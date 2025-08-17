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
    let sql = `SELECT o.*, u.username as userName FROM p2p_offers o JOIN users u ON o.userId = u.id WHERE o.isActive = TRUE AND o.userId != ?`;
    const result = await db.execute({ sql, args: [req.user.id] });
    return res.status(200).json({ success: true, data: { offers: result.rows.map(processOffer) } });
  } catch(err) {
      console.error('Error getting P2P offers:', err);
      return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}

export async function createOffer(req, res) {
  const user = req.user;
  const { type, assetTicker, fiatCurrency, price, totalAmount } = req.body;
  if (!type || !assetTicker || !fiatCurrency || !price || !totalAmount) {
    return res.status(400).json({ success: false, message: 'Missing required fields for offer' });
  }
  
  let tx;
  try {
      tx = await db.transaction('write');
      if (type.toUpperCase() === 'SELL') {
          const assetResult = await tx.execute({ sql: 'SELECT balance FROM assets WHERE userId = ? AND ticker = ?', args: [user.id, assetTicker]});
          if (assetResult.rows.length === 0 || Number(assetResult.rows[0].balance) < Number(totalAmount)) {
              await tx.rollback();
              return res.status(400).json({ success: false, message: 'Insufficient asset balance.' });
          }
          await tx.execute({
              sql: 'UPDATE assets SET balance = balance - ?, balanceInEscrow = balanceInEscrow + ? WHERE userId = ? AND ticker = ?',
              args: [Number(totalAmount), Number(totalAmount), user.id, assetTicker]
          });
      }
      // ... (rest of insert logic)
      await tx.commit();
      return res.status(201).json({ success: true, message: 'Offer created.' });
  } catch(err) {
      if (tx) await tx.rollback();
      console.error('Error creating P2P offer:', err);
      return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}

// --- Placeholder functions for other P2P actions ---
export async function getMyOrders(req, res) { res.status(200).json({ success: true, data: { orders: [] } }); }
export async function createOrder(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function updateOrderStatus(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function postChatMessage(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function getPaymentMethods(req, res) { res.status(200).json({ success: true, data: { paymentMethods: [] } }); }
