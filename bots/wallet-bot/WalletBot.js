const KingdomBot = require('../../lib/core/KingdomBot');
const crypto = require('crypto');
const { readData, writeData } = require('../../lib/storage');

/**
 * WalletBot manages non‑custodial wallets per user.  Wallet data is
 * stored persistently in `data/wallets.json`.  Each wallet has an id,
 * chain, address and balance.  Addresses are generated using crypto
 * random bytes to simulate HD wallet addresses.  Balances are
 * simulated; in production they should query chain data.
 */
class WalletBot extends KingdomBot {
  constructor(core) {
    super(core);
    this.dataFile = 'data/wallets.json';
    this.wallets = readData(this.dataFile);
  }

  async initialize() {
    this.logDivineAction('Wallet Bot Initialized');
    return true;
  }

  async execute(params = {}) {
    const action = params.action;
    switch (action) {
      case 'create_wallet':
        return this.createWallet(params);
      case 'get_wallets':
        return this.getWallets(params);
      case 'get_balance':
        return this.getBalance(params);
      case 'send':
        return this.send(params);
      default:
        return { success: false, message: `Unknown wallet action: ${action}` };
    }
  }

  /**
   * Generates a new wallet for a user on a given chain.  The address
   * is a hex string derived from random bytes.  Balance starts at 0.
   * @param {{ userId: string, chain: string }} params
   */
  createWallet({ userId, chain }) {
    userId = userId || 'default';
    chain = (chain || 'ETH').toUpperCase();
    const id = `w_${crypto.randomBytes(8).toString('hex')}`;
    const address = '0x' + crypto.randomBytes(20).toString('hex');
    const wallet = { id, userId, chain, address, balance: 0 };
    if (!this.wallets[userId]) this.wallets[userId] = [];
    this.wallets[userId].push(wallet);
    writeData(this.dataFile, this.wallets);
    this.logDivineAction('Wallet Created', wallet);
    return { success: true, wallet };
  }

  /**
   * Returns all wallets for a user.
   * @param {{ userId: string }} params
   */
  getWallets({ userId }) {
    userId = userId || 'default';
    const list = this.wallets[userId] || [];
    return { success: true, userId, wallets: list };
  }

  /**
   * Returns the balance for a given wallet id.
   * @param {{ walletId: string }} params
   */
  getBalance({ walletId }) {
    if (!walletId) return { success: false, message: 'Missing walletId' };
    for (const user in this.wallets) {
      const w = this.wallets[user].find((w) => w.id === walletId);
      if (w) return { success: true, walletId, balance: w.balance, chain: w.chain, address: w.address };
    }
    return { success: false, message: 'Wallet not found' };
  }

  /**
   * Simulates sending tokens from one wallet to another.  Balances are
   * updated locally.  In production this should generate and sign
   * transactions on the appropriate blockchain.
   * @param {{ fromWalletId: string, toAddress: string, amount: number }} params
   */
  send({ fromWalletId, toAddress, amount }) {
    const amt = Number(amount);
    if (!fromWalletId || !toAddress || amt <= 0) {
      return { success: false, message: 'Invalid parameters' };
    }
    // Find the sender wallet
    let sender;
    for (const uid in this.wallets) {
      const w = this.wallets[uid].find((w) => w.id === fromWalletId);
      if (w) { sender = w; break; }
    }
    if (!sender) return { success: false, message: 'Sender wallet not found' };
    if (sender.balance < amt) return { success: false, message: 'Insufficient balance' };
    // Deduct from sender
    sender.balance -= amt;
    // Credit to recipient if exists
    let recipientFound = false;
    for (const uid in this.wallets) {
      const w = this.wallets[uid].find((w) => w.address.toLowerCase() === toAddress.toLowerCase());
      if (w) {
        w.balance += amt;
        recipientFound = true;
        break;
      }
    }
    // Persist changes
    writeData(this.dataFile, this.wallets);
    this.logDivineAction('Transfer Executed', { fromWalletId, toAddress, amount: amt, recipientFound });
    return { success: true, fromWalletId, toAddress, amount: amt, recipientFound };
  }
}

module.exports = WalletBot;