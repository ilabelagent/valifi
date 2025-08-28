const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * IRABot is a scaffold for traditional and Roth IRA account
 * management.  It will manage contributions, conversions and
 * distributions.  Current actions are not yet implemented.
 */
class IRABot extends KingdomBot {
  constructor(core) {
    super(core);
    this.dataFile = 'data/ira.json';
    const { readData } = require('../../lib/storage');
    this.accounts = readData(this.dataFile); // { userId: [ { id, type, balance } ] }
  }

  async initialize() {
    this.logDivineAction('IRA Bot Initialized');
    return true;
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'create_account':
        return this.createAccount(params);
      case 'add_contribution':
        return this.addContribution(params);
      case 'get_balance':
        return this.getBalance(params);
      case 'withdraw':
        return this.withdraw(params);
      case 'convert':
        return this.convert(params);
      default:
        return { success: false, message: `Unknown action for IRABot: ${action}` };
    }
  }

  /**
   * Create a new IRA account for a user.  Type may be "traditional" or "roth".
   */
  createAccount({ userId, type }) {
    const { writeData } = require('../../lib/storage');
    userId = userId || 'default';
    type = (type || 'traditional').toLowerCase();
    const id = `ira_${Date.now()}`;
    const account = { id, type, balance: 0 };
    if (!this.accounts[userId]) this.accounts[userId] = [];
    this.accounts[userId].push(account);
    writeData(this.dataFile, this.accounts);
    this.logDivineAction('IRA Account Created', { userId, account });
    return { success: true, account };
  }

  /**
   * Add a contribution to an IRA account.
   */
  addContribution({ accountId, amount }) {
    const { writeData } = require('../../lib/storage');
    const amt = Number(amount);
    if (!accountId || amt <= 0) return { success: false, message: 'Invalid accountId or amount' };
    for (const uid in this.accounts) {
      const acc = this.accounts[uid].find((a) => a.id === accountId);
      if (acc) {
        acc.balance += amt;
        writeData(this.dataFile, this.accounts);
        this.logDivineAction('IRA Contribution', { accountId, amount: amt, newBalance: acc.balance });
        return { success: true, accountId, balance: acc.balance };
      }
    }
    return { success: false, message: 'Account not found' };
  }

  /**
   * Get the balance of an IRA account.
   */
  getBalance({ accountId }) {
    if (!accountId) return { success: false, message: 'Missing accountId' };
    for (const uid in this.accounts) {
      const acc = this.accounts[uid].find((a) => a.id === accountId);
      if (acc) return { success: true, accountId, balance: acc.balance, type: acc.type };
    }
    return { success: false, message: 'Account not found' };
  }

  /**
   * Withdraw funds from an IRA account.
   */
  withdraw({ accountId, amount }) {
    const { writeData } = require('../../lib/storage');
    const amt = Number(amount);
    if (!accountId || amt <= 0) return { success: false, message: 'Invalid accountId or amount' };
    for (const uid in this.accounts) {
      const acc = this.accounts[uid].find((a) => a.id === accountId);
      if (acc) {
        if (acc.balance < amt) return { success: false, message: 'Insufficient balance' };
        acc.balance -= amt;
        writeData(this.dataFile, this.accounts);
        this.logDivineAction('IRA Withdrawal', { accountId, amount: amt, newBalance: acc.balance });
        return { success: true, accountId, balance: acc.balance };
      }
    }
    return { success: false, message: 'Account not found' };
  }

  /**
   * Convert an IRA account from traditional to Roth or vice versa.
   */
  convert({ accountId, toType }) {
    const { writeData } = require('../../lib/storage');
    toType = (toType || '').toLowerCase();
    if (!accountId || !toType || !['traditional', 'roth'].includes(toType)) {
      return { success: false, message: 'Invalid accountId or toType' };
    }
    for (const uid in this.accounts) {
      const acc = this.accounts[uid].find((a) => a.id === accountId);
      if (acc) {
        acc.type = toType;
        writeData(this.dataFile, this.accounts);
        this.logDivineAction('IRA Conversion', { accountId, newType: toType });
        return { success: true, accountId, type: toType, balance: acc.balance };
      }
    }
    return { success: false, message: 'Account not found' };
  }
}

module.exports = IRABot;