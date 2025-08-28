// Database Adapter Module
// Provides a unified interface for database operations

import { Pool } from 'pg';

export interface DatabaseConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean | any;
  max?: number;
  idleTimeoutMillis?: number;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  fields?: any[];
}

export class DatabaseAdapter {
  private pool: Pool | null = null;
  private config: DatabaseConfig;
  private connected: boolean = false;

  constructor(config?: DatabaseConfig) {
    this.config = config || this.getConfigFromEnv();
  }

  private getConfigFromEnv(): DatabaseConfig {
    // Try to get database URL from various environment variables
    const databaseUrl = 
      process.env.DATABASE_URL || 
      process.env.POSTGRES_URL || 
      process.env.POSTGRESQL_URL;

    if (databaseUrl) {
      return {
        connectionString: databaseUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
      };
    }

    // Fallback to individual connection parameters
    return {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DATABASE || 'valifi',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
    };
  }

  async connect(): Promise<void> {
    if (this.connected && this.pool) {
      return;
    }

    try {
      this.pool = new Pool(this.config);
      
      // Test connection
      await this.pool.query('SELECT 1');
      
      this.connected = true;
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      this.connected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.connected = false;
      console.log('Database disconnected');
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    if (!this.pool) {
      await this.connect();
    }

    try {
      const result = await this.pool!.query(text, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount || 0,
        fields: result.fields,
      };
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  async transaction<T = any>(callback: (client: any) => Promise<T>): Promise<T> {
    if (!this.pool) {
      await this.connect();
    }

    const client = await this.pool!.connect();

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

  // Helper methods for common operations

  async findOne<T = any>(table: string, conditions: Record<string, any>): Promise<T | null> {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    
    const query = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`;
    const result = await this.query<T>(query, values);
    
    return result.rows[0] || null;
  }

  async findMany<T = any>(
    table: string, 
    conditions?: Record<string, any>, 
    options?: { limit?: number; offset?: number; orderBy?: string }
  ): Promise<T[]> {
    let query = `SELECT * FROM ${table}`;
    const values: any[] = [];

    if (conditions && Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      const whereClause = keys.map((key, index) => {
        values.push(conditions[key]);
        return `${key} = $${index + 1}`;
      }).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    if (options?.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
    }

    if (options?.limit) {
      query += ` LIMIT ${options.limit}`;
    }

    if (options?.offset) {
      query += ` OFFSET ${options.offset}`;
    }

    const result = await this.query<T>(query, values);
    return result.rows;
  }

  async insert<T = any>(table: string, data: Record<string, any>): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await this.query<T>(query, values);
    return result.rows[0];
  }

  async update<T = any>(
    table: string, 
    conditions: Record<string, any>, 
    data: Record<string, any>
  ): Promise<T[]> {
    const dataKeys = Object.keys(data);
    const dataValues = Object.values(data);
    const conditionKeys = Object.keys(conditions);
    const conditionValues = Object.values(conditions);
    
    const setClause = dataKeys.map((key, index) => 
      `${key} = $${index + 1}`
    ).join(', ');
    
    const whereClause = conditionKeys.map((key, index) => 
      `${key} = $${dataKeys.length + index + 1}`
    ).join(' AND ');
    
    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE ${whereClause}
      RETURNING *
    `;
    
    const result = await this.query<T>(query, [...dataValues, ...conditionValues]);
    return result.rows;
  }

  async delete<T = any>(table: string, conditions: Record<string, any>): Promise<T[]> {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    
    const query = `
      DELETE FROM ${table}
      WHERE ${whereClause}
      RETURNING *
    `;
    
    const result = await this.query<T>(query, values);
    return result.rows;
  }

  async count(table: string, conditions?: Record<string, any>): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM ${table}`;
    const values: any[] = [];

    if (conditions && Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      const whereClause = keys.map((key, index) => {
        values.push(conditions[key]);
        return `${key} = $${index + 1}`;
      }).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    const result = await this.query<{ count: string }>(query, values);
    return parseInt(result.rows[0].count, 10);
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// Export singleton instance for default use
const dbAdapter = new DatabaseAdapter();
export default dbAdapter;

// Also export the class for custom instances
export { DatabaseAdapter as DB };

// Export getDbAdapter function
export function getDbAdapter(): DatabaseAdapter {
  return dbAdapter;
}

// Add missing methods for API compatibility
DatabaseAdapter.prototype.logAIInteraction = async function(data: any) {
  try {
    return await this.insert('ai_interactions', {
      ...data,
      created_at: new Date(),
    });
  } catch (error) {
    console.error('Failed to log AI interaction:', error);
    return null;
  }
};

DatabaseAdapter.prototype.createAuditLog = async function(data: any) {
  try {
    return await this.insert('audit_logs', {
      ...data,
      created_at: new Date(),
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return null;
  }
};