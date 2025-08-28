/**
 * TransactionEngine processes simple account transactions such as
 * deposits and withdrawals.  Each transaction is recorded in the
 * database and balances are updated accordingly.
 */
class TransactionEngine {
  constructor(db) {
    this.db = db;
  }
  processTransaction(data) {
    const type = data.type;
    const accountId = Number(data.account_id);
    const amount = Number(data.amount);
    if (!accountId || amount <= 0) {
      return { success: false, message: 'Invalid transaction data.' };
    }
    if (type === 'deposit') {
      const newBal = this.db.adjustBalance(accountId, amount);
      const txnId = this.db.recordTransaction({ type: 'deposit', to_account: accountId, amount });
      return { success: true, transaction_id: txnId, new_balance: newBal };
    } else if (type === 'withdrawal') {
      const bal = this.db.getBalance(accountId);
      if (bal < amount) return { success: false, message: 'Insufficient funds.' };
      const newBal = this.db.adjustBalance(accountId, -amount);
      const txnId = this.db.recordTransaction({ type: 'withdrawal', from_account: accountId, amount });
      return { success: true, transaction_id: txnId, new_balance: newBal };
    }
    return { success: false, message: 'Unknown transaction type.' };
  }
}
module.exports = TransactionEngine;