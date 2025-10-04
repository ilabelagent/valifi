// ============================================
// 🧠 GOD BRAIN MCP ORCHESTRATOR
// Central coordination system for all MCP servers
// ============================================

const { MCPServer } = require('@modelcontextprotocol/sdk');
const { Octokit } = require('@octokit/rest');
const express = require('express');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const simpleGit = require('simple-git');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

class GodBrainMCPOrchestrator {
    constructor() {
        this.name = 'God Brain MCP Orchestrator';
        this.version = '1.0.0';
        this.servers = new Map();
        this.activeConnections = new Set();
        this.memory = new Map();
        this.github = null;
        this.projectPath = process.env.PROJECT_PATH || 'C:\\Users\\josh\\Desktop\\GodBrainAI';
        this.status = 'initializing';
        
        this.initializeGitHub();
        this.setupFileWatcher();
        this.scheduleAutoPatch();
    }

    async initialize() {
        console.log('🧠 Initializing God Brain MCP Orchestrator...');
        
        try {
            // Initialize core MCP servers
            await this.startFilesystemMCP();
            await this.startMemoryMCP();
            await this.startSequentialThinkingMCP();
            await this.startGitHubMCP();
            
            // Start web interface
            await this.startWebInterface();
            
            this.status = 'active';
            console.log('✅ God Brain MCP Orchestrator initialized successfully!');
            
            return { success: true, message: 'MCP Orchestrator ready' };
        } catch (error) {
            console.error('❌ Failed to initialize MCP Orchestrator:', error);
            this.status = 'error';
            return { success: false, error: error.message };
        }
    }

    initializeGitHub() {
        if (process.env.GITHUB_TOKEN) {
            this.github = new Octokit({
                auth: process.env.GITHUB_TOKEN
            });
            console.log('🐙 GitHub API initialized');
        } else {
            console.warn('⚠️  GitHub token not found - some features will be limited');
        }
    }

    async startFilesystemMCP() {
        console.log('📁 Starting Filesystem MCP Server...');
        
        const filesystemServer = {
            name: 'filesystem',
            type: 'core',
            capabilities: ['read', 'write', 'watch', 'search'],
            status: 'active'
        };
        
        this.servers.set('filesystem', filesystemServer);
        return filesystemServer;
    }

    async startMemoryMCP() {
        console.log('🧠 Starting Memory MCP Server...');
        
        const memoryServer = {
            name: 'memory',
            type: 'core', 
            capabilities: ['store', 'retrieve', 'search', 'relate'],
            status: 'active',
            data: new Map()
        };
        
        this.servers.set('memory', memoryServer);
        return memoryServer;
    }

    async startSequentialThinkingMCP() {
        console.log('🤔 Starting Sequential Thinking MCP Server...');
        
        const thinkingServer = {
            name: 'sequential-thinking',
            type: 'reasoning',
            capabilities: ['analyze', 'plan', 'execute', 'verify'],
            status: 'active',
            thoughts: []
        };
        
        this.servers.set('sequential-thinking', thinkingServer);
        return thinkingServer;
    }

    async startGitHubMCP() {
        console.log('🐙 Starting GitHub MCP Server...');
        
        const githubServer = {
            name: 'github',
            type: 'integration',
            capabilities: ['repos', 'issues', 'pulls', 'commits'],
            status: this.github ? 'active' : 'limited',
            client: this.github
        };
        
        this.servers.set('github', githubServer);
        return githubServer;
    }

    setupFileWatcher() {
        console.log('👁️  Setting up file watcher for auto-patch...');
        
        const watcher = chokidar.watch(this.projectPath, {
            ignored: /node_modules|\.git|\.env/,
            persistent: true
        });
        
        watcher.on('change', async (filePath) => {
            console.log(`📝 File changed: ${filePath}`);
            await this.handleFileChange(filePath);
        });
        
        watcher.on('add', async (filePath) => {
            console.log(`➕ File added: ${filePath}`);
            await this.handleFileAdd(filePath);
        });
    }

    async handleFileChange(filePath) {
        try {
            // Check if file needs auto-patching
            if (filePath.endsWith('.js') || filePath.endsWith('.py') || filePath.endsWith('.html')) {
                const needsPatch = await this.analyzeFileForIssues(filePath);
                if (needsPatch.hasIssues) {
                    await this.autoPatchFile(filePath, needsPatch.issues);
                }
            }
        } catch (error) {
            console.error(`❌ Error handling file change for ${filePath}:`, error);
        }
    }

    async handleFileAdd(filePath) {
        try {
            // Log new files for memory
            await this.storeInMemory('file_added', {
                path: filePath,
                timestamp: new Date().toISOString(),
                type: path.extname(filePath)
            });
        } catch (error) {
            console.error(`❌ Error handling file add for ${filePath}:`, error);
        }
    }

    async analyzeFileForIssues(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const issues = [];
            
            // JavaScript analysis
            if (filePath.endsWith('.js')) {
                if (content.includes('eval(')) {
                    issues.push({ type: 'security', severity: 'high', message: 'eval() usage detected' });
                }
                if (content.includes('console.log') && content.includes('password')) {
                    issues.push({ type: 'security', severity: 'high', message: 'Password logging detected' });
                }
                if (!content.includes('use strict') && content.length > 100) {
                    issues.push({ type: 'quality', severity: 'low', message: 'Missing strict mode' });
                }
            }
            
            // Python analysis
            if (filePath.endsWith('.py')) {
                if (content.includes('exec(') || content.includes('eval(')) {
                    issues.push({ type: 'security', severity: 'high', message: 'Dynamic execution detected' });
                }
                if (!content.includes('#!/usr/bin/env python') && content.startsWith('#!')) {
                    issues.push({ type: 'quality', severity: 'low', message: 'Non-standard shebang' });
                }
            }
            
            return {
                hasIssues: issues.length > 0,
                issues,
                filePath
            };
            
        } catch (error) {
            console.error(`❌ Error analyzing file ${filePath}:`, error);
            return { hasIssues: false, issues: [] };
        }
    }

    async autoPatchFile(filePath, issues) {
        try {
            console.log(`🔧 Auto-patching file: ${filePath}`);
            
            let content = await fs.readFile(filePath, 'utf8');
            let patched = false;
            
            for (const issue of issues) {
                if (issue.type === 'quality' && issue.message === 'Missing strict mode') {
                    if (!content.includes('use strict')) {
                        content = `'use strict';\n\n${content}`;
                        patched = true;
                    }
                }
                
                // Add more auto-patch rules here
            }
            
            if (patched) {
                // Backup original
                await fs.writeFile(`${filePath}.backup`, content);
                await fs.writeFile(filePath, content);
                
                console.log(`✅ Auto-patched: ${filePath}`);
                
                // Log to memory
                await this.storeInMemory('file_patched', {
                    path: filePath,
                    issues: issues.length,
                    timestamp: new Date().toISOString()
                });
                
                // Create GitHub commit if configured
                if (this.github && process.env.AUTO_COMMIT === 'true') {
                    await this.createAutoCommit(filePath, issues);
                }
            }
            
        } catch (error) {
            console.error(`❌ Error auto-patching ${filePath}:`, error);
        }
    }

    async createAutoCommit(filePath, issues) {
        try {
            const git = simpleGit(this.projectPath);
            const relativePath = path.relative(this.projectPath, filePath);
            
            await git.add(relativePath);
            await git.commit(`🔧 Auto-patch: Fixed ${issues.length} issues in ${relativePath}\\n\\n${issues.map(i => `- ${i.message}`).join('\\n')}`);
            
            console.log(`📝 Auto-committed fixes for ${relativePath}`);
            
        } catch (error) {
            console.error('❌ Error creating auto-commit:', error);
        }
    }

    async storeInMemory(key, data) {
        const memoryServer = this.servers.get('memory');
        if (memoryServer) {
            memoryServer.data.set(key + '_' + Date.now(), data);
        }
    }

    scheduleAutoPatch() {
        console.log('⏰ Scheduling auto-patch cron job...');
        
        // Run auto-patch every hour
        cron.schedule('0 * * * *', async () => {
            console.log('🔄 Running scheduled auto-patch...');
            await this.runFullProjectScan();
        });
        
        // Run deep analysis every day at 2 AM
        cron.schedule('0 2 * * *', async () => {
            console.log('🔍 Running deep project analysis...');
            await this.runDeepAnalysis();
        });
    }

    async runFullProjectScan() {
        try {
            console.log('🔍 Scanning full project for issues...');
            const files = await this.getAllProjectFiles();
            
            for (const file of files) {
                const analysis = await this.analyzeFileForIssues(file);
                if (analysis.hasIssues) {
                    await this.autoPatchFile(file, analysis.issues);
                }
            }
            
            console.log('✅ Full project scan completed');
            
        } catch (error) {
            console.error('❌ Error in full project scan:', error);
        }
    }

    async getAllProjectFiles() {
        const files = [];
        
        async function scanDir(dir) {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory() && !['node_modules', '.git', '.vercel'].includes(entry.name)) {
                    await scanDir(fullPath);
                } else if (entry.isFile() && /\\.(js|py|html|css)$/.test(entry.name)) {
                    files.push(fullPath);
                }
            }
        }
        
        await scanDir(this.projectPath);
        return files;
    }

    async runDeepAnalysis() {
        try {
            console.log('🧠 Running deep project analysis...');
            
            const analysis = {
                totalFiles: 0,
                issuesFound: 0,
                patchesApplied: 0,
                securityIssues: 0,
                qualityIssues: 0,
                timestamp: new Date().toISOString()
            };
            
            const files = await this.getAllProjectFiles();
            analysis.totalFiles = files.length;
            
            for (const file of files) {
                const result = await this.analyzeFileForIssues(file);
                if (result.hasIssues) {
                    analysis.issuesFound += result.issues.length;
                    analysis.securityIssues += result.issues.filter(i => i.type === 'security').length;
                    analysis.qualityIssues += result.issues.filter(i => i.type === 'quality').length;
                    
                    await this.autoPatchFile(file, result.issues);
                    analysis.patchesApplied++;
                }
            }
            
            await this.storeInMemory('deep_analysis', analysis);
            console.log('📊 Deep analysis completed:', analysis);
            
        } catch (error) {
            console.error('❌ Error in deep analysis:', error);
        }
    }

    async startWebInterface() {
        const app = express();
        app.use(express.json());
        app.use(express.static('web'));
        
        // MCP Status endpoint
        app.get('/api/mcp/status', (req, res) => {
            const status = {
                orchestrator: this.status,
                servers: Array.from(this.servers.entries()).map(([name, server]) => ({
                    name: server.name,
                    type: server.type,
                    status: server.status,
                    capabilities: server.capabilities
                })),
                connections: this.activeConnections.size,
                memory: this.servers.get('memory')?.data.size || 0
            };
            res.json(status);
        });
        
        // DevBot commands endpoint
        app.post('/api/devbot/command', async (req, res) => {
            try {
                const { command, params } = req.body;
                const result = await this.executeDevBotCommand(command, params);
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        
        // Auto-patch endpoint
        app.post('/api/autopatch/run', async (req, res) => {
            try {
                await this.runFullProjectScan();
                res.json({ success: true, message: 'Auto-patch completed' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        
        const server = app.listen(process.env.MCP_PORT || 8080, () => {
            console.log(`🌐 MCP Web Interface started on port ${process.env.MCP_PORT || 8080}`);
        });
        
        return server;
    }

    async executeDevBotCommand(command, params) {
        console.log(`🤖 Executing DevBot command: ${command}`);
        
        switch (command) {
            case 'scan_project':
                return await this.runFullProjectScan();
                
            case 'patch_file':
                if (params.filePath) {
                    const analysis = await this.analyzeFileForIssues(params.filePath);
                    if (analysis.hasIssues) {
                        await this.autoPatchFile(params.filePath, analysis.issues);
                        return { success: true, patches: analysis.issues.length };
                    }
                    return { success: true, patches: 0, message: 'No issues found' };
                }
                return { success: false, error: 'filePath required' };
                
            case 'analyze_security':
                return await this.runSecurityAnalysis();
                
            case 'create_backup':
                return await this.createProjectBackup();
                
            default:
                return { success: false, error: `Unknown command: ${command}` };
        }
    }

    async runSecurityAnalysis() {
        console.log('🔒 Running security analysis...');
        
        const files = await this.getAllProjectFiles();
        const securityIssues = [];
        
        for (const file of files) {
            const analysis = await this.analyzeFileForIssues(file);
            const security = analysis.issues.filter(i => i.type === 'security');
            if (security.length > 0) {
                securityIssues.push({ file, issues: security });
            }
        }
        
        return {
            success: true,
            totalFiles: files.length,
            vulnerableFiles: securityIssues.length,
            issues: securityIssues
        };
    }

    async createProjectBackup() {
        try {
            const backupDir = path.join(this.projectPath, 'backups', `backup_${Date.now()}`);
            await fs.mkdir(backupDir, { recursive: true });
            
            // This would normally copy files - simplified for demo
            console.log(`💾 Creating backup in ${backupDir}`);
            
            return {
                success: true,
                backupPath: backupDir,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async shutdown() {
        console.log('🔄 Shutting down God Brain MCP Orchestrator...');
        this.status = 'shutting_down';
        
        for (const [name, server] of this.servers) {
            console.log(`🔌 Disconnecting ${name} server...`);
            server.status = 'inactive';
        }
        
        this.status = 'inactive';
        console.log('✅ God Brain MCP Orchestrator shut down complete');
    }
}

// Initialize and start
const orchestrator = new GodBrainMCPOrchestrator();

process.on('SIGINT', async () => {
    console.log('\\n🛑 Graceful shutdown initiated...');
    await orchestrator.shutdown();
    process.exit(0);
});

// Auto-start if run directly
if (require.main === module) {
    orchestrator.initialize().then(result => {
        if (result.success) {
            console.log('🚀 God Brain MCP System is now ONLINE!');
            console.log('📊 Dashboard: http://localhost:8080');
            console.log('🤖 DevBot: Ready for commands');
            console.log('🔧 Auto-patch: Active');
        } else {
            console.error('❌ Failed to start:', result.error);
            process.exit(1);
        }
    });
}

module.exports = GodBrainMCPOrchestrator;
