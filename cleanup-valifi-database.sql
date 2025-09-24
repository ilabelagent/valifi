-- VALIFI PRODUCTION DATABASE CLEANUP
-- Remove all demo/test data
-- =====================================

-- Remove demo users
DELETE FROM users WHERE email LIKE '%demo%' OR email LIKE '%test%' OR email LIKE '%example%';
DELETE FROM users WHERE username IN ('demo', 'test', 'admin', 'user1', 'user2');

-- Remove orphaned sessions
DELETE FROM sessions WHERE user_id NOT IN (SELECT id FROM users);

-- Remove test portfolios
DELETE FROM portfolios WHERE name LIKE '%test%' OR name LIKE '%demo%';
DELETE FROM portfolios WHERE user_id NOT IN (SELECT id FROM users);

-- Remove test transactions
DELETE FROM transactions WHERE description LIKE '%test%' OR description LIKE '%demo%';
DELETE FROM transactions WHERE user_id NOT IN (SELECT id FROM users);

-- Remove test assets
DELETE FROM assets WHERE portfolio_id NOT IN (SELECT id FROM portfolios);

-- Reset auto-increment counters
UPDATE sqlite_sequence SET seq = 0 WHERE name IN ('users', 'portfolios', 'transactions', 'assets');

-- Add production indexes
CREATE INDEX IF NOT EXISTS idx_users_email_prod ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token_prod ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);

-- Vacuum database
VACUUM;
