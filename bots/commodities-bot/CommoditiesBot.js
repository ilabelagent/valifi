const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * CommoditiesBot scaffolds trading of commodities such as oil, gas
 * and agricultural products.  It will later provide live quotes
 * and order management.  Currently actions return not implemented.
 */
class CommoditiesBot extends KingdomBot {
  constructor(core) {
    super(core);
    if (!CommoditiesBot.prices) {
      CommoditiesBot.prices = {
        OIL: 80,
        GAS: 3,
        WHEAT: 7,
        CORN: 5,
        SOY: 13,
      };
    }
    if (!CommoditiesBot.portfolios) {
      CommoditiesBot.portfolios = {}; // { userId: { commodity: qty } }
    }
  }

  async initialize() {
    this.logDivineAction('Commodities Bot Initialized');
    return true;
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'get_quote':
        return this.getQuote(params);
      case 'buy':
        return this.buy(params);
      case 'sell':
        return this.sell(params);
      case 'get_positions':
        return this.getPositions(params);
      default:
        return { success: false, message: `Unknown action for CommoditiesBot: ${action}` };
    }
  }

  /**
   * Simulate getting current commodity price.  Adjusts price by ±2% each call.
   */
  getQuote({ commodity }) {
    commodity = commodity ? commodity.toUpperCase() : null;
    if (!commodity || !(commodity in CommoditiesBot.prices)) {
      return { success: false, message: 'Unknown commodity' };
    }
    // simulate price change
    let price = CommoditiesBot.prices[commodity];
    const delta = price * (Math.random() * 0.04 - 0.02);
    price = Math.max(0.1, price + delta);
    CommoditiesBot.prices[commodity] = parseFloat(price.toFixed(2));
    return { success: true, commodity, price: CommoditiesBot.prices[commodity] };
  }

  buy({ userId, commodity, quantity }) {
    userId = userId || 'default';
    commodity = commodity ? commodity.toUpperCase() : null;
    const qty = Number(quantity);
    if (!commodity || !qty || qty <= 0) return { success: false, message: 'Missing or invalid commodity/quantity' };
    if (!(commodity in CommoditiesBot.prices)) return { success: false, message: `Unknown commodity ${commodity}` };
    const port = CommoditiesBot.portfolios[userId] || {};
    port[commodity] = (port[commodity] || 0) + qty;
    CommoditiesBot.portfolios[userId] = port;
    this.logDivineAction('Commodity Purchased', { userId, commodity, quantity: qty });
    return { success: true, userId, commodity, quantity: qty };
  }

  sell({ userId, commodity, quantity }) {
    userId = userId || 'default';
    commodity = commodity ? commodity.toUpperCase() : null;
    const qty = Number(quantity);
    if (!commodity || !qty || qty <= 0) return { success: false, message: 'Missing or invalid commodity/quantity' };
    const port = CommoditiesBot.portfolios[userId] || {};
    const current = port[commodity] || 0;
    if (current < qty) return { success: false, message: `Not enough ${commodity} to sell` };
    port[commodity] = current - qty;
    CommoditiesBot.portfolios[userId] = port;
    this.logDivineAction('Commodity Sold', { userId, commodity, quantity: qty });
    return { success: true, userId, commodity, quantity: qty };
  }

  getPositions({ userId }) {
    userId = userId || 'default';
    const port = CommoditiesBot.portfolios[userId] || {};
    const positions = {};
    let totalValue = 0;
    Object.keys(port).forEach((commodity) => {
      const qty = port[commodity];
      const price = CommoditiesBot.prices[commodity] || 0;
      const value = qty * price;
      positions[commodity] = { quantity: qty, price, value };
      totalValue += value;
    });
    return { success: true, userId, positions, totalValue: parseFloat(totalValue.toFixed(2)) };
  }
}

module.exports = CommoditiesBot;