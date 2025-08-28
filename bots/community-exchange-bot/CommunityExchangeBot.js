const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * CommunityExchangeBot facilitates peer‑to‑peer OTC crypto trades.
 * Verified providers can respond to buy/sell orders posted by
 * users.  Providers earn a service fee (default 7–10%) per
 * transaction.  All trades go through the EscrowBot for safe
 * settlement.  Orders, offers and deals are persisted to disk.
 */
class CommunityExchangeBot extends KingdomBot {
  async initialize() {
    this.logDivineAction('Community Exchange Bot Initialized');
    return true;
  }
  // Helper to read/write persistent state
  _getData() {
    const { readData } = require('../../lib/storage');
    const data = readData('data/community_exchange.json');
    data.orders = data.orders || [];
    data.offers = data.offers || [];
    data.deals = data.deals || [];
    return data;
  }
  _saveData(data) {
    const { writeData } = require('../../lib/storage');
    writeData('data/community_exchange.json', data);
  }
  /**
   * Create a new OTC order.  Users specify the asset, chain,
   * amount, currency, payment method and service fee bounds.
   */
  createOrder({ userId = 'default', side, asset, chain, amount, currency, payMethod, feeMin = 0.07, feeMax = 0.10, slaMinutes = 60 }) {
    if (!side || !asset || !chain || !amount || !currency || !payMethod) {
      return { success: false, message: 'Missing required order fields' };
    }
    const data = this._getData();
    const order = {
      id: `order_${Date.now()}`,
      userId,
      side,
      asset,
      chain,
      amount: Number(amount),
      currency,
      payMethod,
      feeMin: Number(feeMin),
      feeMax: Number(feeMax),
      slaMinutes: Number(slaMinutes),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    data.orders.push(order);
    this._saveData(data);
    this.logDivineAction('OTC Order Created', { order });
    return { success: true, order };
  }
  /**
   * Providers submit offers for an existing order.  Fee must fall
   * within the requested range.  Records the offer with a
   * pending status.
   */
  submitOffer({ providerId, orderId, price, fee, timeToFund }) {
    if (!providerId || !orderId || !price || !fee || !timeToFund) {
      return { success: false, message: 'Missing required offer fields' };
    }
    const data = this._getData();
    const order = data.orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };
    // Ensure fee within bounds
    const f = Number(fee);
    if (f < order.feeMin || f > order.feeMax) {
      return { success: false, message: `Fee must be between ${order.feeMin*100}% and ${order.feeMax*100}%` };
    }
    const offer = {
      id: `offer_${Date.now()}`,
      orderId,
      providerId,
      price: Number(price),
      fee: f,
      timeToFund: Number(timeToFund),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    data.offers.push(offer);
    this._saveData(data);
    this.logDivineAction('OTC Offer Submitted', { offer });
    return { success: true, offer };
  }
  /**
   * List all offers for a given order.  Optionally filter by
   * providerId.
   */
  listOffers({ orderId, providerId }) {
    const data = this._getData();
    let offers = data.offers.filter((o) => o.orderId === orderId);
    if (providerId) offers = offers.filter((o) => o.providerId === providerId);
    return { success: true, offers };
  }
  /**
   * Accept an offer and open an escrow.  Changes order and offer
   * statuses, creates a deal record and invokes the EscrowBot
   * through the KingdomCore to open the appropriate escrow.
   */
  async acceptOffer({ userId = 'default', offerId }) {
    if (!offerId) return { success: false, message: 'offerId required' };
    const data = this._getData();
    const offer = data.offers.find((o) => o.id === offerId);
    if (!offer || offer.status !== 'pending') return { success: false, message: 'Offer not found or not pending' };
    const order = data.orders.find((o) => o.id === offer.orderId);
    if (!order || order.status !== 'open') return { success: false, message: 'Order not available' };
    // Mark order and offer as matched
    order.status = 'matched';
    offer.status = 'accepted';
    // Determine escrow type: if currency is fiat, create fiat escrow, else crypto
    let escrowRes;
    try {
      if (order.currency.toUpperCase() === 'USD' || order.currency.toUpperCase() === 'EUR') {
        escrowRes = await this.kingdomCore.executeBot('escrow', {
          action: 'create_fiat_escrow',
          orderId: order.id,
          buyerId: order.side === 'buy' ? order.userId : offer.providerId,
          sellerId: order.side === 'buy' ? offer.providerId : order.userId,
          amount: order.amount,
          currency: order.currency,
        });
      } else {
        escrowRes = await this.kingdomCore.executeBot('escrow', {
          action: 'create_crypto_escrow',
          orderId: order.id,
          buyerId: order.side === 'buy' ? order.userId : offer.providerId,
          sellerId: order.side === 'buy' ? offer.providerId : order.userId,
          asset: order.asset,
          chain: order.chain,
          amount: order.amount,
        });
      }
    } catch (e) {
      return { success: false, message: `Failed to open escrow: ${e.message}` };
    }
    // Create a deal record
    const deal = {
      id: `deal_${Date.now()}`,
      orderId: order.id,
      offerId: offer.id,
      escrowId: escrowRes?.escrow?.id || null,
      buyerId: order.side === 'buy' ? order.userId : offer.providerId,
      sellerId: order.side === 'buy' ? offer.providerId : order.userId,
      price: offer.price,
      fee: offer.fee,
      status: 'in_escrow',
      createdAt: new Date().toISOString(),
    };
    data.deals.push(deal);
    this._saveData(data);
    this.logDivineAction('OTC Deal Created', { deal });
    return { success: true, deal, escrow: escrowRes };
  }
  /**
   * List user’s orders or provider’s offers.  Accepts role param
   * to determine which list to fetch.
   */
  listMy({ userId, role = 'user' }) {
    const data = this._getData();
    if (role === 'provider') {
      const offers = data.offers.filter((o) => o.providerId === userId);
      return { success: true, offers };
    }
    // default: return orders created by user
    const orders = data.orders.filter((o) => o.userId === userId);
    return { success: true, orders };
  }
  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'create_order':
        return this.createOrder(params);
      case 'submit_offer':
        return this.submitOffer(params);
      case 'list_offers':
        return this.listOffers(params);
      case 'accept_offer':
        return await this.acceptOffer(params);
      case 'list_my':
        return this.listMy(params);
      default:
        return { success: false, message: `Unknown action for CommunityExchangeBot: ${action}` };
    }
  }
}

module.exports = CommunityExchangeBot;