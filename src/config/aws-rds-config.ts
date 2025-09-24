import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export interface AWSRDSConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
  connectionTimeout: number;
  region: string;
}

export const awsRDSConfig: AWSRDSConfig = {
  host: process.env.AWS_RDS_HOST || '',
  port: parseInt(process.env.AWS_RDS_PORT || '5432'),
  database: process.env.AWS_RDS_DATABASE || 'valifi_fintech',
  username: process.env.AWS_RDS_USERNAME || '',
  password: process.env.AWS_RDS_PASSWORD || '',
  ssl: process.env.AWS_RDS_SSL === 'true',
  maxConnections: parseInt(process.env.AWS_RDS_MAX_CONNECTIONS || '20'),
  connectionTimeout: parseInt(process.env.AWS_RDS_CONNECTION_TIMEOUT || '30000'),
  region: process.env.AWS_REGION || 'us-east-1'
};

export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DB_POOL_SIZE || '20'),
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pgPool.connect();
    const res = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ AWS RDS PostgreSQL connected successfully:', res.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ AWS RDS PostgreSQL connection failed:', error);
    return false;
  }
}

export default pgPool;