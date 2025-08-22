import crypto from 'crypto';
import { db } from '../lib/db.js';

const processOffer = (offer) => ({
    ...offer,
    price: Number(offer.price),
    availableAmount: Number(offer.availableAmount),
    minOrder: Number(offer.minOrder),
    maxOrder: Number(offer.maxOrder),
});

export async function getOffers(req, res) {
  try {
    let sql = `
        SELECT 
            o.*, 
            u.username as name, 
            u.profilePhotoUrl as avatarUrl,
            u.p2pRating as rating,
            u.p2pTotalTrades as totalTrades,
            u.p2pCompletionRate as completionRate,
            u.isP2PVerified as isVerified,
            u.countryCode as countryCode,
            u.p2pJoinDate as joinDate,
            u.createdAt as userCreatedAt,
            u.p2pLanguage as language,
            u.p2pTrustScore as trustScore
        FROM p2p_offers o 
        JOIN users u ON o.userId = u.id 
        WHERE o.isActive = TRUE AND o.userId != ?`;
    const result = await db.execute({ sql, args: [req.user.id] });
    
    // This is complex because we need to construct the nested user object
    const offers = result.rows.map(row => {
        const { name, avatarUrl, rating, totalTrades, completionRate, isVerified, countryCode, joinDate, userCreatedAt, language, trustScore, ...offerData } = row;
        return {
            ...processOffer(offerData),
            user: {
                id: offerData.userId,
                name, avatarUrl, 
                rating: Number(rating), 
                totalTrades: Number(totalTrades), 
                completionRate: Number(completionRate), 
                isVerified: Boolean(isVerified), 
                countryCode, 
                joinDate: joinDate || userCreatedAt, 
                language, 
                trustScore: Number(trustScore), 
                badges: [] // Badges can be added as a separate feature
            }
        }
    });

    return res.status(200).json({ success: true, data: { offers } });
  } catch(err) {
      console.error('Error getting P2P offers:', err);
      return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}

export async function createOrder(req, res) {
  const buyerId = req.user.id;
  const { offerId, amount, paymentMethodId } = req.body;

  if (!offerId || !amount || !paymentMethodId) {
    return res.status(400).json({ success: false, message: 'Missing trade parameters' });
  }

  let tx;
  try {
    tx = await db.transaction('write');
    const offerResult = await tx.execute({ sql: `SELECT * FROM p2p_offers WHERE id = ? AND isActive = TRUE`, args: [offerId]});
    if (offerResult.rows.length === 0) {
        await tx.rollback();
        return res.status(404).json({ success: false, message: 'Offer not found or is no longer active.' });
    }
    const offer = processOffer(offerResult.rows[0]);
    const cryptoAmount = Number(amount) / offer.price;

    if (cryptoAmount > offer.availableAmount) {
        await tx.rollback();
        return res.status(400).json({ success: false, message: 'Trade amount exceeds available offer amount.' });
    }

    // Decrement offer availability and escrow
    await tx.execute({
        sql: 'UPDATE p2p_offers SET availableAmount = availableAmount - ? WHERE id = ?',
        args: [cryptoAmount, offerId]
    });
    // Note: Escrow was already handled when the seller created the offer. This just reduces the available pool.

    const orderId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + offer.paymentTimeLimitMinutes * 60 * 1000).toISOString();
    
    // Create the order
    await tx.execute({
        sql: `INSERT INTO p2p_orders (id, offerId, buyerId, sellerId, status, fiatAmount, cryptoAmount, expiresAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [orderId, offerId, buyerId, offer.userId, 'Pending Payment', Number(amount), cryptoAmount, expiresAt]
    });

    await tx.commit();
    // Fetch the full order to return to the user
    const newOrderResult = await db.execute({ sql: 'SELECT * FROM p2p_orders WHERE id = ?', args: [orderId]});

    res.status(201).json({ success: true, data: newOrderResult.rows[0] });

  } catch (err) {
      if (tx) {
        try { await tx.rollback(); } catch(e) { console.error('Failed to rollback transaction:', e); }
      }
      console.error('Error creating P2P order:', err);
      return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}

// --- Placeholder functions for other P2P actions ---
export async function getMyOrders(req, res) { 
    const result = await db.execute({ sql: `SELECT * from p2p_orders WHERE buyerId = ? OR sellerId = ?`, args: [req.user.id, req.user.id]});
    res.status(200).json({ success: true, data: { orders: result.rows } });
}
export async function updateOrderStatus(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function postChatMessage(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function getPaymentMethods(req, res) { 
    const result = await db.execute({ sql: `SELECT * from p2p_payment_methods WHERE userId = ?`, args: [req.user.id]});
    res.status(200).json({ success: true, data: { paymentMethods: result.rows.map(pm => ({...pm, details: JSON.parse(pm.details)})) } }); 
}