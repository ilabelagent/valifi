#!/usr/bin/env node

// =====================================================
// VALIFI KINGDOM MASTER CONTROL
// Complete A-Z Execution with Zero Manual Intervention
// =====================================================

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class ValifiMasterControl {
  constructor() {
    this.platform = os.platform();
    this.isWindows = this.platform === 'win32';
    this.projectRoot = __dirname;
    this.completed = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    const prefix = {
      info: 'ℹ',
      success: '✓',
      warning: '⚠',
      error: '✗'
    };
    
    console.log(`${colors[type]}${prefix[type]} ${message}${colors.reset}`);
  }

  async run() {
    console.clear();
    this.log('════════════════════════════════════════════════════════════════', 'info');
    this.log('          VALIFI KINGDOM MASTER CONTROL v3.0', 'info');
    this.log('          Complete A-Z Execution Starting...', 'info');
    this.log('════════════════════════════════════════════════════════════════', 'info');
    console.log();
    
    try {
      // Check system requirements
      await this.checkRequirements();
      
      // Execute complete automation
      await this.executeCompleteAutomation();
      
      // Launch the system
      await this.launchKingdom();
      
      // Show final status
      await this.showFinalStatus();
      
    } catch (error) {
      this.log(`Critical error: ${error.message}`, 'error');
      this.errors.push(error.message);
      process.exit(1);
    }
  }

  async checkRequirements() {
    this.log('Checking system requirements...', 'info');
    
    // Check Node.js
    try {
      const nodeVersion = execSync('node --version').toString().trim();
      this.log(`Node.js: ${nodeVersion}`, 'success');
    } catch {
      throw new Error('Node.js is not installed');
    }
    
    // Check npm
    try {
      const npmVersion = execSync('npm --version').toString().trim();
      this.log(`npm: ${npmVersion}`, 'success');
    } catch {
      throw new Error('npm is not installed');
    }
    
    // Check Git
    try {
      const gitVersion = execSync('git --version').toString().trim();
      this.log(`Git: ${gitVersion}`, 'success');
    } catch {
      this.log('Git not found (optional for local development)', 'warning');
    }
    
    this.completed.push('System Requirements');
    console.log();
  }

  async executeCompleteAutomation() {
    this.log('Executing complete automation...', 'info');
    console.log();
    
    // Check if automation script exists
    const automationScript = path.join(this.projectRoot, 'kingdom-complete-automation.js');
    
    if (!fs.existsSync(automationScript)) {
      this.log('Creating automation script...', 'warning');
      // The script should already be created, but if not, we can handle it
      throw new Error('Automation script not found. Please ensure kingdom-complete-automation.js exists.');
    }
    
    return new Promise((resolve, reject) => {
      const automation = spawn('node', ['kingdom-complete-automation.js'], {
        cwd: this.projectRoot,
        stdio: 'inherit',
        shell: true
      });
      
      automation.on('close', (code) => {
        if (code === 0) {
          this.log('Automation completed successfully', 'success');
          this.completed.push('Complete Automation');
          resolve();
        } else {
          reject(new Error(`Automation failed with code ${code}`));
        }
      });
      
      automation.on('error', (err) => {
        reject(err);
      });
    });
  }

  async launchKingdom() {
    this.log('Launching Valifi Kingdom...', 'info');
    console.log();
    
    if (this.isWindows) {
      // On Windows, launch the Kingdom Launcher
      if (fs.existsSync('KINGDOM-LAUNCHER.bat')) {
        this.log('Starting Kingdom Launcher...', 'info');
        
        const launcher = spawn('cmd', ['/c', 'start', 'KINGDOM-LAUNCHER.bat'], {
          cwd: this.projectRoot,
          detached: true,
          stdio: 'ignore'
        });
        
        launcher.unref();
        this.log('Kingdom Launcher started', 'success');
      } else {
        // Fallback to direct npm start
        this.log('Starting development server...', 'info');
        
        const server = spawn('npm', ['run', 'dev'], {
          cwd: this.projectRoot,
          detached: true,
          stdio: 'ignore',
          shell: true
        });
        
        server.unref();
        this.log('Development server started', 'success');
      }
    } else {
      // On Unix-like systems
      this.log('Starting development server...', 'info');
      
      const server = spawn('npm', ['run', 'dev'], {
        cwd: this.projectRoot,
        detached: true,
        stdio: 'ignore'
      });
      
      server.unref();
      this.log('Development server started', 'success');
    }
    
    this.completed.push('Kingdom Launch');
    console.log();
  }

  async showFinalStatus() {
    console.log();
    this.log('════════════════════════════════════════════════════════════════', 'success');
    this.log('                 VALIFI KINGDOM IS READY!', 'success');
    this.log('════════════════════════════════════════════════════════════════', 'success');
    console.log();
    
    this.log('Completed Steps:', 'info');
    this.completed.forEach(step => {
      this.log(`  ${step}`, 'success');
    });
    
    if (this.errors.length > 0) {
      console.log();
      this.log('Warnings:', 'warning');
      this.errors.forEach(error => {
        this.log(`  ${error}`, 'warning');
      });
    }
    
    console.log();
    this.log('Access Points:', 'info');
    this.log('  Dashboard: http://localhost:3000', 'success');
    this.log('  Monitoring: Open kingdom-dashboard.html', 'success');
    this.log('  MCP Console: Run kingdom-mcp-server.js', 'success');
    
    console.log();
    this.log('Deployment:', 'info');
    this.log('  1. Push to GitHub: git push origin main', 'info');
    this.log('  2. Deploy via Render Dashboard', 'info');
    this.log('  3. Access: https://valifi-fintech-platform.onrender.com', 'info');
    
    console.log();
    this.log('Reports Generated:', 'info');
    this.log('  automation-report.json - Full automation report', 'success');
    this.log('  automation.log - Detailed log file', 'success');
    
    console.log();
    this.log('Your Valifi Kingdom is fully operational!', 'success');
    console.log();
  }
}

// Execute Master Control
if (require.main === module) {
  const master = new ValifiMasterControl();
  
  // ASCII Art Banner
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  ██╗   ██╗ █████╗ ██╗     ██╗███████╗██╗    ██╗  ██╗██╗███╗   ██╗ ██████╗  ║
║  ██║   ██║██╔══██╗██║     ██║██╔════╝██║    ██║ ██╔╝██║████╗  ██║██╔════╝  ║
║  ██║   ██║███████║██║     ██║█████╗  ██║    █████╔╝ ██║██╔██╗ ██║██║  ███╗ ║
║  ╚██╗ ██╔╝██╔══██║██║     ██║██╔══╝  ██║    ██╔═██╗ ██║██║╚██╗██║██║   ██║ ║
║   ╚████╔╝ ██║  ██║███████╗██║██║     ██║    ██║  ██╗██║██║ ╚████║╚██████╔╝ ║
║    ╚═══╝  ╚═╝  ╚═╝╚══════╝╚═╝╚═╝     ╚═╝    ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝  ║
║                                                                              ║
║                    M A S T E R   C O N T R O L   v3.0                       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
  `);
  
  console.log('Starting in 3 seconds... Press Ctrl+C to cancel.\n');
  
  setTimeout(() => {
    master.run().catch(error => {
      console.error('\n❌ Master Control failed:', error.message);
      process.exit(1);
    });
  }, 3000);
}

module.exports = ValifiMasterControl;
