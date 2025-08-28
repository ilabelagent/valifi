-- Valifi Platform: Advanced Features Schema
-- Version: 3.0
-- Additional tables for P2P, DeFi, and advanced trading

-- P2P Trading System
CREATE TABLE IF NOT EXISTS p2p_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    offer_type VARCHAR(10) NOT NULL CHECK (offer_type IN ('buy', 'sell')),
    asset_symbol VARCHAR(20) NOT NULL,
    fiat_currency VARCHAR(3) NOT NULL,
    price_per_unit DECIMAL(20,8) NOT NULL,
    min_amount DECIMAL(20,8) NOT NULL,
    max_amount DECIMAL(20,8) NOT NULL,
    available_amount DECIMAL(20,8) NOT NULL,
    payment_methods TEXT[],
    payment_time_limit INTEGER DEFAULT 15, -- minutes
    terms_conditions TEXT,
    auto_accept BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    completed_orders INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 100.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS p2p_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID NOT NULL REFERENCES p2p_offers(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    fiat_amount DECIMAL(20,8) NOT NULL,
    crypto_amount DECIMAL(20,8) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    payment_method VARCHAR(100),
    payment_reference VARCHAR(255),
    escrow_tx_id UUID,
    chat_enabled BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    payment_confirmed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES users(id),
    cancellation_reason TEXT,
    dispute_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DeFi Features
CREATE TABLE IF NOT EXISTS defi_pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    protocol VARCHAR(50) NOT NULL,
    chain VARCHAR(50) NOT NULL,
    token_a VARCHAR(20) NOT NULL,
    token_b VARCHAR(20) NOT NULL,
    tvl DECIMAL(30,8) DEFAULT 0,
    apr DECIMAL(10,4),
    apy DECIMAL(10,4),
    volume_24h DECIMAL(30,8),
    fees_24h DECIMAL(20,8),
    is_active BOOLEAN DEFAULT true,
    risk_level VARCHAR(20),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS defi_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pool_id UUID NOT NULL REFERENCES defi_pools(id),
    position_type VARCHAR(20) NOT NULL, -- 'liquidity', 'staking', 'farming', 'lending', 'borrowing'
    amount_invested DECIMAL(30,8) NOT NULL,
    current_value DECIMAL(30,8),
    rewards_earned DECIMAL(30,8) DEFAULT 0,
    rewards_claimed DECIMAL(30,8) DEFAULT 0,
    entry_price DECIMAL(20,8),
    current_price DECIMAL(20,8),
    impermanent_loss DECIMAL(20,8),
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Staking System
CREATE TABLE IF NOT EXISTS staking_pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_symbol VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    min_stake DECIMAL(20,8) NOT NULL,
    max_stake DECIMAL(20,8),
    lock_period_days INTEGER DEFAULT 0,
    apy DECIMAL(10,4) NOT NULL,
    total_staked DECIMAL(30,8) DEFAULT 0,
    rewards_distributed DECIMAL(30,8) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    auto_compound BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_stakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pool_id UUID NOT NULL REFERENCES staking_pools(id),
    amount DECIMAL(20,8) NOT NULL,
    rewards_earned DECIMAL(20,8) DEFAULT 0,
    rewards_claimed DECIMAL(20,8) DEFAULT 0,
    last_reward_calculation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unlock_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    auto_compound BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trading Bots Configuration
CREATE TABLE IF NOT EXISTS trading_bots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    strategy VARCHAR(50) NOT NULL, -- 'grid', 'dca', 'arbitrage', 'market_making', 'trend_following'
    status VARCHAR(20) DEFAULT 'inactive',
    pairs TEXT[],
    investment_amount DECIMAL(20,8) NOT NULL,
    current_value DECIMAL(20,8),
    total_profit_loss DECIMAL(20,8) DEFAULT 0,
    win_rate DECIMAL(5,2),
    total_trades INTEGER DEFAULT 0,
    successful_trades INTEGER DEFAULT 0,
    config JSONB NOT NULL DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    risk_parameters JSONB DEFAULT '{}',
    last_trade_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    stopped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trading_bot_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID NOT NULL REFERENCES trading_bots(id) ON DELETE CASCADE,
    order_type VARCHAR(20) NOT NULL, -- 'market', 'limit', 'stop', 'stop_limit'
    side VARCHAR(10) NOT NULL, -- 'buy', 'sell'
    pair VARCHAR(20) NOT NULL,
    quantity DECIMAL(20,8) NOT NULL,
    price DECIMAL(20,8),
    executed_price DECIMAL(20,8),
    status VARCHAR(20) NOT NULL,
    profit_loss DECIMAL(20,8),
    fees DECIMAL(20,8),
    exchange VARCHAR(50),
    exchange_order_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP WITH TIME ZONE
);

-- Wallet Management
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    type VARCHAR(20) NOT NULL, -- 'hot', 'cold', 'hardware', 'multi_sig'
    blockchain VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    public_key TEXT,
    encrypted_private_key TEXT, -- Encrypted with user's master key
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    balance DECIMAL(30,8) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, blockchain, address)
);

-- API Keys Management
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(20) NOT NULL, -- First few chars for identification
    permissions JSONB NOT NULL DEFAULT '[]',
    ip_whitelist INET[],
    rate_limit INTEGER DEFAULT 1000, -- requests per hour
    requests_made INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Referral System
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    commission_rate DECIMAL(5,2) DEFAULT 0.10, -- 10%
    total_commission_earned DECIMAL(20,8) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    activated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(referred_id)
);

-- Create indexes for new tables
CREATE INDEX idx_p2p_offers_user_id ON p2p_offers(user_id);
CREATE INDEX idx_p2p_offers_asset_fiat ON p2p_offers(asset_symbol, fiat_currency);
CREATE INDEX idx_p2p_orders_status ON p2p_orders(status);
CREATE INDEX idx_p2p_orders_buyer_seller ON p2p_orders(buyer_id, seller_id);
CREATE INDEX idx_defi_positions_user_id ON defi_positions(user_id);
CREATE INDEX idx_user_stakes_user_id ON user_stakes(user_id);
CREATE INDEX idx_trading_bots_user_id ON trading_bots(user_id);
CREATE INDEX idx_trading_bot_orders_bot_id ON trading_bot_orders(bot_id);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);