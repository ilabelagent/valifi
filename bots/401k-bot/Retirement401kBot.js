const KingdomBot = require('../../lib/core/KingdomBot');

const { readData, writeData } = require('../../lib/storage');

/**
 * Retirement401kBot manages employer‑sponsored 401(k) plans.  It
 * supports creating accounts, making contributions, checking
 * balances and withdrawing funds.  Data is stored in
 * `data/401k.json`.
 */
class Retirement401kBot extends KingdomBot {
  constructor(core) {
    super(core);
    this.dataFile = 'data/401k.json';
    this.accounts = readData(this.dataFile);
  }
  async initialize() {
    this.logDivineAction('401k Bot Initialized');
    return true;
  }
  async execute(params = {}) {
    const action = params.action;
    switch (action) {
      case 'create_account':
        return this.createAccount(params);
      case 'add_contribution':
        return this.addContribution(params);
      case 'get_balance':
        return this.getBalance(params);
      case 'withdraw':
        return this.withdraw(params);
      default:
        return { success: false, message: `Unknown action for 401kBot: ${action}` };
    }
  }
  /**
   * Create a new 401(k) account for a user with zero balance.
   */
  createAccount({ userId }) {
    userId = userId || 'default';
    const id = `401k_${Date.now()}`;
    const account = { id, userId, balance: 0 };
    if (!this.accounts[userId]) this.accounts[userId] = [];
    this.accounts[userId].push(account);
    writeData(this.dataFile, this.accounts);
    this.logDivineAction('401k Account Created', account);
    return { success: true, account };
  }
  /**
   * Add a contribution to an existing 401(k) account.
   */
  addContribution({ accountId, amount }) {
    const amt = Number(amount);
    if (!accountId || amt <= 0) {
      return { success: false, message: 'Invalid accountId or amount' };
    }
    for (const uid in this.accounts) {
      const acc = this.accounts[uid].find((a) => a.id === accountId);
      if (acc) {
        acc.balance += amt;
        writeData(this.dataFile, this.accounts);
        this.logDivineAction('401k Contribution', { accountId, amount: amt, newBalance: acc.balance });
        return { success: true, accountId, balance: acc.balance };
      }
    }
    return { success: false, message: 'Account not found' };
  }
  /**
   * Get the balance of a 401(k) account.
   */
  getBalance({ accountId }) {
    if (!accountId) return { success: false, message: 'Missing accountId' };
    for (const uid in this.accounts) {
      const acc = this.accounts[uid].find((a) => a.id === accountId);
      if (acc) return { success: true, accountId, balance: acc.balance };
    }
    return { success: false, message: 'Account not found' };
  }
  /**
   * Withdraw funds from a 401(k) account.
   */
  withdraw({ accountId, amount }) {
    const amt = Number(amount);
    if (!accountId || amt <= 0) {
      return { success: false, message: 'Invalid accountId or amount' };
    }
    for (const uid in this.accounts) {
      const acc = this.accounts[uid].find((a) => a.id === accountId);
      if (acc) {
        if (acc.balance < amt) return { success: false, message: 'Insufficient balance' };
        acc.balance -= amt;
        writeData(this.dataFile, this.accounts);
        this.logDivineAction('401k Withdrawal', { accountId, amount: amt, newBalance: acc.balance });
        return { success: true, accountId, balance: acc.balance };
      }
    }
    return { success: false, message: 'Account not found' };
  }
}

module.exports = Retirement401kBot;