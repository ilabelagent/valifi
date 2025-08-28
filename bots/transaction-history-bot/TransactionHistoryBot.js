const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * TransactionHistoryBot scaffolds retrieval and export of transaction
 * history across the platform.  It will support filtering and
 * exporting to various formats.  All actions currently return not
 * implemented.
 */
class TransactionHistoryBot extends KingdomBot {
  async initialize() {
    this.logDivineAction('Transaction History Bot Initialized');
    return true;
  }

  _getPaymentData() {
    const { readData } = require('../../lib/storage');
    // Reuse payment data for transaction history; other bots could be added here
    return readData('data/payment.json');
  }

  /**
   * Retrieve combined transaction history for a user from all
   * supported bots.  Currently only returns payment transactions.
   */
  getHistory({ userId = 'default' }) {
    const paymentData = this._getPaymentData();
    const paymentTxs = paymentData.transactions && paymentData.transactions[userId] ? paymentData.transactions[userId] : [];
    // Additional transaction sources (trades, lending, etc.) could be appended here
    const history = paymentTxs.map((tx) => Object.assign({ source: 'payment' }, tx));
    // sort by timestamp descending
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return { success: true, transactions: history };
  }

  /**
   * Export transaction history to CSV format.  Returns a CSV
   * string.  Only includes payment transactions for now.
   */
  exportCsv({ userId = 'default' }) {
    const { transactions } = this.getHistory({ userId });
    if (!transactions || transactions.length === 0) {
      return { success: false, message: 'No transactions to export' };
    }
    const headers = Object.keys(transactions[0]);
    const rows = [headers.join(',')];
    transactions.forEach((tx) => {
      const values = headers.map((h) => JSON.stringify(tx[h] ?? ''));
      rows.push(values.join(','));
    });
    const csv = rows.join('\n');
    return { success: true, csv };
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'get_history':
        return this.getHistory(params);
      case 'export_csv':
        return this.exportCsv(params);
      default:
        return { success: false, message: `Unknown action for TransactionHistoryBot: ${action}` };
    }
  }
}

module.exports = TransactionHistoryBot;