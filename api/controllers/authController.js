import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../lib/db.js';

// Registers a new user.  Duplicate emails or usernames are rejected.  A
// freshly registered user starts with a zero balance cash asset and has
// their KYC status set to 'Not Started'.  Passwords are stored in plain
// text for simplicity; do not replicate this in production code.
export async function register(req, res) {
  const { fullName, username, email, password } = req.body;
  console.log(`Registration attempt for email: ${email}, username: ${username}`);
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
        console.warn(`Registration failed: Duplicate user for email ${email} or username ${username}`);
        if (existingUser.rows[0].email === email) {
            await tx.rollback();
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        await tx.rollback();
        return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    const userId = crypto.randomUUID();
    const settingsId = crypto.randomUUID();
    const assetId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await tx.execute({
        sql: 'INSERT INTO users (id, fullName, username, email, passwordHash, kycStatus, createdAt, updatedAt, kycRejectionReason, isAdmin, profilePhotoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [userId, fullName, username, email, passwordHash, 'Not Started', now, now, null, false, `https://i.pravatar.cc/40?u=${username}`]
    });

    const defaultPreferences = { currency: 'USD', language: 'en', theme: 'dark', balancePrivacy: false };
    const defaultPrivacy = { emailMarketing: false, platformMessages: true, contactAccess: false };
    const defaultVaultRecovery = { email: '', phone: '', pin: '' };
    
    await tx.execute({
        sql: 'INSERT INTO user_settings (id, userId, twoFactorEnabled, twoFactorMethod, loginAlerts, preferences, privacy, vaultRecovery) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [settingsId, userId, false, 'none', false, JSON.stringify(defaultPreferences), JSON.stringify(defaultPrivacy), JSON.stringify(defaultVaultRecovery)]
    });

    await tx.execute({
        sql: `INSERT INTO assets (id, userId, name, ticker, type, balance, valueUSD, initialInvestment, totalEarnings, status, details, balanceInEscrow, change24h, allocation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [assetId, userId, 'Cash', 'USD', 'Cash', 0, 0, 0, 0, 'Active', '{}', 0, 0, 0]
    });
    
    await tx.commit();
    console.log(`Registration successful for new user ID: ${userId}`);
    
    const userResult = await db.execute({
        sql: 'SELECT * FROM users WHERE id = ?',
        args: [userId]
    });
    const newUser = userResult.rows[0];
    delete newUser.passwordHash;

    // Use user ID as token for simplicity as per existing logic
    return res.status(201).json({ success: true, user: { ...newUser, token: userId } });

  } catch (err) {
      await tx.rollback();
      console.error(`Registration error for email ${email}:`, err);
      return res.status(500).json({ status: 'error', message: 'Database error during registration.' });
  }
}

// Logs a user in by matching email and password.  On success returns a
// simplified access token equal to the user ID and a refresh token stub.
export async function login(req, res) {
  const { email, password } = req.body;
  console.log(`Login attempt for email: ${email}`);
  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Email and password required' });
  }
  
  try {
      const result = await db.execute({
          sql: 'SELECT id, passwordHash FROM users WHERE email = ?',
          args: [email]
      });

      if (result.rows.length === 0) {
        console.warn(`Login failed: No user found for email ${email}`);
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);

      if (!passwordMatch) {
        console.warn(`Login failed: Password mismatch for email ${email}`);
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      console.log(`Login successful for user ID: ${user.id}`);
      // In lieu of JWTs we return the user ID as the token.
      return res.status(200).json({
        success: true,
        token: user.id,
      });
  } catch (err) {
      console.error(`Login error for email ${email}:`, err);
      return res.status(500).json({ success: false, message: 'Database error during login.' });
  }
}

export const forgotPassword = async (req, res) => {
    // In a real app, this would generate a reset token and send an email.
    // For this mock, we just acknowledge the request.
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ status: 'error', message: 'Email is required.' });
    }
    console.log(`Password reset requested for: ${email}`);
    return res.status(200).json({ status: 'success', message: 'If an account with that email exists, a reset link has been sent.' });
};
