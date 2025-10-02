import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

// Initialize PostgreSQL connection
const dbUrl = process.env.DATABASE_URL || 'postgresql://valifip:Valifi2025SecurePass@localhost:5432/valifi_production';
const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Test PostgreSQL connection
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    const dbInfo = result.rows[0];

    return res.status(200).json({
      success: true,
      status: 'healthy',
      message: 'All systems operational',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      service: 'valifi-api',
      database: {
        configured: true,
        status: 'connected',
        type: 'PostgreSQL',
        serverTime: dbInfo.current_time
      }
    });

  } catch (error: any) {
    console.error('Health check error:', error);

    return res.status(503).json({
      success: false,
      status: 'error',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      service: 'valifi-api',
      database: {
        configured: true,
        status: 'connection-failed',
        error: error.message
      }
    });
  }
}