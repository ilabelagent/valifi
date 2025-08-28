const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * PortfolioBot manages a user's investment positions and basic rebalancing.
 * Positions are stored in memory keyed by userId.  In production this
 * should be replaced with persistent storage.  Each position is an
 * object of the form { asset: string, quantity: number }.
 */
class PortfolioBot extends KingdomBot {
  // Static store across all instances: { [userId]: [{ asset, quantity }] }
  static portfolios = {};

  async initialize() {
    this.logDivineAction('Portfolio Bot Initialized');
    return true;
  }

  /**
   * Main dispatch method called by the API router.
   * Accepts actions: get_positions, add_position, rebalance.
   */
  async execute(params = {}) {
    const action = params.action;
    switch (action) {
      case 'get_positions':
        return this.getPositions(params);
      case 'add_position':
        return this.addPosition(params);
      case 'rebalance':
        return this.rebalance(params);
      default:
        return { success: false, message: `Unknown portfolio action: ${action}` };
    }
  }

  /**
   * Returns the positions for a given user.
   * @param {{ userId: string }} params
   */
  getPositions(params) {
    const userId = params.userId || 'default';
    const positions = PortfolioBot.portfolios[userId] || [];
    return { success: true, userId, positions };
  }

  /**
   * Adds or updates a position for a user.  If the asset already exists
   * the quantity will be increased by the provided amount.
   * @param {{ userId: string, asset: string, quantity: number }} params
   */
  addPosition(params) {
    const userId = params.userId || 'default';
    const asset = params.asset;
    const quantity = Number(params.quantity) || 0;
    if (!asset || quantity <= 0) {
      return { success: false, message: 'Missing or invalid asset/quantity.' };
    }
    const positions = PortfolioBot.portfolios[userId] || [];
    const idx = positions.findIndex((p) => p.asset === asset);
    if (idx >= 0) {
      positions[idx].quantity += quantity;
    } else {
      positions.push({ asset, quantity });
    }
    PortfolioBot.portfolios[userId] = positions;
    this.logDivineAction('Position Added', { userId, asset, quantity });
    return { success: true, userId, positions };
  }

  /**
   * Rebalances a portfolio to equal weight.  The total quantity is summed
   * and divided equally across all assets.  This function simply
   * redistributes quantities without considering transaction costs.
   * @param {{ userId: string }} params
   */
  rebalance(params) {
    const userId = params.userId || 'default';
    const positions = PortfolioBot.portfolios[userId] || [];
    if (positions.length === 0) {
      return { success: false, message: 'No positions to rebalance.', userId };
    }
    const total = positions.reduce((sum, p) => sum + p.quantity, 0);
    const equalQuantity = total / positions.length;
    positions.forEach((p) => {
      p.quantity = equalQuantity;
    });
    PortfolioBot.portfolios[userId] = positions;
    this.logDivineAction('Portfolio Rebalanced', { userId, positions });
    return { success: true, userId, positions, total, equalQuantity };
  }
}

module.exports = PortfolioBot;