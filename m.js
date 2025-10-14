#!/usr/bin/env node
/**
 * Environment Variable and Credentials Extraction Tool
 * SECURITY WARNING: This script extracts ALL sensitive data
 * DO NOT commit the output file to git!
 * For backup and migration purposes only.
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

console.log('🔐 Starting Environment Extraction...\n');

// Extract all environment variables
const envVars = process.env;

// Organize by category
const categorizedEnv = {
  timestamp: new Date().toISOString(),
  system: 'Valifi Kingdom Fintech Platform',

  // Database
  database: {
    DATABASE_URL: envVars.DATABASE_URL || 'NOT_SET',
    DB_HOST: envVars.DB_HOST || 'NOT_SET',
    DB_PORT: envVars.DB_PORT || 'NOT_SET',
    DB_NAME: envVars.DB_NAME || 'NOT_SET',
    DB_USER: envVars.DB_USER || 'NOT_SET',
    DB_PASSWORD: envVars.DB_PASSWORD || 'NOT_SET',
  },

  // AI/ML Services
  ai_ml: {
    ANTHROPIC_API_KEY: envVars.ANTHROPIC_API_KEY || 'NOT_SET',
    OPENAI_API_KEY: envVars.OPENAI_API_KEY || 'NOT_SET',
    GOOGLE_GEMINI_API_KEY: envVars.GOOGLE_GEMINI_API_KEY || 'NOT_SET',
    GOOGLE_AI_API_KEY: envVars.GOOGLE_AI_API_KEY || 'NOT_SET',
    LANGCHAIN_API_KEY: envVars.LANGCHAIN_API_KEY || 'NOT_SET',
    LANGCHAIN_PROJECT: envVars.LANGCHAIN_PROJECT || 'NOT_SET',
    LANGSMITH_API_KEY: envVars.LANGSMITH_API_KEY || 'NOT_SET',
  },

  // Payment Processors
  payments: {
    // Stripe
    STRIPE_SECRET_KEY: envVars.STRIPE_SECRET_KEY || 'NOT_SET',
    STRIPE_PUBLISHABLE_KEY: envVars.STRIPE_PUBLISHABLE_KEY || 'NOT_SET',
    STRIPE_WEBHOOK_SECRET: envVars.STRIPE_WEBHOOK_SECRET || 'NOT_SET',

    // PayPal
    PAYPAL_CLIENT_ID: envVars.PAYPAL_CLIENT_ID || 'NOT_SET',
    PAYPAL_CLIENT_SECRET: envVars.PAYPAL_CLIENT_SECRET || 'NOT_SET',
    PAYPAL_ENVIRONMENT: envVars.PAYPAL_ENVIRONMENT || 'sandbox',

    // Plaid
    PLAID_CLIENT_ID: envVars.PLAID_CLIENT_ID || 'NOT_SET',
    PLAID_SECRET: envVars.PLAID_SECRET || 'NOT_SET',
    PLAID_ENVIRONMENT: envVars.PLAID_ENVIRONMENT || 'sandbox',
  },

  // Crypto Payment Processors
  crypto_payments: {
    BITPAY_API_KEY: envVars.BITPAY_API_KEY || 'NOT_SET',
    BITPAY_ENVIRONMENT: envVars.BITPAY_ENVIRONMENT || 'test',

    BINANCE_PAY_API_KEY: envVars.BINANCE_PAY_API_KEY || 'NOT_SET',
    BINANCE_PAY_SECRET: envVars.BINANCE_PAY_SECRET || 'NOT_SET',

    BYBIT_API_KEY: envVars.BYBIT_API_KEY || 'NOT_SET',
    BYBIT_API_SECRET: envVars.BYBIT_API_SECRET || 'NOT_SET',

    KUCOIN_API_KEY: envVars.KUCOIN_API_KEY || 'NOT_SET',
    KUCOIN_API_SECRET: envVars.KUCOIN_API_SECRET || 'NOT_SET',
    KUCOIN_PASSPHRASE: envVars.KUCOIN_PASSPHRASE || 'NOT_SET',

    LUNO_API_KEY: envVars.LUNO_API_KEY || 'NOT_SET',
    LUNO_API_SECRET: envVars.LUNO_API_SECRET || 'NOT_SET',
  },

  // Blockchain/Web3
  blockchain: {
    // RPC Endpoints
    ETHEREUM_RPC_URL: envVars.ETHEREUM_RPC_URL || envVars.ETH_RPC_URL || 'NOT_SET',
    POLYGON_RPC_URL: envVars.POLYGON_RPC_URL || 'NOT_SET',
    BSC_RPC_URL: envVars.BSC_RPC_URL || 'NOT_SET',
    ARBITRUM_RPC_URL: envVars.ARBITRUM_RPC_URL || 'NOT_SET',
    OPTIMISM_RPC_URL: envVars.OPTIMISM_RPC_URL || 'NOT_SET',

    // Alchemy/Infura
    ALCHEMY_API_KEY: envVars.ALCHEMY_API_KEY || 'NOT_SET',
    INFURA_API_KEY: envVars.INFURA_API_KEY || 'NOT_SET',
    INFURA_PROJECT_ID: envVars.INFURA_PROJECT_ID || 'NOT_SET',

    // WalletConnect
    WALLETCONNECT_PROJECT_ID: envVars.WALLETCONNECT_PROJECT_ID || 'NOT_SET',

    // Contract Addresses
    CONTRACT_ADDRESS: envVars.CONTRACT_ADDRESS || 'NOT_SET',
  },

  // Market Data APIs
  market_data: {
    ALPHA_VANTAGE_API_KEY: envVars.ALPHA_VANTAGE_API_KEY || 'NOT_SET',
    TWELVE_DATA_API_KEY: envVars.TWELVE_DATA_API_KEY || 'NOT_SET',
    METALS_API_KEY: envVars.METALS_API_KEY || 'NOT_SET',
    FINNHUB_API_KEY: envVars.FINNHUB_API_KEY || 'NOT_SET',
    POLYGON_IO_API_KEY: envVars.POLYGON_IO_API_KEY || 'NOT_SET',
  },

  // Trading/Broker APIs
  trading: {
    ALPACA_API_KEY: envVars.ALPACA_API_KEY || 'NOT_SET',
    ALPACA_SECRET_KEY: envVars.ALPACA_SECRET_KEY || 'NOT_SET',
    ALPACA_BASE_URL: envVars.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets',

    INTERACTIVE_BROKERS_API_KEY: envVars.INTERACTIVE_BROKERS_API_KEY || 'NOT_SET',
    INTERACTIVE_BROKERS_SECRET: envVars.INTERACTIVE_BROKERS_SECRET || 'NOT_SET',
  },

  // KYC/Compliance
  kyc: {
    SUMSUB_APP_TOKEN: envVars.SUMSUB_APP_TOKEN || 'NOT_SET',
    SUMSUB_SECRET_KEY: envVars.SUMSUB_SECRET_KEY || 'NOT_SET',
    SUMSUB_WEBHOOK_SECRET: envVars.SUMSUB_WEBHOOK_SECRET || 'NOT_SET',
  },

  // Storage/IPFS
  storage: {
    IPFS_HOST: envVars.IPFS_HOST || 'ipfs.infura.io',
    IPFS_PORT: envVars.IPFS_PORT || '5001',
    IPFS_PROTOCOL: envVars.IPFS_PROTOCOL || 'https',
    IPFS_PROJECT_ID: envVars.IPFS_PROJECT_ID || 'NOT_SET',
    IPFS_PROJECT_SECRET: envVars.IPFS_PROJECT_SECRET || 'NOT_SET',

    AWS_ACCESS_KEY_ID: envVars.AWS_ACCESS_KEY_ID || 'NOT_SET',
    AWS_SECRET_ACCESS_KEY: envVars.AWS_SECRET_ACCESS_KEY || 'NOT_SET',
    AWS_REGION: envVars.AWS_REGION || 'NOT_SET',
    AWS_S3_BUCKET: envVars.AWS_S3_BUCKET || 'NOT_SET',
  },

  // Email/Communication
  communication: {
    SENDGRID_API_KEY: envVars.SENDGRID_API_KEY || 'NOT_SET',
    TWILIO_ACCOUNT_SID: envVars.TWILIO_ACCOUNT_SID || 'NOT_SET',
    TWILIO_AUTH_TOKEN: envVars.TWILIO_AUTH_TOKEN || 'NOT_SET',
    TWILIO_PHONE_NUMBER: envVars.TWILIO_PHONE_NUMBER || 'NOT_SET',
  },

  // Application Config
  application: {
    NODE_ENV: envVars.NODE_ENV || 'development',
    PORT: envVars.PORT || '5000',
    SESSION_SECRET: envVars.SESSION_SECRET || 'NOT_SET',
    JWT_SECRET: envVars.JWT_SECRET || 'NOT_SET',
    ENCRYPTION_KEY: envVars.ENCRYPTION_KEY || 'NOT_SET',
    API_BASE_URL: envVars.API_BASE_URL || 'NOT_SET',
    FRONTEND_URL: envVars.FRONTEND_URL || 'NOT_SET',
  },

  // Replit Specific
  replit: {
    REPL_ID: envVars.REPL_ID || 'NOT_SET',
    REPL_SLUG: envVars.REPL_SLUG || 'NOT_SET',
    REPL_OWNER: envVars.REPL_OWNER || 'NOT_SET',
    REPLIT_DB_URL: envVars.REPLIT_DB_URL || 'NOT_SET',
  },

  // All Other Environment Variables
  other: {}
};

// Capture any env vars not explicitly categorized
Object.keys(envVars).forEach(key => {
  const alreadyCategorized = Object.values(categorizedEnv).some(category => {
    if (typeof category === 'object' && category !== null) {
      return key in category;
    }
    return false;
  });

  if (!alreadyCategorized && !['timestamp', 'system'].includes(key)) {
    categorizedEnv.other[key] = envVars[key];
  }
});

// Create .env format
let envFileContent = `# Valifi Kingdom Platform - Environment Variables
# Generated: ${new Date().toISOString()}
# SECURITY WARNING: DO NOT COMMIT THIS FILE TO GIT!

# ============================================
# DATABASE
# ============================================
DATABASE_URL="${categorizedEnv.database.DATABASE_URL}"

# ============================================
# AI/ML SERVICES
# ============================================
ANTHROPIC_API_KEY="${categorizedEnv.ai_ml.ANTHROPIC_API_KEY}"
OPENAI_API_KEY="${categorizedEnv.ai_ml.OPENAI_API_KEY}"
GOOGLE_GEMINI_API_KEY="${categorizedEnv.ai_ml.GOOGLE_GEMINI_API_KEY}"
LANGCHAIN_API_KEY="${categorizedEnv.ai_ml.LANGCHAIN_API_KEY}"
LANGSMITH_API_KEY="${categorizedEnv.ai_ml.LANGSMITH_API_KEY}"

# ============================================
# PAYMENT PROCESSORS
# ============================================
# Stripe
STRIPE_SECRET_KEY="${categorizedEnv.payments.STRIPE_SECRET_KEY}"
STRIPE_PUBLISHABLE_KEY="${categorizedEnv.payments.STRIPE_PUBLISHABLE_KEY}"
STRIPE_WEBHOOK_SECRET="${categorizedEnv.payments.STRIPE_WEBHOOK_SECRET}"

# PayPal
PAYPAL_CLIENT_ID="${categorizedEnv.payments.PAYPAL_CLIENT_ID}"
PAYPAL_CLIENT_SECRET="${categorizedEnv.payments.PAYPAL_CLIENT_SECRET}"
PAYPAL_ENVIRONMENT="${categorizedEnv.payments.PAYPAL_ENVIRONMENT}"

# Plaid
PLAID_CLIENT_ID="${categorizedEnv.payments.PLAID_CLIENT_ID}"
PLAID_SECRET="${categorizedEnv.payments.PLAID_SECRET}"
PLAID_ENVIRONMENT="${categorizedEnv.payments.PLAID_ENVIRONMENT}"

# ============================================
# CRYPTO PAYMENT PROCESSORS
# ============================================
# BitPay
BITPAY_API_KEY="${categorizedEnv.crypto_payments.BITPAY_API_KEY}"

# Binance Pay
BINANCE_PAY_API_KEY="${categorizedEnv.crypto_payments.BINANCE_PAY_API_KEY}"
BINANCE_PAY_SECRET="${categorizedEnv.crypto_payments.BINANCE_PAY_SECRET}"

# Bybit
BYBIT_API_KEY="${categorizedEnv.crypto_payments.BYBIT_API_KEY}"
BYBIT_API_SECRET="${categorizedEnv.crypto_payments.BYBIT_API_SECRET}"

# KuCoin
KUCOIN_API_KEY="${categorizedEnv.crypto_payments.KUCOIN_API_KEY}"
KUCOIN_API_SECRET="${categorizedEnv.crypto_payments.KUCOIN_API_SECRET}"
KUCOIN_PASSPHRASE="${categorizedEnv.crypto_payments.KUCOIN_PASSPHRASE}"

# Luno
LUNO_API_KEY="${categorizedEnv.crypto_payments.LUNO_API_KEY}"
LUNO_API_SECRET="${categorizedEnv.crypto_payments.LUNO_API_SECRET}"

# ============================================
# BLOCKCHAIN / WEB3
# ============================================
ETHEREUM_RPC_URL="${categorizedEnv.blockchain.ETHEREUM_RPC_URL}"
POLYGON_RPC_URL="${categorizedEnv.blockchain.POLYGON_RPC_URL}"
BSC_RPC_URL="${categorizedEnv.blockchain.BSC_RPC_URL}"
ARBITRUM_RPC_URL="${categorizedEnv.blockchain.ARBITRUM_RPC_URL}"
OPTIMISM_RPC_URL="${categorizedEnv.blockchain.OPTIMISM_RPC_URL}"

ALCHEMY_API_KEY="${categorizedEnv.blockchain.ALCHEMY_API_KEY}"
INFURA_API_KEY="${categorizedEnv.blockchain.INFURA_API_KEY}"
WALLETCONNECT_PROJECT_ID="${categorizedEnv.blockchain.WALLETCONNECT_PROJECT_ID}"

# ============================================
# MARKET DATA APIS
# ============================================
ALPHA_VANTAGE_API_KEY="${categorizedEnv.market_data.ALPHA_VANTAGE_API_KEY}"
TWELVE_DATA_API_KEY="${categorizedEnv.market_data.TWELVE_DATA_API_KEY}"
METALS_API_KEY="${categorizedEnv.market_data.METALS_API_KEY}"

# ============================================
# TRADING / BROKER APIS
# ============================================
ALPACA_API_KEY="${categorizedEnv.trading.ALPACA_API_KEY}"
ALPACA_SECRET_KEY="${categorizedEnv.trading.ALPACA_SECRET_KEY}"
ALPACA_BASE_URL="${categorizedEnv.trading.ALPACA_BASE_URL}"

# ============================================
# KYC / COMPLIANCE
# ============================================
SUMSUB_APP_TOKEN="${categorizedEnv.kyc.SUMSUB_APP_TOKEN}"
SUMSUB_SECRET_KEY="${categorizedEnv.kyc.SUMSUB_SECRET_KEY}"

# ============================================
# STORAGE / IPFS
# ============================================
IPFS_PROJECT_ID="${categorizedEnv.storage.IPFS_PROJECT_ID}"
IPFS_PROJECT_SECRET="${categorizedEnv.storage.IPFS_PROJECT_SECRET}"

# ============================================
# APPLICATION CONFIG
# ============================================
NODE_ENV="${categorizedEnv.application.NODE_ENV}"
PORT="${categorizedEnv.application.PORT}"
SESSION_SECRET="${categorizedEnv.application.SESSION_SECRET}"
JWT_SECRET="${categorizedEnv.application.JWT_SECRET}"
ENCRYPTION_KEY="${categorizedEnv.application.ENCRYPTION_KEY}"
`;

// Save files
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const exportDir = './exports';
const jsonPath = join(exportDir, `env-backup-${timestamp}.json`);
const envPath = join(exportDir, `env-backup-${timestamp}.env`);
const readmePath = join(exportDir, `ENV-README-${timestamp}.md`);

try {
  // Save JSON format (detailed)
  writeFileSync(jsonPath, JSON.stringify(categorizedEnv, null, 2));
  console.log(`✅ JSON backup saved: ${jsonPath}`);

  // Save .env format (ready to use)
  writeFileSync(envPath, envFileContent);
  console.log(`✅ .env backup saved: ${envPath}`);

  // Save README with instructions
  const readme = `# Environment Variables Backup
Generated: ${new Date().toISOString()}

## ⚠️ SECURITY WARNING
This file contains HIGHLY SENSITIVE credentials and API keys.
- **DO NOT** commit to git
- **DO NOT** share publicly
- Store in secure location only
- Rotate keys if exposed

## Files Generated
1. **${jsonPath}** - Detailed JSON format with categorization
2. **${envPath}** - Ready-to-use .env format

## Usage
To restore environment variables:
\`\`\`bash
cp ${envPath} .env
\`\`\`

## Missing Keys
Keys marked as "NOT_SET" need to be configured:
${JSON.stringify(categorizedEnv, null, 2)
  .split('\n')
  .filter(line => line.includes('NOT_SET'))
  .join('\n')}

## Categories Extracted
- Database credentials
- AI/ML API keys (Anthropic, OpenAI, Google Gemini)
- Payment processors (Stripe, PayPal, Plaid)
- Crypto payments (BitPay, Binance, Bybit, KuCoin, Luno)
- Blockchain RPC endpoints (5 networks)
- Market data APIs (Alpha Vantage, Twelve Data, Metals API)
- Trading APIs (Alpaca)
- KYC/Compliance (Sumsub)
- Storage/IPFS credentials
- Application secrets

## Next Steps
1. Review all extracted values
2. Update any "NOT_SET" values with real credentials
3. Test in new environment
4. Secure this backup file
5. Update .gitignore to exclude these files
`;

  writeFileSync(readmePath, readme);
  console.log(`✅ README saved: ${readmePath}`);

  console.log('\n📊 Extraction Summary:');
  console.log(`   - Database vars: ${Object.keys(categorizedEnv.database).length}`);
  console.log(`   - AI/ML vars: ${Object.keys(categorizedEnv.ai_ml).length}`);
  console.log(`   - Payment vars: ${Object.keys(categorizedEnv.payments).length}`);
  console.log(`   - Crypto payment vars: ${Object.keys(categorizedEnv.crypto_payments).length}`);
  console.log(`   - Blockchain vars: ${Object.keys(categorizedEnv.blockchain).length}`);
  console.log(`   - Market data vars: ${Object.keys(categorizedEnv.market_data).length}`);
  console.log(`   - Trading vars: ${Object.keys(categorizedEnv.trading).length}`);
  console.log(`   - Other vars: ${Object.keys(categorizedEnv.other).length}`);

  console.log('\n⚠️  IMPORTANT SECURITY REMINDERS:');
  console.log('   1. DO NOT commit these files to git!');
  console.log('   2. Add to .gitignore: exports/env-backup-*');
  console.log('   3. Store in secure location only');
  console.log('   4. Rotate keys if accidentally exposed');

} catch (error)
  console.error('❌ Error saving files:', error);
  process.exit(1);
}

console.log('\n✅ Environment extraction complete!\n');
