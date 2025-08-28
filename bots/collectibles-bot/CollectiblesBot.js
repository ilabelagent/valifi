const KingdomBot = require('../../lib/core/KingdomBot');
const { readData, writeData } = require('../../lib/storage');

/**
 * CollectiblesBot handles trading and storage of precious metals,
 * rare earth elements, precious stones, numismatic coins,
 * artwork, antiquities, wine and luxury watches.  Prices are
 * mocked and holdings are stored persistently.  Users can also
 * store assets in a secure vault.
 */
class CollectiblesBot extends KingdomBot {
  async initialize() {
    this.logDivineAction('Collectibles Bot Initialized');
    return true;
  }
  _getData() {
    const data = readData('data/collectibles.json');
    data.holdings = data.holdings || {};
    data.vault = data.vault || {};
    return data;
  }
  _saveData(data) {
    writeData('data/collectibles.json', data);
  }

  /**
   * Get the current price list for all supported assets.  Prices
   * fluctuate slightly with each call to simulate a market.
   */
  listAssets() {
    const basePrices = {
      gold: 1900,
      silver: 25,
      platinum: 950,
      palladium: 1300,
      rareearth: 300,
      stones: 500,
      coins: 150,
      art: 10000,
      antiquities: 8000,
      wine: 200,
      watches: 5000,
    };
    const prices = {};
    Object.keys(basePrices).forEach((k) => {
      const base = basePrices[k];
      const delta = base * (Math.random() - 0.5) * 0.02;
      prices[k] = Number((base + delta).toFixed(2));
    });
    return { success: true, prices };
  }

  /**
   * Buy an asset.  Updates holdings for the user.  Quantity can
   * represent units, ounces or pieces depending on asset type.
   */
  buyAsset({ userId = 'default', asset, quantity }) {
    const qty = Number(quantity);
    if (!asset || !qty || qty <= 0) return { success: false, message: 'asset and quantity required' };
    const { prices } = this.listAssets();
    const key = asset.toLowerCase();
    if (!prices[key]) return { success: false, message: 'Unsupported asset' };
    const cost = prices[key] * qty;
    const data = this._getData();
    const holdings = data.holdings[userId] || {};
    holdings[key] = (holdings[key] || 0) + qty;
    data.holdings[userId] = holdings;
    this._saveData(data);
    this.logDivineAction('Asset Purchased', { userId, asset: key, quantity: qty });
    return { success: true, asset: key, quantity: qty, cost: Number(cost.toFixed(2)), holdings };
  }

  /**
   * Sell an asset if the user has enough units.  Returns proceeds.
   */
  sellAsset({ userId = 'default', asset, quantity }) {
    const qty = Number(quantity);
    if (!asset || !qty || qty <= 0) return { success: false, message: 'asset and quantity required' };
    const { prices } = this.listAssets();
    const key = asset.toLowerCase();
    const data = this._getData();
    const holdings = data.holdings[userId] || {};
    const current = holdings[key] || 0;
    if (current < qty) return { success: false, message: 'Insufficient holdings' };
    const proceeds = prices[key] * qty;
    holdings[key] = current - qty;
    data.holdings[userId] = holdings;
    this._saveData(data);
    this.logDivineAction('Asset Sold', { userId, asset: key, quantity: qty });
    return { success: true, asset: key, quantity: qty, proceeds: Number(proceeds.toFixed(2)), holdings };
  }

  /**
   * Retrieve holdings for a user.
   */
  getHoldings({ userId = 'default' }) {
    const data = this._getData();
    return { success: true, holdings: data.holdings[userId] || {} };
  }

  /**
   * Store assets in a secure vault.  Moves quantity from holdings
   * into the vault, which is kept separate for safekeeping.
   */
  storeAsset({ userId = 'default', asset, quantity }) {
    const qty = Number(quantity);
    if (!asset || !qty || qty <= 0) return { success: false, message: 'asset and quantity required' };
    const data = this._getData();
    const holdings = data.holdings[userId] || {};
    const key = asset.toLowerCase();
    if ((holdings[key] || 0) < qty) return { success: false, message: 'Insufficient holdings' };
    holdings[key] -= qty;
    const vaultUser = data.vault[userId] || {};
    vaultUser[key] = (vaultUser[key] || 0) + qty;
    data.vault[userId] = vaultUser;
    data.holdings[userId] = holdings;
    this._saveData(data);
    this.logDivineAction('Asset Stored', { userId, asset: key, quantity: qty });
    return { success: true, vault: vaultUser };
  }

  /**
   * Retrieve assets from the vault back into holdings.
   */
  retrieveAsset({ userId = 'default', asset, quantity }) {
    const qty = Number(quantity);
    if (!asset || !qty || qty <= 0) return { success: false, message: 'asset and quantity required' };
    const data = this._getData();
    const key = asset.toLowerCase();
    const vaultUser = data.vault[userId] || {};
    if ((vaultUser[key] || 0) < qty) return { success: false, message: 'Insufficient assets in vault' };
    vaultUser[key] -= qty;
    const holdings = data.holdings[userId] || {};
    holdings[key] = (holdings[key] || 0) + qty;
    data.vault[userId] = vaultUser;
    data.holdings[userId] = holdings;
    this._saveData(data);
    this.logDivineAction('Asset Retrieved', { userId, asset: key, quantity: qty });
    return { success: true, holdings };
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'list_assets':
        return this.listAssets();
      case 'buy_asset':
        return this.buyAsset(params);
      case 'sell_asset':
        return this.sellAsset(params);
      case 'get_holdings':
        return this.getHoldings(params);
      case 'store_asset':
        return this.storeAsset(params);
      case 'retrieve_asset':
        return this.retrieveAsset(params);
      default:
        return { success: false, message: `Unknown action for CollectiblesBot: ${action}` };
    }
  }
}

module.exports = CollectiblesBot;