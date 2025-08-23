import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@libsql/client';

const JWT_SECRET = process.env.JWT_SECRET || 'valifi-secret-key-change-in-production';

// Initialize Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || ''
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  const { provider, email, name, profilePhotoUrl } = req.body;

  if (!provider || !['google', 'github'].includes(provider)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid provider. Must be google or github.'
    });
  }

  if (!email || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email and name are required for social login'
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

    // Check if OAuth is properly configured
    const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
    const isGithubConfigured = process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET;

    if (provider === 'google' && !isGoogleConfigured) {
      return res.status(501).json({
        success: false,
        message: 'Google login is not configured. Please use email/password login.'
      });
    }

    if (provider === 'github' && !isGithubConfigured) {
      return res.status(501).json({
        success: false,
        message: 'GitHub login is not configured. Please use email/password login.'
      });
    }

    const emailNormalized = email.toLowerCase();

    // Check if user already exists
    const existingUser = await db.execute({
      sql: 'SELECT id, email, name, is_verified, is_active, role FROM users WHERE email = ?',
      args: [emailNormalized]
    });

    let userId;
    let userData;

    if (existingUser.rows.length > 0) {
      // User exists, log them in
      userData = existingUser.rows[0];
      userId = userData.id;

      // Check if account is active
      if (userData.is_active === 0) {
        return res.status(403).json({
          success: false,
          message: 'Your account is currently inactive. Please contact support.'
        });
      }
    } else {
      // Create new user
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36).slice(-16),
        10
      );

      // Generate a unique username from email
      const username = emailNormalized.split('@')[0] + '_' + provider;

      const result = await db.execute({
        sql: `INSERT INTO users (email, name, password_hash, is_verified, is_active) 
              VALUES (?, ?, ?, 1, 1) 
              RETURNING id, email, name, is_verified, is_active, role`,
        args: [emailNormalized, name, randomPassword]
      });

      userData = result.rows[0];
      userId = userData.id;

      // Create portfolio for new user
      await db.execute({
        sql: 'INSERT INTO portfolios (user_id, cash_balance) VALUES (?, ?)',
        args: [userId, 0] // Start with $0 balance - no demo money
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'user'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: userData.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Store/update session in database
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Delete any existing sessions for this user
    await db.execute({
      sql: 'DELETE FROM sessions WHERE user_id = ?',
      args: [userData.id]
    });

    // Create new session
    await db.execute({
      sql: 'INSERT INTO sessions (user_id, token, refresh_token, expires_at) VALUES (?, ?, ?, ?)',
      args: [userData.id, token, refreshToken, expiresAt.toISOString()]
    });

    return res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        isVerified: true,
        role: userData.role || 'user'
      },
      message: `${provider} login successful`
    });

  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({
      success: false,
      message: 'Social login failed. Please try email/password login.'
    });
  }
}