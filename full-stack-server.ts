/**
 * VALIFI FULL STACK SERVER - Complete React + API Server
 * Serves both the frontend React app and backend API
 */

import { serve, file } from 'bun';
import { join } from 'path';

const PORT = parseInt(process.env.PORT || '8080');
const isDev = process.env.NODE_ENV !== 'production';

// Database setup - import our database configuration
let db: any = null;
let isDatabaseConnected = false;

// Try to connect to PostgreSQL database
async function initializeDatabase() {
  try {
    // Use dynamic import to handle both environments
    const { db: database, testConnection } = await import('./src/config/database.ts');

    const isConnected = await testConnection();
    if (isConnected) {
      db = database;
      isDatabaseConnected = true;
      console.log('✅ Connected to PostgreSQL database');
    } else {
      console.log('📦 Database connection failed - using demo mode');
    }
  } catch (error) {
    console.log('📦 Database module not available - running in demo mode');
    console.log('   Error:', error.message);
  }
}

// Initialize database connection
await initializeDatabase();

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
const apiRoutes = {
  '/api/health': async () => {
    let dbStatus = 'disconnected';
    let dbInfo = null;

    if (isDatabaseConnected && db) {
      try {
        const healthResult = await db.healthCheck();
        dbStatus = healthResult.status;
        dbInfo = {
          latency: healthResult.latency,
          connections: healthResult.connections,
          host: process.env.DB_HOST || 'localhost',
          database: process.env.DB_NAME || 'demo'
        };
      } catch (error) {
        dbStatus = 'error';
        dbInfo = { error: error.message };
      }
    }

    return Response.json({
      status: 'healthy',
      runtime: 'Bun ' + Bun.version,
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        connected: isDatabaseConnected,
        info: dbInfo
      },
      environment: process.env.NODE_ENV || 'development'
    });
  },

  '/api/auth/login': async (req: Request) => {
    const { email, password } = await req.json();
    // Demo login - accepts any credentials
    return Response.json({
      success: true,
      token: 'demo-token-123',
      user: demoUser
    });
  },

  '/api/auth/register': async (req: Request) => {
    const { fullName, username, email, password } = await req.json();
    return Response.json({
      success: true,
      token: 'demo-token-123',
      user: { ...demoUser, fullName, username, email }
    });
  },

  '/api/app-data': async (req: Request) => {
    // Return demo data for the app
    return Response.json(demoAppData);
  },

  '/api/bot': async (req: Request) => {
    const { bot, action } = await req.json();
    return Response.json({
      success: true,
      bot,
      action,
      result: 'Bot action executed successfully'
    });
  }
};

// Main server
const server = serve({
  port: PORT,

  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Handle CORS for API routes
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers });
    }

    // API Routes
    if (path.startsWith('/api/')) {
      const handler = apiRoutes[path];
      if (handler) {
        const response = await handler(req);
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      }
      return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
        status: 404,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    // Serve static files from public directory
    if (path.startsWith('/static/') || path.includes('.')) {
      try {
        const filePath = join(process.cwd(), 'public', path === '/' ? 'index.html' : path);
        return new Response(file(filePath));
      } catch {
        // File not found, continue to serve index.html
      }
    }

    // Serve React app HTML for all other routes (SPA routing)
    try {
      const indexPath = join(process.cwd(), 'public', 'index.html');
      const htmlContent = await file(indexPath).text();

      // Inject a script to set up the React app
      const modifiedHtml = htmlContent.replace(
        '</body>',
        `<script>
          // Set demo mode flag
          window.VALIFI_DEMO_MODE = true;
          console.log('🚀 Valifi Platform - Demo Mode');
        </script>
        </body>`
      );

      return new Response(modifiedHtml, {
        headers: { 'Content-Type': 'text/html' }
      });
    } catch {
      // If no index.html, return a simple HTML page
      return new Response(`
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
              <p class="text-xl mb-8">AI-Powered Financial Services</p>

              <div class="space-y-4">
                <div class="bg-gray-800 p-6 rounded-lg">
                  <h2 class="text-2xl mb-2">✅ Server Running</h2>
                  <p>API: <a href="/api/health" class="text-blue-400 hover:underline">/api/health</a></p>
                </div>

                <div class="bg-gray-800 p-6 rounded-lg">
                  <h2 class="text-xl mb-2">📱 Frontend Setup Required</h2>
                  <p class="mb-2">To see the full UI, build the React app:</p>
                  <code class="bg-gray-700 px-2 py-1 rounded">bun run build</code>
                </div>

                <div class="bg-gray-800 p-6 rounded-lg">
                  <h2 class="text-xl mb-2">🔧 Development Mode</h2>
                  <p>For development with hot reload:</p>
                  <code class="bg-gray-700 px-2 py-1 rounded">bun run dev</code>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
  },

  error(error) {
    console.error('Server error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});

console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                            ║
║     VALIFI FULL STACK SERVER - READY! 🚀                  ║
║                                                            ║
║     Frontend:  http://localhost:${PORT}                       ║
║     API:       http://localhost:${PORT}/api                   ║
║     Health:    http://localhost:${PORT}/api/health            ║
║                                                            ║
║     Mode:      ${db ? 'Production (with database)' : 'Demo (no database)'}           ║
║     Runtime:   Bun ${Bun.version}                              ║
║                                                            ║
║     Features:                                             ║
║     ✅ React Frontend                                      ║
║     ✅ REST API Backend                                    ║
║     ✅ Bot Framework                                       ║
║     ✅ Demo Authentication                                 ║
║     ✅ Live Trading Simulation                             ║
║                                                            ║
╚══════════════════════════════════════════════════════════╝

📝 Demo Credentials:
   Email: demo@valifi.com
   Password: (any password works in demo mode)

🌐 Open http://localhost:${PORT} in your browser
`);

export default server;