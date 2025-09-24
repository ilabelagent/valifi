#!/usr/bin/env node

/**
 * VALIFI PRODUCTION PREPARATION SCRIPT
 * ===================================
 * 
 * This script removes ALL mock data and prepares the system for production.
 * 
 * WARNING: This will modify your codebase. Make sure you have a backup!
 * 
 * Usage: node REMOVE-ALL-MOCK-DATA.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 VALIFI PRODUCTION PREPARATION STARTING...\n');

class ProductionCleaner {
  constructor() {
    this.modifiedFiles = [];
    this.errors = [];
    this.warnings = [];
  }

  async run() {
    try {
      console.log('🔍 Step 1: Analyzing current system...');
      await this.analyzeSystem();
      
      console.log('\n🧹 Step 2: Removing mock data from bot system...');
      await this.cleanBotSystem();
      
      console.log('\n🔌 Step 3: Updating API services...');
      await this.updateAPIServices();
      
      console.log('\n⚙️ Step 4: Updating configuration files...');
      await this.updateConfigurations();
      
      console.log('\n🔒 Step 5: Adding security enhancements...');
      await this.addSecurityEnhancements();
      
      console.log('\n📊 Step 6: Creating production endpoints...');
      await this.createProductionEndpoints();
      
      console.log('\n📋 Step 7: Generating production report...');
      await this.generateReport();
      
      console.log('\n✅ PRODUCTION PREPARATION COMPLETED!');
      console.log(`Modified ${this.modifiedFiles.length} files`);
      console.log(`Found ${this.warnings.length} warnings`);
      console.log(`Encountered ${this.errors.length} errors`);
      
    } catch (error) {
      console.error('\n❌ FATAL ERROR:', error.message);
      process.exit(1);
    }
  }

  async analyzeSystem() {
    console.log('   📁 Scanning directories...');
    
    const botsDir = path.join(process.cwd(), 'bots');
    if (fs.existsSync(botsDir)) {
      const botDirs = fs.readdirSync(botsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      console.log(`   Found ${botDirs.length} bot modules`);
      
      // Analyze each bot for mock data
      for (const botDir of botDirs) {
        await this.analyzeBotDirectory(path.join(botsDir, botDir));
      }
    }
    
    console.log('   ✅ System analysis complete');
  }

  async analyzeBotDirectory(botPath) {
    const files = fs.readdirSync(botPath);
    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = path.join(botPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for mock data patterns
        if (content.includes('static priceCatalog') || 
            content.includes('Math.random()') ||
            content.includes('_simulatePrice') ||
            content.includes('static portfolios') ||
            content.includes('static orders')) {
          this.warnings.push(`Mock data found in ${filePath}`);
        }
      }
    }
  }

  async cleanBotSystem() {
    const botsDir = path.join(process.cwd(), 'bots');
    if (!fs.existsSync(botsDir)) {
      this.errors.push('Bots directory not found');
      return;
    }

    const botDirs = fs.readdirSync(botsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`   🤖 Cleaning ${botDirs.length} bot modules...`);

    for (const botDir of botDirs) {
      await this.cleanBotDirectory(path.join(botsDir, botDir), botDir);
    }

    console.log('   ✅ Bot system cleaned');
  }

  async cleanBotDirectory(botPath, botName) {
    const files = fs.readdirSync(botPath);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = path.join(botPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Remove static mock data
        if (content.includes('static priceCatalog')) {
          content = content.replace(
            /static\s+priceCatalog\s*=\s*{[^}]*};?/g,
            `// PRODUCTION: Static price catalog removed
  // TODO: Implement real market data integration
  // Use MarketDataService.getPrice(symbol) instead`
          );
          modified = true;
        }

        if (content.includes('static portfolios')) {
          content = content.replace(
            /static\s+portfolios\s*=\s*{[^}]*};?/g,
            `// PRODUCTION: Static portfolios removed
  // TODO: Use database to store user portfolios`
          );
          modified = true;
        }

        if (content.includes('static orders')) {
          content = content.replace(
            /static\s+orders\s*=\s*{[^}]*};?/g,
            `// PRODUCTION: Static orders removed
  // TODO: Use database to store order history`
          );
          modified = true;
        }

        // Remove simulation methods
        if (content.includes('_simulatePrice')) {
          content = content.replace(
            /static\s+_simulatePrice\([^)]*\)\s*{[^}]*}/g,
            `// PRODUCTION: Price simulation removed
  // TODO: Implement real market data API integration`
          );
          modified = true;
        }

        // Remove Math.random() usage
        if (content.includes('Math.random()')) {
          content = content.replace(
            /Math\.random\(\)[^;]*/g,
            '/* PRODUCTION: Random price generation removed - use real market data */'
          );
          modified = true;
        }

        // Add production notice at top of file
        if (modified) {
          const productionNotice = `/*
 * PRODUCTION NOTICE: Mock data has been removed from this bot.
 * This bot requires real API integrations before deployment.
 * 
 * Required integrations for ${botName}:
 * - Real market data API (Polygon.io, Alpha Vantage)
 * - Database integration for user data
 * - Real trading API (Alpaca, Interactive Brokers)
 * - Risk management system
 * - Compliance checks (KYC/AML)
 * 
 * DO NOT DEPLOY TO PRODUCTION WITHOUT IMPLEMENTING ABOVE!
 */

`;
          content = productionNotice + content;
          
          fs.writeFileSync(filePath, content);
          this.modifiedFiles.push(`bots/${botName}/${file}`);
          console.log(`     📝 Cleaned ${botName}/${file}`);
        }
      }
    }
  }

  async updateAPIServices() {
    const apiPath = path.join(process.cwd(), 'services', 'api.ts');
    
    if (!fs.existsSync(apiPath)) {
      this.errors.push('services/api.ts not found');
      return;
    }

    console.log('   🔌 Updating API service layer...');

    // Create production-ready API service
    const productionAPI = `/*
 * VALIFI PRODUCTION API SERVICE
 * ============================
 * 
 * This file contains the production-ready API service layer.
 * All mock implementations have been removed.
 * 
 * CRITICAL: Ensure all endpoints are implemented before deployment!
 */

import type { 
  UserSettings, CardDetails, CardApplicationData, BankAccount, 
  LoanApplication, P2POrder, P2POffer, PaymentMethod, 
  ReferralNode, ReferralActivity, CoPilotMessage, ChatMessage, 
  P2PChatMessage, StakableStock, StakableAsset, REITProperty, InvestableNFT 
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Add request timeout
const TIMEOUT_MS = 30000;

// Create fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('valifi_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': \`Bearer \${token}\` } : {})
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: \`HTTP error! status: \${response.status}\` 
    }));
    throw new Error(error.message || \`Request failed with status: \${response.status}\`);
  }
  return response.json();
};

// PRODUCTION IMPLEMENTATIONS - NO MOCK DATA
// ==========================================

// Health Check
export const checkDbStatus = async () => {
  try {
    const response = await fetchWithTimeout(\`\${API_BASE_URL}/health\`);
    return await response.json();
  } catch (error: any) {
    console.error("Health check failed:", error);
    return { 
      success: false, 
      status: 'error', 
      message: \`Failed to connect to API: \${error.message}\`
    };
  }
};

// Authentication
export const login = async (email: string, password: string) => {
  try {
    const response = await fetchWithTimeout(\`\${API_BASE_URL}/auth/signin\`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return await handleResponse(response);
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const register = async (fullName: string, username: string, email: string, password: string) => {
  try {
    const response = await fetchWithTimeout(\`\${API_BASE_URL}/auth/signup\`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fullName, username, email, password }),
    });
    return await handleResponse(response);
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// User Data
export const getAppData = async (token: string) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/app-data\`, {
    headers: { 'Authorization': \`Bearer \${token}\` }
  });
  const result = await handleResponse(response);
  return result.data;
};

export const updateUserSettings = async (newSettings: UserSettings): Promise<UserSettings> => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/user/settings\`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(newSettings)
  });
  return await handleResponse(response);
};

// Wallet Operations
export const createWallet = async () => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/wallet/create\`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return await handleResponse(response);
};

export const importWallet = async (secretPhrase: string, source: string) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/wallet/import\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ secretPhrase, source })
  });
  return await handleResponse(response);
};

// Transaction Operations
export const requestDeposit = async (data: any) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/transactions/deposit\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await handleResponse(response);
};

export const requestWithdrawal = async (data: any) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/transactions/withdraw\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await handleResponse(response);
};

export const internalTransfer = async (recipient: string, amount: number, note: string) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/transactions/internal-transfer\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ recipient, amount, note })
  });
  return await handleResponse(response);
};

// Investment Operations
export const searchInvestments = async (query: string) => {
  const response = await fetchWithTimeout(
    \`\${API_BASE_URL}/investments/search?q=\${encodeURIComponent(query)}\`,
    { headers: getAuthHeaders() }
  );
  const result = await handleResponse(response);
  return result.results;
};

export const swapAssets = async (fromTicker: string, toTicker: string, fromAmount: number) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/exchange/swap\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ fromTicker, toTicker, fromAmount })
  });
  return await handleResponse(response);
};

// P2P Trading
export const onInitiateTrade = async (offerId: string, amount: number, paymentMethodId: string): Promise<P2POrder> => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/p2p/orders\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ offerId, amount, paymentMethodId })
  });
  return await handleResponse(response);
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/p2p/orders/\${orderId}/status\`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  return await handleResponse(response);
};

export const postChatMessage = async (orderId: string, text: string) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/p2p/orders/\${orderId}/messages\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text })
  });
  return await handleResponse(response);
};

// Financial Services
export const applyForCard = async (data: CardApplicationData) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/cards/apply\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await handleResponse(response);
};

export const linkBankAccount = async (data: any) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/banking/link-account\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await handleResponse(response);
};

export const applyForLoan = async (data: any) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/loans/apply\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await handleResponse(response);
};

export const repayLoan = async (loanId: string, paymentAmount: number) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/loans/\${loanId}/repay\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ paymentAmount })
  });
  return await handleResponse(response);
};

// KYC/Compliance
export const submitKyc = async (data: any) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/kyc/submit\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await handleResponse(response);
};

// AI Services
export const callTaxAdvisor = async (prompt: string, history: ChatMessage[] = []) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/ai/tax-advisor\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt, history })
  });
  return await handleResponse(response);
};

export const callCoPilot = async (contextPrompt: string, systemInstruction: string, history: CoPilotMessage[] = []) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/ai/copilot\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ contextPrompt, systemInstruction, history })
  });
  return await handleResponse(response);
};

// Staking Operations
export const stakeCrypto = async (assetId: string, amount: number, duration: number, payoutDestination: string) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/staking/crypto\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ assetId, amount, duration, payoutDestination })
  });
  return await handleResponse(response);
};

export const stakeStock = async (stockTicker: string, amount: number) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/staking/stocks\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ stockTicker, amount })
  });
  return await handleResponse(response);
};

// Investment Products
export const investReit = async (propertyId: string, amount: number) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/investments/reit\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ propertyId, amount })
  });
  return await handleResponse(response);
};

export const investNftFractional = async (nftId: string, amount: number) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/investments/nft\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ nftId, amount })
  });
  return await handleResponse(response);
};

// P2P Management
export const createP2POffer = async (offerData: any) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/p2p/offers\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(offerData)
  });
  return await handleResponse(response);
};

export const addPaymentMethod = async (methodData: any) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/payment-methods\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(methodData)
  });
  return await handleResponse(response);
};

export const deletePaymentMethod = async (methodId: string) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/payment-methods/\${methodId}\`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return await handleResponse(response);
};

// Trading Bot API Integration
export const getBotPrice = async (symbol: string) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/bots/trading/price/\${symbol}\`, {
    headers: getAuthHeaders()
  });
  return await handleResponse(response);
};

export const getBotPrices = async () => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/bots/trading/prices\`, {
    headers: getAuthHeaders()
  });
  return await handleResponse(response);
};

export const executeBotTrade = async (action: 'buy' | 'sell', symbol: string, quantity: number) => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/bots/trading/execute\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action, symbol, quantity })
  });
  return await handleResponse(response);
};

export const getBotOrders = async () => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/bots/trading/orders\`, {
    headers: getAuthHeaders()
  });
  return await handleResponse(response);
};

export const getBotPortfolio = async () => {
  const response = await fetchWithTimeout(\`\${API_BASE_URL}/bots/trading/portfolio\`, {
    headers: getAuthHeaders()
  });
  return await handleResponse(response);
};

/*
 * PRODUCTION DEPLOYMENT CHECKLIST:
 * ================================
 * 
 * ✅ Mock data removed
 * ⚠️  API endpoints need implementation
 * ⚠️  Database integration required
 * ⚠️  Third-party API keys needed
 * ⚠️  Error handling enhanced
 * ⚠️  Rate limiting required
 * ⚠️  Security audit needed
 * 
 * DO NOT DEPLOY WITHOUT IMPLEMENTING ALL ENDPOINTS!
 */
`;

    fs.writeFileSync(apiPath, productionAPI);
    this.modifiedFiles.push('services/api.ts');
    console.log('   ✅ API service updated for production');
  }

  async updateConfigurations() {
    console.log('   ⚙️ Updating configuration files...');

    // Update next.config.js for production
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      let config = fs.readFileSync(nextConfigPath, 'utf8');
      
      // Add production optimizations
      if (!config.includes('compress: true')) {
        config = config.replace(
          'module.exports = {',
          `/** @type {import('next').NextConfig} */
module.exports = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  },`
        );
      }
      
      fs.writeFileSync(nextConfigPath, config);
      this.modifiedFiles.push('next.config.js');
    }

    // Update package.json scripts
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Add production scripts
      pkg.scripts = {
        ...pkg.scripts,
        "build:production": "NODE_ENV=production next build",
        "start:production": "NODE_ENV=production next start",
        "deploy:aws": "npm run build:production && aws s3 sync .next/static s3://valifi-static",
        "test:production": "NODE_ENV=production npm run test",
        "security:audit": "npm audit --audit-level high",
        "check:production": "node scripts/production-check.js"
      };
      
      fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
      this.modifiedFiles.push('package.json');
    }

    console.log('   ✅ Configuration files updated');
  }

  async addSecurityEnhancements() {
    console.log('   🔒 Adding security enhancements...');

    // Create security middleware
    const securityMiddleware = `// Security middleware for production
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

export const securityMiddleware = [
  // Rate limiting
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  
  // Security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.valifi.com"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false
  })
];

export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !isValidApiKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
};

const isValidApiKey = (key) => {
  // Implement API key validation logic
  return key && key.startsWith('valifi_') && key.length === 64;
};
`;

    const middlewarePath = path.join(process.cwd(), 'lib', 'middleware', 'security.ts');
    const middlewareDir = path.dirname(middlewarePath);
    
    if (!fs.existsSync(middlewareDir)) {
      fs.mkdirSync(middlewareDir, { recursive: true });
    }
    
    fs.writeFileSync(middlewarePath, securityMiddleware);
    this.modifiedFiles.push('lib/middleware/security.ts');

    console.log('   ✅ Security enhancements added');
  }

  async createProductionEndpoints() {
    console.log('   📊 Creating missing production endpoints...');

    const apiDir = path.join(process.cwd(), 'pages', 'api');
    
    // Create production health endpoint
    const healthEndpoint = `import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@libsql/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const healthChecks = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    service: 'valifi-api',
    version: process.env.npm_package_version || '1.0.0'
  };

  try {
    // Database health check
    if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
      const db = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
      });
      
      await db.execute('SELECT 1');
      healthChecks.database = { status: 'connected', type: 'turso' };
    } else {
      healthChecks.database = { status: 'not_configured' };
    }

    // External API health checks
    healthChecks.external_apis = {
      market_data: process.env.POLYGON_API_KEY ? 'configured' : 'missing',
      payments: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing',
      kyc: process.env.JUMIO_API_TOKEN ? 'configured' : 'missing'
    };

    const allHealthy = healthChecks.database.status === 'connected';
    
    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      status: allHealthy ? 'healthy' : 'degraded',
      ...healthChecks
    });

  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'Service unavailable',
      ...healthChecks
    });
  }
}`;

    fs.writeFileSync(path.join(apiDir, 'health.ts'), healthEndpoint);
    this.modifiedFiles.push('pages/api/health.ts');

    console.log('   ✅ Production endpoints created');
  }

  async generateReport() {
    const report = `
# VALIFI PRODUCTION PREPARATION REPORT
=====================================

Generated: ${new Date().toISOString()}

## Summary
- Files Modified: ${this.modifiedFiles.length}
- Warnings: ${this.warnings.length}
- Errors: ${this.errors.length}

## Modified Files
${this.modifiedFiles.map(file => `- ${file}`).join('\n')}

## Warnings
${this.warnings.map(warning => `⚠️  ${warning}`).join('\n')}

## Errors
${this.errors.map(error => `❌ ${error}`).join('\n')}

## Next Steps for Production Deployment

### 1. CRITICAL - Set Environment Variables
\`\`\`bash
# Copy and fill in real values
cp .env.production.template .env.production

# Required API keys:
POLYGON_API_KEY=your_polygon_key
STRIPE_SECRET_KEY=your_stripe_key
JUMIO_API_TOKEN=your_jumio_key
ALPACA_API_KEY=your_alpaca_key
\`\`\`

### 2. Implement Missing API Endpoints
All API endpoints in services/api.ts need backend implementation:
- /api/transactions/deposit
- /api/transactions/withdraw
- /api/bots/trading/*
- /api/exchange/swap
- /api/kyc/submit

### 3. Database Setup
\`\`\`bash
# Run production migrations
npm run migrate:production
\`\`\`

### 4. Security Audit
\`\`\`bash
npm run security:audit
npm run test:production
\`\`\`

### 5. Deploy to Staging
Test all functionality before production deployment.

## IMPORTANT WARNINGS

🚨 **DO NOT DEPLOY TO PRODUCTION UNTIL:**
1. All API endpoints are implemented with real data
2. Database is properly configured and migrated
3. All environment variables are set with real values
4. Security audit is completed
5. KYC/AML compliance is implemented
6. Payment processing is properly integrated
7. Trading bots use real market data and broker APIs

This system is now ready for development of production features,
but is NOT ready for live deployment with real money.
`;

    fs.writeFileSync('PRODUCTION-PREPARATION-REPORT.md', report);
    console.log('   📋 Production report generated');
  }
}

// Run the production cleaner
new ProductionCleaner().run().catch(console.error);