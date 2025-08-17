-- SQL Schema for Valifi Platform
-- Based on data-models.md and types.ts

-- Core Models
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    profilePhotoUrl TEXT,
    kycStatus TEXT NOT NULL CHECK(kycStatus IN ('Not Started', 'Pending', 'Approved', 'Rejected', 'Resubmit Required')) DEFAULT 'Not Started',
    kycRejectionReason TEXT,
    isAdmin INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL UNIQUE,
    twoFactorEnabled INTEGER NOT NULL DEFAULT 0,
    twoFactorMethod TEXT CHECK(twoFactorMethod IN ('none', 'email', 'sms', 'authenticator')) DEFAULT 'none',
    twoFactorSecret TEXT,
    loginAlerts INTEGER NOT NULL DEFAULT 0,
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

-- Investment & Asset Models
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    ticker TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Crypto', 'Stock', 'Cash', 'NFT', 'REIT')),
    balance REAL NOT NULL DEFAULT 0,
    balanceInEscrow REAL DEFAULT 0,
    valueUSD REAL NOT NULL DEFAULT 0,
    initialInvestment REAL,
    totalEarnings REAL,
    status TEXT,
    maturityDate TEXT,
    payoutDestination TEXT,
    details TEXT, -- JSON stored as TEXT
    change24h REAL DEFAULT 0,
    allocation REAL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_assets_userId_ticker ON assets(userId, ticker);

CREATE TABLE IF NOT EXISTS investment_logs (
    id TEXT PRIMARY KEY,
    assetId TEXT NOT NULL,
    date TEXT NOT NULL,
    action TEXT NOT NULL,
    amountUSD REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Completed', 'Pending')),
    referenceId TEXT,
    FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE CASCADE
);

-- Transaction & Financial Models
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    amountUSD REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Completed', 'Pending', 'Failed')),
    type TEXT NOT NULL,
    txHash TEXT,
    relatedAssetId TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (relatedAssetId) REFERENCES assets(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_transactions_userId_date ON transactions(userId, date DESC);

-- P2P Exchange Models
CREATE TABLE IF NOT EXISTS p2p_offers (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('BUY', 'SELL')),
    assetTicker TEXT NOT NULL,
    fiatCurrency TEXT NOT NULL,
    price REAL NOT NULL,
    availableAmount REAL NOT NULL,
    minOrder REAL NOT NULL,
    maxOrder REAL NOT NULL,
    paymentTimeLimitMinutes INTEGER NOT NULL,
    terms TEXT,
    isActive INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS p2p_orders (
    id TEXT PRIMARY KEY,
    offerId TEXT NOT NULL,
    buyerId TEXT NOT NULL,
    sellerId TEXT NOT NULL,
    status TEXT NOT NULL,
    fiatAmount REAL NOT NULL,
    cryptoAmount REAL NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiresAt TEXT,
    completedAt TEXT,
    paymentMethodDetails TEXT, -- Storing the chosen payment method as JSON
    reviewDetails TEXT, -- Storing the review as JSON
    FOREIGN KEY (offerId) REFERENCES p2p_offers(id),
    FOREIGN KEY (buyerId) REFERENCES users(id),
    FOREIGN KEY (sellerId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS p2p_chat_messages (
    id TEXT PRIMARY KEY,
    orderId TEXT NOT NULL,
    authorId TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    imageUrl TEXT,
    FOREIGN KEY (orderId) REFERENCES p2p_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS p2p_disputes (
    id TEXT PRIMARY KEY,
    orderId TEXT NOT NULL UNIQUE,
    raisedById TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL,
    resolution TEXT,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    logs TEXT, -- JSON Array of log objects
    FOREIGN KEY (orderId) REFERENCES p2p_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (raisedById) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payment_methods (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    methodType TEXT NOT NULL,
    nickname TEXT NOT NULL,
    country TEXT NOT NULL,
    details TEXT, -- JSON
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Feature-Specific Models
CREATE TABLE IF NOT EXISTS loan_applications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    amount REAL NOT NULL,
    term INTEGER NOT NULL,
    interestRate REAL NOT NULL,
    collateralAssetId TEXT NOT NULL,
    status TEXT NOT NULL,
    reason TEXT,
    details TEXT, -- JSON with repayment progress, dates, etc.
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (collateralAssetId) REFERENCES assets(id)
);

CREATE TABLE IF NOT EXISTS valifi_cards (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL,
    type TEXT NOT NULL,
    currency TEXT NOT NULL,
    theme TEXT NOT NULL,
    cardNumberHash TEXT,
    expiry TEXT, -- Encrypted
    cvvHash TEXT,
    isFrozen INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bank_accounts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    countryCode TEXT NOT NULL,
    nickname TEXT NOT NULL,
    accountDisplay TEXT NOT NULL, -- e.g., "Chase (...1234)"
    details TEXT NOT NULL, -- Encrypted JSON
    status TEXT NOT NULL CHECK(status IN ('Pending', 'Verified', 'Rejected')),
    rejectionReason TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Other Models (from controllers)
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    isRead INTEGER NOT NULL DEFAULT 0,
    link TEXT,
    linkContext TEXT, -- JSON for extra context e.g. { orderId: "..." }
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS news_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watched_wallets (
    id TEXT PRIMARY KEY,
    hash TEXT NOT NULL UNIQUE,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reits (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    totalShares REAL NOT NULL,
    pricePerShare REAL NOT NULL,
    imageUrl TEXT,
    monthlyDividend REAL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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
