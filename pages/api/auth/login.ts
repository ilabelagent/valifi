import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

// Demo user for testing
const DEMO_USER = {
  email: 'demo@valifi.net',
  password: 'demo123',
  passwordHash: '$2a$10$YourHashHere', // This would be the actual hash
  id: 'demo_user_001',
  fullName: 'Demo User',
  username: 'demouser'
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
      const token = Buffer.from(`${DEMO_USER.id}:${Date.now()}`).toString('base64');
      
      return res.status(200).json({
        success: true,
        token,
        message: 'Login successful'
      });
    }

    // In production, check database here
    // For now, return error for non-demo users
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials (use demo@valifi.net / demo123)'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
}