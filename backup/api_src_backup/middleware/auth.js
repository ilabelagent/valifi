
import { db } from '../lib/db.js';

export async function protect(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authorization header is missing or invalid.' });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
      return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token is missing from authorization header.' });
  }

  try {
    // Select only the fields needed for authorization and context, excluding sensitive data
    const result = await db.execute({
        sql: 'SELECT id, email, username, kycStatus, status, isAdmin FROM users WHERE id = ?',
        args: [token],
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid token. User not found.' });
    }
    
    const user = result.rows[0];
    user.isAdmin = Boolean(user.isAdmin);
    
    req.user = user;
    
    next();
  } catch (err) {
      console.error('Authentication error:', err);
      // Return a 401 for auth-related db errors, as it's an auth failure from client's perspective
      return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Could not verify authentication.' });
  }
}

// Middleware to check that the authenticated user has completed KYC.
export function requireKyc(req, res, next) {
  const user = req.user;
  if (!user || user.kycStatus !== 'Approved') {
    return res.status(403).json({ code: 'KYC_REQUIRED', message: 'This action requires KYC approval.' });
  }
  next();
}

// Middleware to enforce admin privileges.
export function requireAdmin(req, res, next) {
  const user = req.user;
  if (!user || !user.isAdmin) {
    return res.status(403).json({ code: 'ADMIN_REQUIRED', message: 'Admin access required for this resource.' });
  }
  next();
}
