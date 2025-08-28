import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@libsql/client';

const JWT_SECRET = process.env.JWT_SECRET || 'valifi-secret-key-change-in-production';

// Initialize Turso client 
const db = process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN
  ? createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    })
  : null;

// Demo accounts for development when database is not configured
const DEMO_ACCOUNTS = [
  {
    id: 'demo-user-1',
    email: 'demo@valifi.com',
    password: 'demo123',
    name: 'Demo User',
    isVerified: true,
    isActive: true,
    role: 'user'
  },
  {
    id: 'admin-user-1',
    email: 'admin@valifi.com',
    password: 'admin123',
    name: 'Admin User',
    isVerified: true,
    isActive: true,
    role: 'admin'
  }
];

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
    if (!db) {
      console.warn('Database not configured - using demo mode');
      
      // Demo mode authentication
      const demoUser = DEMO_ACCOUNTS.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
      );

      if (!demoUser) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Demo accounts: demo@valifi.com/demo123 or admin@valifi.com/admin123'
        });
      }

      // Generate JWT token for demo user
      const token = jwt.sign(
        { 
          userId: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Generate refresh token
      const refreshToken = jwt.sign(
        { userId: demoUser.id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        token,
        refreshToken,
        user: {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          isVerified: demoUser.isVerified,
          role: demoUser.role
        },
        isDemoMode: true
      });
    }

    // Production mode with database
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

    // Verify password
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
        name: user.name,
        role: user.role
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