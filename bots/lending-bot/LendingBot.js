const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * LendingBot scaffolds decentralized lending and borrowing.  It
 * supports deposit, borrow, repay and position management.  Actions
 * currently return not implemented.
 */
const { readData, writeData } = require('../../lib/storage');

/**
 * LendingBot offers a simple simulation of decentralized lending
 * markets.  Users can deposit tokens to earn interest, borrow
 * tokens against their deposits, repay loans and view their
 * lending positions.  Interest rates are fixed per token in this
 * implementation.
 */
class LendingBot extends KingdomBot {
  async initialize() {
    this.logDivineAction('Lending Bot Initialized');
    return true;
  }

  _getData() {
    const data = readData('data/lending.json');
    if (!data.deposits) data.deposits = {};
    if (!data.debts) data.debts = {};
    if (!data.rates) {
      data.rates = {
        USDT: { depositAPY: 0.05, borrowAPR: 0.1 },
        USDC: { depositAPY: 0.05, borrowAPR: 0.1 },
        DAI: { depositAPY: 0.04, borrowAPR: 0.09 },
      };
    }
    return data;
  }
  _saveData(data) {
    writeData('data/lending.json', data);
  }

  /**
   * Deposit an amount of a token.  Increments the user's deposit
   * balance.  Interest is not accrued in this simplified version.
   */
  deposit({ userId = 'default', token, amount }) {
    const amt = Number(amount);
    if (!token || !amt || amt <= 0) return { success: false, message: 'Missing or invalid deposit parameters' };
    const data = this._getData();
    const dep = data.deposits[userId] || {};
    dep[token.toUpperCase()] = (dep[token.toUpperCase()] || 0) + amt;
    data.deposits[userId] = dep;
    this._saveData(data);
    this.logDivineAction('Lending Deposit', { userId, token: token.toUpperCase(), amount: amt });
    return { success: true, token: token.toUpperCase(), amount: dep[token.toUpperCase()] };
  }

  /**
   * Borrow an amount of a token.  Adds to the user's debt.  No
   * collateral checks are performed in this simplified version.
   */
  borrow({ userId = 'default', token, amount }) {
    const amt = Number(amount);
    if (!token || !amt || amt <= 0) return { success: false, message: 'Missing or invalid borrow parameters' };
    const data = this._getData();
    const debts = data.debts[userId] || {};
    debts[token.toUpperCase()] = (debts[token.toUpperCase()] || 0) + amt;
    data.debts[userId] = debts;
    this._saveData(data);
    this.logDivineAction('Lending Borrow', { userId, token: token.toUpperCase(), amount: amt });
    return { success: true, token: token.toUpperCase(), amount: debts[token.toUpperCase()] };
  }

  /**
   * Repay a debt.  Decreases the user's borrowed amount for the
   * given token.
   */
  repay({ userId = 'default', token, amount }) {
    const amt = Number(amount);
    if (!token || !amt || amt <= 0) return { success: false, message: 'Missing or invalid repay parameters' };
    const data = this._getData();
    const debts = data.debts[userId] || {};
    const current = debts[token.toUpperCase()] || 0;
    if (current < amt) return { success: false, message: 'Repay amount exceeds debt' };
    debts[token.toUpperCase()] = current - amt;
    data.debts[userId] = debts;
    this._saveData(data);
    this.logDivineAction('Lending Repay', { userId, token: token.toUpperCase(), amount: amt });
    return { success: true, token: token.toUpperCase(), remaining: debts[token.toUpperCase()] };
  }

  /**
   * Return the deposits and debts for a user.
   */
  getPositions({ userId = 'default' }) {
    const data = this._getData();
    const deposits = data.deposits[userId] || {};
    const debts = data.debts[userId] || {};
    return { success: true, deposits, debts };
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'deposit':
        return this.deposit(params);
      case 'borrow':
        return this.borrow(params);
      case 'repay':
        return this.repay(params);
      case 'get_positions':
        return this.getPositions(params);
      default:
        return { success: false, message: `Unknown action for LendingBot: ${action}` };
    }
  }
}

module.exports = LendingBot;