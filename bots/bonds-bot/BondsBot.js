const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * BondsBot scaffolds government, corporate and municipal bond
 * trading capabilities.  Real implementations will handle bond
 * listings, trades and coupon payments.  Currently all actions
 * return a not implemented message.
 */
class BondsBot extends KingdomBot {
  constructor(core) {
    super(core);
    // Define some example bonds with prices per unit
    if (!BondsBot.bonds) {
      BondsBot.bonds = {
        US10Y: { name: 'US Treasury 10Y', price: 100 },
        CORPAAA: { name: 'Corporate AAA Bond', price: 95 },
        MUNI: { name: 'Municipal Bond', price: 102 },
      };
    }
    if (!BondsBot.portfolios) {
      BondsBot.portfolios = {}; // { userId: { bondId: quantity } }
    }
  }

  async initialize() {
    this.logDivineAction('Bonds Bot Initialized');
    return true;
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'list_bonds':
        return this.listBonds();
      case 'buy_bond':
        return this.buyBond(params);
      case 'sell_bond':
        return this.sellBond(params);
      case 'get_portfolio':
        return this.getPortfolio(params);
      default:
        return { success: false, message: `Unknown action for BondsBot: ${action}` };
    }
  }

  listBonds() {
    // Slight price movement
    Object.keys(BondsBot.bonds).forEach((id) => {
      const bond = BondsBot.bonds[id];
      const delta = bond.price * (Math.random() * 0.01 - 0.005);
      bond.price = parseFloat(Math.max(50, bond.price + delta).toFixed(2));
    });
    return { success: true, bonds: BondsBot.bonds };
  }

  buyBond({ userId, bondId, quantity }) {
    userId = userId || 'default';
    bondId = bondId ? bondId.toUpperCase() : null;
    const qty = Number(quantity);
    if (!bondId || !qty || qty <= 0) return { success: false, message: 'Missing or invalid bondId/quantity' };
    if (!BondsBot.bonds[bondId]) return { success: false, message: `Unknown bond ${bondId}` };
    const port = BondsBot.portfolios[userId] || {};
    port[bondId] = (port[bondId] || 0) + qty;
    BondsBot.portfolios[userId] = port;
    this.logDivineAction('Bond Purchased', { userId, bondId, quantity: qty });
    return { success: true, userId, bondId, quantity: qty };
  }

  sellBond({ userId, bondId, quantity }) {
    userId = userId || 'default';
    bondId = bondId ? bondId.toUpperCase() : null;
    const qty = Number(quantity);
    if (!bondId || !qty || qty <= 0) return { success: false, message: 'Missing or invalid bondId/quantity' };
    const port = BondsBot.portfolios[userId] || {};
    const current = port[bondId] || 0;
    if (current < qty) return { success: false, message: `Not enough ${bondId} to sell` };
    port[bondId] = current - qty;
    BondsBot.portfolios[userId] = port;
    this.logDivineAction('Bond Sold', { userId, bondId, quantity: qty });
    return { success: true, userId, bondId, quantity: qty };
  }

  getPortfolio({ userId }) {
    userId = userId || 'default';
    const port = BondsBot.portfolios[userId] || {};
    const holdings = {};
    let totalValue = 0;
    Object.keys(port).forEach((bondId) => {
      const units = port[bondId];
      const price = BondsBot.bonds[bondId]?.price || 0;
      const value = units * price;
      holdings[bondId] = { units, price, value };
      totalValue += value;
    });
    return { success: true, userId, holdings, totalValue: parseFloat(totalValue.toFixed(2)) };
  }
}

module.exports = BondsBot;