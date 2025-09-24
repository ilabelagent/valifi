/**
 * VALIFI BOT SYSTEM - PRODUCTION INDEX
 * ====================================
 *
 * Central registry for all financial bots
 * No mock/demo/simulation code - production only
 */

// Import all bot modules
import { StocksBot } from './stocks-bot/StocksBot.js';
import { TradingBot } from './trading-bot/TradingBot.js';
import { WalletBot } from './wallet-bot/WalletBot.js';
import { BankingBot } from './banking-bot/BankingBot.js';
import { ForexBot } from './forex-bot/ForexBot.js';
import { CommoditiesBot } from './commodities-bot/CommoditiesBot.js';
import { OptionsBot } from './options-bot/OptionsBot.js';
import { BondsBot } from './bonds-bot/BondsBot.js';
import { MetalsBot } from './metals-bot/MetalsBot.js';
import { DeFiBot } from './defi-bot/DeFiBot.js';
import { NFTBot } from './nft-bot/NFTBot.js';
import { LendingBot } from './lending-bot/LendingBot.js';
import { ComplianceBot } from './compliance-bot/ComplianceBot.js';
import { PaymentBot } from './payment-bot/PaymentBot.js';
import { PortfolioBot } from './portfolio-bot/PortfolioBot.js';
import { ArmorCryptoBot } from './armor-crypto-bot/ArmorCryptoBot.js';

// Bot registry
const botRegistry = new Map();

// Production configuration
const config = {
  apiKeys: {
    polygon: process.env.POLYGON_API_KEY,
    alpaca: process.env.ALPACA_API_KEY,
    coinbase: process.env.COINBASE_API_KEY,
    stripe: process.env.STRIPE_API_KEY
  },
  database: {
    url: process.env.DATABASE_URL
  },
  websocket: {
    url: process.env.WS_URL || 'ws://localhost:3001'
  }
};

// Initialize all bots
export async function initializeBots() {
  console.log('🤖 Initializing bot system...');

  const bots = [
    { name: 'stocks', Bot: StocksBot },
    { name: 'trading', Bot: TradingBot },
    { name: 'wallet', Bot: WalletBot },
    { name: 'banking', Bot: BankingBot },
    { name: 'forex', Bot: ForexBot },
    { name: 'commodities', Bot: CommoditiesBot },
    { name: 'options', Bot: OptionsBot },
    { name: 'bonds', Bot: BondsBot },
    { name: 'metals', Bot: MetalsBot },
    { name: 'defi', Bot: DeFiBot },
    { name: 'nft', Bot: NFTBot },
    { name: 'lending', Bot: LendingBot },
    { name: 'compliance', Bot: ComplianceBot },
    { name: 'payment', Bot: PaymentBot },
    { name: 'portfolio', Bot: PortfolioBot },
    { name: 'armor-crypto', Bot: ArmorCryptoBot }
  ];

  for (const { name, Bot } of bots) {
    try {
      const instance = new Bot(config);
      await instance.initialize();
      botRegistry.set(name, instance);
      console.log(`✅ ${name} bot initialized`);
    } catch (error) {
      console.error(`❌ Failed to initialize ${name} bot:`, error.message);
    }
  }

  console.log(`🎯 ${botRegistry.size} bots initialized successfully`);
  return botRegistry;
}

// Get bot instance
export function getBot(name) {
  return botRegistry.get(name);
}

// Execute bot command
export async function executeBotCommand(botName, command, params) {
  const bot = botRegistry.get(botName);

  if (!bot) {
    throw new Error(`Bot ${botName} not found`);
  }

  if (typeof bot[command] !== 'function') {
    throw new Error(`Command ${command} not found in ${botName} bot`);
  }

  return await bot[command](params);
}

// Shutdown all bots
export async function shutdownBots() {
  console.log('🛑 Shutting down bot system...');

  for (const [name, bot] of botRegistry) {
    try {
      if (typeof bot.shutdown === 'function') {
        await bot.shutdown();
      }
      console.log(`✅ ${name} bot shutdown`);
    } catch (error) {
      console.error(`❌ Error shutting down ${name} bot:`, error.message);
    }
  }

  botRegistry.clear();
  console.log('👋 Bot system shutdown complete');
}

// Export registry for direct access
export { botRegistry };