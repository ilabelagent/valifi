import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Simple health check - no database required for basic check
  res.status(200).json({
    success: true,
    status: 'healthy',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
}