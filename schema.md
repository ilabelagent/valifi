# Valifi Platform: Database Schema

This document outlines the database schema for the Valifi platform, designed for a SQLite-compatible database like Turso.

```sql
-- Users and Authentication
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    profilePhotoUrl TEXT,
    kycStatus TEXT DEFAULT 'Not Started',
    kycRejectionReason TEXT,
    isAdmin BOOLEAN DEFAULT FALSE,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL UNIQUE,
    twoFactorEnabled BOOLEAN DEFAULT FALSE,
    twoFactorMethod TEXT DEFAULT 'none',
    twoFactorSecret TEXT,
    loginAlerts BOOLEAN DEFAULT TRUE,
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
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Assets and Investments
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    ticker TEXT NOT NULL,
    type TEXT NOT NULL,
    balance REAL DEFAULT 0,
    balanceInEscrow REAL DEFAULT 0,
    valueUSD REAL DEFAULT 0,
    change24h REAL DEFAULT 0,
    allocation REAL DEFAULT 0,
    initialInvestment REAL,
    totalEarnings REAL,
    status TEXT,
    maturityDate TEXT,
    payoutDestination TEXT,
    details TEXT, -- JSON stored as TEXT
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS investment_logs (
    id TEXT PRIMARY KEY,
    assetId TEXT NOT NULL,
    date TEXT NOT NULL,
    action TEXT NOT NULL,
    amountUSD REAL NOT NULL,
    status TEXT NOT NULL,
    referenceId TEXT,
    FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE CASCADE
);

-- Financials
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    amountUSD REAL NOT NULL,
    status TEXT NOT NULL,
    type TEXT NOT NULL,
    txHash TEXT,
    relatedAssetId TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- P2P System
CREATE TABLE IF NOT EXISTS p2p_offers (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL, -- 'BUY' or 'SELL'
    assetTicker TEXT NOT NULL,
    fiatCurrency TEXT NOT NULL,
    price REAL NOT NULL,
    availableAmount REAL NOT NULL,
    minOrder REAL,
    maxOrder REAL,
    paymentTimeLimitMinutes INTEGER,
    terms TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS p2p_orders (
    id TEXT PRIMARY KEY,
    offerId TEXT NOT NULL,
    buyerId TEXT NOT NULL,
    sellerId TEXT NOT NULL,
    status TEXT NOT NULL,
    fiatAmount REAL NOT NULL,
    cryptoAmount REAL NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    expiresAt TEXT,
    completedAt TEXT,
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
    isFrozen BOOLEAN DEFAULT FALSE,
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
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
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
    isRead BOOLEAN DEFAULT FALSE,
    link TEXT,
    linkContext TEXT, -- JSON stored as TEXT
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS news_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    linkText TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS career_applications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    expertise TEXT NOT NULL,
    coverLetter TEXT,
    resumeFileName TEXT,
    submittedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- AI Caching
CREATE TABLE IF NOT EXISTS ai_suggestions_cache (
    id TEXT PRIMARY KEY,
    suggestion_key TEXT NOT NULL UNIQUE,
    generated_text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```
