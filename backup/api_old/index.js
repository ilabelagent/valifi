// Valifi Backend - Complete API in a single file for Vercel
// Using Vercel's catch-all API route pattern

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { createClient } from '@libsql/client';

// Load environment variables
dotenv.config();

// ============================================
// DATABASE SETUP
// ============================================

const getDb = () => {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
        console.warn('Database credentials not configured, using mock mode');
        return null;
    }
    
    return createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });
};

const db = getDb();

// Initialize database schema
async function initializeSchema() {
    if (!db) {
        console.log('Running in mock mode - no database');
        return;
    }
    
    try {
        // Users table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                profile_photo_url TEXT,
                kyc_status TEXT DEFAULT 'Not Started',
                kyc_rejection_reason TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // User settings table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS user_settings (
                user_id TEXT PRIMARY KEY,
                two_factor_enabled BOOLEAN DEFAULT 0,
                two_factor_method TEXT DEFAULT 'none',
                login_alerts BOOLEAN DEFAULT 1,
                auto_logout TEXT DEFAULT '1h',
                currency TEXT DEFAULT 'USD',
                language TEXT DEFAULT 'en',
                date_format TEXT DEFAULT 'MM/DD/YYYY',
                timezone TEXT DEFAULT 'UTC',
                balance_privacy BOOLEAN DEFAULT 0,
                sidebar_collapsed BOOLEAN DEFAULT 0,
                email_marketing BOOLEAN DEFAULT 0,
                platform_messages BOOLEAN DEFAULT 1,
                contact_access BOOLEAN DEFAULT 0,
                vault_recovery_email TEXT,
                vault_recovery_phone TEXT,
                vault_recovery_pin TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Portfolio table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS portfolios (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                total_value REAL DEFAULT 0,
                total_profit REAL DEFAULT 0,
                daily_change REAL DEFAULT 0,
                weekly_change REAL DEFAULT 0,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Assets table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS assets (
                id TEXT PRIMARY KEY,
                portfolio_id TEXT NOT NULL,
                type TEXT NOT NULL,
                ticker TEXT NOT NULL,
                name TEXT NOT NULL,
                balance REAL DEFAULT 0,
                value REAL DEFAULT 0,
                change_24h REAL DEFAULT 0,
                change_percent_24h REAL DEFAULT 0,
                icon TEXT,
                is_staked BOOLEAN DEFAULT 0,
                staking_apr REAL,
                staking_end_date DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (portfolio_id) REFERENCES portfolios(id)
            )
        `);

        // Transactions table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                type TEXT NOT NULL,
                amount REAL NOT NULL,
                asset_ticker TEXT,
                description TEXT,
                status TEXT DEFAULT 'Completed',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        console.log('Database schema initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// ============================================
// MOCK DATA
// ============================================

const mockInvestmentData = {
    stakableStocks: [
        { ticker: "AAPL", name: "Apple Inc.", price: 178.50, apr: 8.5, minStake: 100, Icon: "AppleIcon" },
        { ticker: "GOOGL", name: "Alphabet Inc.", price: 139.25, apr: 7.8, minStake: 100, Icon: "GoogleIcon" },
        { ticker: "MSFT", name: "Microsoft Corp.", price: 378.85, apr: 8.2, minStake: 100, Icon: "MicrosoftIcon" },
        { ticker: "NVDA", name: "NVIDIA Corp.", price: 495.50, apr: 9.5, minStake: 100, Icon: "NvidiaIcon" },
        { ticker: "TSLA", name: "Tesla Inc.", price: 253.75, apr: 10.2, minStake: 100, Icon: "TeslaIcon" },
        { ticker: "AMZN", name: "Amazon.com Inc.", price: 145.50, apr: 7.5, minStake: 100, Icon: "AmazonIcon" }
    ],
    stakableCrypto: [
        { id: "btc", ticker: "BTC", name: "Bitcoin", apr: 5.5, Icon: "BtcIcon" },
        { id: "eth", ticker: "ETH", name: "Ethereum", apr: 6.8, Icon: "EthIcon" },
        { id: "sol", ticker: "SOL", name: "Solana", apr: 8.2, Icon: "SolanaIcon" },
        { id: "ada", ticker: "ADA", name: "Cardano", apr: 7.5, Icon: "CardanoIcon" },
        { id: "dot", ticker: "DOT", name: "Polkadot", apr: 9.0, Icon: "PolkadotIcon" }
    ],
    reitProperties: [
        {
            id: "reit-1",
            name: "Manhattan Commercial Tower",
            location: "New York, NY",
            type: "Commercial",
            price: 250,
            yield: 7.5,
            occupied: 95,
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
        },
        {
            id: "reit-2",
            name: "Silicon Valley Tech Park",
            location: "San Jose, CA",
            type: "Office",
            price: 500,
            yield: 6.8,
            occupied: 98,
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
        }
    ],
    investableNFTs: [
        {
            id: "nft-1",
            name: "Bored Ape #3749",
            collection: "BAYC",
            fractionPrice: 100,
            totalValue: 250000,
            image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800",
            stakingApr: 12.5
        },
        {
            id: "nft-2",
            name: "CryptoPunk #2140",
            collection: "CryptoPunks",
            fractionPrice: 150,
            totalValue: 350000,
            image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800",
            stakingApr: 15.0
        }
    ],
    spectrumPlans: [
        {
            id: "starter",
            name: "Starter",
            investmentRange: "$100 - $999",
            dailyReturns: "0.5%",
            capitalReturn: "After 200 days",
            totalPeriods: "200 days",
            colorClass: "bg-gradient-to-r from-blue-500 to-blue-600",
            borderColor: "border-blue-500",
            buttonColor: "bg-blue-500 hover:bg-blue-600",
            shadowColor: "shadow-blue-500/20"
        },
        {
            id: "growth",
            name: "Growth",
            investmentRange: "$1,000 - $4,999",
            dailyReturns: "0.8%",
            capitalReturn: "After 150 days",
            totalPeriods: "150 days",
            colorClass: "bg-gradient-to-r from-purple-500 to-purple-600",
            borderColor: "border-purple-500",
            buttonColor: "bg-purple-500 hover:bg-purple-600",
            shadowColor: "shadow-purple-500/20"
        }
    ]
};

// ============================================
// MIDDLEWARE
// ============================================

// Simple auth middleware
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        
        // For demo purposes, we'll accept any token and use a test user
        // In production, you'd verify JWT tokens properly
        req.userId = 'test-user-' + token.substring(0, 8);
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

const requireKyc = async (req, res, next) => {
    // For demo, just pass through
    next();
};

// ============================================
// EXPRESS APP SETUP
// ============================================

const app = express();

// Middleware
app.set('trust proxy', 1);
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/api/health/db', async (req, res) => {
    try {
        if (db) {
            await db.execute('SELECT 1');
            res.json({ 
                success: true, 
                status: 'healthy',
                message: 'Database connection successful' 
            });
        } else {
            res.json({ 
                success: true, 
                status: 'mock',
                message: 'Running in mock mode (no database configured)' 
            });
        }
    } catch (error) {
        res.status(503).json({ 
            success: false, 
            status: 'error',
            message: 'Database connection failed' 
        });
    }
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;
        
        // Validate input
        if (!fullName || !username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        if (db) {
            // Check if user exists
            const existingUser = await db.execute({
                sql: 'SELECT id FROM users WHERE email = ? OR username = ?',
                args: [email, username]
            });

            if (existingUser.rows.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User already exists' 
                });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);
            const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(7);

            // Create user
            await db.execute({
                sql: `INSERT INTO users (id, email, username, password_hash, full_name, profile_photo_url) 
                      VALUES (?, ?, ?, ?, ?, ?)`,
                args: [userId, email, username, passwordHash, fullName, `https://i.pravatar.cc/150?u=${username}`]
            });

            // Create user settings
            await db.execute({
                sql: 'INSERT INTO user_settings (user_id) VALUES (?)',
                args: [userId]
            });

            // Create portfolio
            const portfolioId = 'portfolio_' + userId;
            await db.execute({
                sql: 'INSERT INTO portfolios (id, user_id) VALUES (?, ?)',
                args: [portfolioId, userId]
            });

            // Add initial cash balance
            await db.execute({
                sql: `INSERT INTO assets (id, portfolio_id, type, ticker, name, balance, value, icon) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [`asset_${Date.now()}`, portfolioId, 'Cash', 'USD', 'US Dollar', 10000, 10000, 'UsdIcon']
            });

            // Generate simple token (in production, use JWT)
            const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64');

            res.json({ 
                success: true, 
                token,
                message: 'Registration successful' 
            });
        } else {
            // Mock mode - just return success
            const token = Buffer.from(`mock_user:${Date.now()}`).toString('base64');
            res.json({ 
                success: true, 
                token,
                message: 'Registration successful (mock mode)' 
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Registration failed' 
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (db) {
            // Get user
            const result = await db.execute({
                sql: 'SELECT id, password_hash FROM users WHERE email = ?',
                args: [email]
            });

            if (result.rows.length === 0) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid credentials' 
                });
            }

            const user = result.rows[0];
            const validPassword = await bcrypt.compare(password, user.password_hash);

            if (!validPassword) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid credentials' 
                });
            }

            // Generate token
            const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

            res.json({ 
                success: true, 
                token,
                message: 'Login successful' 
            });
        } else {
            // Mock mode - accept demo credentials
            if (email === 'demo@valifi.net' && password === 'demo123') {
                const token = Buffer.from(`demo_user:${Date.now()}`).toString('base64');
                res.json({ 
                    success: true, 
                    token,
                    message: 'Login successful (mock mode)' 
                });
            } else {
                res.status(401).json({ 
                    success: false, 
                    message: 'Invalid credentials (use demo@valifi.net / demo123)' 
                });
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Login failed' 
        });
    }
});

app.post('/api/auth/social-login', async (req, res) => {
    try {
        const { provider } = req.body;
        
        // For demo, create/get a demo user
        const userId = `demo_${provider}_user`;
        const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64');

        res.json({ 
            success: true, 
            token,
            message: `${provider} login successful` 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Social login failed' 
        });
    }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    res.json({ 
        success: true, 
        message: 'Password reset instructions sent to your email' 
    });
});

// App data route (main data loading)
app.get('/api/app-data', authenticate, async (req, res) => {
    try {
        // For demo, return mock data
        const appData = {
            profile: {
                id: req.userId,
                fullName: 'Demo User',
                username: 'demouser',
                email: 'demo@valifi.net',
                profilePhotoUrl: 'https://i.pravatar.cc/150?u=demo',
                kycStatus: 'Not Started'
            },
            settings: {
                twoFactorAuth: { enabled: false, method: 'none' },
                loginAlerts: true,
                autoLogout: '1h',
                preferences: {
                    currency: 'USD',
                    language: 'en',
                    dateFormat: 'MM/DD/YYYY',
                    timezone: 'UTC',
                    balancePrivacy: false,
                    sidebarCollapsed: false,
                    openNavGroups: ['overview', 'trading', 'money', 'growth', 'compliance']
                },
                privacy: {
                    emailMarketing: false,
                    platformMessages: true,
                    contactAccess: false
                },
                vaultRecovery: {
                    email: '',
                    phone: '',
                    pin: ''
                }
            },
            sessions: [],
            portfolio: {
                totalValue: 10000,
                totalProfit: 0,
                dailyChange: 0,
                weeklyChange: 0,
                assets: [
                    {
                        id: 'cash-1',
                        type: 'Cash',
                        ticker: 'USD',
                        name: 'US Dollar',
                        balance: 10000,
                        value: 10000,
                        change24h: 0,
                        changePercent24h: 0,
                        Icon: 'UsdIcon'
                    }
                ],
                transactions: []
            },
            notifications: [],
            userActivity: [],
            newsItems: [
                {
                    id: '1',
                    title: 'Welcome to Valifi',
                    summary: 'Start your investment journey today',
                    url: '#',
                    source: 'Valifi',
                    publishedAt: new Date().toISOString(),
                    sentiment: 'positive'
                }
            ],
            cardDetails: {
                status: 'Not Applied',
                type: 'Virtual',
                currency: 'USD',
                theme: 'Obsidian',
                isFrozen: false
            },
            linkedBankAccounts: [],
            loanApplications: [],
            p2pOffers: [],
            p2pOrders: [],
            userPaymentMethods: [],
            reitProperties: mockInvestmentData.reitProperties,
            stakableStocks: mockInvestmentData.stakableStocks,
            investableNFTs: mockInvestmentData.investableNFTs,
            spectrumPlans: mockInvestmentData.spectrumPlans,
            stakableCrypto: mockInvestmentData.stakableCrypto,
            referralSummary: {
                tree: null,
                activities: []
            }
        };

        res.json({ success: true, data: appData });
    } catch (error) {
        console.error('App data error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to load app data' 
        });
    }
});

// All other routes (simplified for brevity)
app.all('/api/*', authenticate, (req, res) => {
    // Generic handler for all other authenticated routes
    res.json({ 
        success: true, 
        message: `Mock response for ${req.path}`,
        data: {} 
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(500).json({
        success: false,
        message: 'An internal server error occurred'
    });
});

// Initialize database on startup (only in development)
if (process.env.NODE_ENV !== 'production') {
    initializeSchema().catch(console.error);
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel - THIS IS THE KEY PART
export default function handler(req, res) {
    // Handle the request with Express
    return app(req, res);
}

// Also export the app for testing
export { app };