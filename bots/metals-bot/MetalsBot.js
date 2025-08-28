const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * MetalsBot manages a simple portfolio of precious metals and
 * artifacts.  It can return current spot prices, execute buys
 * and sells and report a user's holdings.  Prices are mocked
 * rather than pulled from any external API.  Holdings are stored
 * in a static map keyed by user ID.
 */
class MetalsBot extends KingdomBot {
  constructor(core) {
    super(core);
    if (!MetalsBot.holdings) {
      MetalsBot.holdings = {};
    }
    if (!MetalsBot.prices) {
      // Initialise spot prices; these could be updated on each
      // invocation to simulate market movement.
      MetalsBot.prices = {
        gold: 1900, // USD per ounce
        silver: 25,
        platinum: 950,
        palladium: 1300,
        artifact: 5000, // Generic rare artifact price
      };
    }
  }
  async initialize() {
    this.logDivineAction('Metals Bot Initialised');
    return true;
  }
  async execute(params = {}) {
    const action = params.action || 'status';
    switch (action) {
      case 'get_prices':
        return this.getPrices();
      case 'buy_metal':
        return this.buyMetal(params);
      case 'sell_metal':
        return this.sellMetal(params);
      case 'get_portfolio':
        return this.getPortfolio(params);
      default:
        return { success: false, message: 'Unknown metals action.' };
    }
  }
  /**
   * Return the current spot prices.  Randomly vary the price
   * slightly to simulate live markets.
   */
  getPrices() {
    const prices = {};
    for (const [metal, price] of Object.entries(MetalsBot.prices)) {
      // Apply a small random fluctuation +/- 1%
      const delta = price * (Math.random() - 0.5) * 0.02;
      prices[metal] = Number((price + delta).toFixed(2));
    }
    return { success: true, prices };
  }
  /**
   * Buy a quantity of a specific metal for a user.  Expects
   * user_id, metal and quantity.  Updates holdings and returns
   * cost and new balance.
   */
  buyMetal({ user_id, metal, quantity }) {
    const qty = Number(quantity);
    if (!user_id || !metal || !qty || qty <= 0) {
      return { success: false, message: 'Invalid buy parameters.' };
    }
    const m = metal.toLowerCase();
    if (!MetalsBot.prices[m]) {
      return { success: false, message: 'Unsupported metal.' };
    }
    const price = MetalsBot.prices[m];
    const cost = qty * price;
    // update holdings
    if (!MetalsBot.holdings[user_id]) MetalsBot.holdings[user_id] = {};
    MetalsBot.holdings[user_id][m] = (MetalsBot.holdings[user_id][m] || 0) + qty;
    return { success: true, metal: m, quantity: qty, total_cost: Number(cost.toFixed(2)), holdings: MetalsBot.holdings[user_id] };
  }
  /**
   * Sell a quantity of a metal.  Validates that the user has
   * enough holdings and returns proceeds of the sale.
   */
  sellMetal({ user_id, metal, quantity }) {
    const qty = Number(quantity);
    const m = metal ? metal.toLowerCase() : null;
    if (!user_id || !m || !qty || qty <= 0) {
      return { success: false, message: 'Invalid sell parameters.' };
    }
    if (!MetalsBot.prices[m]) {
      return { success: false, message: 'Unsupported metal.' };
    }
    const userHoldings = MetalsBot.holdings[user_id] || {};
    const current = userHoldings[m] || 0;
    if (current < qty) {
      return { success: false, message: 'Insufficient holdings.' };
    }
    const price = MetalsBot.prices[m];
    const proceeds = qty * price;
    userHoldings[m] = current - qty;
    return { success: true, metal: m, quantity: qty, proceeds: Number(proceeds.toFixed(2)), holdings: userHoldings };
  }
  /**
   * Retrieve the portfolio for a user.  Returns an object mapping
   * metal names to quantities.
   */
  getPortfolio({ user_id }) {
    if (!user_id) return { success: false, message: 'user_id required.' };
    const holdings = MetalsBot.holdings[user_id] || {};
    return { success: true, holdings };
  }
  getCapabilities() {
    return {
      metals: ['get_prices', 'buy_metal', 'sell_metal', 'get_portfolio'],
    };
  }
}
module.exports = MetalsBot;