#!/usr/bin/env node

/**
 * VALIFI PRODUCTION CLEANUP SCRIPT
 * =================================
 * 
 * This script removes ALL mock data and prepares the system for production.
 * 
 * CRITICAL: This will modify your codebase. Make sure you have a backup!
 * 
 * Usage: node production-cleanup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 STARTING VALIFI PRODUCTION CLEANUP...\n');

class ProductionCleaner {
  constructor() {
    this.modifiedFiles = [];
    this.errors = [];
    this.warnings = [];
  }

  async run() {
    try {
      console.log('Step 1: Removing mock data from trading bots...');
      await this.cleanTradingBots();
      
      console.log('\nStep 2: Cleaning stocks bot...');
      await this.cleanStocksBot();
      
      console.log('\nStep 3: Updating bot API endpoint...');
      await this.updateBotAPI();
      
      console.log('\nStep 4: Creating production environment template...');
      await this.createProductionEnvTemplate();
      
      console.log('\nStep 5: Creating production checklist...');
      await this.createProductionChecklist();
      
      console.log('\n✅ PRODUCTION CLEANUP COMPLETED!');
      console.log(`Modified ${this.modifiedFiles.length} files`);
      
      if (this.warnings.length > 0) {
        console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
        this.warnings.forEach(warning => console.log(`   ${warning}`));
      }
      
      if (this.errors.length > 0) {
        console.log(`\n❌ ERRORS (${this.errors.length}):`);
        this.errors.forEach(error => console.log(`   ${error}`));
      }
      
    } catch (error) {
      console.error('\n❌ FATAL ERROR:', error.message);
      process.exit(1);
    }
  }

  async cleanTradingBots() {
    const tradingBotPath = path.join(process.cwd(), 'bots', 'trading-bot', 'TradingBot.js');
    
    if (fs.existsSync(tradingBotPath)) {
      let content = fs.readFileSync(tradingBotPath, 'utf8');
      
      // Replace mock price catalog
      content = content.replace(
        /static priceCatalog = \{[^}]*\};/g,
        `// PRODUCTION: Mock price catalog removed
  // TODO: Implement real market data service
  // Use MarketDataService.getPrice(symbol) instead`
      );
      
      // Replace simulation method
      content = content.replace(
        /static _simulatePrice\(symbol\) \{[^}]*\}/g,
        `// PRODUCTION: Price simulation removed
  // TODO: Implement real market data API`
      );
      
      // Replace portfolios and orders
      content = content.replace(
        /static portfolios = \{\};/g,
        '// PRODUCTION: Use database for portfolios'
      );
      
      content = content.replace(
        /static orders = \{\};/g,
        '// PRODUCTION: Use database for orders'
      );
      
      // Add production warning at top
      const productionWarning = `/*
 * PRODUCTION WARNING: This bot has been cleaned of mock data.
 * 
 * REQUIRED INTEGRATIONS:
 * - Real market data API (Polygon.io, Alpha Vantage)
 * - Real trading broker API (Alpaca, Interactive Brokers)
 * - Database integration for user portfolios
 * - Risk management system
 * - Compliance checks
 * 
 * DO NOT USE IN PRODUCTION WITHOUT IMPLEMENTING ABOVE!
 */

`;
      
      content = productionWarning + content;
      
      fs.writeFileSync(tradingBotPath, content);
      this.modifiedFiles.push('bots/trading-bot/TradingBot.js');
      console.log('   ✅ Trading bot cleaned');
    } else {
      this.warnings.push('Trading bot file not found');
    }
  }

  async cleanStocksBot() {
    const stocksBotPath = path.join(process.cwd(), 'bots', 'stocks-bot', 'StocksBot.js');
    
    if (fs.existsSync(stocksBotPath)) {
      let content = fs.readFileSync(stocksBotPath, 'utf8');
      
      // Replace static prices
      content = content.replace(
        /if \(!StocksBot\.prices\) \{[^}]*\}/g,
        `// PRODUCTION: Static prices removed
    // TODO: Implement real stock market data API`
      );
      
      // Replace price randomization
      content = content.replace(
        /_randomizePrices\(\) \{[^}]*\}/g,
        `// PRODUCTION: Price randomization removed
  // TODO: Fetch real prices from market data API`
      );
      
      // Replace local file storage
      content = content.replace(
        /_getData\(\) \{[^}]*\}/g,
        `// PRODUCTION: File storage removed
  // TODO: Use database for portfolio data`
      );
      
      content = content.replace(
        /_saveData\(data\) \{[^}]*\}/g,
        `// PRODUCTION: File storage removed
  // TODO: Save to database instead`
      );
      
      // Add production warning
      const productionWarning = `/*
 * PRODUCTION WARNING: This stocks bot has been cleaned of mock data.
 * 
 * REQUIRED INTEGRATIONS:
 * - Real stock market data API (Polygon.io, Alpha Vantage, IEX)
 * - Database integration for portfolios and orders
 * - Real brokerage API (Alpaca, TD Ameritrade, Interactive Brokers)
 * - Compliance and regulatory requirements
 * - Risk management and position limits
 * 
 * DO NOT USE IN PRODUCTION WITHOUT IMPLEMENTING ABOVE!
 */

`;
      
      content = productionWarning + content;
      
      fs.writeFileSync(stocksBotPath, content);
      this.modifiedFiles.push('bots/stocks-bot/StocksBot.js');
      console.log('   ✅ Stocks bot cleaned');
    } else {
      this.warnings.push('Stocks bot file not found');
    }
  }

  async updateBotAPI() {
    const botAPIPath = path.join(process.cwd(), 'pages', 'api', 'bot.ts');
    
    if (fs.existsSync(botAPIPath)) {
      const productionBotAPI = `/*
 * VALIFI BOT API - PRODUCTION VERSION
 * ==================================
 * 
 * This API has been cleaned of mock data and requires real implementations.
 * All trading functions must integrate with real market data and brokers.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

// Verify JWT token
function verifyToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback');
  } catch (error) {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify authentication for all requests
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, decoded.userId);
    case 'POST':
      return handlePost(req, res, decoded.userId);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(\`Method \${req.method} Not Allowed\`);
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { action } = req.query;

  switch (action) {
    case 'status':
      return res.status(200).json({
        success: true,
        status: 'production',
        version: '1.0.0',
        features: ['trading', 'portfolio', 'compliance'],
        warnings: [
          'Real market data integration required',
          'Broker API integration required',
          'Compliance systems required'
        ]
      });

    case 'suggestions':
      return res.status(200).json({
        success: true,
        suggestions: getProductionSuggestions(),
      });

    default:
      return res.status(200).json({
        success: true,
        message: 'Valifi Bot API - Production Mode',
        notice: 'All trading functions require real broker integration'
      });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { command, data } = req.body;

  if (!command) {
    return res.status(400).json({
      success: false,
      error: 'Command is required',
    });
  }

  try {
    const result = await processProductionCommand(command, data, userId);
    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Bot command error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process command',
    });
  }
}

async function processProductionCommand(command: string, data: any, userId: string) {
  switch (command) {
    case 'trade':
      return processProductionTrade(data, userId);
    case 'view':
      return processProductionView(data, userId);
    case 'message':
      return processProductionMessage(data, userId);
    default:
      throw new Error(\`Command not implemented in production: \${command}\`);
  }
}

async function processProductionTrade(data: any, userId: string) {
  const { type, asset, amount } = data;
  
  // PRODUCTION: This must integrate with real broker APIs
  throw new Error('Trading not implemented - requires real broker API integration');
  
  // TODO: Implement real trading logic:
  // 1. Validate user permissions and KYC status
  // 2. Check account balance and buying power
  // 3. Validate trade parameters
  // 4. Execute trade via broker API (Alpaca, Interactive Brokers)
  // 5. Record transaction in database
  // 6. Update user portfolio
  // 7. Send confirmation
}

async function processProductionView(data: any, userId: string) {
  const { screen } = data;
  
  // PRODUCTION: This must fetch real data from database
  throw new Error('Portfolio view not implemented - requires database integration');
  
  // TODO: Implement real portfolio data:
  // 1. Fetch user portfolio from database
  // 2. Get real-time market prices
  // 3. Calculate current values and P&L
  // 4. Return formatted portfolio data
}

async function processProductionMessage(data: any, userId: string) {
  const { text } = data;
  
  // Basic response - can be enhanced with AI
  let response = "I understand your message. However, trading features require real broker integration.";
  
  if (text.toLowerCase().includes('price')) {
    response = "Price data requires real market data API integration (Polygon.io, Alpha Vantage).";
  } else if (text.toLowerCase().includes('buy') || text.toLowerCase().includes('sell')) {
    response = "Trading requires real broker API integration (Alpaca, Interactive Brokers).";
  } else if (text.toLowerCase().includes('portfolio')) {
    response = "Portfolio data requires database integration and real account balances.";
  }
  
  return {
    type: 'message',
    response,
    timestamp: new Date().toISOString(),
    notice: 'Production mode - real integrations required for full functionality'
  };
}

function getProductionSuggestions() {
  return [
    {
      category: 'Setup Required',
      items: [
        { id: 'setup-broker', text: 'Setup Broker API', icon: '🔧', notice: 'Required for trading' },
        { id: 'setup-data', text: 'Setup Market Data', icon: '📊', notice: 'Required for prices' },
        { id: 'setup-db', text: 'Setup Database', icon: '💾', notice: 'Required for portfolios' },
        { id: 'setup-kyc', text: 'Setup KYC/AML', icon: '🔐', notice: 'Required for compliance' },
      ],
    },
    {
      category: 'Coming Soon',
      items: [
        { id: 'real-trading', text: 'Real Trading', icon: '💼', notice: 'After broker integration' },
        { id: 'live-prices', text: 'Live Prices', icon: '📈', notice: 'After data API setup' },
        { id: 'portfolio-sync', text: 'Portfolio Sync', icon: '🔄', notice: 'After database setup' },
      ],
    },
  ];
}

/*
 * PRODUCTION DEPLOYMENT CHECKLIST:
 * ================================
 * 
 * ❌ Broker API integration (Alpaca, Interactive Brokers)
 * ❌ Market data API (Polygon.io, Alpha Vantage)
 * ❌ Database integration for portfolios
 * ❌ KYC/AML compliance system
 * ❌ Risk management system
 * ❌ Real money handling and security
 * ❌ Regulatory compliance (SEC, FINRA)
 * 
 * DO NOT DEPLOY WITHOUT IMPLEMENTING ALL REQUIREMENTS!
 */
`;

      fs.writeFileSync(botAPIPath, productionBotAPI);
      this.modifiedFiles.push('pages/api/bot.ts');
      console.log('   ✅ Bot API updated for production');
    } else {
      this.warnings.push('Bot API file not found');
    }
  }

  async createProductionEnvTemplate() {
    const envTemplate = `# VALIFI PRODUCTION ENVIRONMENT VARIABLES
# =========================================
# 
# CRITICAL: Fill in ALL values before production deployment!
# DO NOT use placeholder values in production!

# Application Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://valifi.com
NEXT_PUBLIC_API_URL=https://valifi.com/api
PORT=3000

# Database (REQUIRED)
DATABASE_URL=postgresql://username:password@host:5432/valifi_production
TURSO_DATABASE_URL=libsql://your-db-url.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# Security (REQUIRED - Generate strong secrets!)
JWT_SECRET=GENERATE_STRONG_SECRET_HERE_64_CHARS_MIN
JWT_REFRESH_SECRET=GENERATE_STRONG_REFRESH_SECRET_HERE_64_CHARS_MIN
ENCRYPTION_KEY=GENERATE_32_CHAR_ENCRYPTION_KEY_HERE

# Market Data APIs (REQUIRED for trading bots)
POLYGON_API_KEY=your_polygon_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
IEX_CLOUD_API_KEY=your_iex_api_key

# Trading/Broker APIs (REQUIRED for real trading)
ALPACA_API_KEY=your_alpaca_api_key
ALPACA_SECRET_KEY=your_alpaca_secret_key
ALPACA_BASE_URL=https://paper-api.alpaca.markets  # Use https://api.alpaca.markets for live
INTERACTIVE_BROKERS_API_KEY=your_ib_api_key

# Payment Processing (REQUIRED for deposits/withdrawals)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Banking Integration (REQUIRED for bank accounts)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=production  # or sandbox for testing

# KYC/AML Compliance (REQUIRED for regulatory compliance)
JUMIO_API_TOKEN=your_jumio_api_token
JUMIO_API_SECRET=your_jumio_api_secret
JUMIO_WORKFLOW_KEY=your_jumio_workflow_key

# Crypto/Blockchain (OPTIONAL)
BITCOIN_NODE_URL=https://bitcoin-node.valifi.com
ETHEREUM_NODE_URL=https://ethereum-node.valifi.com
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key

# Email/Notifications (REQUIRED)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
FROM_EMAIL=noreply@valifi.com

# Error Monitoring (HIGHLY RECOMMENDED)
SENTRY_DSN=https://your-sentry-dsn@sentry.io
DATADOG_API_KEY=your_datadog_api_key

# AWS/Cloud Services (REQUIRED for production)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=valifi-production-assets

# Security & Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://valifi.com

# Feature Flags
ENABLE_TRADING_BOTS=true
ENABLE_REAL_MONEY=false  # Set to true only when ready!
ENABLE_KYC_VERIFICATION=true
ENABLE_TWO_FACTOR_AUTH=true

# Compliance Settings
MAX_DAILY_TRADING_VOLUME=50000
MAX_POSITION_SIZE=10000
REQUIRE_KYC_FOR_TRADING=true
AML_REPORTING_THRESHOLD=10000

# PRODUCTION DEPLOYMENT CHECKLIST:
# ================================
# □ All API keys obtained and configured
# □ Database created and migrated
# □ SSL certificates configured
# □ Monitoring and logging set up
# □ Security audit completed
# □ Compliance procedures implemented
# □ Real money handling tested
# □ Backup and disaster recovery tested
# □ Legal compliance verified
# □ Insurance and liability coverage obtained

# WARNING: DO NOT DEPLOY WITH PLACEHOLDER VALUES!
# Ensure all API keys and secrets are real production values.
`;

    fs.writeFileSync('.env.production.template', envTemplate);
    this.modifiedFiles.push('.env.production.template');
    console.log('   ✅ Production environment template created');
  }

  async createProductionChecklist() {
    const checklist = `# VALIFI PRODUCTION DEPLOYMENT CHECKLIST
=======================================

Generated: ${new Date().toISOString()}

## 🚨 CRITICAL - DO NOT DEPLOY WITHOUT COMPLETING ALL ITEMS

### ✅ Code Cleanup (COMPLETED)
- [x] Mock data removed from trading bots
- [x] Simulation code removed from stocks bot
- [x] Bot API updated for production
- [x] Production environment template created

### ⚠️ REQUIRED INTEGRATIONS (NOT COMPLETED)

#### 1. Market Data APIs
- [ ] Polygon.io API key obtained and configured
- [ ] Alpha Vantage API key obtained and configured
- [ ] Real-time price feeds implemented
- [ ] Market data caching implemented
- [ ] Rate limiting for API calls implemented

#### 2. Trading/Broker APIs
- [ ] Alpaca API integration implemented
- [ ] Interactive Brokers API integration (if needed)
- [ ] Real trade execution implemented
- [ ] Order management system implemented
- [ ] Trade confirmation and reporting implemented

#### 3. Payment Processing
- [ ] Stripe integration for card payments
- [ ] PayPal integration (if needed)
- [ ] ACH/Bank transfer processing
- [ ] Cryptocurrency payment processing
- [ ] PCI DSS compliance implemented

#### 4. Banking Integration
- [ ] Plaid integration for bank account linking
- [ ] Bank account verification
- [ ] ACH transfer processing
- [ ] Transaction monitoring and reporting

#### 5. Database & Backend
- [ ] Production PostgreSQL database set up
- [ ] Database migrations run
- [ ] Connection pooling configured
- [ ] Automated backups configured
- [ ] Database performance optimized

#### 6. Security & Compliance
- [ ] KYC/AML system implemented (Jumio)
- [ ] Identity verification workflow
- [ ] Suspicious activity monitoring
- [ ] Regulatory reporting system
- [ ] Data encryption at rest and in transit

#### 7. Risk Management
- [ ] Position size limits implemented
- [ ] Daily trading volume limits
- [ ] Stop-loss mechanisms
- [ ] Portfolio concentration limits
- [ ] Risk scoring system

#### 8. Monitoring & Logging
- [ ] Error tracking (Sentry) configured
- [ ] Performance monitoring (DataDog)
- [ ] Application logging implemented
- [ ] Security monitoring set up
- [ ] Uptime monitoring configured

#### 9. Infrastructure
- [ ] Production hosting environment set up
- [ ] SSL certificates configured
- [ ] CDN configured for static assets
- [ ] Load balancing implemented (if needed)
- [ ] Auto-scaling configured

#### 10. Legal & Regulatory
- [ ] Securities regulations compliance (SEC)
- [ ] Money transmission licenses (if required)
- [ ] Terms of service and privacy policy
- [ ] User agreements and disclosures
- [ ] Insurance coverage obtained

### 🧪 TESTING REQUIREMENTS

#### Security Testing
- [ ] Penetration testing completed
- [ ] Vulnerability assessment completed
- [ ] Code security audit completed
- [ ] API security testing completed

#### Functional Testing
- [ ] User registration and KYC flow tested
- [ ] Deposit and withdrawal processes tested
- [ ] Trading bot functionality tested with real APIs
- [ ] Portfolio management tested
- [ ] Payment processing tested

#### Performance Testing
- [ ] Load testing completed
- [ ] Stress testing completed
- [ ] API response time optimization
- [ ] Database performance testing

#### Compliance Testing
- [ ] KYC verification process tested
- [ ] AML monitoring tested
- [ ] Regulatory reporting tested
- [ ] Audit trail verification

### 📊 PRODUCTION METRICS

#### Performance Targets
- [ ] API response time < 200ms
- [ ] Page load time < 2 seconds
- [ ] Database query time < 50ms
- [ ] 99.9% uptime target

#### Security Targets
- [ ] Zero critical vulnerabilities
- [ ] All transactions encrypted
- [ ] Real-time fraud detection
- [ ] Complete audit logging

### 🚀 DEPLOYMENT STEPS

1. **Pre-Deployment**
   - [ ] All checklist items completed
   - [ ] Code review completed
   - [ ] Security audit passed
   - [ ] Staging environment testing passed

2. **Deployment**
   - [ ] Database migrations run
   - [ ] Environment variables configured
   - [ ] SSL certificates installed
   - [ ] Monitoring systems activated

3. **Post-Deployment**
   - [ ] Health checks passing
   - [ ] All integrations working
   - [ ] Monitoring alerts configured
   - [ ] Backup systems verified

### 📞 EMERGENCY CONTACTS

- **Technical Issues**: [Your DevOps Team]
- **Security Issues**: [Your Security Team]
- **Legal/Compliance**: [Your Legal Team]
- **Financial Issues**: [Your Finance Team]

### 📋 SIGN-OFF REQUIRED

Before production deployment, the following roles must sign off:

- [ ] **Technical Lead**: All technical requirements met
- [ ] **Security Officer**: Security audit passed
- [ ] **Compliance Officer**: Regulatory requirements met
- [ ] **Legal Counsel**: Legal compliance verified
- [ ] **Product Manager**: Business requirements met
- [ ] **CEO/CTO**: Final authorization for production deployment

---

## 🚨 FINAL WARNING

**This system is NOT ready for production deployment until ALL items above are completed.**

**Deploying with real money before completing these requirements could result in:**
- Financial losses
- Regulatory violations
- Legal liability
- Security breaches
- Loss of customer trust

**Only deploy to production when you can check ALL boxes above!**

---

Report generated by Valifi Production Cleanup Script
Files modified: ${this.modifiedFiles.length}
Warnings: ${this.warnings.length}
Errors: ${this.errors.length}
`;

    fs.writeFileSync('PRODUCTION-DEPLOYMENT-CHECKLIST.md', checklist);
    this.modifiedFiles.push('PRODUCTION-DEPLOYMENT-CHECKLIST.md');
    console.log('   ✅ Production deployment checklist created');
  }
}

// Run the production cleaner
const cleaner = new ProductionCleaner();
cleaner.run().catch(console.error);