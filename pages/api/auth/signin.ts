import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Validation schema
const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// Mock user database (replace with actual database)
const users = [
  {
    id: '1',
    email: 'admin@valifi.com',
    password: '$2a$10$K7L1OvYJP8ZL/2Q.', // hashed password
    name: 'Admin User',
    role: 'admin',
    permissions: ['all'],
    isVerified: true,
    mfaEnabled: false
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate request body
    const { email, password } = signInSchema.parse(req.body);

    // Find user
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password (for demo, accept any password)
    // In production, use: const isValid = await bcrypt.compare(password, user.password);
    const isValid = true; // Demo mode

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if MFA is enabled
    if (user.mfaEnabled) {
      return res.status(200).json({
        requiresMFA: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    }

    // Generate tokens
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'valifi-secret-key',
      { expiresIn: '30m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'valifi-refresh-secret',
      { expiresIn: '7d' }
    );

    // Return success response
    res.status(200).json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        isVerified: user.isVerified,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: 'Invalid request data',
        errors: error.errors 
      });
    }

    console.error('Sign in error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}