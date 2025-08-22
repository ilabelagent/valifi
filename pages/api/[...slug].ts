import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Catch-all handler for other API routes
  // Returns mock success for any endpoint
  
  const { slug } = req.query;
  const path = Array.isArray(slug) ? slug.join('/') : slug;

  // Log the request for debugging
  console.log(`API Request: ${req.method} /api/${path}`);

  // Return mock success response
  res.status(200).json({
    success: true,
    message: `Mock response for /api/${path}`,
    data: {},
    timestamp: new Date().toISOString()
  });
}