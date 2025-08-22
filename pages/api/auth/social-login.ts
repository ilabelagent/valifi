import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { provider } = req.body;

  if (!provider) {
    return res.status(400).json({
      success: false,
      message: 'Provider is required'
    });
  }

  try {
    // Mock social login
    const userId = `${provider}_user_${Date.now()}`;
    const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64');

    res.status(200).json({
      success: true,
      token,
      message: `${provider} login successful`
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({
      success: false,
      message: 'Social login failed'
    });
  }
}