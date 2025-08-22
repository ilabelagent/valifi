import crypto from 'crypto';
import { db } from '../lib/db.js';

export async function internalTransfer(req, res) {
  const senderId = req.user.id;
  const { recipientIdentifier, amountUSD, note } = req.body;
  if (!recipientIdentifier || !amountUSD) {
    return res.status(400).json({ success: false, message: 'Recipient and amount are required' });
  }
  
  const amount = Number(amountUSD);
  if (amount <= 0) {
    return res.status(400).json({ success: false, message: 'Amount must be positive' });
  }

  let tx;
  try {
    tx = await db.transaction('write');
    const [senderResult, recipientResult] = await Promise.all([
        tx.execute({ sql: `SELECT a.balance, u.username FROM assets a JOIN users u ON u.id = a.userId WHERE a.userId = ? AND a.type = 'Cash'`, args: [senderId] }),
        tx.execute({ sql: `SELECT id, username FROM users WHERE username = ? OR email_normalized = ?`, args: [recipientIdentifier, recipientIdentifier.toLowerCase()] })
    ]);

    if (recipientResult.rows.length === 0) {
        await tx.rollback();
        return res.status(404).json({ success: false, message: 'Recipient not found' });
    }
    const recipient = recipientResult.rows[0];
    
    if (recipient.id === senderId) {
        await tx.rollback();
        return res.status(400).json({ success: false, message: 'Cannot send funds to yourself.' });
    }

    if (senderResult.rows.length === 0 || Number(senderResult.rows[0].balance) < amount) {
        await tx.rollback();
        return res.status(400).json({ success: false, message: 'Insufficient cash balance' });
    }
    const sender = senderResult.rows[0];

    // Debit sender & Credit recipient
    await Promise.all([
        tx.execute({ sql: `UPDATE assets SET balance = balance - ?, valueUSD = valueUSD - ? WHERE userId = ? AND type = 'Cash'`, args: [amount, amount, senderId] }),
        tx.execute({ sql: `UPDATE assets SET balance = balance + ?, valueUSD = valueUSD + ? WHERE userId = ? AND type = 'Cash'`, args: [amount, amount, recipient.id] })
    ]);

    // Record transactions
    await Promise.all([
        tx.execute({ sql: `INSERT INTO transactions (id, userId, description, type, amountUSD, status) VALUES (?, ?, ?, 'Sent', ?, 'Completed')`, args: [crypto.randomUUID(), senderId, `Transfer to ${recipient.username}${note ? ` - Note: ${note}` : ''}`, -amount] }),
        tx.execute({ sql: `INSERT INTO transactions (id, userId, description, type, amountUSD, status) VALUES (?, ?, ?, 'Received', ?, 'Completed')`, args: [crypto.randomUUID(), recipient.id, `Transfer from ${sender.username}${note ? ` - Note: ${note}` : ''}`, amount] })
    ]);

    await tx.commit();
    return res.status(200).json({ success: true, message: 'Transfer successful.' });

  } catch(err) {
      if (tx) {
        try { await tx.rollback(); } catch(e) { console.error('Failed to rollback transaction:', e); }
      }
      console.error('Internal transfer error:', err);
      return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}

export async function requestDeposit(req, res) {
    const userId = req.user.id;
    const { amount, type, coinTicker } = req.body;
    const numericAmount = Number(amount);

    if (!type || !numericAmount || numericAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Type and a valid positive amount are required.' });
    }

    try {
        const description = type === 'fiat' 
            ? `Bank Deposit Intent of $${numericAmount.toFixed(2)}`
            : `Crypto Deposit Intent of ${numericAmount.toFixed(8)} ${coinTicker}`;

        await db.execute({
            sql: `INSERT INTO transactions (id, userId, description, amountUSD, type, status) VALUES (?, ?, ?, ?, ?, 'Pending')`,
            args: [crypto.randomUUID(), userId, description, numericAmount, 'Deposit']
        });

        res.status(201).json({ success: true, message: 'Deposit intent recorded. Your balance will be updated upon confirmation.' });
    } catch (err) {
        console.error('Error recording deposit intent:', err);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
}

export async function requestWithdrawal(req, res) {
    const userId = req.user.id;
    const { amount, type, destination, coinTicker, coinAmount } = req.body;
    const numericAmount = Number(amount);

    if (!type || !numericAmount || numericAmount <= 0 || !destination) {
        return res.status(400).json({ success: false, message: 'Type, a valid positive amount, and destination are required.' });
    }

    let tx;
    try {
        tx = await db.transaction('write');

        const cashResult = await tx.execute({ sql: 'SELECT balance FROM assets WHERE userId = ? AND type = "Cash"', args: [userId] });
        if (cashResult.rows.length === 0 || Number(cashResult.rows[0].balance) < numericAmount) {
            await tx.rollback();
            return res.status(400).json({ success: false, message: 'Insufficient cash balance for withdrawal.' });
        }

        const description = type === 'fiat'
            ? `Withdrawal of $${numericAmount.toFixed(2)} to ${destination}`
            : `Withdrawal of ${coinAmount.toFixed(8)} ${coinTicker} to ${destination}`;

        await tx.execute({
            sql: `INSERT INTO transactions (id, userId, description, amountUSD, type, status) VALUES (?, ?, ?, ?, ?, 'Pending')`,
            args: [crypto.randomUUID(), userId, description, -numericAmount, 'Withdrawal']
        });
        
        // Place a hold on the user's funds
        await tx.execute({ sql: 'UPDATE assets SET balance = balance - ?, valueUSD = valueUSD - ? WHERE userId = ? AND type = "Cash"', args: [numericAmount, numericAmount, userId] });

        await tx.commit();
        res.status(202).json({ success: true, message: 'Withdrawal request submitted for review.' });

    } catch (err) {
        if (tx) { try { await tx.rollback(); } catch(e) {} }
        console.error('Error processing withdrawal request:', err);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
}
