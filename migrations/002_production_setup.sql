-- =====================================================
-- VALIFI PRODUCTION DATABASE SETUP
-- Complete production schema with NO demo data
-- =====================================================

-- Drop and recreate database (optional - comment out if preserving data)
-- DROP DATABASE IF EXISTS valifi_production;
-- CREATE DATABASE valifi_production;

-- Connect to the database
-- \c valifi_production;

-- =====================================================
-- CLEANUP: Remove all demo/test data
-- =====================================================

-- First, remove any existing demo data
DO $$
BEGIN
    -- Clean up demo users
    DELETE FROM audit_logs WHERE user_id IN (
        SELECT id FROM users WHERE email LIKE '%demo%' OR email LIKE '%test%' OR email LIKE '%example%'
    );
    DELETE FROM notifications WHERE user_id IN (
        SELECT id FROM users WHERE email LIKE '%demo%' OR email LIKE '%test%' OR email LIKE '%example%'
    );
    DELETE FROM ai_interactions WHERE user_id IN (
        SELECT id FROM users WHERE email LIKE '%demo%' OR email LIKE '%test%' OR email LIKE '%example%'
    );
    DELETE FROM bot_logs WHERE user_id IN (
        SELECT id FROM users WHERE email LIKE '%demo%' OR email LIKE '%test%' OR email LIKE '%example%'
    );
    DELETE FROM bot_configurations WHERE user_id IN (
        SELECT id FROM users WHERE email LIKE '%demo%' OR email LIKE '%test%' OR email LIKE '%example%'
    );
    DELETE FROM transactions WHERE user_id IN (
        SELECT id FROM users WHERE email LIKE '%demo%' OR email LIKE '%test%' OR email LIKE '%example%'
    );
    DELETE FROM assets WHERE user_id IN (
        SELECT id FROM users WHERE email LIKE '%demo%' OR email LIKE '%test%' OR email LIKE '%example%'
    );
    DELETE FROM portfolios WHERE user_id IN (
        SELECT id FROM users WHERE email LIKE '%demo%' OR email LIKE '%test%' OR email LIKE '%example%'
    );
    DELETE FROM user_settings WHERE user_id IN (
        SELECT id FROM users WHERE email LIKE '%demo%' OR email LIKE '%test%' OR email LIKE '%example%'
    );
    DELETE FROM sessions WHERE user_id IN (
        SELECT id FROM users WHERE email LIKE '%demo%' OR email LIKE '%test%' OR email LIKE '%example%'
    );
    DELETE FROM users WHERE email LIKE '%demo%' OR email LIKE '%test%' OR email LIKE '%example%';
    
    RAISE NOTICE 'Demo data cleaned successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error cleaning demo data: %', SQLERRM;
END $$;

-- =====================================================
-- PRODUCTION CONSTRAINTS AND VALIDATIONS
-- =====================================================

-- Add production constraints to users table
ALTER TABLE users 
    ADD CONSTRAINT check_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE users 
    ADD CONSTRAINT check_username_length 
    CHECK (char_length(username) >= 3 AND char_length(username) <= 50);

-- Add constraint to prevent demo emails
ALTER TABLE users 
    ADD CONSTRAINT no_demo_accounts 
    CHECK (
        email NOT LIKE '%demo%' AND 
        email NOT LIKE '%test%' AND 
        email NOT LIKE '%example%' AND
        email NOT LIKE '%dummy%'
    );

-- Add constraint for password hash length (bcrypt produces 60 char hashes)
ALTER TABLE users 
    ADD CONSTRAINT check_password_hash 
    CHECK (char_length(password_hash) = 60);

-- =====================================================
-- PRODUCTION INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional indexes for production performance
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolios_total_value ON portfolios(total_value_usd DESC);
CREATE INDEX IF NOT EXISTS idx_assets_type_status ON assets(type, status);
CREATE INDEX IF NOT EXISTS idx_transactions_date_range ON transactions(created_at, type);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active, expires_at);

-- Full text search indexes
CREATE INDEX IF NOT EXISTS idx_users_fulltext ON users USING gin(to_tsvector('english', full_name || ' ' || username));

-- =====================================================
-- PRODUCTION FUNCTIONS AND PROCEDURES
-- =====================================================

-- Function to validate email domain
CREATE OR REPLACE FUNCTION validate_email_domain(email_address TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    domain TEXT;
    blocked_domains TEXT[] := ARRAY['tempmail.com', 'throwaway.email', 'guerrillamail.com'];
BEGIN
    domain := LOWER(SPLIT_PART(email_address, '@', 2));
    
    IF domain = ANY(blocked_domains) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate email on insert/update
CREATE OR REPLACE FUNCTION check_email_domain()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT validate_email_domain(NEW.email) THEN
        RAISE EXCEPTION 'Email domain is not allowed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_email_domain_trigger
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION check_email_domain();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM sessions 
    WHERE expires_at < CURRENT_TIMESTAMP 
    OR (is_active = false AND created_at < CURRENT_TIMESTAMP - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;

-- Function to calculate portfolio performance
CREATE OR REPLACE FUNCTION calculate_portfolio_performance(p_portfolio_id UUID)
RETURNS TABLE (
    total_value DECIMAL(20,8),
    total_profit_loss DECIMAL(20,8),
    day_change DECIMAL(10,4),
    week_change DECIMAL(10,4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(total_value_usd), 0) as total_value,
        COALESCE(SUM(profit_loss), 0) as total_profit_loss,
        COALESCE(AVG(change_24h_percent), 0) as day_change,
        COALESCE(AVG(change_24h_percent * 7), 0) as week_change
    FROM assets
    WHERE portfolio_id = p_portfolio_id
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PRODUCTION SECURITY POLICIES
-- =====================================================

-- Enable Row Level Security on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
CREATE POLICY users_policy ON users
    FOR ALL
    USING (id = current_setting('app.current_user_id')::UUID);

CREATE POLICY portfolios_policy ON portfolios
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY assets_policy ON assets
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY transactions_policy ON transactions
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- =====================================================
-- PRODUCTION AUDIT TRIGGERS
-- =====================================================

-- Enhanced audit logging function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    audit_user_id UUID;
    old_data JSONB;
    new_data JSONB;
BEGIN
    -- Get current user ID from session
    BEGIN
        audit_user_id := current_setting('app.current_user_id')::UUID;
    EXCEPTION
        WHEN OTHERS THEN
            audit_user_id := NULL;
    END;
    
    -- Prepare old and new data
    IF TG_OP = 'DELETE' THEN
        old_data := row_to_json(OLD)::JSONB;
        new_data := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := row_to_json(OLD)::JSONB;
        new_data := row_to_json(NEW)::JSONB;
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := row_to_json(NEW)::JSONB;
    END IF;
    
    -- Insert audit log
    INSERT INTO audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        ip_address,
        created_at
    ) VALUES (
        audit_user_id,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        old_data,
        new_data,
        inet_client_addr(),
        CURRENT_TIMESTAMP
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_portfolios
AFTER INSERT OR UPDATE OR DELETE ON portfolios
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_transactions
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- PRODUCTION SCHEDULED JOBS
-- =====================================================

-- Create a job to clean up expired sessions (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-sessions', '0 * * * *', 'SELECT cleanup_expired_sessions();');

-- =====================================================
-- PRODUCTION VIEWS
-- =====================================================

-- Create view for user dashboard
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.email,
    u.kyc_status,
    p.total_value_usd as portfolio_value,
    p.total_profit_loss,
    p.day_change_percent,
    COUNT(DISTINCT a.id) as total_assets,
    COUNT(DISTINCT t.id) as total_transactions
FROM users u
LEFT JOIN portfolios p ON u.id = p.user_id AND p.is_primary = true
LEFT JOIN assets a ON p.id = a.portfolio_id
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.full_name, u.email, u.kyc_status, 
         p.total_value_usd, p.total_profit_loss, p.day_change_percent;

-- =====================================================
-- PRODUCTION STATISTICS
-- =====================================================

-- Table for storing platform statistics
CREATE TABLE IF NOT EXISTS platform_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    total_volume DECIMAL(20,8) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Function to update daily statistics
CREATE OR REPLACE FUNCTION update_daily_statistics()
RETURNS void AS $$
BEGIN
    INSERT INTO platform_statistics (
        date,
        total_users,
        active_users,
        new_users,
        total_transactions,
        total_volume
    )
    SELECT 
        CURRENT_DATE,
        COUNT(DISTINCT u.id),
        COUNT(DISTINCT CASE WHEN u.last_login_at > CURRENT_DATE - INTERVAL '7 days' THEN u.id END),
        COUNT(DISTINCT CASE WHEN DATE(u.created_at) = CURRENT_DATE THEN u.id END),
        COUNT(DISTINCT t.id),
        COALESCE(SUM(t.amount), 0)
    FROM users u
    LEFT JOIN transactions t ON u.id = t.user_id AND DATE(t.created_at) = CURRENT_DATE
    ON CONFLICT (date) DO UPDATE SET
        total_users = EXCLUDED.total_users,
        active_users = EXCLUDED.active_users,
        new_users = EXCLUDED.new_users,
        total_transactions = EXCLUDED.total_transactions,
        total_volume = EXCLUDED.total_volume;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FINAL CLEANUP AND OPTIMIZATION
-- =====================================================

-- Analyze all tables for query optimization
ANALYZE;

-- Show summary
DO $$
DECLARE
    user_count INTEGER;
    portfolio_count INTEGER;
    asset_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO portfolio_count FROM portfolios;
    SELECT COUNT(*) INTO asset_count FROM assets;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PRODUCTION DATABASE SETUP COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Current Status:';
    RAISE NOTICE '  Users: %', user_count;
    RAISE NOTICE '  Portfolios: %', portfolio_count;
    RAISE NOTICE '  Assets: %', asset_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Security Features:';
    RAISE NOTICE '  ✓ Row Level Security enabled';
    RAISE NOTICE '  ✓ Audit logging active';
    RAISE NOTICE '  ✓ Demo accounts blocked';
    RAISE NOTICE '  ✓ Email validation active';
    RAISE NOTICE '========================================';
END $$;
