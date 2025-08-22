


import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../lib/db.js';

// --- In-memory Rate Limiting (simple implementation for serverless) ---
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_PERIOD = 15 * 60 * 1000; // 15 minutes

const rateLimiter = (req, res, next) => {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) return next();

    const now = Date.now();
    const attempt = loginAttempts.get(email) || { count: 0, lockUntil: 0 };

    if (now < attempt.lockUntil) {
        return res.status(429).json({
            code: 'RATE_LIMITED',
            message: 'Too many login attempts. Please try again later.'
        });
    }

    if (attempt.count >= MAX_ATTEMPTS) {
        attempt.lockUntil = now + LOCKOUT_PERIOD;
        loginAttempts.set(email, attempt);
        return res.status(429).json({
            code: 'RATE_LIMITED',
            message: 'Too many login attempts. Please try again later.'
        });
    }
    
    // Attach attempt info to req to be updated on failure
    req.loginAttempt = attempt;
    req.loginIdentifier = email;

    next();
};


export async function register(req, res) {
  const { fullName, username, email, password } = req.body;
  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ code: 'MISSING_FIELDS', message: 'All registration fields are required.' });
  }
  if (password.length < 8) {
      return res.status(400).json({ code: 'PASSWORD_TOO_SHORT', message: 'Password must be at least 8 characters long.' });
  }

  const email_normalized = email.trim().toLowerCase();
  
  let tx;
  try {
    tx = await db.transaction('write');

    const existingUserResult = await tx.execute({
        sql: 'SELECT id FROM users WHERE email_normalized = ? OR username = ?',
        args: [email_normalized, username]
    });

    if (existingUserResult.rows.length > 0) {
        await tx.rollback();
        return res.status(409).json({ code: 'EMAIL_EXISTS', message: 'An account with this email or username already exists.' });
    }

    const userId = crypto.randomUUID();
    const settingsId = crypto.randomUUID();
    const assetId = crypto.randomUUID();
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await tx.batch([
        {
            sql: 'INSERT INTO users (id, fullName, username, email, email_normalized, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
            args: [userId, fullName, username, email, email_normalized, passwordHash]
        },
        {
            sql: 'INSERT INTO user_settings (id, userId) VALUES (?, ?)',
            args: [settingsId, userId]
        },
        {
            sql: `INSERT INTO assets (id, userId, name, ticker, type, balance, valueUSD) VALUES (?, ?, 'Cash', 'USD', 'Cash', 0, 0)`,
            args: [assetId, userId]
        }
    ]);
    
    await tx.commit();
    
    // Return token (user ID) directly for immediate login
    return res.status(201).json({ success: true, token: userId });

  } catch (err) {
      if (tx) {
        try { await tx.rollback(); } catch (e) { console.error('Failed to rollback transaction:', e); }
      }
      console.error('Registration Error:', err);
      return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An internal server error occurred during registration.' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ code: 'MISSING_FIELDS', message: 'Email and password are required.' });
  }
  
  const email_normalized = email.trim().toLowerCase();

  try {
      const result = await db.execute({
          sql: 'SELECT * FROM users WHERE email_normalized = ?',
          args: [email_normalized]
      });

      if (result.rows.length === 0) {
          return res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' });
      }

      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password_hash || '');

      if (!passwordMatch) {
        // Increment login attempt on failure
        const attempt = req.loginAttempt || { count: 0, lockUntil: 0 };
        attempt.count++;
        loginAttempts.set(req.loginIdentifier, attempt);
        return res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' });
      }
      
      if (user.status !== 'active') {
          return res.status(403).json({ code: 'USER_INACTIVE', message: `Your account is currently inactive. Status: ${user.status}` });
      }
      
      // Clear login attempts on success
      loginAttempts.delete(req.loginIdentifier);

      // Defensively create user_settings if they are missing
      const settingsResult = await db.execute({
          sql: 'SELECT userId from user_settings WHERE userId = ?',
          args: [user.id]
      });

      if (settingsResult.rows.length === 0) {
          console.warn(`User ${user.id} is missing a settings row. Auto-creating one now.`);
          await db.execute({
              sql: 'INSERT INTO user_settings (id, userId) VALUES (?, ?)',
              args: [crypto.randomUUID(), user.id]
          });
      }

      return res.status(200).json({ success: true, token: user.id });

  } catch (err) {
      console.error(`Login error for email ${email_normalized}:`, err);
      return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' });
  }
}

// Attach the rate limiter middleware to the exported login function
export const loginWithRateLimit = [rateLimiter, login];

export async function socialLogin(req, res) {
  const { provider } = req.body;
  if (!provider || !['google', 'github'].includes(provider)) {
    return res.status(400).json({ code: 'INVALID_PROVIDER', message: 'Invalid social provider specified.' });
  }

  const mockUsers = {
    google: {
      email: 'social.google@valifi.com',
      fullName: 'Google User',
      username: 'googleuser',
      profilePhotoUrl: 'https://i.pravatar.cc/150?u=google'
    },
    github: {
      email: 'social.github@valifi.com',
      fullName: 'GitHub User',
      username: 'githubuser',
      profilePhotoUrl: 'https://i.pravatar.cc/150?u=github'
    }
  };

  const socialUser = mockUsers[provider];
  const email_normalized = socialUser.email.trim().toLowerCase();
  
  let tx;
  try {
    const existingUserResult = await db.execute({
      sql: 'SELECT id FROM users WHERE email_normalized = ?',
      args: [email_normalized]
    });

    if (existingUserResult.rows.length > 0) {
      const userId = existingUserResult.rows[0].id;
      return res.status(200).json({ success: true, token: userId });
    }
    
    // User does not exist, create them
    tx = await db.transaction('write');
    const userId = crypto.randomUUID();
    const settingsId = crypto.randomUUID();
    const assetId = crypto.randomUUID();
    const placeholderPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

    await tx.batch([
        {
            sql: 'INSERT INTO users (id, fullName, username, email, email_normalized, password_hash, profilePhotoUrl, kycStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            args: [userId, socialUser.fullName, socialUser.username, socialUser.email, email_normalized, placeholderPassword, socialUser.profilePhotoUrl, 'Approved'] // Approve social users by default for demo
        },
        {
            sql: 'INSERT INTO user_settings (id, userId) VALUES (?, ?)',
            args: [settingsId, userId]
        },
        {
            sql: `INSERT INTO assets (id, userId, name, ticker, type, balance, valueUSD) VALUES (?, ?, 'Cash', 'USD', 'Cash', 0, 0)`,
            args: [assetId, userId]
        }
    ]);
    
    await tx.commit();

    return res.status(201).json({ success: true, token: userId });

  } catch (err) {
    if (tx) {
        try { await tx.rollback(); } catch (e) { console.error('Failed to rollback social login transaction:', e); }
    }
    console.error(`Social Login Error for ${provider}:`, err);
    return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An internal server error occurred during social login.' });
  }
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    // In a real app, this would generate a reset token and send an email.
    // For now, we just acknowledge the request to prevent user enumeration.
    return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
};
