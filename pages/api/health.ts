import type { NextApiRequest, NextApiResponse } from 'next';
import db, { testConnection, initializeDatabase } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test database connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return res.status(503).json({
        status: 'error',
        message: 'Database connection failed',
        details: 'Check your TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables'
      });
    }

    // Initialize tables if needed
    if (req.query.init === 'true') {
      const initialized = await initializeDatabase();
      if (!initialized) {
        return res.status(500).json({
          status: 'error',
          message: 'Failed to initialize database tables'
        });
      }
    }

    // Get database stats
    const userCount = await db.execute('SELECT COUNT(*) as count FROM users');
    const sessionCount = await db.execute('SELECT COUNT(*) as count FROM sessions WHERE expires_at > datetime("now")');
    const portfolioCount = await db.execute('SELECT COUNT(*) as count FROM portfolios');

    return res.status(200).json({
      status: 'healthy',
      message: 'Database is connected and operational',
      stats: {
        users: userCount.rows[0]?.count || 0,
        activeSessions: sessionCount.rows[0]?.count || 0,
        portfolios: portfolioCount.rows[0]?.count || 0
      },
      database: {
        url: process.env.TURSO_DATABASE_URL ? 'Configured' : 'Not configured',
        authToken: process.env.TURSO_AUTH_TOKEN ? 'Configured' : 'Not configured'
      }
    });
  } catch (error: any) {
    console.error('Database health check error:', error);
    return res.status(503).json({
      status: 'error',
      message: 'Database health check failed',
      error: error.message
    });
  }
}