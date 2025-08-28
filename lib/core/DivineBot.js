/**
 * DivineBot is a JavaScript analogue of the PHP interface.  It
 * defines the methods that every bot must implement.  Because
 * JavaScript lacks interfaces, this base class throws errors if
 * methods are not overridden.
 */
class DivineBot {
  /** Initialise the bot. */
  async initialize() {
    throw new Error('initialize() must be implemented');
  }
  /** Execute a bot action. */
  async execute(params = {}) {
    throw new Error('execute() must be implemented');
  }
  /** Report bot status. */
  getStatus() {
    return 'ready';
  }
  /** Shutdown hook */
  async shutdown() {
    return true;
  }
  /** Handle an arbitrary AI request. */
  async handleAIRequest(query) {
    throw new Error('handleAIRequest() must be implemented');
  }
  /** Register bot with the core. */
  async integrateWithKingdom() {
    return true;
  }
  /** List the bot capabilities. */
  getCapabilities() {
    return {};
  }
}
module.exports = DivineBot;