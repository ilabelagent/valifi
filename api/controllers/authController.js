
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { client, withTx } from '../lib/db.js';
import { create } from '../lib/errors.js';
import { issueJwtCookie, clearJwtCookie } from '../middleware/auth.js';

const RegisterSchema = z.object({
  email: z.string().email().transform(v => v.trim().toLowerCase()),
  password: z.string().min(8),
  name: z.string().trim().min(1).max(120).optional(),
});

const LoginSchema = z.object({
  email: z.string().email().transform(v => v.trim().toLowerCase()),
  password: z.string().min(1),
});

export const register = async (req, res) => {
  const { email, password, name } = RegisterSchema.parse(req.body);

  return await withTx(async (tx) => {
    // 1) Deduplicate by normalized email
    const existing = await tx.execute({
      sql: 'SELECT id FROM users WHERE email_normalized = ? LIMIT 1',
      args: [email],
    });
    if (existing.rows.length) {
      throw create.conflict('EMAIL_EXISTS', 'Email is already registered');
    }

    // 2) Insert user
    const id = uuid();
    const hash = await bcrypt.hash(password, 12);

    await tx.execute({
      sql: `INSERT INTO users (id, email, email_normalized, password_hash, status, kyc_status)
            VALUES (?, ?, ?, ?, 'active', 'unverified')`,
      args: [id, req.body.email, email, hash],
    });

    // 3) Insert default settings (atomic)
    await tx.execute({
      sql: `INSERT INTO user_settings (user_id, preferred_currency, language, theme)
            VALUES (?, 'USD', 'en', 'system')`,
      args: [id],
    });

    // 4) Issue session
    issueJwtCookie(res, { id, email, sub: id });

    res.status(201).json({ ok: true, user: { id, email, name: name || null } });
  });
};

export const login = async (req, res) => {
  const { email, password } = LoginSchema.parse(req.body);

  const userQ = await client.execute({
    sql: `SELECT id, email, password_hash, status, kyc_status
          FROM users WHERE email_normalized = ? LIMIT 1`,
    args: [email],
  });

  if (!userQ.rows.length) throw create.unauthorized('INVALID_CREDENTIALS', 'Email or password is incorrect');

  const user = userQ.rows[0];

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw create.unauthorized('INVALID_CREDENTIALS', 'Email or password is incorrect');

  if (user.status !== 'active') {
    throw create.forbidden('USER_INACTIVE', 'Account is not active');
  }

  // Self-heal: ensure user_settings exists
  const settings = await client.execute({
    sql: `SELECT user_id FROM user_settings WHERE user_id = ? LIMIT 1`,
    args: [user.id],
  });

  if (!settings.rows.length) {
    await client.execute({
      sql: `INSERT INTO user_settings (user_id, preferred_currency, language, theme)
            VALUES (?, 'USD', 'en', 'system')`,
      args: [user.id],
    });
  }

  issueJwtCookie(res, { id: user.id, email: user.email, sub: user.id });

  res.json({ ok: true, user: { id: user.id, email: user.email } });
};

export const me = async (req, res) => {
  const userId = req.user.id;
  const q = await client.execute({
    sql: `SELECT u.id, u.email, u.status, u.kyc_status,
                 s.preferred_currency, s.language, s.theme
          FROM users u
          LEFT JOIN user_settings s ON s.user_id = u.id
          WHERE u.id = ? LIMIT 1`,
    args: [userId],
  });

  if (!q.rows.length) throw create.unauthorized('UNAUTHORIZED', 'User not found');

  res.json({ ok: true, profile: q.rows[0] });
};

export const logout = async (_req, res) => {
  clearJwtCookie(res);
  res.json({ ok: true });
};
