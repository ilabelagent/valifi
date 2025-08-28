const DivineBot = require('./DivineBot');

/**
 * Base class for all bots in the Kingdom.  Provides access to the
 * AI engine, database, logger and configuration.  Also generates a
 * unique bot ID and logs actions using the core logger.
 */
class KingdomBot extends DivineBot {
  constructor(core) {
    super();
    this.core = core;
    this.aiEngine = core.getAIEngine();
    this.database = core.getDatabase();
    this.logger = core.getLogger();
    this.config = core.getConfig();
    this.botId = this.generateDivineBotId();
  }
  generateDivineBotId() {
    return `KINGDOM_${this.constructor.name.toUpperCase()}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2)}`;
  }
  logDivineAction(action, data = {}) {
    this.logger.info(`Divine Bot Action: ${action}`, {
      bot_id: this.botId,
      bot_class: this.constructor.name,
      data,
      timestamp: Date.now(),
    });
  }
  async queryAI(prompt, context = {}) {
    return this.aiEngine.processQuery(prompt, Object.assign({}, context, {
      bot_context: this.constructor.name,
      bot_id: this.botId,
    }));
  }
  async integrateWithKingdom() {
    return this.core.registerBot(this);
  }
}
module.exports = KingdomBot;