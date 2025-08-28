const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * MultiChainBot scaffolds support for transferring assets across
 * multiple blockchains.  It will handle chain discovery, balance
 * queries and cross‑chain transfers.  Actions currently return
 * not implemented.
 */
const { readData, writeData } = require('../../lib/storage');

/**
 * MultiChainBot handles balances across multiple blockchains and
 * transfers between addresses.  It supports querying supported
 * chains, checking balances and sending tokens.  Balances are
 * stored per user, per chain and per token in a persistent data
 * store.
 */
class MultiChainBot extends KingdomBot {
  async initialize() {
    this.logDivineAction('MultiChain Bot Initialized');
    return true;
  }

  _getData() {
    const data = readData('data/multichain.json');
    if (!data.balances) data.balances = {};
    if (!data.chains) data.chains = ['Ethereum', 'Binance', 'Polygon', 'Solana', 'Cardano'];
    if (!data.tokens) data.tokens = ['ETH', 'USDT', 'DAI', 'BNB', 'MATIC', 'ADA'];
    return data;
  }
  _saveData(data) {
    writeData('data/multichain.json', data);
  }

  /**
   * Return the list of supported chains.
   */
  getChains() {
    const data = this._getData();
    return { success: true, chains: data.chains };
  }

  /**
   * Get the balance of a token on a specific chain for a user.  If
   * no balance exists, returns 0.
   */
  getBalance({ userId = 'default', chain, token }) {
    if (!chain || !token) {
      return { success: false, message: 'Missing chain or token' };
    }
    const data = this._getData();
    const balances = data.balances[userId] || {};
    const chainBalances = balances[chain] || {};
    const bal = chainBalances[token.toUpperCase()] || 0;
    return { success: true, chain, token: token.toUpperCase(), balance: bal };
  }

  /**
   * Transfer a token amount from the user's address on a chain to
   * another address.  Only deducts from the user's balance and
   * records the transfer.  Does not credit the destination in this
   * simplified version.
   */
  transfer({ userId = 'default', chain, token, amount, to }) {
    const amt = Number(amount);
    if (!chain || !token || !to || !amt || amt <= 0) {
      return { success: false, message: 'Missing or invalid transfer parameters' };
    }
    const data = this._getData();
    const balances = data.balances[userId] || {};
    const chainBalances = balances[chain] || {};
    const current = chainBalances[token.toUpperCase()] || 0;
    if (current < amt) {
      return { success: false, message: `Insufficient ${token} balance on ${chain}` };
    }
    chainBalances[token.toUpperCase()] = current - amt;
    balances[chain] = chainBalances;
    data.balances[userId] = balances;
    this._saveData(data);
    this.logDivineAction('MultiChain Transfer', { userId, chain, token: token.toUpperCase(), amount: amt, to });
    return { success: true, chain, token: token.toUpperCase(), amount: amt, to };
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'get_chains':
        return this.getChains(params);
      case 'get_balance':
        return this.getBalance(params);
      case 'transfer':
        return this.transfer(params);
      default:
        return { success: false, message: `Unknown action for MultiChainBot: ${action}` };
    }
  }
}

module.exports = MultiChainBot;