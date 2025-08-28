const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * ForexBot scaffolds foreign exchange trading.  It will eventually
 * provide real currency quotes, margin trading and order
 * management.  Actions currently return not implemented.
 */
const { readData, writeData } = require('../../lib/storage');

/**
 * ForexBot provides a basic simulation of foreign exchange
 * trading.  It maintains spot rates for a few currency pairs and
 * allows users to buy and sell those pairs, tracking positions
 * over time.  Rates fluctuate slightly on each quote to imitate
 * market movement.
 */
class ForexBot extends KingdomBot {
  constructor(core) {
    super(core);
    if (!ForexBot.rates) {
      ForexBot.rates = {
        'EUR/USD': 1.1,
        'GBP/USD': 1.3,
        'USD/JPY': 110,
        'USD/CHF': 0.93,
        'AUD/USD': 0.7,
      };
    }
  }
  async initialize() {
    this.logDivineAction('Forex Bot Initialized');
    return true;
  }

  _getData() {
    const data = readData('data/forex.json');
    if (!data.positions) data.positions = {};
    return data;
  }
  _saveData(data) {
    writeData('data/forex.json', data);
  }

  /**
   * Randomly perturb FX rates by ±1% to simulate daily
   * volatility.  Ensures rates remain positive.
   */
  _randomizeRates() {
    Object.keys(ForexBot.rates).forEach((pair) => {
      const current = ForexBot.rates[pair];
      const change = current * (Math.random() * 0.02 - 0.01);
      let newRate = current + change;
      newRate = Math.max(0.0001, newRate);
      ForexBot.rates[pair] = parseFloat(newRate.toFixed(5));
    });
  }

  /**
   * Get the current rate for a currency pair.
   */
  getRate({ pair }) {
    if (!pair) return { success: false, message: 'Missing pair' };
    this._randomizeRates();
    const p = pair.toUpperCase();
    const rate = ForexBot.rates[p];
    if (!rate) return { success: false, message: `Unknown pair ${pair}` };
    return { success: true, pair: p, rate };
  }

  /**
   * Buy a currency pair (long the first currency, short the second).
   * Positions are tracked by pair; no margin or leverage is applied.
   */
  buyCurrency({ userId = 'default', pair, qty }) {
    const amount = Number(qty);
    if (!pair || !amount || amount <= 0) {
      return { success: false, message: 'Missing or invalid pair/qty' };
    }
    const p = pair.toUpperCase();
    const rate = this.getRate({ pair: p }).rate;
    if (!rate) return { success: false, message: `Unknown pair ${pair}` };
    const data = this._getData();
    const positions = data.positions[userId] || {};
    const pos = positions[p] || { qty: 0, avgPrice: rate };
    // Update average price
    const totalCost = pos.avgPrice * pos.qty + rate * amount;
    pos.qty += amount;
    pos.avgPrice = pos.qty ? parseFloat((totalCost / pos.qty).toFixed(5)) : rate;
    positions[p] = pos;
    data.positions[userId] = positions;
    this._saveData(data);
    this.logDivineAction('FX Purchased', { userId, pair: p, qty: amount, rate });
    return { success: true, pair: p, qty: pos.qty, avgPrice: pos.avgPrice };
  }

  /**
   * Sell a currency pair (reduce long position).  Ensures the user
   * has enough quantity before executing the trade.
   */
  sellCurrency({ userId = 'default', pair, qty }) {
    const amount = Number(qty);
    if (!pair || !amount || amount <= 0) {
      return { success: false, message: 'Missing or invalid pair/qty' };
    }
    const p = pair.toUpperCase();
    const rate = this.getRate({ pair: p }).rate;
    if (!rate) return { success: false, message: `Unknown pair ${pair}` };
    const data = this._getData();
    const positions = data.positions[userId] || {};
    const pos = positions[p];
    if (!pos || pos.qty < amount) {
      return { success: false, message: `Not enough position in ${p} to sell` };
    }
    pos.qty -= amount;
    if (pos.qty === 0) {
      delete positions[p];
    }
    data.positions[userId] = positions;
    this._saveData(data);
    this.logDivineAction('FX Sold', { userId, pair: p, qty: amount, rate });
    return { success: true, remainingQty: pos.qty || 0 };
  }

  /**
   * Retrieve the user's current FX positions.
   */
  getPositions({ userId = 'default' }) {
    const data = this._getData();
    const positions = data.positions[userId] || {};
    return { success: true, positions };
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'get_rate':
        return this.getRate(params);
      case 'buy_currency':
        return this.buyCurrency(params);
      case 'sell_currency':
        return this.sellCurrency(params);
      case 'get_positions':
        return this.getPositions(params);
      default:
        return { success: false, message: `Unknown action for ForexBot: ${action}` };
    }
  }
}

module.exports = ForexBot;