const KingdomBot = require('../../lib/core/KingdomBot');
const { readData, writeData } = require('../../lib/storage');

/**
 * PaymentBot simulates a payment and card management system.  It
 * allows issuance of debit, credit and virtual cards, processing
 * payments with basic fee and cashback logic, and tracking
 * transactions and reward points.  Balances for debit and credit
 * cards are maintained separately and persisted on disk.  No
 * connection to actual payment networks is performed.
 */
class PaymentBot extends KingdomBot {
  async initialize() {
    this.logDivineAction('Payment Bot Initialized');
    return true;
  }

  _getData() {
    const data = readData('data/payment.json');
    if (!data.cards) data.cards = {};
    if (!data.transactions) data.transactions = {};
    if (!data.rewards) data.rewards = {};
    return data;
  }
  _saveData(data) {
    writeData('data/payment.json', data);
  }

  /**
   * Issue a new debit card for a user.  Debit cards start with a
   * zero balance and may be loaded via external funding methods
   * (not implemented).  Cards are denominated in a currency.
   */
  issueDebitCard({ userId = 'default', currency = 'USD' }) {
    const data = this._getData();
    const cards = data.cards[userId] || [];
    const card = {
      id: `card_${Date.now()}`,
      type: 'debit',
      currency: currency.toUpperCase(),
      balance: 0,
    };
    cards.push(card);
    data.cards[userId] = cards;
    this._saveData(data);
    this.logDivineAction('Debit Card Issued', { userId, card });
    return { success: true, card };
  }

  /**
   * Issue a new credit card with a specified credit limit.  A
   * credit card tracks the outstanding balance and available
   * credit.  Interest and minimum payments are not simulated.
   */
  issueCreditCard({ userId = 'default', currency = 'USD', limit = 5000 }) {
    const data = this._getData();
    const cards = data.cards[userId] || [];
    const card = {
      id: `card_${Date.now()}`,
      type: 'credit',
      currency: currency.toUpperCase(),
      creditLimit: Number(limit),
      availableCredit: Number(limit),
    };
    cards.push(card);
    data.cards[userId] = cards;
    this._saveData(data);
    this.logDivineAction('Credit Card Issued', { userId, card });
    return { success: true, card };
  }

  /**
   * Create a virtual card linked to an existing card.  Virtual
   * cards are useful for online transactions and share the same
   * balance/credit as the parent card.
   */
  createVirtualCard({ userId = 'default', parentCardId }) {
    if (!parentCardId) return { success: false, message: 'Missing parentCardId' };
    const data = this._getData();
    const cards = data.cards[userId] || [];
    const parent = cards.find((c) => c.id === parentCardId);
    if (!parent) return { success: false, message: 'Parent card not found' };
    const vcard = {
      id: `vcard_${Date.now()}`,
      type: 'virtual',
      currency: parent.currency,
      parentId: parent.id,
    };
    cards.push(vcard);
    data.cards[userId] = cards;
    this._saveData(data);
    this.logDivineAction('Virtual Card Created', { userId, card: vcard });
    return { success: true, card: vcard };
  }

  /**
   * Process a payment using a specified card.  For debit cards,
   * the balance is deducted.  For credit cards, the available
   * credit is reduced.  A 1% cashback reward is applied to all
   * purchases.  Cross‑border payments may incur an additional
   * fee of 2% which is deducted from the payment amount.
   */
  processPayment({ userId = 'default', cardId, amount, currency = 'USD', merchant = 'Unknown', crossBorder = false }) {
    const amt = Number(amount);
    if (!cardId || !amt || amt <= 0) {
      return { success: false, message: 'Missing or invalid payment parameters' };
    }
    const data = this._getData();
    const cards = data.cards[userId] || [];
    const card = cards.find((c) => c.id === cardId);
    if (!card) return { success: false, message: 'Card not found' };
    let total = amt;
    let fee = 0;
    if (crossBorder) {
      fee = amt * 0.02;
      total += fee;
    }
    let success = true;
    let error;
    if (card.type === 'debit') {
      if (card.balance < total) {
        success = false;
        error = 'Insufficient funds';
      } else {
        card.balance -= total;
      }
    } else if (card.type === 'credit') {
      if (card.availableCredit < total) {
        success = false;
        error = 'Credit limit exceeded';
      } else {
        card.availableCredit -= total;
      }
    } else if (card.type === 'virtual') {
      // Virtual card uses parent card for limits
      const parent = cards.find((c) => c.id === card.parentId);
      if (!parent) return { success: false, message: 'Parent card not found for virtual card' };
      if (parent.type === 'debit') {
        if (parent.balance < total) { success = false; error = 'Insufficient funds'; } else { parent.balance -= total; }
      } else {
        if (parent.availableCredit < total) { success = false; error = 'Credit limit exceeded'; } else { parent.availableCredit -= total; }
      }
    }
    if (!success) {
      return { success: false, message: error };
    }
    // Update rewards: 1% cashback on purchase amount (before fees)
    const cashback = amt * 0.01;
    const rewards = data.rewards[userId] || { totalCashback: 0 };
    rewards.totalCashback += cashback;
    data.rewards[userId] = rewards;
    // Record transaction
    const txs = data.transactions[userId] || [];
    const tx = {
      id: `txn_${Date.now()}`,
      cardId,
      amount: amt,
      currency: currency.toUpperCase(),
      merchant,
      crossBorder: !!crossBorder,
      fee: parseFloat(fee.toFixed(2)),
      cashback: parseFloat(cashback.toFixed(2)),
      timestamp: new Date().toISOString(),
    };
    txs.push(tx);
    data.transactions[userId] = txs;
    this._saveData(data);
    this.logDivineAction('Payment Processed', { userId, tx });
    return { success: true, transaction: tx, card }; 
  }

  /**
   * Retrieve all cards for a user.
   */
  getCards({ userId = 'default' }) {
    const data = this._getData();
    return { success: true, cards: data.cards[userId] || [] };
  }

  /**
   * Retrieve transaction history for a user.
   */
  getTransactions({ userId = 'default' }) {
    const data = this._getData();
    return { success: true, transactions: data.transactions[userId] || [] };
  }

  /**
   * Get the accumulated cashback rewards for a user.
   */
  getRewards({ userId = 'default' }) {
    const data = this._getData();
    const rewards = data.rewards[userId] || { totalCashback: 0 };
    return { success: true, totalCashback: parseFloat(rewards.totalCashback.toFixed(2)) };
  }

  /**
   * Provide simple spending analytics for a user.  Aggregates total
   * spending by merchant and returns a summary.  Useful for
   * budgeting and expense tracking.
   */
  getSpendingAnalytics({ userId = 'default' }) {
    const data = this._getData();
    const txs = data.transactions[userId] || [];
    const summary = {};
    txs.forEach((tx) => {
      summary[tx.merchant] = (summary[tx.merchant] || 0) + tx.amount;
    });
    // Convert to array with totals
    const analytics = Object.keys(summary).map((m) => ({ merchant: m, total: parseFloat(summary[m].toFixed(2)) }));
    return { success: true, analytics };
  }

  /**
   * Link a card to a mobile wallet (Apple Pay or Google Pay).  This
   * action creates a token to represent the mobile wallet enrolment.
   */
  enableMobilePay({ userId = 'default', cardId, provider }) {
    const allowed = ['apple', 'google'];
    if (!cardId || !provider || !allowed.includes(provider.toLowerCase())) {
      return { success: false, message: 'Missing or invalid provider/cardId' };
    }
    const data = this._getData();
    const cards = data.cards[userId] || [];
    const card = cards.find((c) => c.id === cardId);
    if (!card) return { success: false, message: 'Card not found' };
    // generate token
    const token = `${provider.toLowerCase()}_${card.id}_${Date.now()}`;
    card.mobilePay = { provider: provider.toLowerCase(), token };
    this._saveData(data);
    this.logDivineAction('Mobile Pay Enabled', { userId, cardId, provider });
    return { success: true, token };
  }

  /**
   * Perform a bank wire transfer from a card.  Only debit cards can
   * be used for wire transfers.  Supports ACH, SWIFT and SEPA.  Fees
   * vary by transfer type.  The transfer amount is deducted from the
   * card balance.  A transaction record is stored.
   */
  wireTransfer({ userId = 'default', cardId, amount, currency = 'USD', bankType = 'ACH', destinationBank, recipient }) {
    const amt = Number(amount);
    const supported = ['ACH','SWIFT','SEPA'];
    if (!cardId || !amt || amt <= 0 || !supported.includes(bankType.toUpperCase())) {
      return { success: false, message: 'Invalid wire transfer parameters' };
    }
    const data = this._getData();
    const cards = data.cards[userId] || [];
    const card = cards.find((c) => c.id === cardId);
    if (!card) return { success: false, message: 'Card not found' };
    if (card.type !== 'debit') {
      return { success: false, message: 'Wire transfers are only supported for debit cards' };
    }
    // fees: ACH 0.5%, SWIFT 1.5%, SEPA 0.8%
    const feeRates = { ACH: 0.005, SWIFT: 0.015, SEPA: 0.008 };
    const fee = amt * feeRates[bankType.toUpperCase()];
    const total = amt + fee;
    if (card.balance < total) {
      return { success: false, message: 'Insufficient funds for wire transfer' };
    }
    card.balance -= total;
    // record transaction
    const txs = data.transactions[userId] || [];
    const tx = {
      id: `wire_${Date.now()}`,
      cardId,
      type: 'wire',
      amount: amt,
      fee: parseFloat(fee.toFixed(2)),
      bankType: bankType.toUpperCase(),
      destinationBank,
      recipient,
      currency: currency.toUpperCase(),
      timestamp: new Date().toISOString(),
    };
    txs.push(tx);
    data.transactions[userId] = txs;
    this._saveData(data);
    this.logDivineAction('Wire Transfer', { userId, tx });
    return { success: true, transaction: tx };
  }

  /**
   * Process a merchant payment.  This is similar to processPayment
   * but tags the transaction as 'merchant' and allows recurring
   * payments.  For recurring payments, a schedule (in days) can
   * be provided.  Recurring transactions are recorded and can be
   * triggered externally via a job scheduler.
   */
  merchantPayment({ userId = 'default', cardId, amount, merchant = 'Unknown', currency = 'USD', crossBorder = false, recurring = false, intervalDays = 0 }) {
    // Use processPayment logic
    const result = this.processPayment({ userId, cardId, amount, currency, merchant, crossBorder });
    if (!result.success) return result;
    const data = this._getData();
    // mark last transaction as merchant
    const tx = result.transaction;
    tx.type = 'merchant';
    tx.recurring = !!recurring;
    tx.intervalDays = recurring ? Number(intervalDays) || 30 : 0;
    // update transaction record with recurrence
    const txs = data.transactions[userId] || [];
    txs[txs.length - 1] = tx;
    data.transactions[userId] = txs;
    this._saveData(data);
    this.logDivineAction('Merchant Payment', { userId, tx });
    return { success: true, transaction: tx };
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'issue_debit_card':
        return this.issueDebitCard(params);
      case 'issue_credit_card':
        return this.issueCreditCard(params);
      case 'create_virtual_card':
        return this.createVirtualCard(params);
      case 'process_payment':
        return this.processPayment(params);
      case 'get_cards':
        return this.getCards(params);
      case 'get_transactions':
        return this.getTransactions(params);
      case 'get_rewards':
        return this.getRewards(params);
      case 'get_spending_analytics':
        return this.getSpendingAnalytics(params);
      case 'enable_mobile_pay':
        return this.enableMobilePay(params);
      case 'wire_transfer':
        return this.wireTransfer(params);
      case 'merchant_payment':
        return this.merchantPayment(params);
      default:
        return { success: false, message: `Unknown action for PaymentBot: ${action}` };
    }
  }
}

module.exports = PaymentBot;