const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * CryptoDerivativesBot scaffolds trading of crypto futures,
 * perpetual swaps and options.  It currently provides stubbed
 * actions that will later interface with derivatives exchanges.
 */
const { readData, writeData } = require('../../lib/storage');

/**
 * CryptoDerivativesBot provides a simplistic simulator for trading
 * cryptocurrency futures and perpetual swaps.  Users can open
 * leveraged long or short positions on supported assets, close
 * positions, and view their open positions.  Prices for the
 * underlying assets are randomly varied on each call to emulate
 * market movement.
 */
class CryptoDerivativesBot extends KingdomBot {
  constructor(core) {
    super(core);
    if (!CryptoDerivativesBot.prices) {
      CryptoDerivativesBot.prices = {
        BTCUSDT: 30000,
        ETHUSDT: 2000,
        BNBUSDT: 300,
        SOLUSDT: 40,
      };
    }
  }
  async initialize() {
    this.logDivineAction('Crypto Derivatives Bot Initialized');
    return true;
  }

  _getData() {
    const data = readData('data/crypto_derivatives.json');
    if (!data.positions) data.positions = {};
    return data;
  }
  _saveData(data) {
    writeData('data/crypto_derivatives.json', data);
  }

  _randomizePrices() {
    Object.keys(CryptoDerivativesBot.prices).forEach((pair) => {
      const current = CryptoDerivativesBot.prices[pair];
      const change = current * (Math.random() * 0.04 - 0.02);
      let newPrice = current + change;
      newPrice = Math.max(0.01, newPrice);
      CryptoDerivativesBot.prices[pair] = parseFloat(newPrice.toFixed(2));
    });
  }

  /**
   * Return a list of available futures contracts with current
   * prices.  This implementation only lists perpetual contracts.
   */
  getFutures() {
    this._randomizePrices();
    const futures = {};
    Object.keys(CryptoDerivativesBot.prices).forEach((pair) => {
      futures[pair] = { price: CryptoDerivativesBot.prices[pair] };
    });
    return { success: true, futures };
  }

  /**
   * Open a leveraged long or short position on a crypto pair.  The
   * position is stored with the entry price and leverage.  Margin
   * requirements are not enforced in this simulation.
   */
  openPosition({ userId = 'default', pair, type, qty, leverage }) {
    const amount = Number(qty);
    const lev = Number(leverage) || 1;
    if (!pair || !type || !amount || amount <= 0) {
      return { success: false, message: 'Missing or invalid position parameters' };
    }
    const p = pair.toUpperCase();
    this._randomizePrices();
    const price = CryptoDerivativesBot.prices[p];
    if (!price) return { success: false, message: `Unknown pair ${pair}` };
    const data = this._getData();
    const positions = data.positions[userId] || [];
    const position = {
      id: `deriv_${Date.now()}`,
      pair: p,
      type: type.toLowerCase() === 'short' ? 'short' : 'long',
      qty: amount,
      leverage: lev,
      entryPrice: price,
      timestamp: new Date().toISOString(),
      open: true,
    };
    positions.push(position);
    data.positions[userId] = positions;
    this._saveData(data);
    this.logDivineAction('Derivative Position Opened', { userId, pair: p, type: position.type, qty: amount, leverage: lev, entryPrice: price });
    return { success: true, position };
  }

  /**
   * Close an open position and calculate profit or loss based on the
   * current price.  Removes the position from the user's list.
   */
  closePosition({ userId = 'default', positionId }) {
    if (!positionId) return { success: false, message: 'Missing positionId' };
    const data = this._getData();
    const positions = data.positions[userId] || [];
    const idx = positions.findIndex((p) => p.id === positionId);
    if (idx < 0) return { success: false, message: 'Position not found' };
    const pos = positions[idx];
    this._randomizePrices();
    const price = CryptoDerivativesBot.prices[pos.pair];
    let pnl;
    if (pos.type === 'long') {
      pnl = (price - pos.entryPrice) * pos.qty * pos.leverage;
    } else {
      pnl = (pos.entryPrice - price) * pos.qty * pos.leverage;
    }
    positions.splice(idx, 1);
    data.positions[userId] = positions;
    this._saveData(data);
    this.logDivineAction('Derivative Position Closed', { userId, positionId, pnl });
    return { success: true, pnl: parseFloat(pnl.toFixed(2)), exitPrice: price };
  }

  /**
   * Return all open derivative positions for a user.
   */
  getPositions({ userId = 'default' }) {
    const data = this._getData();
    const positions = data.positions[userId] || [];
    return { success: true, positions };
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'get_futures':
        return this.getFutures(params);
      case 'open_position':
        return this.openPosition(params);
      case 'close_position':
        return this.closePosition(params);
      case 'get_positions':
        return this.getPositions(params);
      default:
        return { success: false, message: `Unknown action for CryptoDerivativesBot: ${action}` };
    }
  }
}

module.exports = CryptoDerivativesBot;