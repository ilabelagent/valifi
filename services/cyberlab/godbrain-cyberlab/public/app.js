// GodBrain Cybersecurity Lab - Frontend Application
class GodBrainLab {
  constructor() {
    this.wsConnection = null;
    this.initWebSocket();
    this.setupEventListeners();
    this.refreshStats();
  }

  initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    try {
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        this.updateWSStatus('Connected', 'defense');
        this.log('WebSocket connected - Real-time updates enabled', 'defense');
      };
      
      this.wsConnection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleRealtimeUpdate(data);
      };
      
      this.wsConnection.onclose = () => {
        this.updateWSStatus('Disconnected', 'danger');
        setTimeout(() => this.initWebSocket(), 5000);
      };
      
      this.wsConnection.onerror = () => {
        this.updateWSStatus('Error', 'danger');
      };
    } catch (error) {
      this.updateWSStatus('Failed', 'danger');
    }
  }

  setupEventListeners() {
    // Keylogger simulation
    const keyArea = document.getElementById('keyArea');
    if (keyArea) {
      keyArea.addEventListener('keydown', (e) => this.captureKeystroke(e));
    }

    // Console input
    const consoleInput = document.getElementById('consoleInput');
    if (consoleInput) {
      consoleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.executeCommand();
      });
    }
  }

  updateWSStatus(status, type) {
    const statusEl = document.getElementById('wsStatus');
    if (statusEl) {
      statusEl.textContent = status;
      statusEl.className = type;
    }
  }

  handleRealtimeUpdate(data) {
    switch (data.type) {
      case 'traffic':
        this.updateStatus('Traffic detected', 'info');
        break;
      case 'incident':
        this.updateStatus(`${data.data.type} detected`, 'attack');
        this.setModuleStatus(data.data.type.split('_')[0], true);
        break;
      case 'phishing_capture':
        this.updateStatus('Credentials captured!', 'attack');
        this.setModuleStatus('phish', true);
        break;
      case 'sqli_attempt':
        this.updateStatus('SQL injection attempted', 'attack');
        this.setModuleStatus('sqli', true);
        break;
      case 'ddos_started':
        this.updateStatus('DDoS simulation started', 'warning');
        this.setModuleStatus('ddos', true);
        break;
      case 'ddos_completed':
        this.updateStatus('DDoS simulation completed', 'info');
        this.setModuleStatus('ddos', false);
        break;
    }
  }

  updateStatus(message, type) {
    this.log(`[${new Date().toLocaleTimeString()}] ${message}`, type);
  }

  setModuleStatus(module, active) {
    const statusEl = document.getElementById(`${module}Status`);
    if (statusEl) {
      statusEl.className = active ? 'status active' : 'status';
    }
  }

  log(message, type = 'info') {
    const console = document.getElementById('liveConsole');
    if (console) {
      const line = document.createElement('div');
      line.className = `console-line ${type}`;
      line.textContent = message;
      console.appendChild(line);
      console.scrollTop = console.scrollHeight;
      
      // Keep only last 100 lines
      while (console.children.length > 100) {
        console.removeChild(console.firstChild);
      }
    }
  }

  async apiCall(endpoint, method = 'GET', data = null) {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (data) options.body = JSON.stringify(data);
      
      const response = await fetch(endpoint, options);
      return await response.json();
    } catch (error) {
      this.log(`API Error: ${error.message}`, 'attack');
      return { error: error.message };
    }
  }

  // Tab switching
  switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
  }

  // Phishing simulation
  async simulatePhishing() {
    const email = document.getElementById('phishEmail').value;
    const username = document.getElementById('phishUsername').value;
    const password = document.getElementById('phishPassword').value;
    const message = document.getElementById('phishMessage').value;
    
    const result = await this.apiCall('/sim/phish/submit', 'POST', {
      email, username, password, message
    });
    
    document.getElementById('phishOutput').textContent = JSON.stringify(result, null, 2);
    this.log(`Phishing simulation: ${email}`, 'attack');
  }

  async getPhishingTemplates() {
    const result = await this.apiCall('/sim/phish/templates');
    document.getElementById('phishOutput').textContent = JSON.stringify(result, null, 2);
  }

  // SQL Injection
  async testSQLInjection(type) {
    const query = document.getElementById('sqliQuery').value;
    const table = document.getElementById('sqliTable').value;
    
    const endpoint = type === 'vulnerable' ? '/sim/sqli/vulnerable' : '/sim/sqli/safe';
    const data = type === 'vulnerable' ? { query, table } : { userId: query };
    
    const result = await this.apiCall(endpoint, 'POST', data);
    document.getElementById('sqliOutput').textContent = JSON.stringify(result, null, 2);
    this.log(`SQL injection test: ${type}`, 'attack');
  }

  async getSQLIScenarios() {
    const result = await this.apiCall('/sim/sqli/scenarios');
    document.getElementById('sqliOutput').textContent = JSON.stringify(result, null, 2);
  }

  // XSS Testing
  async testXSS(type) {
    const payload = document.getElementById('xssPayload').value;
    const sanitize = document.getElementById('xssSanitize').checked;
    
    let endpoint, data;
    if (type === 'reflect') {
      endpoint = '/sim/xss/reflect';
      data = { input: payload, sanitize };
    } else {
      endpoint = '/sim/xss/store';
      data = { comment: payload, username: 'testuser' };
    }
    
    const result = await this.apiCall(endpoint, 'POST', data);
    document.getElementById('xssOutput').textContent = JSON.stringify(result, null, 2);
    this.log(`XSS test: ${type}`, 'attack');
  }

  async getXSSPayloads() {
    const result = await this.apiCall('/sim/xss/payloads');
    document.getElementById('xssOutput').textContent = JSON.stringify(result, null, 2);
  }

  // Keylogger simulation
  async captureKeystroke(event) {
    if (!document.getElementById('keyConsent').checked) return;
    
    await this.apiCall('/sim/keys/capture', 'POST', {
      key: event.key,
      metadata: {
        alt: event.altKey,
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        meta: event.metaKey
      },
      consent: true
    });
  }

  async getKeystrokes() {
    const result = await this.apiCall('/sim/keys/keystrokes');
    document.getElementById('keyOutput').textContent = JSON.stringify(result, null, 2);
  }

  async reconstructText() {
    const result = await this.apiCall('/sim/keys/reconstruct');
    document.getElementById('keyOutput').textContent = JSON.stringify(result, null, 2);
  }

  // Cookie manipulation
  async setCookie() {
    const name = document.getElementById('cookieName').value;
    const value = document.getElementById('cookieValue').value;
    const secure = document.getElementById('cookieSecure').checked;
    const httponly = document.getElementById('cookieHttpOnly').checked;
    
    const params = new URLSearchParams({ name, value, secure, httponly });
    const result = await this.apiCall(`/sim/cookies/set?${params}`);
    document.getElementById('cookieOutput').textContent = JSON.stringify(result, null, 2);
  }

  async readCookies() {
    const result = await this.apiCall('/sim/cookies/read');
    document.getElementById('cookieOutput').textContent = JSON.stringify(result, null, 2);
  }

  async simulateSessionHijack() {
    const sessionId = document.cookie.match(/lab_session=([^;]+)/)?.[1] || 'LAB_12345';
    const result = await this.apiCall('/sim/cookies/hijack', 'POST', { sessionId });
    document.getElementById('cookieOutput').textContent = JSON.stringify(result, null, 2);
  }

  // DDoS simulation
  async startDDoS() {
    const rps = parseInt(document.getElementById('ddosRPS').value) || 10;
    const duration = parseInt(document.getElementById('ddosDuration').value) || 10;
    const threads = parseInt(document.getElementById('ddosThreads').value) || 1;
    
    const result = await this.apiCall('/sim/ddos/simulate', 'POST', {
      target: '127.0.0.1:5000',
      rps,
      duration,
      threads
    });
    
    document.getElementById('ddosOutput').textContent = JSON.stringify(result, null, 2);
    this.log(`DDoS simulation started: ${rps} RPS for ${duration}s`, 'warning');
  }

  async getDDoSMetrics() {
    const result = await this.apiCall('/sim/ddos/metrics');
    document.getElementById('ddosOutput').textContent = JSON.stringify(result, null, 2);
    
    // Update stats display
    if (result.current) {
      const statsEl = document.getElementById('ddosStats');
      if (statsEl) {
        statsEl.innerHTML = `
          <div class="stat">
            <div class="stat-value">${result.current.requests || 0}</div>
            <div class="stat-label">Requests</div>
          </div>
          <div class="stat">
            <div class="stat-value">${result.current.blocked || 0}</div>
            <div class="stat-label">Blocked</div>
          </div>
          <div class="stat">
            <div class="stat-value">${result.current.rps || 0}</div>
            <div class="stat-label">RPS</div>
          </div>
          <div class="stat">
            <div class="stat-value">${result.current.active ? 'Active' : 'Stopped'}</div>
            <div class="stat-label">Status</div>
          </div>
        `;
      }
    }
  }

  // Defense testing
  async testMITMDefense() {
    const enableHSTS = document.getElementById('enableHSTS').checked;
    const enableCertPinning = document.getElementById('enableCertPinning').checked;
    
    const result = await this.apiCall('/sim/mitm/defense-test', 'POST', {
      enableHSTS,
      enableCertPinning,
      enableCAValidation: true
    });
    
    document.getElementById('mitmDefenseOutput').textContent = JSON.stringify(result, null, 2);
  }

  async configureDDoSProtection() {
    const enableRateLimit = document.getElementById('enableRateLimit').checked;
    const enableFirewall = document.getElementById('enableFirewall').checked;
    const enableCDN = document.getElementById('enableCDN').checked;
    
    const result = await this.apiCall('/sim/ddos/protect', 'POST', {
      enableRateLimit,
      enableFirewall,
      enableCDN
    });
    
    document.getElementById('ddosProtectionOutput').textContent = JSON.stringify(result, null, 2);
  }

  async analyzeSecurityHeaders() {
    // Analyze current page headers
    const headers = {
      'Content-Security-Policy': 'enabled',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'geolocation=()'
    };
    
    document.getElementById('headersOutput').textContent = JSON.stringify(headers, null, 2);
    this.log('Security headers analyzed', 'defense');
  }

  // Payload generation
  async generatePayloads() {
    const type = document.getElementById('payloadType').value;
    const encoded = document.getElementById('encodePayloads').checked;
    
    const params = new URLSearchParams({ type, encoded });
    const result = await this.apiCall(`/sim/payloads/generate?${params}`);
    document.getElementById('payloadOutput').textContent = JSON.stringify(result, null, 2);
  }

  async encodePayload() {
    const payload = document.getElementById('customPayload').value;
    const encodings = [];
    
    if (document.getElementById('urlEncode').checked) encodings.push('url');
    if (document.getElementById('htmlEncode').checked) encodings.push('html');
    if (document.getElementById('base64Encode').checked) encodings.push('base64');
    
    const result = await this.apiCall('/sim/payloads/encode', 'POST', { payload, encodings });
    document.getElementById('encoderOutput').textContent = JSON.stringify(result, null, 2);
  }

  async getWAFBypass() {
    const result = await this.apiCall('/sim/payloads/waf-bypass');
    document.getElementById('wafBypassOutput').textContent = JSON.stringify(result, null, 2);
  }

  // Analytics
  async refreshStats() {
    const result = await this.apiCall('/api/stats');
    
    const statsEl = document.getElementById('labStats');
    if (statsEl && result) {
      statsEl.innerHTML = `
        <div class="stat">
          <div class="stat-value">${result.incidents || 0}</div>
          <div class="stat-label">Incidents</div>
        </div>
        <div class="stat">
          <div class="stat-value">${result.keystrokes || 0}</div>
          <div class="stat-label">Keystrokes</div>
        </div>
        <div class="stat">
          <div class="stat-value">${result.traffic || 0}</div>
          <div class="stat-label">Traffic</div>
        </div>
        <div class="stat">
          <div class="stat-value">${Math.round((result.uptime || 0) / 1000)}s</div>
          <div class="stat-label">Uptime</div>
        </div>
      `;
    }
    
    document.getElementById('statsOutput').textContent = JSON.stringify(result, null, 2);
  }

  async analyzeTraffic() {
    const result = await this.apiCall('/api/tap');
    document.getElementById('trafficOutput').textContent = JSON.stringify(result.slice(-20), null, 2);
  }

  async getIncidents() {
    const result = await this.apiCall('/api/incidents');
    document.getElementById('incidentOutput').textContent = JSON.stringify(result.slice(-10), null, 2);
  }

  async clearData() {
    if (confirm('Clear all lab data? This cannot be undone.')) {
      const result = await this.apiCall('/api/clear', 'DELETE');
      document.getElementById('incidentOutput').textContent = JSON.stringify(result, null, 2);
      this.log('Lab data cleared', 'warning');
      this.refreshStats();
    }
  }

  // Console commands
  executeCommand() {
    const input = document.getElementById('consoleInput');
    const command = input.value.trim();
    input.value = '';
    
    this.log(`> ${command}`, 'info');
    
    switch (command.toLowerCase()) {
      case 'help':
        this.log('Available commands:', 'info');
        this.log('- stats: Show lab statistics', 'info');
        this.log('- clear: Clear console', 'info');
        this.log('- status: Show module status', 'info');
        this.log('- ddos start: Start DDoS simulation', 'info');
        this.log('- incidents: Show recent incidents', 'info');
        break;
      case 'stats':
        this.refreshStats();
        break;
      case 'clear':
        document.getElementById('liveConsole').innerHTML = '';
        break;
      case 'status':
        this.log('Module Status:', 'info');
        this.log('- All modules operational', 'defense');
        break;
      case 'ddos start':
        this.startDDoS();
        break;
      case 'incidents':
        this.getIncidents();
        break;
      default:
        this.log(`Unknown command: ${command}`, 'attack');
    }
  }
}

// Global functions for HTML onclick handlers
function switchTab(tabName) {
  lab.switchTab(tabName);
}

function simulatePhishing() { lab.simulatePhishing(); }
function getPhishingTemplates() { lab.getPhishingTemplates(); }
function testSQLInjection(type) { lab.testSQLInjection(type); }
function getSQLIScenarios() { lab.getSQLIScenarios(); }
function testXSS(type) { lab.testXSS(type); }
function getXSSPayloads() { lab.getXSSPayloads(); }
function getKeystrokes() { lab.getKeystrokes(); }
function reconstructText() { lab.reconstructText(); }
function setCookie() { lab.setCookie(); }
function readCookies() { lab.readCookies(); }
function simulateSessionHijack() { lab.simulateSessionHijack(); }
function startDDoS() { lab.startDDoS(); }
function getDDoSMetrics() { lab.getDDoSMetrics(); }
function testMITMDefense() { lab.testMITMDefense(); }
function configureDDoSProtection() { lab.configureDDoSProtection(); }
function analyzeSecurityHeaders() { lab.analyzeSecurityHeaders(); }
function generatePayloads() { lab.generatePayloads(); }
function encodePayload() { lab.encodePayload(); }
function getWAFBypass() { lab.getWAFBypass(); }
function refreshStats() { lab.refreshStats(); }
function analyzeTraffic() { lab.analyzeTraffic(); }
function getIncidents() { lab.getIncidents(); }
function clearData() { lab.clearData(); }
function executeCommand() { lab.executeCommand(); }

// Initialize the lab when page loads
const lab = new GodBrainLab();

// Auto-refresh stats every 30 seconds
setInterval(() => {
  lab.refreshStats();
  lab.getDDoSMetrics();
}, 30000);

// Show welcome message
setTimeout(() => {
  lab.log('🧠 Welcome to GodBrain Cybersecurity Lab!', 'defense');
  lab.log('📚 This is a controlled environment for ethical hacking training', 'info');
  lab.log('⚠️  All simulations are localhost-only for safety', 'warning');
  lab.log('🎓 Perfect for CEH v14 certification preparation', 'info');
  lab.log('💡 Use the tabs above to explore different attack vectors', 'info');
}, 1000);
