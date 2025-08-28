const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * MultiSigBot scaffolds multi‑signature wallet creation and
 * management.  It will allow adding/removing signers and signing
 * transactions.  Currently all actions are placeholders.
 */
class MultiSigBot extends KingdomBot {
  async initialize() {
    this.logDivineAction('MultiSig Bot Initialized');
    return true;
  }

  _getData() {
    const { readData } = require('../../lib/storage');
    const data = readData('data/multisig.json');
    data.wallets = data.wallets || {};
    data.transactions = data.transactions || {};
    return data;
  }
  _saveData(data) {
    const { writeData } = require('../../lib/storage');
    writeData('data/multisig.json', data);
  }

  /**
   * Create a new multi‑signature wallet with a list of owners and
   * a required threshold of signatures.  Stores the wallet in
   * persistent storage.
   */
  createMultisig({ walletId, owners = [], threshold = 2 }) {
    if (!owners || owners.length < threshold) {
      return { success: false, message: 'Owners count must be >= threshold' };
    }
    const data = this._getData();
    const id = walletId || `msw_${Date.now()}`;
    if (data.wallets[id]) return { success: false, message: 'Wallet already exists' };
    data.wallets[id] = {
      id,
      owners,
      threshold: Number(threshold),
      transactions: {},
    };
    this._saveData(data);
    this.logDivineAction('Multisig Wallet Created', { id, owners, threshold });
    return { success: true, wallet: data.wallets[id] };
  }

  /**
   * Add a signer to an existing multi‑sig wallet.
   */
  addSigner({ walletId, signer }) {
    const data = this._getData();
    const wallet = data.wallets[walletId];
    if (!wallet) return { success: false, message: 'Wallet not found' };
    if (!signer) return { success: false, message: 'signer required' };
    if (!wallet.owners.includes(signer)) {
      wallet.owners.push(signer);
      this._saveData(data);
    }
    return { success: true, owners: wallet.owners };
  }

  /**
   * Remove a signer from the wallet.  Cannot remove if it would
   * reduce owners below threshold.
   */
  removeSigner({ walletId, signer }) {
    const data = this._getData();
    const wallet = data.wallets[walletId];
    if (!wallet) return { success: false, message: 'Wallet not found' };
    if (!signer) return { success: false, message: 'signer required' };
    if (wallet.owners.length - 1 < wallet.threshold) {
      return { success: false, message: 'Cannot remove signer below threshold' };
    }
    wallet.owners = wallet.owners.filter((o) => o !== signer);
    this._saveData(data);
    return { success: true, owners: wallet.owners };
  }

  /**
   * Propose a transaction for the multisig wallet.  The
   * transaction is stored with its desired action and awaits
   * signatures.  Each transaction records which owners have
   * signed and whether it has been executed.
   */
  createTransaction({ walletId, txId, payload }) {
    const data = this._getData();
    const wallet = data.wallets[walletId];
    if (!wallet) return { success: false, message: 'Wallet not found' };
    const id = txId || `mtx_${Date.now()}`;
    wallet.transactions[id] = {
      id,
      payload,
      signatures: [],
      executed: false,
    };
    this._saveData(data);
    return { success: true, transaction: wallet.transactions[id] };
  }

  /**
   * Sign a pending transaction.  Adds the signer to the list of
   * signatures.  If the number of signatures meets or exceeds
   * the threshold, the transaction is marked as executed.
   */
  signTransaction({ walletId, txId, signer }) {
    const data = this._getData();
    const wallet = data.wallets[walletId];
    if (!wallet) return { success: false, message: 'Wallet not found' };
    const tx = wallet.transactions[txId];
    if (!tx) return { success: false, message: 'Transaction not found' };
    if (!wallet.owners.includes(signer)) return { success: false, message: 'Signer not authorised' };
    if (tx.executed) return { success: false, message: 'Transaction already executed' };
    if (!tx.signatures.includes(signer)) {
      tx.signatures.push(signer);
      // check threshold
      if (tx.signatures.length >= wallet.threshold) {
        tx.executed = true;
        // In a real implementation, this is where the payload would
        // be executed on-chain.  We just mark executed here.
      }
      this._saveData(data);
    }
    return { success: true, transaction: tx };
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'create_multisig':
        return this.createMultisig(params);
      case 'add_signer':
        return this.addSigner(params);
      case 'remove_signer':
        return this.removeSigner(params);
      case 'create_transaction':
        return this.createTransaction(params);
      case 'sign_transaction':
        return this.signTransaction(params);
      default:
        return { success: false, message: `Unknown action for MultiSigBot: ${action}` };
    }
  }
}

module.exports = MultiSigBot;