/**
 * AccountManager handles creation of new accounts.  It delegates
 * storage to the shared DatabaseKingdom.  Additional logic such as
 * KYC or AML checks could be added here.
 */
class AccountManager {
  constructor(db) {
    this.db = db;
  }
  createAccount(data) {
    // data may include name, email, etc.
    const accountId = this.db.createAccount(data);
    return accountId;
  }
}
module.exports = AccountManager;