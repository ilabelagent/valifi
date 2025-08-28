const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * VipDeskBot powers the VIP/Private Miner/Whale desk.  Access is
 * invite‑only.  It manages RFQs (requests for quotes), quotes
 * from providers, creation of deal rooms via escrow, and lists
 * positions.  This bot is meant to operate in an isolated
 * environment with stricter access controls.
 */
class VipDeskBot extends KingdomBot {
  async initialize() {
    this.logDivineAction('VIP Desk Bot Initialized');
    return true;
  }
  _getData() {
    const { readData } = require('../../lib/storage');
    const data = readData('data/vip_desk.json');
    data.invites = data.invites || [];
    data.rfqs = data.rfqs || [];
    data.quotes = data.quotes || [];
    data.deals = data.deals || [];
    return data;
  }
  _saveData(data) {
    const { writeData } = require('../../lib/storage');
    writeData('data/vip_desk.json', data);
  }
  /**
   * Invite a user to the VIP desk.  Only admin should call this.
   */
  invite({ adminId = 'admin', userId, limits }) {
    if (!userId) return { success: false, message: 'userId required' };
    const data = this._getData();
    const invite = { id: `invite_${Date.now()}`, userId, limits: limits || {}, invitedBy: adminId, invitedAt: new Date().toISOString(), accepted: false };
    data.invites.push(invite);
    this._saveData(data);
    this.logDivineAction('VIP Invite Sent', { adminId, userId });
    return { success: true, invite };
  }
  /**
   * Accept an invite.  Marks it accepted and allows the user to
   * post RFQs.  In real system this would verify identity.
   */
  acceptInvite({ userId }) {
    const data = this._getData();
    const invite = data.invites.find((i) => i.userId === userId && !i.accepted);
    if (!invite) return { success: false, message: 'No pending invite' };
    invite.accepted = true;
    invite.acceptedAt = new Date().toISOString();
    this._saveData(data);
    this.logDivineAction('VIP Invite Accepted', { userId });
    return { success: true, invite };
  }
  /**
   * Create a request for quote (RFQ).  Only invited users can
   * create RFQs.  Stores the RFQ with open status.
   */
  createRFQ({ userId, asset, chain, side, notionalMin, notionalMax, feeMin, feeMax, settlementWindow }) {
    if (!asset || !chain || !side || !notionalMin || !notionalMax) {
      return { success: false, message: 'Missing required RFQ fields' };
    }
    const data = this._getData();
    const invite = data.invites.find((i) => i.userId === userId && i.accepted);
    if (!invite) return { success: false, message: 'User not invited to VIP desk' };
    const rfq = {
      id: `rfq_${Date.now()}`,
      userId,
      asset,
      chain,
      side,
      notionalMin: Number(notionalMin),
      notionalMax: Number(notionalMax),
      feeMin: Number(feeMin || 0.07),
      feeMax: Number(feeMax || 0.10),
      settlementWindow: settlementWindow || 'T+0',
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    data.rfqs.push(rfq);
    this._saveData(data);
    this.logDivineAction('VIP RFQ Created', { rfq });
    return { success: true, rfq };
  }
  /**
   * Submit a quote in response to an RFQ.  Only providers invited
   * to VIP desk can submit.  Price curve simplified to a single
   * price and min/max fill.
   */
  submitQuote({ providerId, rfqId, price, minFill, maxFill, fees }) {
    if (!providerId || !rfqId || !price || !minFill || !maxFill) {
      return { success: false, message: 'Missing required quote fields' };
    }
    const data = this._getData();
    const rfq = data.rfqs.find((r) => r.id === rfqId);
    if (!rfq || rfq.status !== 'open') return { success: false, message: 'RFQ not available' };
    const quote = {
      id: `quote_${Date.now()}`,
      rfqId,
      providerId,
      price: Number(price),
      minFill: Number(minFill),
      maxFill: Number(maxFill),
      fees: Number(fees || ((rfq.feeMin + rfq.feeMax) / 2)),
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };
    data.quotes.push(quote);
    this._saveData(data);
    this.logDivineAction('VIP Quote Submitted', { quote });
    return { success: true, quote };
  }
  /**
   * Shortlist providers for an RFQ.  Accepts an array of quoteIds
   * and marks the RFQ as in negotiation.  In this simplified
   * implementation, we just attach the shortlist to the RFQ.
   */
  shortlist({ rfqId, quoteIds }) {
    if (!rfqId || !Array.isArray(quoteIds) || !quoteIds.length) {
      return { success: false, message: 'rfqId and quoteIds array required' };
    }
    const data = this._getData();
    const rfq = data.rfqs.find((r) => r.id === rfqId);
    if (!rfq || rfq.status !== 'open') return { success: false, message: 'RFQ not open' };
    rfq.shortlist = quoteIds;
    rfq.status = 'negotiation';
    this._saveData(data);
    this.logDivineAction('VIP RFQ Shortlisted', { rfqId, quoteIds });
    return { success: true, rfq };
  }
  /**
   * Open a deal for a shortlisted quote.  Creates an escrow via
   * the EscrowBot and records the deal.
   */
  async openDeal({ rfqId, quoteId }) {
    const data = this._getData();
    const rfq = data.rfqs.find((r) => r.id === rfqId);
    const quote = data.quotes.find((q) => q.id === quoteId);
    if (!rfq || !quote) return { success: false, message: 'RFQ or quote not found' };
    // Determine buyer/seller based on RFQ side
    const buyerId = rfq.side === 'buy' ? rfq.userId : quote.providerId;
    const sellerId = rfq.side === 'buy' ? quote.providerId : rfq.userId;
    // Notional: use maxFill for simplicity
    const notional = quote.maxFill;
    // Create escrow (crypto for now).  We ignore chain for VIP deals.
    let escrowRes;
    try {
      escrowRes = await this.kingdomCore.executeBot('escrow', {
        action: 'create_crypto_escrow',
        orderId: rfq.id,
        buyerId,
        sellerId,
        asset: rfq.asset,
        chain: rfq.chain,
        amount: notional,
      });
    } catch (e) {
      return { success: false, message: `Failed to open VIP escrow: ${e.message}` };
    }
    const deal = {
      id: `vip_deal_${Date.now()}`,
      rfqId,
      quoteId,
      escrowId: escrowRes?.escrow?.id || null,
      buyerId,
      sellerId,
      price: quote.price,
      quantity: notional,
      status: 'in_escrow',
      openedAt: new Date().toISOString(),
    };
    data.deals.push(deal);
    rfq.status = 'deal';
    this._saveData(data);
    this.logDivineAction('VIP Deal Opened', { deal });
    return { success: true, deal, escrow: escrowRes };
  }
  /**
   * List RFQs, quotes or deals for a user or provider.
   */
  list({ type, userId }) {
    const data = this._getData();
    if (type === 'rfq') {
      return { success: true, rfqs: data.rfqs.filter((r) => !userId || r.userId === userId) };
    }
    if (type === 'quote') {
      return { success: true, quotes: data.quotes.filter((q) => !userId || q.providerId === userId) };
    }
    if (type === 'deal') {
      return { success: true, deals: data.deals.filter((d) => !userId || d.buyerId === userId || d.sellerId === userId) };
    }
    return { success: false, message: 'Invalid type' };
  }
  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'invite':
        return this.invite(params);
      case 'accept_invite':
        return this.acceptInvite(params);
      case 'create_rfq':
        return this.createRFQ(params);
      case 'submit_quote':
        return this.submitQuote(params);
      case 'shortlist':
        return this.shortlist(params);
      case 'open_deal':
        return await this.openDeal(params);
      case 'list':
        return this.list(params);
      default:
        return { success: false, message: `Unknown action for VipDeskBot: ${action}` };
    }
  }
}

module.exports = VipDeskBot;