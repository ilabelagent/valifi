-- Valifi Platform PostgreSQL Migration Script
-- Version: 1.0
-- Date: 2025-01-27
-- Description: Complete schema migration from Turso (SQLite) to PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop tables if they exist (for clean migration)
DROP TABLE IF EXISTS ai_suggestions_cache CASCADE;
DROP TABLE IF EXISTS career_applications CASCADE;
DROP TABLE IF EXISTS news_items CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS loan_applications CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS valifi_cards CASCADE;
DROP TABLE IF EXISTS p2p_reviews CASCADE;
DROP TABLE IF EXISTS p2p_disputes CASCADE;
DROP TABLE IF EXISTS p2p_chat_messages CASCADE;
DROP TABLE IF EXISTS p2p_payment_methods CASCADE;
DROP TABLE IF EXISTS p2p_orders CASCADE;
DROP TABLE IF EXISTS p2p_offers CASCADE;
DROP TABLE IF EXISTS investment_logs CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS active_sessions CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS portfolios CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_photo_url TEXT,
    kyc_status VARCHAR(50) NOT NULL DEFAULT 'Not Started' 
        CHECK(kyc_status IN ('Not Started', 'Pending', 'Approved', 'Rejected', 'Resubmit Required')),
    kyc_rejection_reason TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    refresh_token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_method VARCHAR(20) NOT NULL DEFAULT 'none' 
        CHECK(two_factor_method IN ('none', 'email', 'sms', 'authenticator')),
    two_factor_secret TEXT,
    login_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    preferences JSONB,
    privacy JSONB,
    vault_recovery JSONB,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    device VARCHAR(255),
    location VARCHAR(255),
    ip_address INET,
    last_active TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Portfolios
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    total_value_usd DECIMAL(15,2) DEFAULT 0,
    cash_balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Assets and Investments
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    portfolio_id UUID,
    name VARCHAR(255) NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK(type IN ('Crypto', 'Stock', 'Cash', 'NFT', 'REIT')),
    quantity DECIMAL(18,8) DEFAULT 0,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    balance_in_escrow DECIMAL(15,2) NOT NULL DEFAULT 0,
    value_usd DECIMAL(15,2) NOT NULL DEFAULT 0,
    change_24h DECIMAL(10,2) NOT NULL DEFAULT 0,
    allocation DECIMAL(5,2) NOT NULL DEFAULT 0,
    initial_investment DECIMAL(15,2),
    total_earnings DECIMAL(15,2),
    status VARCHAR(30) CHECK(status IN ('Active', 'Pending', 'Matured', 'Withdrawable', 'Pending Withdrawal', 'Withdrawn')),
    maturity_date DATE,
    payout_destination VARCHAR(20) CHECK(payout_destination IN ('wallet', 'balance')),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
);

CREATE TABLE investment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    action VARCHAR(30) NOT NULL 
        CHECK(action IN ('Buy', 'Reward', 'Compound', 'Withdrawal', 'Maturity Transfer', 
                        'Stake Withdrawal Request', 'Dividend Payout', 'Sell')),
    amount_usd DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK(status IN ('Completed', 'Pending')),
    reference_id VARCHAR(255),
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- Financials
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    amount_usd DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK(status IN ('Completed', 'Pending', 'Failed')),
    type VARCHAR(30) NOT NULL 
        CHECK(type IN ('Deposit', 'Withdrawal', 'Trade', 'Interest', 'Sent', 'Received', 
                      'Reinvestment', 'ROI Payout', 'Maturity', 'P2P', 'Loan Repayment')),
    tx_hash VARCHAR(255),
    related_asset_id UUID,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- P2P System
CREATE TABLE p2p_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(10) NOT NULL CHECK(type IN ('BUY', 'SELL')),
    asset_ticker VARCHAR(20) NOT NULL,
    fiat_currency VARCHAR(10) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    available_amount DECIMAL(18,8) NOT NULL,
    min_order DECIMAL(15,2),
    max_order DECIMAL(15,2),
    payment_time_limit_minutes INTEGER,
    terms TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE p2p_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL,
    buyer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    status VARCHAR(30) NOT NULL 
        CHECK(status IN ('Pending Payment', 'Payment Sent', 'Escrow Released', 'Completed', 
                        'Cancelled', 'Disputed', 'Under Review', 'Auto-Cancelled')),
    fiat_amount DECIMAL(15,2) NOT NULL,
    crypto_amount DECIMAL(18,8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    payment_method_details JSONB,
    FOREIGN KEY (offer_id) REFERENCES p2p_offers(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);

CREATE TABLE p2p_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    method_type VARCHAR(50) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    country VARCHAR(2) NOT NULL,
    details JSONB,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE p2p_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    author_id UUID NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    image_url TEXT,
    FOREIGN KEY (order_id) REFERENCES p2p_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE p2p_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE,
    raised_by_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Open' 
        CHECK(status IN ('Open', 'Under Review', 'Resolved')),
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES p2p_orders(id),
    FOREIGN KEY (raised_by_id) REFERENCES users(id)
);

CREATE TABLE p2p_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE,
    from_user_id UUID NOT NULL,
    to_user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES p2p_orders(id),
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id)
);

-- Platform Features
CREATE TABLE valifi_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL,
    type VARCHAR(30) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    theme VARCHAR(50),
    card_number_hash VARCHAR(255),
    expiry VARCHAR(10),
    cvv_hash VARCHAR(255),
    is_frozen BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    details JSONB, -- Encrypted in application layer
    status VARCHAR(30) NOT NULL,
    rejection_reason TEXT,
    account_display VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    term INTEGER NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    collateral_asset_id UUID NOT NULL,
    status VARCHAR(30) NOT NULL,
    reason TEXT,
    rejection_reason TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (collateral_asset_id) REFERENCES assets(id)
);

-- Content & Communication
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link TEXT,
    link_context JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE news_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    link_text VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE career_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    expertise VARCHAR(255) NOT NULL,
    cover_letter TEXT,
    resume_file_name VARCHAR(255),
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AI Caching
CREATE TABLE ai_suggestions_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion_key VARCHAR(255) NOT NULL UNIQUE,
    generated_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_assets_user_id_type ON assets(user_id, type);
CREATE INDEX idx_assets_portfolio_id ON assets(portfolio_id);
CREATE INDEX idx_transactions_user_id_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_p2p_offers_asset_fiat ON p2p_offers(asset_ticker, fiat_currency);
CREATE INDEX idx_p2p_orders_buyer_id ON p2p_orders(buyer_id);
CREATE INDEX idx_p2p_orders_seller_id ON p2p_orders(seller_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_active_sessions_user_id ON active_sessions(user_id);
CREATE INDEX idx_investment_logs_asset_id ON investment_logs(asset_id);
CREATE INDEX idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);

-- Create update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant appropriate permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO valifi_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO valifi_app;
-- GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO valifi_app;

-- Add comments for documentation
COMMENT ON TABLE users IS 'Core user accounts table for the Valifi platform';
COMMENT ON TABLE portfolios IS 'User investment portfolios';
COMMENT ON TABLE assets IS 'User assets including crypto, stocks, NFTs, and REITs';
COMMENT ON TABLE transactions IS 'Financial transaction history';
COMMENT ON TABLE p2p_offers IS 'Peer-to-peer trading offers';
COMMENT ON TABLE p2p_orders IS 'Peer-to-peer trading orders';
COMMENT ON COLUMN users.kyc_status IS 'Know Your Customer verification status';
COMMENT ON COLUMN assets.balance_in_escrow IS 'Amount locked in escrow for P2P or other operations';
COMMENT ON COLUMN transactions.tx_hash IS 'Blockchain transaction hash for crypto transactions';
