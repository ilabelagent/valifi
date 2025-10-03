// ============================================
// 🪙 ADVANCED COIN MIXING API SERVICE
// Professional cryptocurrency tumbling service
// ============================================

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const NetworkBot = require('./core/modules/networkbot.js');

class CoinMixingAPI {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8888;
        this.networkBot = new NetworkBot();
        
        // Mixing pools for different currencies
        this.mixingPools = new Map();
        this.activeMixes = new Map();
        this.completedMixes = new Map();
        
        // API statistics
        this.stats = {
            totalMixes: 0,
            totalVolume: 0,
            activeUsers: new Set(),
            successRate: 100,
            avgMixingTime: 300000 // 5 minutes
        };
        
        this.initializeAPI();
    }

    async initializeAPI() {
        console.log(`
🪙 ===============================================
   GODBRAIN ADVANCED COIN MIXING API
   Professional Cryptocurrency Tumbling Service
===============================================
        `);

        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false
        }));
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP'
        });
        this.app.use(limiter);
        
        // CORS and JSON parsing
        this.app.use(cors());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.static('public'));
        
        // Initialize mixing pools
        this.initializeMixingPools();
        
        // Setup routes
        this.setupRoutes();
        
        // Initialize network bot
        await this.networkBot.initialize();
        
        // Start monitoring
        this.startMonitoring();
        
        console.log(`✅ Coin Mixing API initialized`);
        console.log(`🌐 Server starting on port ${this.port}`);
    }

    initializeMixingPools() {
        const currencies = ['BTC', 'ETH', 'XMR', 'LTC', 'BCH', 'DASH'];
        
        for (const currency of currencies) {
            this.mixingPools.set(currency, {
                currency,
                totalPool: 0,
                activeAmount: 0,
                transactions: [],
                participants: new Set(),
                lastMix: Date.now(),
                mixingFee: 0.001, // 0.1%
                minAmount: 0.001,
                maxAmount: 100
            });
        }
        
        console.log(`💰 Initialized mixing pools for ${currencies.length} currencies`);
    }

    setupRoutes() {
        // API Documentation
        this.app.get('/', (req, res) => {
            res.sendFile(__dirname + '/coin-mixer-interface.html');
        });

        // API Information
        this.app.get('/api/info', (req, res) => {
            res.json({
                service: 'GodBrain Coin Mixing API',
                version: '1.0.0',
                features: [
                    'Multi-layer mixing',
                    'Tor network routing',
                    'Multiple cryptocurrency support',
                    'Advanced privacy protection',
                    'Real-time mixing status'
                ],
                supportedCurrencies: Array.from(this.mixingPools.keys()),
                fees: {
                    mixing: '0.1%',
                    network: 'Dynamic based on blockchain'
                },
                limits: {
                    minAmount: 0.001,
                    maxAmount: 100,
                    maxLayers: 10
                }
            });
        });

        // Get mixing pools status
        this.app.get('/api/pools', (req, res) => {
            const poolsData = {};
            
            for (const [currency, pool] of this.mixingPools) {
                poolsData[currency] = {
                    currency: pool.currency,
                    totalPool: pool.totalPool,
                    activeAmount: pool.activeAmount,
                    participants: pool.participants.size,
                    lastMix: pool.lastMix,
                    fee: pool.mixingFee,
                    limits: {
                        min: pool.minAmount,
                        max: pool.maxAmount
                    }
                };
            }
            
            res.json({
                pools: poolsData,
                timestamp: Date.now()
            });
        });

        // Start mixing operation
        this.app.post('/api/mix/start', async (req, res) => {
            try {
                const {
                    currency,
                    amount,
                    sourceAddress,
                    destinationAddress,
                    layers = 3,
                    delayMinutes = 5,
                    priorityFee = false
                } = req.body;

                // Validation
                const validation = this.validateMixingRequest({
                    currency, amount, sourceAddress, destinationAddress, layers
                });
                
                if (!validation.valid) {
                    return res.status(400).json({
                        error: 'Validation failed',
                        details: validation.errors
                    });
                }

                // Generate mixing session
                const mixingSession = await this.createMixingSession({
                    currency,
                    amount: parseFloat(amount),
                    sourceAddress,
                    destinationAddress,
                    layers: parseInt(layers),
                    delayMinutes: parseInt(delayMinutes),
                    priorityFee,
                    clientIP: req.ip
                });

                // Start mixing process
                this.startMixingProcess(mixingSession);

                res.json({
                    success: true,
                    sessionId: mixingSession.id,
                    estimatedTime: mixingSession.estimatedTime,
                    totalFee: mixingSession.totalFee,
                    intermediateAddresses: mixingSession.intermediateAddresses,
                    status: 'initiated',
                    message: 'Mixing process started successfully'
                });

            } catch (error) {
                console.error('Mixing start error:', error);
                res.status(500).json({
                    error: 'Internal server error',
                    message: error.message
                });
            }
        });

        // Get mixing status
        this.app.get('/api/mix/status/:sessionId', (req, res) => {
            const sessionId = req.params.sessionId;
            
            if (this.activeMixes.has(sessionId)) {
                const session = this.activeMixes.get(sessionId);
                res.json({
                    sessionId,
                    status: session.status,
                    currentLayer: session.currentLayer,
                    totalLayers: session.totalLayers,
                    progress: Math.round((session.currentLayer / session.totalLayers) * 100),
                    estimatedTimeRemaining: session.estimatedTimeRemaining,
                    transactions: session.transactions.map(tx => ({
                        layer: tx.layer,
                        txid: tx.txid,
                        confirmations: tx.confirmations,
                        timestamp: tx.timestamp
                    }))
                });
            } else if (this.completedMixes.has(sessionId)) {
                const session = this.completedMixes.get(sessionId);
                res.json({
                    sessionId,
                    status: 'completed',
                    finalTxid: session.finalTxid,
                    totalTime: session.totalTime,
                    completedAt: session.completedAt
                });
            } else {
                res.status(404).json({
                    error: 'Session not found',
                    sessionId
                });
            }
        });

        // Stop mixing (emergency)
        this.app.post('/api/mix/stop/:sessionId', (req, res) => {
            const sessionId = req.params.sessionId;
            
            if (this.activeMixes.has(sessionId)) {
                const session = this.activeMixes.get(sessionId);
                session.status = 'cancelled';
                session.cancelled = true;
                
                console.log(`🛑 Mixing session ${sessionId} cancelled by user request`);
                
                res.json({
                    success: true,
                    message: 'Mixing session cancelled',
                    sessionId
                });
            } else {
                res.status(404).json({
                    error: 'Active session not found',
                    sessionId
                });
            }
        });

        // Get API statistics
        this.app.get('/api/stats', (req, res) => {
            res.json({
                ...this.stats,
                activeUsers: this.stats.activeUsers.size,
                activeMixes: this.activeMixes.size,
                network: this.networkBot.getNetworkStatus(),
                uptime: Date.now() - this.startTime,
                timestamp: Date.now()
            });
        });

        // Generate new address
        this.app.post('/api/address/generate', async (req, res) => {
            try {
                const { currency } = req.body;
                
                if (!this.mixingPools.has(currency)) {
                    return res.status(400).json({
                        error: 'Unsupported currency',
                        currency
                    });
                }

                const address = await this.networkBot.generateIntermediateAddress(currency);
                
                res.json({
                    success: true,
                    currency,
                    address,
                    timestamp: Date.now()
                });

            } catch (error) {
                res.status(500).json({
                    error: 'Address generation failed',
                    message: error.message
                });
            }
        });

        // Health check
        this.app.get('/api/health', (req, res) => {
            res.json({
                status: 'healthy',
                network: {
                    tor: this.networkBot.state.torRunning,
                    mixingNodes: this.networkBot.config.mixingNodes.length
                },
                pools: this.mixingPools.size,
                activeMixes: this.activeMixes.size,
                timestamp: Date.now()
            });
        });
    }

    validateMixingRequest(request) {
        const errors = [];
        
        // Currency validation
        if (!request.currency || !this.mixingPools.has(request.currency)) {
            errors.push('Invalid or unsupported currency');
        }
        
        // Amount validation
        if (!request.amount || request.amount <= 0) {
            errors.push('Invalid amount');
        } else {
            const pool = this.mixingPools.get(request.currency);
            if (request.amount < pool.minAmount) {
                errors.push(`Amount below minimum (${pool.minAmount})`);
            }
            if (request.amount > pool.maxAmount) {
                errors.push(`Amount above maximum (${pool.maxAmount})`);
            }
        }
        
        // Address validation
        if (!request.sourceAddress || request.sourceAddress.length < 10) {
            errors.push('Invalid source address');
        }
        
        if (!request.destinationAddress || request.destinationAddress.length < 10) {
            errors.push('Invalid destination address');
        }
        
        if (request.sourceAddress === request.destinationAddress) {
            errors.push('Source and destination addresses cannot be the same');
        }
        
        // Layers validation
        if (!request.layers || request.layers < 2 || request.layers > 10) {
            errors.push('Layers must be between 2 and 10');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    async createMixingSession(params) {
        const sessionId = crypto.randomBytes(16).toString('hex');
        const pool = this.mixingPools.get(params.currency);
        
        // Calculate fees
        const mixingFee = params.amount * pool.mixingFee;
        const priorityFee = params.priorityFee ? params.amount * 0.0005 : 0;
        const totalFee = mixingFee + priorityFee;
        
        // Generate intermediate addresses
        const intermediateAddresses = [];
        for (let i = 0; i < params.layers - 1; i++) {
            const address = await this.networkBot.generateIntermediateAddress(params.currency);
            intermediateAddresses.push(address);
        }
        
        // Estimate time
        const baseTime = params.layers * params.delayMinutes * 60 * 1000;
        const estimatedTime = baseTime + (Math.random() * 60000); // Add some randomness
        
        const session = {
            id: sessionId,
            currency: params.currency,
            amount: params.amount,
            sourceAddress: params.sourceAddress,
            destinationAddress: params.destinationAddress,
            layers: params.layers,
            totalLayers: params.layers,
            currentLayer: 0,
            delayMinutes: params.delayMinutes,
            intermediateAddresses,
            totalFee,
            mixingFee,
            priorityFee,
            estimatedTime,
            estimatedTimeRemaining: estimatedTime,
            status: 'pending',
            startTime: Date.now(),
            clientIP: params.clientIP,
            transactions: [],
            cancelled: false
        };
        
        this.activeMixes.set(sessionId, session);
        this.stats.activeUsers.add(params.clientIP);
        
        console.log(`🆕 Created mixing session: ${sessionId}`);
        console.log(`💰 Amount: ${params.amount} ${params.currency}`);
        console.log(`🔄 Layers: ${params.layers}`);
        
        return session;
    }

    async startMixingProcess(session) {
        console.log(`🚀 Starting mixing process for session: ${session.id}`);
        
        try {
            session.status = 'mixing';
            
            // Use NetworkBot for actual mixing
            const mixingResult = await this.networkBot.mixCoins({
                currency: session.currency,
                amount: session.amount,
                sourceAddress: session.sourceAddress,
                destinationAddress: session.destinationAddress,
                mixingLayers: session.layers,
                delayBetweenLayers: session.delayMinutes * 60 * 1000
            });
            
            // Update session with results
            session.transactions = mixingResult.transactions;
            session.status = 'completed';
            session.endTime = Date.now();
            session.totalTime = session.endTime - session.startTime;
            session.finalTxid = mixingResult.transactions[mixingResult.transactions.length - 1]?.txid;
            
            // Move to completed
            this.completedMixes.set(session.id, session);
            this.activeMixes.delete(session.id);
            
            // Update statistics
            this.stats.totalMixes++;
            this.stats.totalVolume += session.amount;
            
            console.log(`✅ Mixing completed for session: ${session.id}`);
            console.log(`⏱️ Total time: ${Math.round(session.totalTime / 1000)}s`);
            
        } catch (error) {
            console.error(`❌ Mixing failed for session ${session.id}:`, error.message);
            
            session.status = 'failed';
            session.error = error.message;
            session.endTime = Date.now();
            
            // Update success rate
            this.updateSuccessRate(false);
        }
    }

    updateSuccessRate(success) {
        const currentTotal = this.stats.totalMixes;
        const currentSuccessful = Math.round((this.stats.successRate / 100) * currentTotal);
        
        const newTotal = currentTotal + 1;
        const newSuccessful = success ? currentSuccessful + 1 : currentSuccessful;
        
        this.stats.successRate = Math.round((newSuccessful / newTotal) * 100);
    }

    startMonitoring() {
        // Monitor active mixes
        setInterval(() => {
            for (const [sessionId, session] of this.activeMixes) {
                if (session.status === 'mixing') {
                    // Update estimated time remaining
                    const elapsed = Date.now() - session.startTime;
                    session.estimatedTimeRemaining = Math.max(0, session.estimatedTime - elapsed);
                }
                
                // Check for timeout (1 hour)
                if (Date.now() - session.startTime > 3600000) {
                    console.log(`⏰ Session ${sessionId} timed out`);
                    session.status = 'timeout';
                    this.activeMixes.delete(sessionId);
                }
            }
        }, 30000);

        // Clean up old completed mixes (keep for 24 hours)
        setInterval(() => {
            const cutoff = Date.now() - (24 * 60 * 60 * 1000);
            
            for (const [sessionId, session] of this.completedMixes) {
                if (session.endTime < cutoff) {
                    this.completedMixes.delete(sessionId);
                }
            }
        }, 3600000);

        // Update pool statistics
        setInterval(() => {
            this.updatePoolStatistics();
        }, 60000);

        console.log(`📊 Monitoring started for mixing operations`);
    }

    updatePoolStatistics() {
        for (const [currency, pool] of this.mixingPools) {
            // Calculate active amounts
            let activeAmount = 0;
            for (const session of this.activeMixes.values()) {
                if (session.currency === currency && session.status === 'mixing') {
                    activeAmount += session.amount;
                }
            }
            
            pool.activeAmount = activeAmount;
        }
    }

    start() {
        this.startTime = Date.now();
        
        this.app.listen(this.port, () => {
            console.log(`
✅ ===============================================
   GODBRAIN COIN MIXING API SERVER READY
===============================================

🌐 API Endpoint: http://localhost:${this.port}
📱 Web Interface: http://localhost:${this.port}
🔗 API Docs: http://localhost:${this.port}/api/info

🪙 Supported Currencies: ${Array.from(this.mixingPools.keys()).join(', ')}
🔒 Security: Tor routing, Multi-layer mixing
⚡ Features: Real-time status, Advanced privacy

===============================================
            `);
        });
    }

    async shutdown() {
        console.log('🛑 Shutting down Coin Mixing API...');
        
        // Cancel all active mixes
        for (const [sessionId, session] of this.activeMixes) {
            session.status = 'cancelled';
            console.log(`❌ Cancelled session: ${sessionId}`);
        }
        
        // Shutdown network bot
        if (this.networkBot) {
            await this.networkBot.shutdown();
        }
        
        console.log('✅ Coin Mixing API shutdown complete');
    }
}

// Export for use as module
module.exports = CoinMixingAPI;

// Run standalone if executed directly
if (require.main === module) {
    const api = new CoinMixingAPI();
    
    api.start();
    
    // Handle shutdown
    process.on('SIGINT', async () => {
        await api.shutdown();
        process.exit(0);
    });
}
