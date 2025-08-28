/**
 * DatabaseKingdom provides an in‑memory data store for accounts,
 * balances, and transactions.  It offers simple CRUD methods
 * comparable to the PHP version.  For production you would replace
 * this with a proper database layer.
 */
class DatabaseKingdom {
  constructor() {
    this.nextAccountId = 1;
    this.accounts = {};
    this.balances = {};
    this.transactions = {};
    this.nextTransactionId = 1;
  }
  createAccount(data) {
    const id = this.nextAccountId++;
    this.accounts[id] = data;
    this.balances[id] = 0;
    return id;
  }
  getAccount(id) {
    return this.accounts[id] || null;
  }
  getBalance(id) {
    return this.balances[id] || 0;
  }
  setBalance(id, bal) {
    this.balances[id] = bal;
  }
  adjustBalance(id, delta) {
    const bal = this.getBalance(id) + delta;
    this.balances[id] = bal;
    return bal;
  }
  recordTransaction(data) {
    const tid = this.nextTransactionId++;
    this.transactions[tid] = { id: tid, timestamp: Date.now(), ...data };
    return tid;
  }
  listTransactions(id) {
    return Object.values(this.transactions).filter(
      (t) => t.from_account === id || t.to_account === id,
    );
  }
}
module.exports = DatabaseKingdom;