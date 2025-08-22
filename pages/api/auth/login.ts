import type { NextApiRequest, NextApiResponse } from 'next';

// Demo user for testing
const DEMO_USER = {
  email: 'demo@valifi.net',
  password: 'demo123'
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    // Check for demo user
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      const token = Buffer.from(`demo_user:${Date.now()}`).toString('base64');
      
      return res.status(200).json({
        success: true,
        token,
        message: 'Login successful'
      });
    }

    // For any other email/password, return a 401
    // In production, you would check against a database here
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. Use demo@valifi.net / demo123 for demo access.'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
}