/**
 * KINGDOM STANDARD ORCHESTRATOR
 * ==============================
 * Unified bot management and coordination system
 * Integrates: Armor Wallets, PHP Exchange, Coin Mixing, All Trading Bots
 */

const ArmorWalletClient = require('../integrations/armor-wallet-client');
const { EventEmitter } = require('events');

class KingdomStandardOrchestrator extends EventEmitter {
  constructor() {
    super();
    
    this.state = {
      initialized: false,
      bots: new Map(),
      activeSessions: new Map(),
      metrics: {
        totalOperations: 0,
        successRate: 0,
        activeUsers: new Set()
      }
    };

    // Core integrations
    this.armorWallet = new ArmorWalletClient();
    this.phpExchangeURL = 'http://localhost:8080'; // PHP server
    
    // Bot categories
    this.botCategories = {
      trading: ['trading-bot', 'advanced-trading-bot', 'forex-bot', 'stocks-bot', 'options-bot'],
      crypto: ['armor-crypto-bot', 'defi-bot', 'nft-bot', 'bridge-bot', 'coin-mixer-bot'],
      banking: ['banking-bot', 'lending-bot', 'payment-bot'],
      assets: ['metals-bot', 'commodities-bot', 'bonds-bot', 'collectibles-bot'],
      security: ['compliance-bot', 'multisig-bot', 'hardware-wallet-bot', 'gas-optimizer-bot'],
      advanced: ['portfolio-bot', 'retirement-bot', 'ira-bot', 'mutualfunds-bot'],
      divine: ['jesus-cartel-bot', 'word-bot', 'admin-dashboard-bot'],
      intelligence: ['contact-manager-bot']
    };

    console.log('👑 Kingdom Standard Orchestrator initialized');
  }

  /**
   * INITIALIZATION - Load and register all bots
   */
  async initialize() {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     KINGDOM STANDARD ORCHESTRATOR                        ║
║     Unified Bot Management System                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);

    try {
      // Load all bot modules dynamically
      await this.loadBots();
      
      // Initialize integrations
      await this.initializeIntegrations();
      
      // Setup inter-bot communication
      this.setupCommunication();
      
      this.state.initialized = true;
      console.log(`✅ Orchestrator initialized with ${this.state.bots.size} bots`);
      
      return {
        success: true,
        botsLoaded: this.state.bots.size,
        categories: Object.keys(this.botCategories)
      };
    } catch (error) {
      console.error('❌ Orchestrator initialization failed:', error);
      throw error;
    }
  }

  async loadBots() {
    const fs = require('fs');
    const path = require('path');
    const botsDir = path.join(__dirname, '../../bots');
    
    const botDirs = fs.readdirSync(botsDir)
      .filter(dir => fs.statSync(path.join(botsDir, dir)).isDirectory());

    for (const botDir of botDirs) {
      try {
        const botFiles = fs.readdirSync(path.join(botsDir, botDir))
          .filter(file => file.endsWith('.js'));
        
        if (botFiles.length > 0) {
          const botFile = botFiles[0];
          const BotClass = require(path.join(botsDir, botDir, botFile));
          
          const botInstance = {
            name: botDir,
            class: BotClass,
            category: this.getBotCategory(botDir),
            status: 'loaded'
          };
          
          this.state.bots.set(botDir, botInstance);
          console.log(`📦 Loaded: ${botDir}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to load ${botDir}:`, error.message);
      }
    }
    
    console.log(`\n🎯 Kingdom Standard Status:`);
    console.log(`   📊 Total Bots: ${this.state.bots.size}`);
    console.log(`   ✝️ Divine Components: Jesus Cartel, Word Bot, Contact Manager`);
    console.log(`   🤖 AI Systems: Chat Automation, Decision Making`);
    console.log(`   📈 Trading: Enhanced strategies with real indicators`);
    console.log(`   🛡️ Security: Armor Wallet, Coin Mixing`);
    console.log(`   📰 Intelligence: News aggregation, Market analysis`);
  }

  getBotCategory(botName) {
    for (const [category, bots] of Object.entries(this.botCategories)) {
      if (bots.includes(botName)) {
        return category;
      }
    }
    return 'general';
  }

  async initializeIntegrations() {
    console.log('🔗 Initializing integrations...');
    
    // Test Armor Wallet connection
    if (process.env.ARMOR_WALLET_API_KEY) {
      console.log('✅ Armor Wallet API configured');
    }
    
    // PHP Exchange check
    try {
      const axios = require('axios');
      await axios.get(`${this.phpExchangeURL}/api/health`, { timeout: 2000 });
      console.log('✅ PHP Exchange connected');
    } catch (error) {
      console.log('⚠️ PHP Exchange not available (optional)');
    }
  }

  setupCommunication() {
    // Inter-bot event bus
    this.on('bot:request', async (data) => {
      await this.routeBotRequest(data);
    });
    
    this.on('bot:complete', (data) => {
      this.state.metrics.totalOperations++;
    });
  }

  /**
   * UNIFIED BOT EXECUTION
   */
  async executeBot(botName, action, params = {}) {
    try {
      const bot = this.state.bots.get(botName);
      
      if (!bot) {
        return {
          success: false,
          error: `Bot '${botName}' not found`,
          availableBots: Array.from(this.state.bots.keys())
        };
      }

      // Create bot instance if needed
      if (!bot.instance) {
        bot.instance = new bot.class();
        if (typeof bot.instance.initialize === 'function') {
          await bot.instance.initialize();
        }
      }

      // Execute bot action
      const result = await this.executeBotAction(bot.instance, action, params);
      
      this.emit('bot:complete', { botName, action, success: result.success });
      
      return result;
    } catch (error) {
      console.error(`❌ Bot execution error (${botName}):`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async executeBotAction(botInstance, action, params) {
    // Try execute method first (KingdomBot pattern)
    if (typeof botInstance.execute === 'function') {
      return await botInstance.execute({ action, ...params });
    }
    
    // Try direct action method
    if (typeof botInstance[action] === 'function') {
      return await botInstance[action](params);
    }
    
    return {
      success: false,
      error: `Action '${action}' not supported by this bot`
    };
  }

  /**
   * ARMOR WALLET OPERATIONS
   */
  async createArmorWallet(userId, currency = 'BTC') {
    return await this.armorWallet.createWallet(userId, currency);
  }

  async getArmorBalance(walletId) {
    return await this.armorWallet.getBalance(walletId);
  }

  async sendFromArmorWallet(walletId, toAddress, amount, currency) {
    return await this.armorWallet.sendTransaction(walletId, toAddress, amount, currency);
  }

  /**
   * COIN MIXING OPERATIONS
   */
  async initiateCoinMix(params) {
    return await this.executeBot('coin-mixer-bot', 'start_mix', params);
  }

  async getCoinMixStatus(sessionId) {
    return await this.executeBot('coin-mixer-bot', 'get_status', { session_id: sessionId });
  }

  /**
   * TRADING OPERATIONS
   */
  async executeTrade(params) {
    const { bot = 'trading-bot', action, ...tradeParams } = params;
    return await this.executeBot(bot, action, tradeParams);
  }

  async getMarketData(symbol, bot = 'trading-bot') {
    return await this.executeBot(bot, 'get_price', { symbol });
  }

  async getPortfolio(userId, bot = 'portfolio-bot') {
    return await this.executeBot(bot, 'get_portfolio', { userId });
  }

  /**
   * PHP EXCHANGE BRIDGE
   */
  async callPhpExchange(endpoint, method = 'GET', data = null) {
    const axios = require('axios');
    
    try {
      const config = {
        method,
        url: `${this.phpExchangeURL}${endpoint}`,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (data) config.data = data;
      
      const response = await axios(config);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getMetalsExchangeData() {
    return await this.callPhpExchange('/metals-exchange.php');
  }

  async getStakingInfo() {
    return await this.callPhpExchange('/stake.php');
  }

  /**
   * BOT DISCOVERY & ROUTING
   */
  async routeBotRequest(request) {
    const { intent, params } = request;
    
    // Intelligent routing based on intent
    const routes = {
      'trade': 'trading-bot',
      'mix_coins': 'coin-mixer-bot',
      'wallet': 'armor-crypto-bot',
      'bank': 'banking-bot',
      'defi': 'defi-bot',
      'portfolio': 'portfolio-bot'
    };

    const botName = routes[intent];
    if (botName) {
      return await this.executeBot(botName, params.action, params);
    }

    return { success: false, error: 'Unknown intent' };
  }

  /**
   * SYSTEM METRICS
   */
  getMetrics() {
    return {
      ...this.state.metrics,
      activeUsers: this.state.metrics.activeUsers.size,
      botsLoaded: this.state.bots.size,
      activeSessions: this.state.activeSessions.size,
      uptime: process.uptime()
    };
  }

  /**
   * BOT LISTING
   */
  listBots(category = null) {
    if (category) {
      return Array.from(this.state.bots.values())
        .filter(bot => bot.category === category)
        .map(bot => ({
          name: bot.name,
          category: bot.category,
          status: bot.status
        }));
    }

    const botsByCategory = {};
    for (const [name, bot] of this.state.bots) {
      if (!botsByCategory[bot.category]) {
        botsByCategory[bot.category] = [];
      }
      botsByCategory[bot.category].push({
        name: bot.name,
        status: bot.status
      });
    }
    
    return botsByCategory;
  }

  /**
   * SHUTDOWN
   */
  async shutdown() {
    console.log('🛑 Shutting down Kingdom Standard Orchestrator...');
    
    for (const [name, bot] of this.state.bots) {
      if (bot.instance && typeof bot.instance.shutdown === 'function') {
        await bot.instance.shutdown();
      }
    }
    
    this.state.bots.clear();
    this.removeAllListeners();
    
    console.log('✅ Orchestrator shutdown complete');
  }
}

module.exports = KingdomStandardOrchestrator;
