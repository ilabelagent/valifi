-- Valifi Fintech Platform Enhanced Schema
-- Version 2.0.0 - Complete fintech operations

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table with KYC/AML compliance
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    date_of_birth DATE,

    -- KYC/AML fields
    kyc_status VARCHAR(50) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'in_review', 'approved', 'rejected', 'expired')),
    kyc_level INTEGER DEFAULT 0,
    aml_status VARCHAR(50) DEFAULT 'pending' CHECK (aml_status IN ('pending', 'clear', 'flagged', 'blocked')),
    identity_verified BOOLEAN DEFAULT FALSE,
    identity_verification_date TIMESTAMP,
    document_type VARCHAR(50),
    document_number VARCHAR(100),
    document_expiry DATE,
    country_code VARCHAR(2),
    tax_id VARCHAR(100),
    risk_score INTEGER DEFAULT 0,

    -- Account status
    account_status VARCHAR(50) DEFAULT 'active' CHECK (account_status IN ('pending', 'active', 'suspended', 'closed')),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP
);

-- Wallets table with ArmorWallet integration
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_type VARCHAR(50) NOT NULL CHECK (wallet_type IN ('fiat', 'crypto', 'trading', 'savings')),
    currency VARCHAR(10) NOT NULL,
    balance DECIMAL(20, 8) DEFAULT 0,
    available_balance DECIMAL(20, 8) DEFAULT 0,
    locked_balance DECIMAL(20, 8) DEFAULT 0,

    -- ArmorWallet specific fields
    armor_wallet_id VARCHAR(255),
    armor_wallet_address VARCHAR(255),
    private_key_encrypted TEXT,
    public_key VARCHAR(255),
    wallet_status VARCHAR(50) DEFAULT 'active' CHECK (wallet_status IN ('active', 'frozen', 'closed')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, wallet_type, currency)
);

-- Trading accounts (Alpaca & Interactive Brokers)
CREATE TABLE IF NOT EXISTS trading_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    broker VARCHAR(50) NOT NULL CHECK (broker IN ('alpaca', 'interactive_brokers', 'internal')),
    account_number VARCHAR(255) UNIQUE,
    api_key_encrypted TEXT,
    api_secret_encrypted TEXT,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    account_status VARCHAR(50) DEFAULT 'active',
    is_paper_trading BOOLEAN DEFAULT FALSE,
    buying_power DECIMAL(20, 2),
    portfolio_value DECIMAL(20, 2),
    cash_balance DECIMAL(20, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market data subscriptions
CREATE TABLE IF NOT EXISTS market_data_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    data_provider VARCHAR(50) CHECK (data_provider IN ('alpaca', 'polygon', 'finnhub', 'yahoo')),
    subscription_type VARCHAR(50) CHECK (subscription_type IN ('realtime', 'delayed', 'historical')),
    symbols TEXT[], -- Array of subscribed symbols
    features TEXT[], -- Array of features (quotes, trades, bars, news, etc.)
    status VARCHAR(50) DEFAULT 'active',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    trading_account_id UUID REFERENCES trading_accounts(id),
    order_type VARCHAR(50) CHECK (order_type IN ('market', 'limit', 'stop', 'stop_limit', 'trailing_stop')),
    side VARCHAR(10) CHECK (side IN ('buy', 'sell')),
    symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8),
    stop_price DECIMAL(20, 8),
    time_in_force VARCHAR(20) CHECK (time_in_force IN ('day', 'gtc', 'ioc', 'fok')),
    status VARCHAR(50) DEFAULT 'pending',
    broker_order_id VARCHAR(255),
    filled_quantity DECIMAL(20, 8) DEFAULT 0,
    filled_avg_price DECIMAL(20, 8),
    commission DECIMAL(20, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    filled_at TIMESTAMP,
    canceled_at TIMESTAMP
);

-- Positions table
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    trading_account_id UUID REFERENCES trading_accounts(id),
    symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    avg_entry_price DECIMAL(20, 8) NOT NULL,
    current_price DECIMAL(20, 8),
    market_value DECIMAL(20, 8),
    unrealized_pnl DECIMAL(20, 8),
    realized_pnl DECIMAL(20, 8),
    position_type VARCHAR(20) CHECK (position_type IN ('long', 'short')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    UNIQUE(trading_account_id, symbol)
);

-- Transactions table (for all financial movements)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id),
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',

    -- Payment gateway fields
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50), -- stripe, paypal, coinbase, etc.
    gateway_transaction_id VARCHAR(255),
    gateway_response TEXT,

    -- Transaction details
    from_address VARCHAR(255),
    to_address VARCHAR(255),
    tx_hash VARCHAR(255),
    confirmations INTEGER DEFAULT 0,
    fee DECIMAL(20, 8),
    memo TEXT,

    -- Compliance
    aml_check_status VARCHAR(50),
    aml_check_result TEXT,
    risk_score INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason TEXT
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('credit_card', 'debit_card', 'bank_account', 'crypto_wallet', 'paypal')),
    provider VARCHAR(50), -- stripe, plaid, etc.
    provider_payment_method_id VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,

    -- Card details (tokenized)
    card_brand VARCHAR(50),
    card_last4 VARCHAR(4),
    card_exp_month INTEGER,
    card_exp_year INTEGER,

    -- Bank details (tokenized)
    bank_name VARCHAR(255),
    bank_account_last4 VARCHAR(4),
    bank_routing_number_last4 VARCHAR(4),

    -- Crypto details
    crypto_address VARCHAR(255),
    crypto_network VARCHAR(50),

    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

-- KYC documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_url TEXT,
    document_hash VARCHAR(255),
    verification_status VARCHAR(50) DEFAULT 'pending',
    verification_result TEXT,
    verified_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- AML monitoring table
CREATE TABLE IF NOT EXISTS aml_monitoring (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id),
    check_type VARCHAR(100),
    check_result VARCHAR(50),
    risk_factors TEXT[],
    risk_score INTEGER,
    flagged BOOLEAN DEFAULT FALSE,
    reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by VARCHAR(255),
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

-- API keys management
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_name VARCHAR(255),
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(20), -- First few chars for identification
    permissions TEXT[],
    rate_limit INTEGER DEFAULT 100,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

-- Market data cache
CREATE TABLE IF NOT EXISTS market_data_cache (
    symbol VARCHAR(20),
    data_type VARCHAR(50), -- quote, trade, bar, news
    data JSONB NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (symbol, data_type, timestamp)
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_positions_user_id ON positions(user_id);
CREATE INDEX idx_market_data_cache_symbol ON market_data_cache(symbol);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

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

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_accounts_updated_at BEFORE UPDATE ON trading_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();