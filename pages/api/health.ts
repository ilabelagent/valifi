import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@libsql/client';

// Check if database is properly configured
const isDatabaseConfigured = !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if database is configured
    if (!isDatabaseConfigured) {
      // Return success in demo mode
      return res.status(200).json({
        success: true,
        status: 'demo',
        message: 'Running in demo mode - no database configured',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        service: 'valifi-api',
        database: {
          configured: false,
          status: 'demo-mode'
        },
        demoAccounts: [
          { email: 'demo@valifi.com', password: 'demo123' },
          { email: 'admin@valifi.com', password: 'admin123' }
        ]
      });
    }

    // Try to connect to database if configured
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!
    });

    // Simple query to test connection
    await db.execute('SELECT 1');

    return res.status(200).json({
      success: true,
      status: 'healthy',
      message: 'All systems operational',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      service: 'valifi-api',
      database: {
        configured: true,
        status: 'connected'
      }
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    // Return error status if database connection fails
    return res.status(200).json({
      success: false,
      status: 'error',
      message: 'Database connection failed, but demo mode is available',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      service: 'valifi-api',
      database: {
        configured: isDatabaseConfigured,
        status: 'connection-failed'
      },
      demoAccounts: [
        { email: 'demo@valifi.com', password: 'demo123' },
        { email: 'admin@valifi.com', password: 'admin123' }
      ]
    });
  }
}