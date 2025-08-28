const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * MutualFundsBot is a scaffold for a mutual funds and ETFs
 * marketplace.  It will eventually allow users to browse funds,
 * execute trades and view portfolios.  Current actions are
 * placeholders.
 */
class MutualFundsBot extends KingdomBot {
  constructor(core) {
    super(core);
    // Predefined mutual funds with simulated prices
    if (!MutualFundsBot.funds) {
      MutualFundsBot.funds = {
        VFIAX: { name: 'Vanguard 500 Index', price: 400 },
        VTSAX: { name: 'Vanguard Total Stock Market', price: 110 },
        SWPPX: { name: 'Schwab S&P 500 Index', price: 70 },
        FXAIX: { name: 'Fidelity 500 Index', price: 150 },
      };
    }
    if (!MutualFundsBot.portfolios) {
      MutualFundsBot.portfolios = {}; // { userId: { fundId: units } }
    }
  }

  async initialize() {
    this.logDivineAction('MutualFunds Bot Initialized');
    return true;
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'list_funds':
        return this.listFunds();
      case 'buy_fund':
        return this.buyFund(params);
      case 'sell_fund':
        return this.sellFund(params);
      case 'get_portfolio':
        return this.getPortfolio(params);
      default:
        return { success: false, message: `Unknown action for MutualFundsBot: ${action}` };
    }
  }

  /**
   * Returns the list of mutual funds with current prices.  Simulates
   * price fluctuation on each call.
   */
  listFunds() {
    // Simulate slight price movements (±1%)
    Object.keys(MutualFundsBot.funds).forEach((id) => {
      const fund = MutualFundsBot.funds[id];
      const delta = fund.price * (Math.random() * 0.02 - 0.01);
      fund.price = parseFloat(Math.max(1, fund.price + delta).toFixed(2));
    });
    return { success: true, funds: MutualFundsBot.funds };
  }

  /**
   * Buy a number of units of a fund for a user.
   */
  buyFund({ userId, fundId, quantity }) {
    userId = userId || 'default';
    fundId = fundId ? fundId.toUpperCase() : null;
    const qty = Number(quantity);
    if (!fundId || !qty || qty <= 0) {
      return { success: false, message: 'Missing or invalid fundId/quantity' };
    }
    if (!MutualFundsBot.funds[fundId]) {
      return { success: false, message: `Unknown fund ${fundId}` };
    }
    const port = MutualFundsBot.portfolios[userId] || {};
    port[fundId] = (port[fundId] || 0) + qty;
    MutualFundsBot.portfolios[userId] = port;
    this.logDivineAction('Fund Purchased', { userId, fundId, quantity: qty });
    return { success: true, userId, fundId, quantity: qty };
  }

  /**
   * Sell a number of units of a fund for a user.
   */
  sellFund({ userId, fundId, quantity }) {
    userId = userId || 'default';
    fundId = fundId ? fundId.toUpperCase() : null;
    const qty = Number(quantity);
    if (!fundId || !qty || qty <= 0) {
      return { success: false, message: 'Missing or invalid fundId/quantity' };
    }
    const port = MutualFundsBot.portfolios[userId] || {};
    const current = port[fundId] || 0;
    if (current < qty) {
      return { success: false, message: `Not enough units of ${fundId} to sell` };
    }
    port[fundId] = current - qty;
    MutualFundsBot.portfolios[userId] = port;
    this.logDivineAction('Fund Sold', { userId, fundId, quantity: qty });
    return { success: true, userId, fundId, quantity: qty };
  }

  /**
   * Returns a user's mutual fund portfolio with valuations.
   */
  getPortfolio({ userId }) {
    userId = userId || 'default';
    const port = MutualFundsBot.portfolios[userId] || {};
    const holdings = {};
    let totalValue = 0;
    Object.keys(port).forEach((fundId) => {
      const units = port[fundId];
      const price = MutualFundsBot.funds[fundId]?.price || 0;
      const value = units * price;
      holdings[fundId] = { units, price, value };
      totalValue += value;
    });
    return { success: true, userId, holdings, totalValue: parseFloat(totalValue.toFixed(2)) };
  }
}

module.exports = MutualFundsBot;