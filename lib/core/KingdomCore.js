const AIEngine = require('./AIEngine');
const DatabaseKingdom = require('./DatabaseKingdom');

class KingdomCore {
  constructor(config = {}) {
    this.config = config;
    this.aiEngine = new AIEngine();
    this.database = new DatabaseKingdom();
    this.logger = console; // Use console as a basic logger
    this.bots = [];
  }
  getAIEngine() {
    return this.aiEngine;
  }
  getDatabase() {
    return this.database;
  }
  getLogger() {
    return this.logger;
  }
  getConfig() {
    return this.config;
  }
  registerBot(bot) {
    this.bots.push(bot);
    this.logger.info('Bot registered', { bot: bot.constructor.name });
    return true;
  }
  notifyBots(eventName, data = {}) {
    this.bots.forEach((bot) => {
      if (typeof bot.onEvent === 'function') {
        try {
          bot.onEvent(eventName, data);
        } catch (e) {
          this.logger.warn('Bot onEvent error', { bot: bot.constructor.name, error: e.message });
        }
      }
    });
  }
}
module.exports = KingdomCore;