// ============================================
// 📊 ADMIN DASHBOARD BOT - System Monitoring & Control
// Real-time monitoring, control, and management interface
// ============================================

const express = require('express');
const path = require('path');
const fs = require('fs');
const EventEmitter = require('events');

class AdminDashboardBot extends EventEmitter {
    constructor() {
        super();
        this.name = "AdminDashboardBot";
        this.version = "1.0.0";
        
        // Express app for web interface
        this.app = express();
        this.port = 8080;
        
        // System references
        this.godbrain = null;
        this.systemMetrics = {
            uptime: 0,
            tasksProcessed: 0,
            memoryUsage: {},
            botStatuses: {},
            activeWorkflows: [],
            errorLog: [],
            performanceMetrics: {}
        };
        
        // Monitoring intervals
        this.monitoringInterval = null;
        this.metricsHistory = [];
        
        this.initialize();
    }

    async initialize() {
        console.log(`📊 ${this.name}: Initializing admin dashboard...`);
        
        // Setup express middleware
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, '../../admin-ui')));
        
        // Setup routes
        this.setupRoutes();
        
        // Start monitoring
        this.startMonitoring();
        
        // Start server
        this.startServer();
    }

    // Connect to main GodBrain system
    connectToGodbrain(godbrainInstance) {
        this.godbrain = godbrainInstance;
        console.log(`📊 ${this.name}: Connected to GodBrain system`);
        
        // Subscribe to system events
        if (this.godbrain.orchestrator) {
            this.godbrain.orchestrator.on('botRegistered', (data) => {
                this.handleBotRegistered(data);
            });
            
            this.godbrain.orchestrator.on('workflowCompleted', (data) => {
                this.handleWorkflowCompleted(data);
            });
            
            this.godbrain.orchestrator.on('workflowFailed', (data) => {
                this.handleWorkflowFailed(data);
            });
        }
    }

    // Setup API routes
    setupRoutes() {
        // Main dashboard endpoint
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../../admin-ui/index.html'));
        });

        // API endpoints
        this.app.get('/api/status', (req, res) => {
            res.json(this.getSystemStatus());
        });

        this.app.get('/api/metrics', (req, res) => {
            res.json(this.systemMetrics);
        });

        this.app.get('/api/bots', (req, res) => {
            res.json(this.getBotStatuses());
        });

        this.app.get('/api/workflows', (req, res) => {
            res.json(this.getWorkflowStatus());
        });

        this.app.get('/api/memory', (req, res) => {
            res.json(this.getMemoryStatus());
        });

        this.app.get('/api/decisions', (req, res) => {
            res.json(this.getDecisionHistory());
        });

        this.app.get('/api/errors', (req, res) => {
            res.json(this.systemMetrics.errorLog);
        });

        this.app.get('/api/performance', (req, res) => {
            res.json(this.systemMetrics.performanceMetrics);
        });

        // Control endpoints
        this.app.post('/api/command', async (req, res) => {
            try {
                const { command, params } = req.body;
                const result = await this.executeCommand(command, params);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/workflow/execute', async (req, res) => {
            try {
                const { workflowName, params } = req.body;
                const result = await this.executeWorkflow(workflowName, params);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/bot/restart', async (req, res) => {
            try {
                const { botName } = req.body;
                const result = await this.restartBot(botName);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/system/restart', async (req, res) => {
            try {
                const result = await this.restartSystem();
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // WebSocket-like endpoint for real-time updates
        this.app.get('/api/stream', (req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

            // Send updates every second
            const interval = setInterval(() => {
                res.write(`data: ${JSON.stringify(this.getSystemStatus())}\n\n`);
            }, 1000);

            req.on('close', () => {
                clearInterval(interval);
            });
        });
    }

    // Start monitoring system
    startMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.updateMetrics();
        }, 5000); // Update every 5 seconds
    }

    // Update system metrics
    updateMetrics() {
        if (!this.godbrain) return;

        // Update uptime
        this.systemMetrics.uptime = Date.now() - (this.godbrain.startTime || Date.now());

        // Update memory usage
        const memUsage = process.memoryUsage();
        this.systemMetrics.memoryUsage = {
            rss: (memUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
            heapTotal: (memUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
            heapUsed: (memUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
            external: (memUsage.external / 1024 / 1024).toFixed(2) + ' MB'
        };

        // Update bot statuses
        if (this.godbrain.orchestrator) {
            const orchestratorStatus = this.godbrain.orchestrator.getStatus();
            this.systemMetrics.botStatuses = orchestratorStatus.statistics.botStatuses || {};
            this.systemMetrics.activeWorkflows = Array.from(this.godbrain.orchestrator.activeWorkflows.values());
        }

        // Update performance metrics
        this.updatePerformanceMetrics();

        // Store in history (keep last 100 entries)
        this.metricsHistory.push({
            timestamp: Date.now(),
            metrics: { ...this.systemMetrics }
        });

        if (this.metricsHistory.length > 100) {
            this.metricsHistory.shift();
        }
    }

    // Update performance metrics
    updatePerformanceMetrics() {
        if (!this.godbrain || !this.godbrain.orchestrator) return;

        const orchestratorStatus = this.godbrain.orchestrator.getStatus();
        
        this.systemMetrics.performanceMetrics = {
            tasksCompleted: orchestratorStatus.statistics.metrics?.tasksCompleted || 0,
            tasksFailed: orchestratorStatus.statistics.metrics?.tasksFailed || 0,
            averageExecutionTime: orchestratorStatus.statistics.metrics?.averageExecutionTime || 0,
            botUtilization: orchestratorStatus.statistics.metrics?.botUtilization || {}
        };
    }

    // Get system status
    getSystemStatus() {
        return {
            name: this.name,
            version: this.version,
            uptime: this.formatUptime(this.systemMetrics.uptime),
            status: this.godbrain ? 'operational' : 'disconnected',
            timestamp: Date.now(),
            metrics: this.systemMetrics
        };
    }

    // Get bot statuses
    getBotStatuses() {
        if (!this.godbrain || !this.godbrain.orchestrator) {
            return { error: 'System not connected' };
        }

        const bots = [];
        for (const [botName, botConfig] of this.godbrain.orchestrator.bots) {
            bots.push({
                name: botName,
                status: this.godbrain.orchestrator.botStatus.get(botName),
                priority: botConfig.priority,
                tasksCompleted: botConfig.tasksCompleted,
                tasksAssigned: botConfig.tasksAssigned,
                lastActive: botConfig.lastActive
            });
        }

        return bots;
    }

    // Get workflow status
    getWorkflowStatus() {
        if (!this.godbrain || !this.godbrain.orchestrator) {
            return { error: 'System not connected' };
        }

        return {
            registered: Array.from(this.godbrain.orchestrator.workflows.keys()),
            active: Array.from(this.godbrain.orchestrator.activeWorkflows.values()),
            queue: this.godbrain.orchestrator.taskQueue
        };
    }

    // Get memory status
    getMemoryStatus() {
        if (!this.godbrain || !this.godbrain.memoryBot) {
            return { error: 'Memory system not connected' };
        }

        return this.godbrain.memoryBot.getStatus();
    }

    // Get decision history
    getDecisionHistory() {
        if (!this.godbrain || !this.godbrain.decisionBot) {
            return { error: 'Decision system not connected' };
        }

        return {
            history: this.godbrain.decisionBot.decisionHistory.slice(-10), // Last 10 decisions
            activeDecisions: Array.from(this.godbrain.decisionBot.activeDecisions.values())
        };
    }

    // Execute command
    async executeCommand(command, params) {
        if (!this.godbrain) {
            throw new Error('System not connected');
        }

        return await this.godbrain.processCommand(command, params);
    }

    // Execute workflow
    async executeWorkflow(workflowName, params) {
        if (!this.godbrain || !this.godbrain.orchestrator) {
            throw new Error('Orchestrator not connected');
        }

        return await this.godbrain.orchestrator.executeWorkflow(workflowName, params);
    }

    // Restart bot
    async restartBot(botName) {
        if (!this.godbrain || !this.godbrain.orchestrator) {
            throw new Error('Orchestrator not connected');
        }

        await this.godbrain.orchestrator.recoverBot(botName);
        return { message: `Bot ${botName} restarted` };
    }

    // Restart system
    async restartSystem() {
        console.log(`🔄 ${this.name}: System restart requested`);
        
        // This would typically trigger a full system restart
        // For now, we'll just reinitialize components
        if (this.godbrain) {
            await this.godbrain.shutdown();
            await this.godbrain.initialize();
        }
        
        return { message: 'System restarted' };
    }

    // Event handlers
    handleBotRegistered(data) {
        console.log(`📊 Bot registered: ${data.botName}`);
        this.emit('update', { type: 'bot_registered', data });
    }

    handleWorkflowCompleted(data) {
        console.log(`📊 Workflow completed: ${data.name}`);
        this.systemMetrics.tasksProcessed++;
        this.emit('update', { type: 'workflow_completed', data });
    }

    handleWorkflowFailed(data) {
        console.log(`📊 Workflow failed: ${data.name}`);
        this.systemMetrics.errorLog.push({
            timestamp: Date.now(),
            type: 'workflow_failed',
            details: data
        });
        
        // Keep only last 50 errors
        if (this.systemMetrics.errorLog.length > 50) {
            this.systemMetrics.errorLog.shift();
        }
        
        this.emit('update', { type: 'workflow_failed', data });
    }

    // Format uptime
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ${hours % 24}h ${minutes % 60}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    // Start server
    startServer() {
        this.app.listen(this.port, () => {
            console.log(`📊 ${this.name}: Admin dashboard running at http://localhost:${this.port}`);
        });
    }

    // Get status
    getStatus() {
        return {
            name: this.name,
            version: this.version,
            port: this.port,
            connected: this.godbrain !== null,
            uptime: this.formatUptime(this.systemMetrics.uptime),
            metrics: this.systemMetrics
        };
    }

    // Shutdown
    async shutdown() {
        console.log(`📊 ${this.name}: Shutting down admin dashboard`);
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
    }
}

module.exports = AdminDashboardBot;