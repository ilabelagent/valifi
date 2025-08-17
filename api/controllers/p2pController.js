import crypto from 'crypto';
import { db } from '../lib/db.js';

// Return a list of available P2P offers.
export async function getOffers(req, res) {
  const userId = req.user.id;
  const { type, asset, fiat, paymentMethod } = req.query;
  
  // This is a complex query to join offers with user profiles and filter.
  // For this exercise, we will keep it simpler.
  let sql = `SELECT o.*, u.username as userName FROM p2p_offers o JOIN users u ON o.userId = u.id WHERE o.isActive = TRUE AND o.userId != ?`;
  const args = [userId];

  if (type) {
      sql += ' AND o.type = ?';
      args.push(type.toUpperCase());
  }
  if (asset) {
      sql += ' AND o.assetTicker = ?';
      args.push(asset.toUpperCase());
  }
  // More filters can be added here.
  
  try {
    const result = await db.execute({ sql, args });
    // In a real app, we'd hydrate the full user profile and payment methods.
    return res.status(200).json({ status: 'success', data: { offers: result.rows } });
  } catch(err) {
      console.error('Error getting P2P offers:', err);
      return res.status(500).json({ status: 'error', message: 'Database error.' });
  }
}

// Create a new P2P offer.
export async function createOffer(req, res) {
  const user = req.user;
  const { type, assetTicker, fiatCurrency, price, totalAmount, ...otherFields } = req.body;
  if (!type || !assetTicker || !fiatCurrency || !price || !totalAmount) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields for offer' });
  }
  
  const tx = await db.transaction('write');
  try {
      if (type.toUpperCase() === 'SELL') {
          const assetResult = await tx.execute({ sql: 'SELECT balance FROM assets WHERE userId = ? AND ticker = ?', args: [user.id, assetTicker]});
          if (assetResult.rows.length === 0 || assetResult.rows[0].balance < totalAmount) {
              await tx.rollback();
              return res.status(400).json({ status: 'error', message: 'Insufficient asset balance for sell offer' });
          }
          await tx.execute({
              sql: 'UPDATE assets SET balance = balance - ?, balanceInEscrow = balanceInEscrow + ? WHERE userId = ? AND ticker = ?',
              args: [totalAmount, totalAmount, user.id, assetTicker]
          });
      }
      
      const id = crypto.randomUUID();
      const offer = { id, userId: user.id, type: type.toUpperCase(), assetTicker, fiatCurrency, price, availableAmount: totalAmount, ...otherFields };

      await tx.execute({
          sql: `INSERT INTO p2p_offers (id, userId, type, assetTicker, fiatCurrency, price, availableAmount, minOrder, maxOrder, paymentTimeLimitMinutes, terms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [id, user.id, offer.type, offer.assetTicker, offer.fiatCurrency, offer.price, offer.availableAmount, offer.minOrder || 0, offer.maxOrder || totalAmount, offer.paymentTimeLimitMinutes || 15, offer.terms || '']
      });

      await tx.commit();
      return res.status(201).json({ status: 'success', data: { offer } });
  } catch(err) {
      await tx.rollback();
      console.error('Error creating P2P offer:', err);
      return res.status(500).json({ status: 'error', message: 'Database error.' });
  }
}

// Create a new P2P order.
export async function createOrder(req, res) {
    // This function requires complex logic similar to createOffer (transactions, checks).
    // Omitted for brevity.
    return res.status(501).json({ status: 'error', message: 'Not implemented' });
}
export async function confirmPayment(req, res) {
    // Requires UPDATE on p2p_orders table
    return res.status(501).json({ status: 'error', message: 'Not implemented' });
}
export async function releaseEscrow(req, res) {
    // Requires a database transaction to move funds and update order status.
    return res.status(501).json({ status: 'error', message: 'Not implemented' });
}
export async function sendChat(req, res) {
    // Requires INSERT into p2p_chat_messages
    return res.status(501).json({ status: 'error', message: 'Not implemented' });
}
export async function raiseDispute(req, res) {
    // Requires INSERT into disputes and UPDATE on p2p_orders
    return res.status(501).json({ status: 'error', message: 'Not implemented' });
}
export async function submitReview(req, res) {
    // Requires UPDATE on p2p_orders to add a JSON review object
    return res.status(501).json({ status: 'error', message: 'Not implemented' });
}

// --- Payment Methods ---
export async function getPaymentMethods(req, res) {
    try {
        const result = await db.execute({ sql: 'SELECT * FROM payment_methods WHERE userId = ?', args: [req.user.id]});
        const methods = result.rows.map(row => ({ ...row, details: JSON.parse(row.details) }));
        return res.status(200).json({ status: 'success', data: { paymentMethods: methods } });
    } catch(err) {
        console.error('Error fetching payment methods:', err);
        return res.status(500).json({ status: 'error', message: 'Database error.' });
    }
}
export async function addPaymentMethod(req, res) {
    const { methodType, nickname, country, details } = req.body;
    if (!methodType || !nickname || !country || !details) {
        return res.status(400).json({ status: 'error', message: 'Missing payment method fields' });
    }
    const id = crypto.randomUUID();
    try {
        await db.execute({
            sql: `INSERT INTO payment_methods (id, userId, methodType, nickname, country, details) VALUES (?, ?, ?, ?, ?, ?)`,
            args: [id, req.user.id, methodType, nickname, country, JSON.stringify(details)]
        });
        return res.status(201).json({ status: 'success', data: { paymentMethod: {id, ...req.body} } });
    } catch(err) {
        console.error('Error adding payment method:', err);
        return res.status(500).json({ status: 'error', message: 'Database error.' });
    }
}
export async function deletePaymentMethod(req, res) {
    try {
        await db.execute({
            sql: 'DELETE FROM payment_methods WHERE id = ? AND userId = ?',
            args: [req.params.id, req.user.id]
        });
        return res.status(204).end();
    } catch(err) {
        console.error('Error deleting payment method:', err);
        return res.status(500).json({ status: 'error', message: 'Database error.' });
    }
}
