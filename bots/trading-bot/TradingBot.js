const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * TradingBot provides simple stock trading functionality.  It
 * maintains an in‑memory price catalogue, user portfolios and order
 * history.  Prices are simulated and will fluctuate slightly on
 * each request.  In a production system these would be pulled from
 * real market data providers.
 */
class TradingBot extends KingdomBot {
  // Static stores shared across instances
  static priceCatalog = {
    AAPL: 175.00,
    MSFT: 320.00,
    GOOGL: 135.00,
    TSLA: 260.00,
    AMZN: 140.00,
  };
  static portfolios = {}; // { userId: { symbol: quantity } }
  static orders = {};     // { userId: [ order ] }

  async initialize() {
    this.logDivineAction('Trading Bot Initialized');
    return true;
  }

  async execute(params = {}) {
    const action = params.action;
    switch (action) {
      case 'get_price':
        return this.getPrice(params);
      case 'get_prices':
        return this.getPrices(params);
      case 'buy':
        return this.buy(params);
      case 'sell':
        return this.sell(params);
      case 'get_orders':
        return this.getOrders(params);
      case 'get_portfolio':
        return this.getPortfolio(params);
      default:
        return { success: false, message: `Unknown trading action: ${action}` };
    }
  }

  /**
   * Helper to simulate price fluctuations.  Each call will adjust
   * the price up or down by up to ±1%.
   */
  static _simulatePrice(symbol) {
    let price = TradingBot.priceCatalog[symbol];
    if (price === undefined) return null;
    const delta = price * (Math.random() * 0.02 - 0.01); // ±1%
    price = Math.max(0.01, price + delta);
    TradingBot.priceCatalog[symbol] = parseFloat(price.toFixed(2));
    return TradingBot.priceCatalog[symbol];
  }

  getPrice({ symbol }) {
    if (!symbol) {
      return { success: false, message: 'Missing symbol' };
    }
    symbol = symbol.toUpperCase();
    if (!(symbol in TradingBot.priceCatalog)) {
      return { success: false, message: `Unknown symbol ${symbol}` };
    }
    const price = TradingBot._simulatePrice(symbol);
    return { success: true, symbol, price, timestamp: Date.now() };
  }

  getPrices() {
    // Simulate update for all prices
    Object.keys(TradingBot.priceCatalog).forEach((sym) => {
      TradingBot._simulatePrice(sym);
    });
    return { success: true, prices: { ...TradingBot.priceCatalog }, timestamp: Date.now() };
  }

  buy({ userId, symbol, quantity }) {
    userId = userId || 'default';
    symbol = symbol ? symbol.toUpperCase() : null;
    const qty = Number(quantity);
    if (!symbol || qty <= 0) {
      return { success: false, message: 'Missing or invalid symbol/quantity' };
    }
    if (!(symbol in TradingBot.priceCatalog)) {
      return { success: false, message: `Unknown symbol ${symbol}` };
    }
    const price = TradingBot._simulatePrice(symbol);
    // Update portfolio
    const port = TradingBot.portfolios[userId] || {};
    port[symbol] = (port[symbol] || 0) + qty;
    TradingBot.portfolios[userId] = port;
    // Record order
    const order = {
      id: `ord_${Date.now()}`,
      userId,
      symbol,
      side: 'BUY',
      quantity: qty,
      price,
      timestamp: Date.now(),
    };
    if (!TradingBot.orders[userId]) TradingBot.orders[userId] = [];
    TradingBot.orders[userId].push(order);
    this.logDivineAction('Trade Executed', order);
    return { success: true, order };
  }

  sell({ userId, symbol, quantity }) {
    userId = userId || 'default';
    symbol = symbol ? symbol.toUpperCase() : null;
    const qty = Number(quantity);
    if (!symbol || qty <= 0) {
      return { success: false, message: 'Missing or invalid symbol/quantity' };
    }
    const port = TradingBot.portfolios[userId] || {};
    const current = port[symbol] || 0;
    if (current < qty) {
      return { success: false, message: `Not enough ${symbol} to sell` };
    }
    if (!(symbol in TradingBot.priceCatalog)) {
      return { success: false, message: `Unknown symbol ${symbol}` };
    }
    const price = TradingBot._simulatePrice(symbol);
    port[symbol] = current - qty;
    TradingBot.portfolios[userId] = port;
    const order = {
      id: `ord_${Date.now()}`,
      userId,
      symbol,
      side: 'SELL',
      quantity: qty,
      price,
      timestamp: Date.now(),
    };
    if (!TradingBot.orders[userId]) TradingBot.orders[userId] = [];
    TradingBot.orders[userId].push(order);
    this.logDivineAction('Trade Executed', order);
    return { success: true, order };
  }

  getOrders({ userId }) {
    userId = userId || 'default';
    const orders = TradingBot.orders[userId] || [];
    return { success: true, userId, orders };
  }

  getPortfolio({ userId }) {
    userId = userId || 'default';
    const port = TradingBot.portfolios[userId] || {};
    return { success: true, userId, portfolio: port };
  }
}

module.exports = TradingBot;