const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * StocksBot scaffolds a traditional stock trading module.  It will
 * eventually connect to real market data and broker APIs.  For now it
 * exposes stubbed actions that return a not implemented message.
 */
const { readData, writeData } = require('../../lib/storage');

/**
 * StocksBot simulates basic stock trading functionality.  It
 * maintains a simple price feed for a handful of equities and
 * persists user portfolios and order history to disk.  While it
 * cannot connect to real brokerages or exchanges, it provides a
 * realistic interface for buying and selling shares and retrieving
 * quotes.  Prices are randomly perturbed on each quote request to
 * emulate market movement.
 */
class StocksBot extends KingdomBot {
  constructor(core) {
    super(core);
    // Base prices for a small set of equities.  These values will be
    // updated with slight random fluctuations each time a quote is
    // requested.  Additional symbols can be added here as needed.
    if (!StocksBot.prices) {
      StocksBot.prices = {
        AAPL: 150,
        MSFT: 300,
        GOOG: 2800,
        AMZN: 3500,
        TSLA: 800,
        NVDA: 600,
      };
    }
  }

  async initialize() {
    this.logDivineAction('Stocks Bot Initialized');
    return true;
  }

  /**
   * Read persistent portfolios and orders from disk.  If no data
   * exists yet, returns a fresh object structure.
   */
  _getData() {
    const data = readData('data/stocks.json');
    if (!data.portfolios) data.portfolios = {};
    if (!data.orders) data.orders = {};
    return data;
  }

  /**
   * Persist updated portfolios and orders to disk.
   * @param {object} data
   */
  _saveData(data) {
    writeData('data/stocks.json', data);
  }

  /**
   * Apply a small random price movement to each tracked stock.  This
   * method mutates the static price map in place.  The movement is
   * bounded to ±2% of the current price to keep changes realistic.
   */
  _randomizePrices() {
    Object.keys(StocksBot.prices).forEach((sym) => {
      const current = StocksBot.prices[sym];
      const change = current * (Math.random() * 0.04 - 0.02);
      let newPrice = current + change;
      // Ensure price stays above a minimum threshold
      newPrice = Math.max(0.01, newPrice);
      StocksBot.prices[sym] = parseFloat(newPrice.toFixed(2));
    });
  }

  /**
   * Fetch a quote for a single stock symbol.
   * @param {string} symbol
   */
  _getQuote(symbol) {
    this._randomizePrices();
    const sym = symbol.toUpperCase();
    const price = StocksBot.prices[sym];
    if (!price) return null;
    return price;
  }

  /**
   * Execute the requested stock action.  Supported actions include
   * retrieving quotes, buying and selling shares, and listing order
   * history.  Additional metadata should be passed via the params
   * object.
   */
  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'get_quote':
        return this.getQuote(params);
      case 'buy_stock':
        return this.buyStock(params);
      case 'sell_stock':
        return this.sellStock(params);
      case 'get_orders':
        return this.getOrders(params);
      case 'get_portfolio':
        return this.getPortfolio(params);
      default:
        return { success: false, message: `Unknown action for StocksBot: ${action}` };
    }
  }

  /**
   * Return a current quote for the given symbol.
   */
  getQuote({ symbol }) {
    if (!symbol) {
      return { success: false, message: 'Missing symbol' };
    }
    const price = this._getQuote(symbol);
    if (price == null) {
      return { success: false, message: `Unknown symbol ${symbol}` };
    }
    return { success: true, symbol: symbol.toUpperCase(), price };
  }

  /**
   * Buy a quantity of shares for a user.  Records the trade in the
   * user's order history and updates their portfolio.  Returns
   * details of the transaction.
   */
  buyStock({ userId = 'default', symbol, qty }) {
    const quantity = Number(qty);
    if (!symbol || !quantity || quantity <= 0) {
      return { success: false, message: 'Missing or invalid symbol/qty' };
    }
    const price = this._getQuote(symbol);
    if (price == null) {
      return { success: false, message: `Unknown symbol ${symbol}` };
    }
    const data = this._getData();
    const port = data.portfolios[userId] || {};
    const sym = symbol.toUpperCase();
    port[sym] = (port[sym] || 0) + quantity;
    data.portfolios[userId] = port;
    // record order
    const orders = data.orders[userId] || [];
    const order = {
      id: `order_${Date.now()}`,
      symbol: sym,
      side: 'buy',
      qty: quantity,
      price,
      timestamp: new Date().toISOString(),
    };
    orders.push(order);
    data.orders[userId] = orders;
    this._saveData(data);
    this.logDivineAction('Stock Purchased', { userId, symbol: sym, qty: quantity, price });
    return { success: true, order, portfolio: port };
  }

  /**
   * Sell a quantity of shares from a user's portfolio.  Ensures
   * sufficient holdings exist before executing.  Records the sale
   * and updates the portfolio accordingly.
   */
  sellStock({ userId = 'default', symbol, qty }) {
    const quantity = Number(qty);
    if (!symbol || !quantity || quantity <= 0) {
      return { success: false, message: 'Missing or invalid symbol/qty' };
    }
    const sym = symbol.toUpperCase();
    const price = this._getQuote(symbol);
    if (price == null) {
      return { success: false, message: `Unknown symbol ${sym}` };
    }
    const data = this._getData();
    const port = data.portfolios[userId] || {};
    const current = port[sym] || 0;
    if (current < quantity) {
      return { success: false, message: `Not enough shares of ${sym} to sell` };
    }
    port[sym] = current - quantity;
    data.portfolios[userId] = port;
    // record order
    const orders = data.orders[userId] || [];
    const order = {
      id: `order_${Date.now()}`,
      symbol: sym,
      side: 'sell',
      qty: quantity,
      price,
      timestamp: new Date().toISOString(),
    };
    orders.push(order);
    data.orders[userId] = orders;
    this._saveData(data);
    this.logDivineAction('Stock Sold', { userId, symbol: sym, qty: quantity, price });
    return { success: true, order, portfolio: port };
  }

  /**
   * Retrieve the order history for a user.  Returns an array of
   * orders or an empty list if none exist.
   */
  getOrders({ userId = 'default' }) {
    const data = this._getData();
    const orders = data.orders[userId] || [];
    return { success: true, orders };
  }

  /**
   * Retrieve the current stock holdings and their value for a user.
   * Computes total value using current prices.
   */
  getPortfolio({ userId = 'default' }) {
    const data = this._getData();
    const port = data.portfolios[userId] || {};
    const holdings = {};
    let totalValue = 0;
    Object.keys(port).forEach((sym) => {
      const units = port[sym];
      const price = this._getQuote(sym);
      const value = units * (price || 0);
      holdings[sym] = { units, price, value: parseFloat(value.toFixed(2)) };
      totalValue += value;
    });
    return { success: true, userId, holdings, totalValue: parseFloat(totalValue.toFixed(2)) };
  }
}

module.exports = StocksBot;