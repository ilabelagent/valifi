import { db } from '../lib/db.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Missing or invalid authorization header' });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    
    // As per the simple auth system, the token is the user's ID.
    const result = await db.execute({
        sql: 'SELECT * FROM users WHERE id = ?',
        args: [token],
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid or expired token. User not found.' });
    }
    
    const user = result.rows[0];
    // Exclude password hash from the user object attached to the request
    delete user.passwordHash;
    
    // Ensure isAdmin is a boolean
    user.isAdmin = Boolean(user.isAdmin);
    
    req.user = user;
    
    next();
  } catch (err) {
      console.error('Authentication error:', err);
      return res.status(500).json({ status: 'error', message: 'Internal server error during authentication.' });
  }
}

// Middleware to check that the authenticated user has completed KYC.
export function requireKyc(req, res, next) {
  const user = req.user;
  if (!user || user.kycStatus !== 'Approved') {
    return res.status(403).json({ status: 'error', message: 'KYC approval required' });
  }
  next();
}

// Middleware to enforce admin privileges.
export function requireAdmin(req, res, next) {
  const user = req.user;
  if (!user || !user.isAdmin) {
    return res.status(403).json({ status: 'error', message: 'Admin access required' });
  }
  next();
}
