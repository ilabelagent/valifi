import crypto from 'crypto';
import { db } from '../lib/db.js';

// Registers a new user.  Duplicate emails or usernames are rejected.  A
// freshly registered user starts with a zero balance cash asset and has
// their KYC status set to 'Not Started'.  Passwords are stored in plain
// text for simplicity; do not replicate this in production code.
export async function register(req, res) {
  const { fullName, username, email, password } = req.body;
  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ status: 'error', message: 'Missing registration fields' });
  }
  
  const tx = await db.transaction('write');
  try {
    // Check for uniqueness of username and email
    const existingUser = await tx.execute({
        sql: 'SELECT email, username FROM users WHERE email = ? OR username = ?',
        args: [email, username]
    });

    if (existingUser.rows.length > 0) {
        if (existingUser.rows[0].email === email) {
            return res.status(400).json({ status: 'error', message: 'Email already registered' });
        }
        return res.status(400).json({ status: 'error', message: 'Username already taken' });
    }

    const userId = crypto.randomUUID();
    const settingsId = crypto.randomUUID();
    const assetId = crypto.randomUUID();
    
    // In a production system this would be a hashed password.
    const passwordHash = password;

    await tx.execute({
        sql: 'INSERT INTO users (id, fullName, username, email, passwordHash, kycStatus) VALUES (?, ?, ?, ?, ?, ?)',
        args: [userId, fullName, username, email, passwordHash, 'Not Started']
    });

    const defaultPreferences = { currency: 'USD', language: 'en', theme: 'dark', balancePrivacy: false };
    await tx.execute({
        sql: 'INSERT INTO user_settings (id, userId, preferences) VALUES (?, ?, ?)',
        args: [settingsId, userId, JSON.stringify(defaultPreferences)]
    });

    await tx.execute({
        sql: `INSERT INTO assets (id, userId, name, ticker, type, balance, valueUSD) VALUES (?, ?, 'Cash', 'USD', 'Cash', 0, 0)`,
        args: [assetId, userId]
    });
    
    await tx.commit();
    // Use user ID as token for simplicity as per existing logic
    return res.status(201).json({ status: 'success', token: userId });

  } catch (err) {
      await tx.rollback();
      console.error('Registration error:', err);
      return res.status(500).json({ status: 'error', message: 'Database error during registration.' });
  }
}

// Logs a user in by matching email and password.  On success returns a
// simplified access token equal to the user ID and a refresh token stub.
export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Email and password required' });
  }
  
  try {
      const result = await db.execute({
          sql: 'SELECT id, passwordHash FROM users WHERE email = ?',
          args: [email]
      });

      if (result.rows.length === 0) {
        return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
      }

      const user = result.rows[0];
      const passwordMatch = user.passwordHash === password;

      if (!passwordMatch) {
        return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
      }

      // In lieu of JWTs we return the user ID as the token.
      return res.status(200).json({
        status: 'success',
        token: user.id,
        refreshToken: `refresh-${user.id}`,
      });
  } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ status: 'error', message: 'Database error during login.' });
  }
}
