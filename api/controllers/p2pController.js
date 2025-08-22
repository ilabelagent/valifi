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

export async function getMyOrders(req, res) { 
    const result = await db.execute({ sql: `SELECT * from p2p_orders WHERE buyerId = ? OR sellerId = ?`, args: [req.user.id, req.user.id]});
    res.status(200).json({ success: true, data: { orders: result.rows } });
}

export async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  if (!status || !['Payment Sent', 'Escrow Released', 'Cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status provided.' });
  }

  let tx;
  try {
    tx = await db.transaction('write');
    const orderResult = await tx.execute({ sql: `SELECT o.*, offer.assetTicker FROM p2p_orders o JOIN p2p_offers offer ON o.offerId = offer.id WHERE o.id = ?`, args: [id] });
    if (orderResult.rows.length === 0) {
      await tx.rollback();
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    const order = orderResult.rows[0];

    const isBuyer = order.buyerId === userId;
    const isSeller = order.sellerId === userId;
    
    if (status === 'Payment Sent' && isBuyer && order.status === 'Pending Payment') {
        await tx.execute({ sql: `UPDATE p2p_orders SET status = 'Payment Sent', completedAt = CURRENT_TIMESTAMP WHERE id = ?`, args: [id] });
    } else if (status === 'Escrow Released' && isSeller && order.status === 'Payment Sent') {
        const ticker = order.assetTicker;
        await tx.execute({
            sql: `UPDATE assets SET balanceInEscrow = balanceInEscrow - ? WHERE userId = ? AND ticker = ?`,
            args: [order.cryptoAmount, order.sellerId, ticker]
        });

        const buyerAssetResult = await tx.execute({ sql: 'SELECT id FROM assets WHERE userId = ? AND ticker = ?', args: [order.buyerId, ticker] });
        if(buyerAssetResult.rows.length > 0) {
             await tx.execute({ sql: `UPDATE assets SET balance = balance + ?, valueUSD = valueUSD + ? WHERE userId = ? AND ticker = ?`, args: [order.cryptoAmount, order.fiatAmount, order.buyerId, ticker] });
        } else {
             await tx.execute({ sql: `INSERT INTO assets (id, userId, name, ticker, type, balance, valueUSD) VALUES (?, ?, ?, ?, 'Crypto', ?, ?)`, args: [crypto.randomUUID(), order.buyerId, ticker, ticker, order.cryptoAmount, order.fiatAmount] });
        }
        await tx.execute({ sql: `UPDATE p2p_orders SET status = 'Completed', completedAt = CURRENT_TIMESTAMP WHERE id = ?`, args: [id] });
    } else if (status === 'Cancelled' && (isBuyer || isSeller) && ['Pending Payment', 'Payment Sent'].includes(order.status)) {
        const ticker = order.assetTicker;
        await tx.execute({
            sql: 'UPDATE assets SET balanceInEscrow = balanceInEscrow - ?, balance = balance + ? WHERE userId = ? AND ticker = ?',
            args: [order.cryptoAmount, order.cryptoAmount, order.sellerId, ticker]
        });
        await tx.execute({ sql: 'UPDATE p2p_offers SET availableAmount = availableAmount + ? WHERE id = ?', args: [order.cryptoAmount, order.offerId] });
        await tx.execute({ sql: `UPDATE p2p_orders SET status = 'Cancelled', completedAt = CURRENT_TIMESTAMP WHERE id = ?`, args: [id] });
    } else {
        await tx.rollback();
        return res.status(403).json({ success: false, message: 'Action not allowed at this stage or you are not authorized.' });
    }

    await tx.commit();
    const updatedOrderResult = await db.execute({ sql: 'SELECT * FROM p2p_orders WHERE id = ?', args: [id] });
    res.status(200).json({ success: true, data: updatedOrderResult.rows[0] });
  } catch(err) {
      if (tx) { try { await tx.rollback(); } catch(e) {} }
      console.error('Error updating order status:', err);
      res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}

export async function postChatMessage(req, res) { 
    const { id: orderId } = req.params;
    const { text } = req.body;
    const authorId = req.user.id;
    const authorName = req.user.username;

    if (!text) {
        return res.status(400).json({ success: false, message: 'Message text cannot be empty.' });
    }

    try {
        const messageId = `msg_${crypto.randomUUID()}`;
        const timestamp = new Date().toISOString();
        
        await db.execute({
            sql: `INSERT INTO p2p_chat_messages (id, orderId, authorId, text, timestamp) VALUES (?, ?, ?, ?, ?)`,
            args: [messageId, orderId, authorId, text, timestamp]
        });
        
        const newMessage = { id: messageId, orderId, authorId, authorName, text, timestamp };
        // In a real app, you would also use websockets to push this message to the other user.
        res.status(201).json({ success: true, data: { message: newMessage } });
    } catch(err) {
        console.error('Error posting chat message:', err);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
}

export async function createOffer(req, res) {
    const userId = req.user.id;
    const { type, assetTicker, fiatCurrency, price, totalAmount, ...otherDetails } = req.body;
    
    let tx;
    try {
        tx = await db.transaction('write');
        if (type === 'SELL') {
            const assetResult = await tx.execute({ sql: 'SELECT balance FROM assets WHERE userId = ? AND ticker = ?', args: [userId, assetTicker] });
            if (assetResult.rows.length === 0 || Number(assetResult.rows[0].balance) < totalAmount) {
                await tx.rollback();
                return res.status(400).json({ success: false, message: 'Insufficient asset balance to create sell offer.' });
            }
            await tx.execute({ sql: 'UPDATE assets SET balance = balance - ?, balanceInEscrow = balanceInEscrow + ? WHERE userId = ? AND ticker = ?', args: [totalAmount, totalAmount, userId, assetTicker]});
        }
        
        const offerId = crypto.randomUUID();
        await tx.execute({
            sql: `INSERT INTO p2p_offers (id, userId, type, assetTicker, fiatCurrency, price, availableAmount, minOrder, maxOrder, paymentTimeLimitMinutes, terms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [offerId, userId, type, assetTicker, fiatCurrency, price, totalAmount, otherDetails.minOrder, otherDetails.maxOrder, otherDetails.paymentTimeLimitMinutes, otherDetails.terms]
        });

        await tx.commit();
        res.status(201).json({ success: true, message: 'Offer created successfully.' });
    } catch(err) {
        if(tx) await tx.rollback();
        console.error('Error creating offer:', err);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
}

export async function addPaymentMethod(req, res) { 
    const userId = req.user.id;
    const { methodType, nickname, country, details } = req.body;
    const id = crypto.randomUUID();
    await db.execute({
        sql: `INSERT INTO p2p_payment_methods (id, userId, methodType, nickname, country, details) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [id, userId, methodType, nickname, country, JSON.stringify(details)]
    });
    res.status(201).json({ success: true, data: { id, userId, methodType, nickname, country, details } });
}

export async function deletePaymentMethod(req, res) { 
    const { id } = req.params;
    await db.execute({ sql: 'DELETE FROM p2p_payment_methods WHERE id = ? AND userId = ?', args: [id, req.user.id]});
    res.status(204).send();
}

export async function getPaymentMethods(req, res) { 
    const result = await db.execute({ sql: `SELECT * from p2p_payment_methods WHERE userId = ?`, args: [req.user.id]});
    res.status(200).json({ success: true, data: { paymentMethods: result.rows.map(pm => ({...pm, details: JSON.parse(pm.details)})) } }); 
}