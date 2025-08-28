const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * OptionsBot will manage options trading including chains, buying and
 * selling contracts and tracking positions.  It currently provides
 * stubbed actions that return not implemented.
 */
const { readData, writeData } = require('../../lib/storage');
const StocksBot = require('../stocks-bot/StocksBot');

/**
 * OptionsBot provides a simple simulation of equity options trading.
 * It generates an options chain for a given underlying symbol and
 * allows users to buy and sell call or put contracts.  Positions
 * and order history are persisted to disk.  Premiums and strikes
 * are derived from the underlying stock price with random variation.
 */
class OptionsBot extends KingdomBot {
  async initialize() {
    this.logDivineAction('Options Bot Initialized');
    return true;
  }

  _getData() {
    const data = readData('data/options.json');
    if (!data.positions) data.positions = {};
    if (!data.orders) data.orders = {};
    return data;
  }
  _saveData(data) {
    writeData('data/options.json', data);
  }

  /**
   * Generate a basic options chain for a given symbol.  Creates
   * three call and three put options with strikes around the
   * underlying stock price.  Expirations are set to 30, 60 and
   * 90 days from today.
   */
  getOptionsChain({ symbol }) {
    if (!symbol) {
      return { success: false, message: 'Missing symbol' };
    }
    // Use the current core to instantiate StocksBot so it has a valid core reference
    const stockBot = new StocksBot(this.core);
    // Ensure base prices exist; generate quote to randomize price
    const price = stockBot._getQuote(symbol);
    if (price == null) {
      return { success: false, message: `Unknown underlying ${symbol}` };
    }
    const base = price;
    const strikes = [
      parseFloat((base * 0.9).toFixed(2)),
      parseFloat((base * 1.0).toFixed(2)),
      parseFloat((base * 1.1).toFixed(2)),
    ];
    const expirations = [];
    const now = new Date();
    [30, 60, 90].forEach((d) => {
      const exp = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
      expirations.push(exp.toISOString().split('T')[0]);
    });
    const chain = [];
    strikes.forEach((strike) => {
      expirations.forEach((exp) => {
        // Call
        chain.push({
          type: 'call',
          strike,
          expiry: exp,
          premium: parseFloat((Math.random() * base * 0.05).toFixed(2)),
        });
        // Put
        chain.push({
          type: 'put',
          strike,
          expiry: exp,
          premium: parseFloat((Math.random() * base * 0.05).toFixed(2)),
        });
      });
    });
    return { success: true, symbol: symbol.toUpperCase(), chain };
  }

  /**
   * Buy an option contract.  Adds a position to the user's
   * portfolio.  Each contract represents 100 shares of the
   * underlying.  Premium is multiplied by contracts*100 to
   * simulate cost but cost is not deducted from an account.
   */
  buyOption({ userId = 'default', symbol, type, strike, expiry, contracts }) {
    const qty = parseInt(contracts, 10);
    if (!symbol || !type || !strike || !expiry || !qty || qty <= 0) {
      return { success: false, message: 'Missing or invalid buy parameters' };
    }
    // Use the current core to instantiate StocksBot so it has a valid core reference
    const stockBot = new StocksBot(this.core);
    const price = stockBot._getQuote(symbol);
    if (price == null) {
      return { success: false, message: `Unknown underlying ${symbol}` };
    }
    // Estimate premium based on moneyness: deeper ITM calls cost more, puts cost accordingly
    const intrinsic = type === 'call' ? Math.max(0, price - strike) : Math.max(0, strike - price);
    const timeValue = price * 0.02 * Math.random();
    const premium = parseFloat((intrinsic + timeValue).toFixed(2));
    const data = this._getData();
    const positions = data.positions[userId] || [];
    const position = {
      id: `opt_${Date.now()}`,
      symbol: symbol.toUpperCase(),
      type: type.toLowerCase(),
      strike: Number(strike),
      expiry,
      contracts: qty,
      premium,
      timestamp: new Date().toISOString(),
    };
    positions.push(position);
    data.positions[userId] = positions;
    // Record order
    const orders = data.orders[userId] || [];
    orders.push({
      id: position.id,
      action: 'buy',
      symbol: position.symbol,
      type: position.type,
      strike: position.strike,
      expiry: position.expiry,
      contracts: qty,
      premium,
      timestamp: position.timestamp,
    });
    data.orders[userId] = orders;
    this._saveData(data);
    this.logDivineAction('Option Purchased', { userId, symbol: position.symbol, type: position.type, contracts: qty });
    return { success: true, position };
  }

  /**
   * Sell an existing option position.  Reduces or removes the
   * position from the user.  Premium received is estimated
   * similarly to the buy price.  If the position is completely
   * closed, it is removed from the portfolio.
   */
  sellOption({ userId = 'default', positionId, contracts }) {
    const qty = parseInt(contracts, 10);
    if (!positionId || !qty || qty <= 0) {
      return { success: false, message: 'Missing or invalid sell parameters' };
    }
    const data = this._getData();
    const positions = data.positions[userId] || [];
    const idx = positions.findIndex((p) => p.id === positionId);
    if (idx < 0) {
      return { success: false, message: 'Position not found' };
    }
    const pos = positions[idx];
    if (pos.contracts < qty) {
      return { success: false, message: 'Not enough contracts to sell' };
    }
    // Calculate current premium (simulate small difference)
    const underlying = pos.symbol;
    // Use the current core to instantiate StocksBot so it has a valid core reference
    const stockBot = new StocksBot(this.core);
    const price = stockBot._getQuote(underlying);
    const intrinsic = pos.type === 'call' ? Math.max(0, price - pos.strike) : Math.max(0, pos.strike - price);
    const timeValue = price * 0.02 * Math.random();
    const premium = parseFloat((intrinsic + timeValue).toFixed(2));
    pos.contracts -= qty;
    if (pos.contracts <= 0) {
      positions.splice(idx, 1);
    }
    data.positions[userId] = positions;
    // record order
    const orders = data.orders[userId] || [];
    orders.push({
      id: `sell_${Date.now()}`,
      action: 'sell',
      symbol: pos.symbol,
      type: pos.type,
      strike: pos.strike,
      expiry: pos.expiry,
      contracts: qty,
      premium,
      timestamp: new Date().toISOString(),
    });
    data.orders[userId] = orders;
    this._saveData(data);
    this.logDivineAction('Option Sold', { userId, positionId, contracts: qty });
    return { success: true, remainingContracts: pos.contracts || 0 };
  }

  /**
   * Return the current option positions for a user.
   */
  getPositions({ userId = 'default' }) {
    const data = this._getData();
    const positions = data.positions[userId] || [];
    return { success: true, positions };
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'get_options_chain':
        return this.getOptionsChain(params);
      case 'buy_option':
        return this.buyOption(params);
      case 'sell_option':
        return this.sellOption(params);
      case 'get_positions':
        return this.getPositions(params);
      default:
        return { success: false, message: `Unknown action for OptionsBot: ${action}` };
    }
  }
}

module.exports = OptionsBot;