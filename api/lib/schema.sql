# Valifi Platform: Database Schema

This document outlines the database schema for the Valifi platform, designed for a SQLite-compatible database like Turso. This version includes production-ready enhancements like constraints and indexes.

```sql
-- Users and Authentication
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    profilePhotoUrl TEXT,
    kycStatus TEXT NOT NULL DEFAULT 'Not Started' CHECK(kycStatus IN ('Not Started', 'Pending', 'Approved', 'Rejected', 'Resubmit Required')),
    kycRejectionReason TEXT,
    isAdmin BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL UNIQUE,
    twoFactorEnabled BOOLEAN NOT NULL DEFAULT FALSE,
    twoFactorMethod TEXT NOT NULL DEFAULT 'none' CHECK(twoFactorMethod IN ('none', 'email', 'sms', 'authenticator')),
    twoFactorSecret TEXT,
    loginAlerts BOOLEAN NOT NULL DEFAULT TRUE,
    preferences TEXT, -- JSON stored as TEXT
    privacy TEXT, -- JSON stored as TEXT
    vaultRecovery TEXT, -- JSON stored as TEXT
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS active_sessions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    device TEXT,
    location TEXT,
    ipAddress TEXT,
    lastActive TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Assets and Investments
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    ticker TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Crypto', 'Stock', 'Cash', 'NFT', 'REIT')),
    balance REAL NOT NULL DEFAULT 0,
    balanceInEscrow REAL NOT NULL DEFAULT 0,
    valueUSD REAL NOT NULL DEFAULT 0,
    change24h REAL NOT NULL DEFAULT 0,
    allocation REAL NOT NULL DEFAULT 0,
    initialInvestment REAL,
    totalEarnings REAL,
    status TEXT CHECK(status IN ('Active', 'Pending', 'Matured', 'Withdrawable', 'Pending Withdrawal', 'Withdrawn')),
    maturityDate TEXT,
    payoutDestination TEXT CHECK(payoutDestination IN ('wallet', 'balance')),
    details TEXT, -- JSON stored as TEXT
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS investment_logs (
    id TEXT PRIMARY KEY,
    assetId TEXT NOT NULL,
    date TEXT NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('Buy', 'Reward', 'Compound', 'Withdrawal', 'Maturity Transfer', 'Stake Withdrawal Request', 'Dividend Payout', 'Sell')),
    amountUSD REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Completed', 'Pending')),
    referenceId TEXT,
    FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE CASCADE
);

-- Financials
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    amountUSD REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Completed', 'Pending', 'Failed')),
    type TEXT NOT NULL CHECK(type IN ('Deposit', 'Withdrawal', 'Trade', 'Interest', 'Sent', 'Received', 'Reinvestment', 'ROI Payout', 'Maturity', 'P2P', 'Loan Repayment')),
    txHash TEXT,
    relatedAssetId TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- P2P System
CREATE TABLE IF NOT EXISTS p2p_offers (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('BUY', 'SELL')),
    assetTicker TEXT NOT NULL,
    fiatCurrency TEXT NOT NULL,
    price REAL NOT NULL,
    availableAmount REAL NOT NULL,
    minOrder REAL,
    maxOrder REAL,
    paymentTimeLimitMinutes INTEGER,
    terms TEXT,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS p2p_orders (
    id TEXT PRIMARY KEY,
    offerId TEXT NOT NULL,
    buyerId TEXT NOT NULL,
    sellerId TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Pending Payment', 'Payment Sent', 'Escrow Released', 'Completed', 'Cancelled', 'Disputed', 'Under Review', 'Auto-Cancelled')),
    fiatAmount REAL NOT NULL,
    cryptoAmount REAL NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiresAt TEXT,
    completedAt TEXT,
    paymentMethodDetails TEXT, -- Storing a snapshot of the payment method used
    FOREIGN KEY (offerId) REFERENCES p2p_offers(id),
    FOREIGN KEY (buyerId) REFERENCES users(id),
    FOREIGN KEY (sellerId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS p2p_payment_methods (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    methodType TEXT NOT NULL,
    nickname TEXT NOT NULL,
    country TEXT NOT NULL,
    details TEXT, -- JSON stored as TEXT
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- P2P SUPPORTING TABLES
CREATE TABLE IF NOT EXISTS p2p_chat_messages (
    id TEXT PRIMARY KEY,
    orderId TEXT NOT NULL,
    authorId TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    imageUrl TEXT,
    FOREIGN KEY (orderId) REFERENCES p2p_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (authorId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS p2p_disputes (
    id TEXT PRIMARY KEY,
    orderId TEXT NOT NULL UNIQUE,
    raisedById TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open' CHECK(status IN ('Open', 'Under Review', 'Resolved')),
    resolution TEXT,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderId) REFERENCES p2p_orders(id),
    FOREIGN KEY (raisedById) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS p2p_reviews (
    id TEXT PRIMARY KEY,
    orderId TEXT NOT NULL UNIQUE,
    fromUserId TEXT NOT NULL,
    toUserId TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderId) REFERENCES p2p_orders(id),
    FOREIGN KEY (fromUserId) REFERENCES users(id),
    FOREIGN KEY (toUserId) REFERENCES users(id)
);


-- Platform Features
CREATE TABLE IF NOT EXISTS valifi_cards (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL,
    type TEXT NOT NULL,
    currency TEXT NOT NULL,
    theme TEXT,
    cardNumberHash TEXT,
    expiry TEXT,
    cvvHash TEXT,
    isFrozen BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bank_accounts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    countryCode TEXT NOT NULL,
    nickname TEXT NOT NULL,
    details TEXT, -- Encrypted JSON stored as TEXT
    status TEXT NOT NULL,
    rejectionReason TEXT,
    accountDisplay TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS loan_applications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    amount REAL NOT NULL,
    term INTEGER NOT NULL,
    interestRate REAL NOT NULL,
    collateralAssetId TEXT NOT NULL,
    status TEXT NOT NULL,
    reason TEXT,
    rejectionReason TEXT,
    details TEXT, -- JSON stored as TEXT for repayment progress, etc.
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (collateralAssetId) REFERENCES assets(id)
);

-- Content & Communication
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    isRead BOOLEAN NOT NULL DEFAULT FALSE,
    link TEXT,
    linkContext TEXT, -- JSON stored as TEXT
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS news_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    linkText TEXT,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS career_applications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    expertise TEXT NOT NULL,
    coverLetter TEXT,
    resumeFileName TEXT,
    submittedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AI Caching
CREATE TABLE IF NOT EXISTS ai_suggestions_cache (
    id TEXT PRIMARY KEY,
    suggestion_key TEXT NOT NULL UNIQUE,
    generated_text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_assets_userId_type ON assets(userId, type);
CREATE INDEX IF NOT EXISTS idx_transactions_userId_type ON transactions(userId, type);
CREATE INDEX IF NOT EXISTS idx_p2p_offers_asset_fiat ON p2p_offers(assetTicker, fiatCurrency);
CREATE INDEX IF NOT EXISTS idx_p2p_orders_buyerId ON p2p_orders(buyerId);
CREATE INDEX IF NOT EXISTS idx_p2p_orders_sellerId ON p2p_orders(sellerId);
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
```
