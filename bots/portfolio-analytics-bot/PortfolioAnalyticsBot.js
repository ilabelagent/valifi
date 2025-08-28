const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * PortfolioAnalyticsBot scaffolds analysis of balances and
 * performance.  It will compute metrics such as returns, risk and
 * diversification.  All actions currently return not implemented.
 */
class PortfolioAnalyticsBot extends KingdomBot {
  constructor(core) {
    super(core);
    // Static store for previous total values per user to compute performance
    if (!PortfolioAnalyticsBot.previousTotals) {
      PortfolioAnalyticsBot.previousTotals = {};
    }
  }

  async initialize() {
    this.logDivineAction('Portfolio Analytics Bot Initialized');
    return true;
  }

  /**
   * Dispatch for portfolio analytics actions.
   * @param {object} params
   */
  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'get_overview':
        return this.getOverview(params);
      case 'get_performance':
        return this.getPerformance(params);
      default:
        return { success: false, message: `Unknown action for PortfolioAnalyticsBot: ${action}` };
    }
  }

  /**
   * Computes an overview of a user's portfolio including total value,
   * asset allocations and individual prices.  Uses the TradingBot's
   * static priceCatalog and portfolios for data.  Prices are
   * simulated by invoking the TradingBot price update function.
   * @param {{ userId: string }} params
   */
  getOverview({ userId }) {
    userId = userId || 'default';
    // Import TradingBot lazily to avoid circular dependency issues
    const TradingBot = require('../trading-bot/TradingBot');
    const portfolio = TradingBot.portfolios[userId] || {};
    const prices = {};
    let totalValue = 0;
    const assets = {};
    Object.keys(portfolio).forEach((symbol) => {
      // Simulate price update
      const price = TradingBot._simulatePrice(symbol);
      prices[symbol] = price;
      const qty = portfolio[symbol];
      const value = qty * price;
      assets[symbol] = { quantity: qty, price, value };
      totalValue += value;
    });
    // Calculate weight percentages
    Object.keys(assets).forEach((symbol) => {
      const asset = assets[symbol];
      const weight = totalValue > 0 ? asset.value / totalValue : 0;
      asset.weight = parseFloat((weight * 100).toFixed(2));
    });
    return { success: true, userId, totalValue: parseFloat(totalValue.toFixed(2)), assets };
  }

  /**
   * Returns performance metrics compared to the previous portfolio
   * valuation.  Computes the percentage change since the last call.
   * Stores the current total for next comparison.
   * @param {{ userId: string }} params
   */
  getPerformance({ userId }) {
    userId = userId || 'default';
    const overview = this.getOverview({ userId });
    if (!overview.success) return overview;
    const current = overview.totalValue;
    const prev = PortfolioAnalyticsBot.previousTotals[userId] || current;
    const delta = current - prev;
    const pctChange = prev === 0 ? 0 : (delta / prev) * 100;
    // Update previous total for next call
    PortfolioAnalyticsBot.previousTotals[userId] = current;
    return {
      success: true,
      userId,
      currentValue: current,
      previousValue: prev,
      change: parseFloat(delta.toFixed(2)),
      changePercent: parseFloat(pctChange.toFixed(2)),
      assets: overview.assets,
    };
  }
}

module.exports = PortfolioAnalyticsBot;