/**
 * VALIFI FINTECH - UNIFIED SERVER
 * Production-ready with Kingdom Standard Orchestrator
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Kingdom Standard Orchestrator
const KingdomStandardOrchestrator = require('./lib/orchestrator/KingdomStandardOrchestrator');
const PhpExchangeBridge = require('./lib/integrations/php-exchange-bridge');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

// Validate required environment variables
if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is required');
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error('❌ ERROR: JWT_SECRET environment variable is required');
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Database connection
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Initialize Kingdom Standard Orchestrator
const orchestrator = new KingdomStandardOrchestrator();
const phpBridge = new PhpExchangeBridge();

// Test database connection
const testConnection = async () => {
    try {
        const result = await db.query('SELECT NOW() as current_time');
        console.log('✅ PostgreSQL connected:', result.rows[0].current_time);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

testConnection();

// Initialize orchestrator and PHP bridge
orchestrator.initialize().then(() => {
    console.log('✅ Kingdom Standard Orchestrator initialized');
}).catch(error => {
    console.error('❌ Orchestrator initialization failed:', error);
});

phpBridge.initialize().then(() => {
    console.log('✅ PHP Exchange Bridge initialized');
}).catch(error => {
    console.log('⚠️ PHP Exchange Bridge using fallback mode');
});

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Valifi Fintech Platform - AI-Powered Financial System',
        status: 'running',
        version: '3.0.0',
        runtime: 'Node.js ' + process.version,
        environment: process.env.NODE_ENV,
        orchestrator: 'Kingdom Standard',
        bots: orchestrator.state.bots.size
    });
});

app.get('/api/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({
            status: 'healthy',
            database: 'connected',
            orchestrator: orchestrator.state.initialized ? 'ready' : 'initializing',
            bots: orchestrator.state.bots.size,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

/**
 * KINGDOM STANDARD ORCHESTRATOR API
 */

// List all bots
app.get('/api/kingdom/bots', (req, res) => {
    const category = req.query.category;
    const bots = orchestrator.listBots(category);
    res.json({
        success: true,
        bots,
        total: orchestrator.state.bots.size
    });
});

// Execute bot action
app.post('/api/kingdom/execute', async (req, res) => {
    try {
        const { bot, action, params } = req.body;
        
        if (!bot || !action) {
            return res.status(400).json({
                success: false,
                error: 'Bot and action are required'
            });
        }

        const result = await orchestrator.executeBot(bot, action, params);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Armor Wallet operations
app.post('/api/armor/wallet/create', async (req, res) => {
    try {
        const { userId, currency } = req.body;
        const result = await orchestrator.createArmorWallet(userId, currency);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/armor/wallet/:walletId/balance', async (req, res) => {
    try {
        const { walletId } = req.params;
        const result = await orchestrator.getArmorBalance(walletId);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/armor/wallet/:walletId/send', async (req, res) => {
    try {
        const { walletId } = req.params;
        const { toAddress, amount, currency } = req.body;
        const result = await orchestrator.sendFromArmorWallet(walletId, toAddress, amount, currency);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Coin Mixing
app.post('/api/mixer/start', async (req, res) => {
    try {
        const result = await orchestrator.initiateCoinMix(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/mixer/status/:sessionId', async (req, res) => {
    try {
        const result = await orchestrator.getCoinMixStatus(req.params.sessionId);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Trading operations
app.post('/api/trading/execute', async (req, res) => {
    try {
        const result = await orchestrator.executeTrade(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/trading/market/:symbol', async (req, res) => {
    try {
        const result = await orchestrator.getMarketData(req.params.symbol);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Orchestrator metrics
app.get('/api/kingdom/metrics', (req, res) => {
    const metrics = orchestrator.getMetrics();
    res.json({
        success: true,
        metrics
    });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

/**
 * PHP EXCHANGE BRIDGE API
 */

// Get metals prices
app.get('/api/exchange/metals/prices', async (req, res) => {
    try {
        const result = await phpBridge.getMetalsPrices();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Buy metal
app.post('/api/exchange/metals/buy', authenticateToken, async (req, res) => {
    try {
        const { metal, amount, price } = req.body;
        const result = await phpBridge.buyMetal(req.user.userId, metal, amount, price);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Sell metal
app.post('/api/exchange/metals/sell', authenticateToken, async (req, res) => {
    try {
        const { metal, amount, price } = req.body;
        const result = await phpBridge.sellMetal(req.user.userId, metal, amount, price);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get staking plans
app.get('/api/exchange/staking/plans', async (req, res) => {
    try {
        const result = await phpBridge.getStakingPlans();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Stake asset
app.post('/api/exchange/staking/stake', authenticateToken, async (req, res) => {
    try {
        const { planId, amount } = req.body;
        const result = await phpBridge.stakeAsset(req.user.userId, planId, amount);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get staking positions
app.get('/api/exchange/staking/positions', authenticateToken, async (req, res) => {
    try {
        const result = await phpBridge.getStakingPositions(req.user.userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Unstake asset
app.post('/api/exchange/staking/unstake', authenticateToken, async (req, res) => {
    try {
        const { stakingId } = req.body;
        const result = await phpBridge.unstakeAsset(req.user.userId, stakingId);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/** ... (Rest of authentication and app-data endpoints remain the same) ... **/

// Authentication
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        const user = result.rows[0];

        await db.query(
            `INSERT INTO wallets (user_id, currency, balance) 
             VALUES ($1, 'USD', 10000), ($1, 'BTC', 0.1), ($1, 'ETH', 1.0)`,
            [user.id]
        );

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
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

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

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

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

// App data endpoint
app.get('/api/app-data', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const userResult = await db.query(
            'SELECT id, username, email, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const walletsResult = await db.query(
            'SELECT id, currency, balance, created_at FROM wallets WHERE user_id = $1',
            [userId]
        );

        const transactionsResult = await db.query(
            `SELECT id, type, amount, currency, status, created_at 
             FROM transactions 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 10`,
            [userId]
        );

        res.json({
            success: true,
            user: userResult.rows[0],
            wallets: walletsResult.rows,
            transactions: transactionsResult.rows,
            portfolio: {
                totalValue: walletsResult.rows.reduce((sum, w) => sum + parseFloat(w.balance), 0),
                assets: walletsResult.rows.length
            }
        });
    } catch (error) {
        console.error('App data error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load app data'
        });
    }
});

/**
 * REAL-TIME KINGDOM DASHBOARD - WebSocket Gateway
 */
io.on('connection', (socket) => {
    console.log('🔌 Kingdom Dashboard client connected:', socket.id);
    
    socket.emit('welcome', {
        message: 'Connected to Kingdom Standard',
        bots: orchestrator.state.bots.size,
        timestamp: new Date().toISOString()
    });

    socket.on('subscribe_updates', () => {
        socket.join('kingdom_updates');
        console.log('📡 Client subscribed to kingdom updates');
    });

    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
    });
});

// Broadcast bot events to connected clients
const broadcastUpdate = (event, data) => {
    io.to('kingdom_updates').emit(event, {
        ...data,
        timestamp: new Date().toISOString()
    });
};

// Set up orchestrator event listeners
setInterval(() => {
    broadcastUpdate('system_metrics', {
        bots: orchestrator.state.bots.size,
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
}, 5000);

// Kingdom Dashboard API
app.get('/api/kingdom/dashboard', async (req, res) => {
    try {
        const metrics = {
            bots: {
                total: orchestrator.state.bots.size,
                active: Array.from(orchestrator.state.bots.values()).filter(b => b.status === 'loaded').length,
                categories: orchestrator.botCategories
            },
            system: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodeVersion: process.version
            },
            security: {
                threatsDetected: 0,
                status: 'normal'
            },
            predictions: {
                count: 0,
                lastUpdate: new Date().toISOString()
            }
        };

        res.json({ success: true, metrics });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Catch-all route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    io.close();
    await orchestrator.shutdown();
    await db.end();
    process.exit(0);
});

// Start server with WebSocket support
server.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║     VALIFI FINTECH PLATFORM - PRODUCTION READY         ║
║                                                          ║
║     Runtime: Node.js ${process.version.padEnd(27)} ║
║     Server:  http://localhost:${PORT.toString().padEnd(23)} ║
║     Status:  ${process.env.NODE_ENV?.padEnd(33) || 'development'.padEnd(33)}║
║                                                          ║
║     Features:                                           ║
║     ✓ PostgreSQL Database                               ║
║     ✓ JWT Authentication                                ║
║     ✓ Kingdom Standard Orchestrator                     ║
║     ✓ Armor Wallet Integration                          ║
║     ✓ Coin Mixing Service                               ║
║     ✓ ${orchestrator.state.bots.size}+ Trading Bots${' '.repeat(42 - orchestrator.state.bots.size.toString().length)}║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `);
});

module.exports = { app, server, io, broadcastUpdate };
