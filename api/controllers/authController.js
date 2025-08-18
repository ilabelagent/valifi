
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../lib/db.js';

// Helper to ensure all numeric types from DB are JS Numbers
const processUser = (user) => {
    if (!user) return null;
    const { passwordHash, ...userWithoutPassword } = user;
    return {
        ...userWithoutPassword,
        isAdmin: Boolean(user.isAdmin),
    };
};

export async function register(req, res) {
  const { fullName, username, email, password } = req.body;
  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ success: false, message: 'All registration fields are required.' });
  }

  try {
    await db.execute('BEGIN'); // Manual transaction start

    const existingUser = await db.execute({
        sql: 'SELECT email FROM users WHERE email = ? OR username = ?',
        args: [email, username]
    });

    if (existingUser.rows.length > 0) {
        await db.execute('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Email or username is already taken.' });
    }

    const userId = crypto.randomUUID();
    const settingsId = crypto.randomUUID();
    const assetId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await db.execute({
        sql: 'INSERT INTO users (id, fullName, username, email, passwordHash, kycStatus, createdAt, updatedAt, isAdmin, profilePhotoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [userId, fullName, username, email, passwordHash, 'Not Started', now, now, false, `https://i.pravatar.cc/40?u=${username}`]
    });

    const defaultPreferences = { currency: 'USD', language: 'en', theme: 'dark', balancePrivacy: false };
    
    await db.execute({
        sql: 'INSERT INTO user_settings (id, userId, preferences) VALUES (?, ?, ?)',
        args: [settingsId, userId, JSON.stringify(defaultPreferences)]
    });

    await db.execute({
        sql: `INSERT INTO assets (id, userId, name, ticker, type, balance, valueUSD) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [assetId, userId, 'Cash', 'USD', 'Cash', 0, 0]
    });
    
    await db.execute('COMMIT'); // Manual transaction commit
    
    const userResult = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [userId] });
    const newUser = processUser(userResult.rows[0]);

    // Use user ID as token for simplicity
    return res.status(201).json({ success: true, user: { ...newUser, token: userId } });

  } catch (err) {
      try {
        await db.execute('ROLLBACK');
      } catch (e) {
        console.error('Failed to rollback transaction:', e);
      }
      console.error('Registration Error:', err);
      return res.status(500).json({ success: false, message: 'An internal server error occurred during registration.' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  
  try {
      const result = await db.execute({
          sql: 'SELECT id, passwordHash FROM users WHERE email = ?',
          args: [email]
      });

      if (result.rows.length === 0) {
          return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.passwordHash || '');

      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      return res.status(200).json({ success: true, token: user.id });
  } catch (err) {
      console.error(`Login error for email ${email}:`, err);
      return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    console.log(`Password reset requested for: ${email}`);
    // In a real app, this would generate a reset token and send an email.
    return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
};