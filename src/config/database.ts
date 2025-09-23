/**
 * Database Configuration for AWS RDS PostgreSQL
 * Valifi Production Database Setup
 */

import { Pool, PoolConfig } from 'pg';

// Database connection configuration
const databaseConfig: PoolConfig = {
  host: process.env.DB_HOST || 'valifi-production-db.c8y4mxfhjklm.us-east-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'valifi_production',
  user: process.env.DB_USER || 'valifi_admin',
  password: process.env.DB_PASSWORD || '',

  // Connection pool settings
  max: parseInt(process.env.DB_POOL_MAX || '20'),
  min: parseInt(process.env.DB_POOL_MIN || '5'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),

  // SSL configuration for AWS RDS
  ssl: process.env.NODE_ENV === 'production' ? {
    require: true,
    rejectUnauthorized: false
  } : false,

  // Statement timeout
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'),
};

// Create the connection pool
export const pool = new Pool(databaseConfig);

// Connection event handlers
pool.on('connect', (client) => {
  console.log(`🔗 Connected to PostgreSQL database: ${databaseConfig.database}`);
});

pool.on('error', (err, client) => {
  console.error('❌ PostgreSQL pool error:', err);
});

pool.on('remove', (client) => {
  console.log('📤 Client removed from pool');
});

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Database connection test successful:', {
      time: result.rows[0].current_time,
      version: result.rows[0].pg_version.split(' ')[0]
    });
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    console.log('📤 Database pool closed gracefully');
  } catch (error) {
    console.error('❌ Error closing database pool:', error);
  }
}

// Health check query
export async function healthCheck(): Promise<{ status: string; latency: number; connections: number }> {
  const startTime = Date.now();
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    const latency = Date.now() - startTime;
    const connections = pool.totalCount;
    client.release();

    return {
      status: 'healthy',
      latency,
      connections
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      connections: pool.totalCount || 0
    };
  }
}

// Database utilities
export const db = {
  pool,
  query: (text: string, params?: any[]) => pool.query(text, params),
  getClient: () => pool.connect(),
  testConnection,
  healthCheck,
  close: closePool
};

export default db;