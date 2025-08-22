
import jwt from 'jsonwebtoken';
import { create } from '../lib/errors.js';

const COOKIE = process.env.COOKIE_NAME || 'valifi_token';
const JWT_SECRET = process.env.JWT_SECRET;
const isProd = process.env.NODE_ENV === 'production';

export function issueJwtCookie(res, payload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  return token;
}

export function clearJwtCookie(res) {
  res.clearCookie(COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
}

export function protect(req, _res, next) {
  const auth = req.headers.authorization;
  let token;

  if (req.cookies?.[COOKIE]) {
    token = req.cookies[COOKIE];
  } else if (auth?.startsWith('Bearer ')) {
    token = auth.slice(7);
  }

  if (!token) throw create.unauthorized('UNAUTHORIZED', 'Login required');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, sub: decoded.sub || decoded.id };
    next();
  } catch {
    throw create.unauthorized('UNAUTHORIZED', 'Invalid or expired session');
  }
}
