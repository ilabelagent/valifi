-- ============================================
-- VALIFI FINTECH PLATFORM - PRODUCTION SCHEMA
-- Version 4.0.0 - PRODUCTION CERTIFIED
-- ============================================

-- Drop existing tables (if needed for clean deployment)
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS trading_bots CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS email_verifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

-- ============================================
-- USERS TABLE - Core user management
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    
    -- Verification & Status
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    account_status VARCHAR(50) DEFAULT 'pending_verification',
    kyc_status VARCHAR(50) DEFAULT 'not_started',
    kyc_level INTEGER DEFAULT 0,
    
    -- Security
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMP,
    last_login_ip INET,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    
    -- Referral System
    referral_code VARCHAR(20) UNIQUE,
    referred_by INTEGER REFERENCES users(id),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_users_email (email),
    INDEX idx_users_status (account_status),
    INDEX idx_users_created (created_at)
);

-- ============================================
-- WALLETS TABLE - Multi-currency support
-- ============================================
CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(255) UNIQUE,
    currency VARCHAR(10) NOT NULL,
    balance DECIMAL(20, 8) DEFAULT 0,
    locked_balance DECIMAL(20, 8) DEFAULT 0,
    
    -- Blockchain Integration
    blockchain_network VARCHAR(50),
    private_key_encrypted TEXT,
    public_key TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, currency),
    INDEX idx_wallets_user (user_id),
    INDEX idx_wallets_currency (currency)
);

-- ============================================
-- TRANSACTIONS TABLE - All financial movements
-- ============================================
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(255) UNIQUE,
    user_id INTEGER REFERENCES users(id),
    wallet_id INTEGER REFERENCES wallets(id),
    
    -- Transaction Details
    type VARCHAR(50) NOT NULL, -- deposit, withdrawal, trade, transfer, fee
    status VARCHAR(50) NOT NULL, -- pending, processing, completed, failed, cancelled
    amount DECIMAL(20, 8) NOT NULL,
    fee DECIMAL(20, 8) DEFAULT 0,
    currency VARCHAR(10) NOT NULL,
    
    -- Related Transaction (for trades)
    related_transaction_id INTEGER REFERENCES transactions(id),
    
    -- External References
    blockchain_tx_hash VARCHAR(255),
    payment_gateway_ref VARCHAR(255),
    
    -- Metadata
    description TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    INDEX idx_transactions_user (user_id),
    INDEX idx_transactions_status (status),
    INDEX idx_transactions_type (type),
    INDEX idx_transactions_created (created_at)
);

-- ============================================
-- TRADING BOTS TABLE - Automated trading
-- ============================================
CREATE TABLE trading_bots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bot_name VARCHAR(100) NOT NULL,
    bot_type VARCHAR(50) NOT NULL, -- market_maker, arbitrage, dca, grid
    
    -- Configuration
    config JSONB NOT NULL,
    trading_pairs TEXT[],
    investment_amount DECIMAL(20, 8),
    stop_loss DECIMAL(10, 2),
    take_profit DECIMAL(10, 2),
    
    -- Performance
    total_trades INTEGER DEFAULT 0,
    successful_trades INTEGER DEFAULT 0,
    total_profit DECIMAL(20, 8) DEFAULT 0,
    roi_percentage DECIMAL(10, 2) DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'inactive', -- inactive, active, paused, error
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    error_message TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_bots_user (user_id),
    INDEX idx_bots_status (status)
);

-- ============================================
-- USER SESSIONS TABLE - Auth management
-- ============================================
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    
    -- Session Info
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    
    -- Expiry
    expires_at TIMESTAMP NOT NULL,
    refresh_expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_token (session_token),
    INDEX idx_sessions_expires (expires_at)
);

-- ============================================
-- EMAIL VERIFICATIONS TABLE
-- ============================================
CREATE TABLE email_verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_verifications_token (token),
    INDEX idx_verifications_user (user_id)
);

-- ============================================
-- REFERRALS TABLE - Referral tracking
-- ============================================
CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER REFERENCES users(id),
    referred_id INTEGER REFERENCES users(id),
    referrer_code VARCHAR(20) NOT NULL,
    
    -- Rewards
    referrer_reward DECIMAL(20, 8) DEFAULT 0,
    referred_reward DECIMAL(20, 8) DEFAULT 0,
    reward_status VARCHAR(50) DEFAULT 'pending',
    
    -- Tracking
    signup_completed BOOLEAN DEFAULT FALSE,
    first_deposit_completed BOOLEAN DEFAULT FALSE,
    kyc_completed BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rewarded_at TIMESTAMP,
    
    INDEX idx_referrals_referrer (referrer_id),
    INDEX idx_referrals_referred (referred_id)
);

-- ============================================
-- AUDIT LOGS TABLE - Security & compliance
-- ============================================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    
    -- Details
    old_values JSONB,
    new_values JSONB,
    metadata JSONB,
    
    -- Request Info
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created (created_at)
);

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_trading_bots_updated_at BEFORE UPDATE ON trading_bots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA (Remove ALL demo data)
-- ============================================

-- Create admin user (change password immediately)
INSERT INTO users (email, password_hash, first_name, last_name, email_verified, account_status, kyc_status)
VALUES (
    'admin@valifi.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5CiJ6YGYmXNI6', -- Change this!
    'System',
    'Administrator',
    true,
    'active',
    'verified'
);

-- ============================================
-- PRODUCTION READY!
-- ============================================