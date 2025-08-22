import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

// Mock user storage (in production, use database)
const mockUsers = new Map();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { fullName, username, email, password } = req.body;

  // Validate input
  if (!fullName || !username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  // Check if user exists (mock check)
  if (mockUsers.has(email)) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Store user (mock storage)
    mockUsers.set(email, {
      id: userId,
      email,
      username,
      passwordHash,
      fullName,
      profilePhotoUrl: `https://i.pravatar.cc/150?u=${username}`
    });

    // Generate token
    const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64');

    res.status(200).json({
      success: true,
      token,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
}