/**
 * VALIFI FULL STACK SERVER - Node.js Compatible Version for AWS App Runner
 * Serves both the frontend React app and backend API
 */

const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '8080');
const isDev = process.env.NODE_ENV !== 'production';

// Demo data for testing
const demoUser = {
  id: 'demo-user-1',
  email: 'demo@valifi.com',
  fullName: 'Demo User',
  username: 'demo',
  token: 'demo-token-123'
};

const demoAppData = {
  profile: {
    id: 'demo-user-1',
    fullName: 'Demo User',
    username: 'demo',
    email: 'demo@valifi.com',
    profilePhotoUrl: 'https://i.pravatar.cc/150?u=demo',
    kycStatus: 'Verified'
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
      balancePrivacy: false
    }
  },
  portfolio: {
    totalBalance: 125000.50,
    assets: [
      { id: '1', name: 'US Dollar', ticker: 'USD', type: 'CASH', balance: 25000.50, value: 25000.50, change24h: 0, changePercentage24h: 0, Icon: 'UsdIcon' },
      { id: '2', name: 'Bitcoin', ticker: 'BTC', type: 'CRYPTO', balance: 1.5, value: 65000, change24h: 2500, changePercentage24h: 4.0, Icon: 'BtcIcon' },
      { id: '3', name: 'Ethereum', ticker: 'ETH', type: 'CRYPTO', balance: 10, value: 35000, change24h: -500, changePercentage24h: -1.4, Icon: 'EthIcon' }
    ],
    transactions: []
  },
  notifications: [
    { id: '1', type: 'success', title: 'Welcome to Valifi!', message: 'Your account has been created successfully', timestamp: new Date().toISOString(), isRead: false }
  ],
  userActivity: [
    { id: '1', action: 'Account Created', timestamp: new Date().toISOString(), status: 'success', details: 'Welcome to Valifi Platform', icon: 'CheckCircleIcon' }
  ],
  newsItems: [
    { id: '1', title: 'Bitcoin Reaches New Heights', summary: 'BTC surpasses $65,000 mark', timestamp: new Date().toISOString(), category: 'crypto' }
  ],
  cardDetails: { status: 'Not Applied', type: 'Virtual', currency: 'USD', theme: 'Obsidian', isFrozen: false },
  linkedBankAccounts: [],
  loanApplications: [],
  p2pOffers: [],
  p2pOrders: [],
  userPaymentMethods: [],
  reitProperties: [],
  stakableStocks: [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 178.50, apy: 12.5, minStake: 100, Icon: 'AppleIcon', description: 'Tech giant', risk: 'Medium' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 138.20, apy: 11.2, minStake: 100, Icon: 'GoogleIcon', description: 'Search leader', risk: 'Medium' }
  ],
  investableNFTs: [],
  spectrumPlans: [],
  stakableCrypto: [
    { id: 'eth-stake', name: 'Ethereum', ticker: 'ETH', apy: 4.5, minStake: 0.1, Icon: 'EthIcon', currentStaked: 0 },
    { id: 'sol-stake', name: 'Solana', ticker: 'SOL', apy: 7.2, minStake: 1, Icon: 'SolanaIcon', currentStaked: 0 }
  ],
  referralSummary: { tree: null, activities: [] }
};

// API Routes
const handleRequest = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // Handle CORS for API routes
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Set CORS headers
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Routes
  if (path.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    if (path === '/api/health') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'healthy',
        runtime: 'Node.js ' + process.version,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    if (path === '/api/auth/login' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          token: 'demo-token-123',
          user: demoUser
        }));
      });
      return;
    }

    if (path === '/api/auth/register' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const { fullName, username, email } = JSON.parse(body);
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          token: 'demo-token-123',
          user: { ...demoUser, fullName, username, email }
        }));
      });
      return;
    }

    if (path === '/api/app-data') {
      res.writeHead(200);
      res.end(JSON.stringify(demoAppData));
      return;
    }

    if (path === '/api/bot' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const { bot, action } = JSON.parse(body);
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          bot,
          action,
          result: 'Bot action executed successfully'
        }));
      });
      return;
    }

    // API endpoint not found
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
    return;
  }

  // Serve static files from dist directory
  if (path.startsWith('/assets/') || path.includes('.')) {
    try {
      const filePath = path.join(process.cwd(), 'dist', path === '/' ? 'index.html' : path);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        const ext = path.extname(filePath);
        const contentType = {
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.ico': 'image/x-icon'
        }[ext] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.writeHead(200);
        res.end(content);
        return;
      }
    } catch (error) {
      // Continue to serve index.html
    }
  }

  // Serve React app HTML for all other routes (SPA routing)
  try {
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      let htmlContent = fs.readFileSync(indexPath, 'utf8');

      // Inject demo mode script
      htmlContent = htmlContent.replace(
        '</body>',
        `<script>
          window.VALIFI_DEMO_MODE = true;
          console.log('🚀 Valifi Platform - Demo Mode (AWS App Runner)');
        </script>
        </body>`
      );

      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(htmlContent);
      return;
    }
  } catch (error) {
    // Continue to fallback HTML
  }

  // Fallback HTML page
  const fallbackHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Valifi - AI-Powered Financial Platform</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-900 text-white">
      <div id="root" class="min-h-screen flex items-center justify-center">
        <div class="text-center p-8">
          <h1 class="text-4xl font-bold mb-4">🚀 Valifi Platform</h1>
          <p class="text-xl mb-8">AI-Powered Financial Services on AWS App Runner</p>

          <div class="space-y-4">
            <div class="bg-gray-800 p-6 rounded-lg">
              <h2 class="text-2xl mb-2">✅ Server Running</h2>
              <p>API: <a href="/api/health" class="text-blue-400 hover:underline">/api/health</a></p>
              <p>Port: ${PORT}</p>
              <p>Runtime: Node.js ${process.version}</p>
            </div>

            <div class="bg-gray-800 p-6 rounded-lg">
              <h2 class="text-xl mb-2">📱 Frontend Build Required</h2>
              <p class="mb-2">To see the full UI, ensure the React app is built:</p>
              <code class="bg-gray-700 px-2 py-1 rounded">npm run build</code>
            </div>

            <div class="bg-gray-800 p-6 rounded-lg">
              <h2 class="text-xl mb-2">🌐 AWS App Runner Deployment</h2>
              <p>This application is running on AWS App Runner</p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.writeHead(200);
  res.end(fallbackHtml);
};

// Create HTTP server
const http = require('http');
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                            ║
║     VALIFI FULL STACK SERVER - AWS APP RUNNER 🚀          ║
║                                                            ║
║     Frontend:  http://localhost:${PORT}                       ║
║     API:       http://localhost:${PORT}/api                   ║
║     Health:    http://localhost:${PORT}/api/health            ║
║                                                            ║
║     Mode:      Demo (no database)                        ║
║     Runtime:   Node.js ${process.version}                           ║
║                                                            ║
║     Features:                                             ║
║     ✅ React Frontend                                      ║
║     ✅ REST API Backend                                    ║
║     ✅ Bot Framework                                       ║
║     ✅ Demo Authentication                                 ║
║     ✅ AWS App Runner Compatible                           ║
║                                                            ║
╚══════════════════════════════════════════════════════════╝

📝 Demo Credentials:
   Email: demo@valifi.com
   Password: (any password works in demo mode)

🌐 Open http://localhost:${PORT} in your browser
`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

module.exports = server;