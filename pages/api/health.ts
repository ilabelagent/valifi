import type { NextApiRequest, NextApiResponse } from 'next';

// Simple health check without database dependency
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Basic health check response
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    service: 'valifi-api',
    database: {
      configured: !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN),
      status: 'configuration-only'
    }
  };

  // Return health status without attempting database connection
  // Database connection will be tested when users actually try to sign up/sign in
  res.status(200).json(healthStatus);
}