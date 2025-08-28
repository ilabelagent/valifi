const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * EscrowBot handles creation, release and dispute of fiat and
 * crypto escrows.  Supports simple arbitration and status
 * tracking.  Escrows are stored persistently.
 */
class EscrowBot extends KingdomBot {
  async initialize() {
    this.logDivineAction('Escrow Bot Initialized');
    return true;
  }
  _getData() {
    const { readData } = require('../../lib/storage');
    const data = readData('data/escrow.json');
    data.escrows = data.escrows || [];
    return data;
  }
  _saveData(data) {
    const { writeData } = require('../../lib/storage');
    writeData('data/escrow.json', data);
  }
  /**
   * Create a crypto escrow using 2-of-3 arrangement.  Records
   * participants and asset details.  Returns the escrow record.
   */
  createCryptoEscrow({ orderId, buyerId, sellerId, asset, chain, amount }) {
    if (!orderId || !buyerId || !sellerId || !asset || !chain || !amount) {
      return { success: false, message: 'Missing required fields' };
    }
    const data = this._getData();
    const escrow = {
      id: `escrow_${Date.now()}`,
      type: 'crypto',
      orderId,
      buyerId,
      sellerId,
      asset,
      chain,
      amount: Number(amount),
      status: 'open',
      dispute: null,
      createdAt: new Date().toISOString(),
    };
    data.escrows.push(escrow);
    this._saveData(data);
    this.logDivineAction('Crypto Escrow Created', { escrow });
    return { success: true, escrow };
  }
  /**
   * Create a fiat escrow.  Records currency and amount.  In
   * production this would interact with payment processors.
   */
  createFiatEscrow({ orderId, buyerId, sellerId, amount, currency }) {
    if (!orderId || !buyerId || !sellerId || !amount || !currency) {
      return { success: false, message: 'Missing required fields' };
    }
    const data = this._getData();
    const escrow = {
      id: `escrow_${Date.now()}`,
      type: 'fiat',
      orderId,
      buyerId,
      sellerId,
      amount: Number(amount),
      currency,
      status: 'open',
      dispute: null,
      createdAt: new Date().toISOString(),
    };
    data.escrows.push(escrow);
    this._saveData(data);
    this.logDivineAction('Fiat Escrow Created', { escrow });
    return { success: true, escrow };
  }
  /**
   * Release an escrow.  Moves funds to the seller and closes the
   * escrow.  We simply update the status here.  In production,
   * this would sign transactions or instruct fiat payouts.
   */
  release({ escrowId, releasedBy }) {
    const data = this._getData();
    const escrow = data.escrows.find((e) => e.id === escrowId);
    if (!escrow) return { success: false, message: 'Escrow not found' };
    if (escrow.status !== 'open' && escrow.status !== 'in_dispute') return { success: false, message: 'Escrow cannot be released' };
    escrow.status = 'released';
    escrow.releasedBy = releasedBy || 'system';
    escrow.releasedAt = new Date().toISOString();
    this._saveData(data);
    this.logDivineAction('Escrow Released', { escrowId, releasedBy });
    return { success: true, escrow };
  }
  /**
   * Raise a dispute on an escrow.  Records the reason and
   * changes status.  Further actions should be handled by
   * moderators/arbiters.
   */
  dispute({ escrowId, raiserId, reason }) {
    if (!escrowId || !reason) return { success: false, message: 'escrowId and reason required' };
    const data = this._getData();
    const escrow = data.escrows.find((e) => e.id === escrowId);
    if (!escrow) return { success: false, message: 'Escrow not found' };
    escrow.status = 'in_dispute';
    escrow.dispute = { raisedBy: raiserId || 'unknown', reason, raisedAt: new Date().toISOString() };
    this._saveData(data);
    this.logDivineAction('Escrow Disputed', { escrowId, raiserId, reason });
    return { success: true, escrow };
  }
  /**
   * Get the current status of an escrow.
   */
  status({ escrowId }) {
    const data = this._getData();
    const escrow = data.escrows.find((e) => e.id === escrowId);
    if (!escrow) return { success: false, message: 'Escrow not found' };
    return { success: true, escrow };
  }
  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'create_crypto_escrow':
        return this.createCryptoEscrow(params);
      case 'create_fiat_escrow':
        return this.createFiatEscrow(params);
      case 'release':
        return this.release(params);
      case 'dispute':
        return this.dispute(params);
      case 'status':
        return this.status(params);
      default:
        return { success: false, message: `Unknown action for EscrowBot: ${action}` };
    }
  }
}

module.exports = EscrowBot;