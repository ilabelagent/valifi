// PostgreSQL Database Adapter for Valifi Platform
// This file provides a database abstraction layer to support both Turso and PostgreSQL

import { Pool, PoolClient } from 'pg';
import { createClient } from '@libsql/client';

// Database adapter interface
export interface DatabaseAdapter {
  execute(query: string, params?: any[]): Promise<any>;
  executeMany(queries: { query: string; params?: any[] }[]): Promise<any[]>;
  transaction<T>(callback: (client: any) => Promise<T>): Promise<T>;
  close(): Promise<void>;
  isPostgreSQL(): boolean;
}

// PostgreSQL Adapter
export class PostgreSQLAdapter implements DatabaseAdapter {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
      max: parseInt(process.env.DB_POOL_SIZE || '20'),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection on initialization
    this.pool.on('connect', () => {
      console.log('✅ PostgreSQL connection established');
    });

    this.pool.on('error', (err) => {
      console.error('❌ PostgreSQL pool error:', err);
    });
  }

  async execute(query: string, params?: any[]): Promise<any> {
    try {
      // Convert SQLite-style placeholders to PostgreSQL style
      const pgQuery = this.convertQuery(query);
      const pgParams = this.convertParams(params);
      
      const result = await this.pool.query(pgQuery, pgParams);
      
      // Return format similar to Turso for compatibility
      return {
        rows: result.rows,
        rowCount: result.rowCount,
        columns: result.fields?.map(f => f.name) || []
      };
    } catch (error) {
      console.error('PostgreSQL query error:', error);
      throw error;
    }
  }

  async executeMany(queries: { query: string; params?: any[] }[]): Promise<any[]> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const results = [];
      
      for (const { query, params } of queries) {
        const pgQuery = this.convertQuery(query);
        const pgParams = this.convertParams(params);
        const result = await client.query(pgQuery, pgParams);
        results.push({
          rows: result.rows,
          rowCount: result.rowCount,
          columns: result.fields?.map(f => f.name) || []
        });
      }
      
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  isPostgreSQL(): boolean {
    return true;
  }

  // Convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
  private convertQuery(query: string): string {
    let pgQuery = query;
    let paramIndex = 1;
    
    // Replace ? with $n
    pgQuery = pgQuery.replace(/\?/g, () => `$${paramIndex++}`);
    
    // Convert SQLite-specific functions to PostgreSQL
    pgQuery = pgQuery.replace(/hex\(randomblob\(16\)\)/gi, 'gen_random_uuid()');
    pgQuery = pgQuery.replace(/DATETIME/gi, 'TIMESTAMP WITH TIME ZONE');
    pgQuery = pgQuery.replace(/CURRENT_TIMESTAMP/gi, 'CURRENT_TIMESTAMP');
    
    return pgQuery;
  }

  // Convert parameters for PostgreSQL compatibility
  private convertParams(params?: any[]): any[] {
    if (!params) return [];
    
    return params.map(param => {
      // Convert SQLite boolean integers to PostgreSQL booleans
      if (param === 0 || param === 1) {
        return Boolean(param);
      }
      return param;
    });
  }
}

// Turso Adapter (existing implementation)
export class TursoAdapter implements DatabaseAdapter {
  private client: any;

  constructor() {
    this.client = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || ''
    });
  }

  async execute(query: string, params?: any[]): Promise<any> {
    try {
      const result = await this.client.execute({
        sql: query,
        args: params || []
      });
      
      return {
        rows: result.rows,
        rowCount: result.rows.length,
        columns: result.columns
      };
    } catch (error) {
      console.error('Turso query error:', error);
      throw error;
    }
  }

  async executeMany(queries: { query: string; params?: any[] }[]): Promise<any[]> {
    const results = [];
    for (const { query, params } of queries) {
      const result = await this.execute(query, params);
      results.push(result);
    }
    return results;
  }

  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    // Turso handles transactions differently
    // For now, just execute the callback with the client
    return callback(this.client);
  }

  async close(): Promise<void> {
    // Turso client doesn't need explicit closing
  }

  isPostgreSQL(): boolean {
    return false;
  }
}

// Factory function to create the appropriate adapter
export function createDatabaseAdapter(): DatabaseAdapter {
  const usePostgres = process.env.USE_POSTGRES === 'true';
  
  if (usePostgres) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required for PostgreSQL');
    }
    console.log('🐘 Using PostgreSQL database adapter');
    return new PostgreSQLAdapter();
  } else {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required for Turso');
    }
    console.log('🚀 Using Turso database adapter');
    return new TursoAdapter();
  }
}

// Helper functions for common database operations
export const dbHelpers = {
  // Generate UUID (works for both databases)
  generateId: (adapter: DatabaseAdapter): string => {
    if (adapter.isPostgreSQL()) {
      // PostgreSQL will generate UUID automatically with DEFAULT
      return 'DEFAULT';
    } else {
      // For Turso/SQLite, generate a hex string
      return [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    }
  },

  // Format timestamp for database
  formatTimestamp: (date: Date, adapter: DatabaseAdapter): string => {
    if (adapter.isPostgreSQL()) {
      return date.toISOString();
    } else {
      // SQLite format
      return date.toISOString().replace('T', ' ').replace('Z', '');
    }
  },

  // Parse boolean from database
  parseBoolean: (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') return value === 'true' || value === '1';
    return false;
  }
};

// Migration helper to check if tables exist
export async function checkDatabaseSchema(adapter: DatabaseAdapter): Promise<boolean> {
  try {
    let query: string;
    
    if (adapter.isPostgreSQL()) {
      query = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `;
    } else {
      query = `
        SELECT name as table_name 
        FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `;
    }
    
    const result = await adapter.execute(query);
    const tables = result.rows.map((r: any) => r.table_name);
    
    const requiredTables = [
      'users', 'sessions', 'portfolios', 'assets', 
      'transactions', 'notifications'
    ];
    
    const missingTables = requiredTables.filter(t => !tables.includes(t));
    
    if (missingTables.length > 0) {
      console.log('⚠️ Missing tables:', missingTables.join(', '));
      return false;
    }
    
    console.log('✅ All required tables exist');
    return true;
  } catch (error) {
    console.error('❌ Error checking database schema:', error);
    return false;
  }
}

// Initialize database tables
export async function initializeDatabase(adapter: DatabaseAdapter): Promise<boolean> {
  try {
    if (adapter.isPostgreSQL()) {
      // For PostgreSQL, run the migration script
      console.log('📝 PostgreSQL database initialization should be done via migration script');
      console.log('Run: psql -d your_database -f migrations/001_postgresql_migration.sql');
      return true;
    } else {
      // For Turso, use the existing initialization logic
      const queries = [
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          is_verified INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
          user_id TEXT NOT NULL,
          token TEXT UNIQUE NOT NULL,
          refresh_token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS portfolios (
          id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
          user_id TEXT NOT NULL,
          total_value_usd REAL DEFAULT 0,
          cash_balance REAL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
      ];
      
      for (const query of queries) {
        await adapter.execute(query);
      }
      
      console.log('✅ Turso database tables initialized');
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    return false;
  }
}

// Export a singleton instance
let dbAdapter: DatabaseAdapter | null = null;

export function getDbAdapter(): DatabaseAdapter {
  if (!dbAdapter) {
    dbAdapter = createDatabaseAdapter();
  }
  return dbAdapter;
}

// Default export for backward compatibility
export default getDbAdapter();
