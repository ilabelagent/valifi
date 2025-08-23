import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@libsql/client';

const JWT_SECRET = process.env.JWT_SECRET || 'valifi-secret-key-change-in-production';

// Initialize Turso client directly in this file
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || ''
});

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
    // Check if database is configured
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      console.error('Database not configured');
      return res.status(503).json({
        success: false,
        message: 'Database configuration is missing. Please contact support.'
      });
    }

    // Find user in database
    const result = await db.execute({
      sql: 'SELECT id, email, name, password_hash, is_verified, is_active, role FROM users WHERE email = ?',
      args: [email.toLowerCase()]
    });

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Check if account is active
    if (user.is_active === 0) {
      return res.status(403).json({
        success: false,
        message: 'Your account is currently inactive. Please contact support.'
      });
    }

    // Verify password - REAL verification only
    const isValidPassword = await bcrypt.compare(password, user.password_hash as string);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Store/update session in database
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Delete any existing sessions for this user
    await db.execute({
      sql: 'DELETE FROM sessions WHERE user_id = ?',
      args: [user.id]
    });

    // Create new session
    await db.execute({
      sql: 'INSERT INTO sessions (user_id, token, refresh_token, expires_at) VALUES (?, ?, ?, ?)',
      args: [user.id, token, refreshToken, expiresAt.toISOString()]
    });

    return res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: Boolean(user.is_verified),
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    });
  }
}