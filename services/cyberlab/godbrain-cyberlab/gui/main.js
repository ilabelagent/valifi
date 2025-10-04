const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const Store = require('electron-store');
const WebSocket = require('ws');
const fs = require('fs');

// Store for persistent settings
const store = new Store();

let mainWindow;
let serverProcess;
let wsConnection;
const serverPort = store.get('serverPort', 5000);
const httpsPort = store.get('httpsPort', 5443);

// Enable live reload for development
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

class CyberLabManager {
  constructor() {
    this.isServerRunning = false;
    this.labModules = [
      'phishing-demo', 'sqli-demo', 'xss-demo', 'cookies-demo',
      'keylogger-demo', 'ddos-simulation', 'mitm-simulation',
      'payload-generator', 'proxy-mimic'
    ];
    this.labStats = {
      incidents: 0,
      sessions: 0,
      uptime: 0,
      connections: 0
    };
  }

  async startServer() {
    if (this.isServerRunning) return;

    try {
      const serverPath = path.join(__dirname, '..', 'server.js');
      
      // Start the main server
      serverProcess = spawn('node', [serverPath], {
        env: { 
          ...process.env, 
          PORT: serverPort,
          HTTPS_PORT: httpsPort,
          NODE_ENV: 'production'
        },
        cwd: path.join(__dirname, '..')
      });

      serverProcess.stdout.on('data', (data) => {
        console.log(`[SERVER] ${data.toString()}`);
        this.sendToRenderer('server-log', data.toString());
      });

      serverProcess.stderr.on('data', (data) => {
        console.error(`[SERVER ERROR] ${data.toString()}`);
        this.sendToRenderer('server-error', data.toString());
      });

      serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
        this.isServerRunning = false;
        this.sendToRenderer('server-stopped');
      });

      // Wait a moment for server to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Connect WebSocket for real-time updates
      this.connectWebSocket();
      
      this.isServerRunning = true;
      this.sendToRenderer('server-started');
      
      return true;
    } catch (error) {
      console.error('Failed to start server:', error);
      this.sendToRenderer('server-error', error.message);
      return false;
    }
  }

  stopServer() {
    if (serverProcess) {
      serverProcess.kill();
      serverProcess = null;
    }
    if (wsConnection) {
      wsConnection.close();
      wsConnection = null;
    }
    this.isServerRunning = false;
    this.sendToRenderer('server-stopped');
  }

  connectWebSocket() {
    try {
      wsConnection = new WebSocket(`ws://localhost:${serverPort}`);
      
      wsConnection.on('open', () => {
        console.log('WebSocket connected to lab server');
        this.sendToRenderer('websocket-connected');
      });

      wsConnection.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.sendToRenderer('lab-update', message);
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      });

      wsConnection.on('close', () => {
        console.log('WebSocket disconnected');
        this.sendToRenderer('websocket-disconnected');
      });

      wsConnection.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }

  sendToRenderer(channel, data) {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, data);
    }
  }

  async getLabStats() {
    try {
      const response = await fetch(`http://localhost:${serverPort}/api/stats`);
      if (response.ok) {
        this.labStats = await response.json();
        return this.labStats;
      }
    } catch (error) {
      console.error('Failed to fetch lab stats:', error);
    }
    return this.labStats;
  }

  async generateSSLCerts() {
    return new Promise((resolve, reject) => {
      const certDir = path.join(__dirname, '..', 'certs');
      
      if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
      }

      const keyPath = path.join(certDir, 'server.key');
      const certPath = path.join(certDir, 'server.crt');

      // Generate self-signed certificate for local development
      const opensslCmd = `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=US/ST=Lab/L=Training/O=GodBrain/OU=CyberLab/CN=localhost"`;
      
      exec(opensslCmd, (error, stdout, stderr) => {
        if (error) {
          console.error('SSL generation error:', error);
          reject(error);
        } else {
          console.log('SSL certificates generated successfully');
          resolve({ keyPath, certPath });
        }
      });
    });
  }
}

const labManager = new CyberLabManager();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    titleBarStyle: 'default',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Handle window ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Check if this is first run
    if (!store.get('hasRunBefore')) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Welcome to GodBrain CyberLab',
        message: 'Professional CEH Training Environment',
        detail: 'This tool is for educational purposes and authorized penetration testing only. Please ensure you comply with all applicable laws and ethical guidelines.',
        buttons: ['I Understand', 'View Documentation']
      }).then((result) => {
        if (result.response === 1) {
          shell.openExternal('https://github.com/godbrain-ai/cyberlab#readme');
        }
        store.set('hasRunBefore', true);
      });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    labManager.stopServer();
  });

  // Create application menu
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Training Session',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('new-session')
        },
        {
          label: 'Export Lab Data',
          accelerator: 'CmdOrCtrl+E',
          click: () => mainWindow.webContents.send('export-data')
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Lab',
      submenu: [
        {
          label: 'Start Server',
          accelerator: 'F5',
          click: () => labManager.startServer()
        },
        {
          label: 'Stop Server',
          accelerator: 'Shift+F5',
          click: () => labManager.stopServer()
        },
        { type: 'separator' },
        {
          label: 'Open in Browser',
          accelerator: 'CmdOrCtrl+B',
          click: () => shell.openExternal(`http://localhost:${serverPort}`)
        },
        {
          label: 'Clear Lab Data',
          click: () => mainWindow.webContents.send('clear-data')
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Generate SSL Certificates',
          click: async () => {
            try {
              await labManager.generateSSLCerts();
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'SSL Certificates Generated',
                message: 'SSL certificates have been generated successfully for HTTPS training scenarios.'
              });
            } catch (error) {
              dialog.showErrorBox('SSL Generation Failed', error.message);
            }
          }
        },
        {
          label: 'Network Scanner',
          click: () => mainWindow.webContents.send('open-tool', 'network-scanner')
        },
        {
          label: 'Payload Generator',
          click: () => mainWindow.webContents.send('open-tool', 'payload-generator')
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://github.com/godbrain-ai/cyberlab#readme')
        },
        {
          label: 'CEH Training Guide',
          click: () => shell.openExternal('https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/')
        },
        { type: 'separator' },
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About GodBrain CyberLab',
              message: 'GodBrain CyberLab v2.0.0',
              detail: 'Professional CEH Training Environment\\n\\nDeveloped by GodBrain AI\\nFor educational and authorized testing purposes only.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('start-server', async () => {
  return await labManager.startServer();
});

ipcMain.handle('stop-server', () => {
  labManager.stopServer();
  return true;
});

ipcMain.handle('get-server-status', () => {
  return labManager.isServerRunning;
});

ipcMain.handle('get-lab-stats', async () => {
  return await labManager.getLabStats();
});

ipcMain.handle('get-settings', () => {
  return {
    serverPort: store.get('serverPort', 5000),
    httpsPort: store.get('httpsPort', 5443),
    theme: store.get('theme', 'dark'),
    autoStart: store.get('autoStart', false)
  };
});

ipcMain.handle('save-settings', (event, settings) => {
  Object.keys(settings).forEach(key => {
    store.set(key, settings[key]);
  });
  return true;
});

ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle('export-lab-data', async () => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Lab Data',
      defaultPath: `cyberlab-data-${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled) {
      // Fetch data from server
      const response = await fetch(`http://localhost:${serverPort}/api/incidents`);
      const data = await response.json();
      
      fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2));
      return { success: true, path: result.filePath };
    }
    return { success: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    labManager.stopServer();
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  labManager.stopServer();
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
