import crypto from 'crypto';
import { db } from '../lib/db.js';

// Initiate a deposit.  For crypto deposits a dummy address is returned.  For
// fiat deposits, dummy bank details are returned.  No state is mutated.
export function depositIntent(req, res) {
  const user = req.user;
  const { type, assetTicker, network } = req.body;
  if (!type) {
    return res.status(400).json({ status: 'error', message: 'Deposit type required' });
  }
  if (type === 'crypto') {
    const ticker = assetTicker ? assetTicker.toUpperCase() : 'USDT';
    const depositAddress = `${ticker}-DEPOSIT-${Date.now()}`;
    return res.status(201).json({ status: 'success', data: { depositAddress } });
  } else if (type === 'fiat') {
    const bankDetails = {
      beneficiary: user.fullName,
      reference: `VLF-${Date.now()}`,
    };
    return res.status(201).json({ status: 'success', data: { bankDetails } });
  } else {
    return res.status(400).json({ status: 'error', message: 'Invalid deposit type' });
  }
}

// Submit a withdrawal request.  KYC approval is required.  The user must
// have sufficient cash balance.  Withdrawal requests are recorded with
// status pending; no funds are actually debited until admin approval.
export async function withdrawRequest(req, res) {
  const user = req.user;
  const { type, amountUSD, destination } = req.body;
  if (!type || !amountUSD || !destination) {
    return res.status(400).json({ status: 'error', message: 'Missing withdrawal parameters' });
  }
  
  // KYC gating handled by middleware
  const amount = Number(amountUSD);
  try {
    const cashResult = await db.execute({
        sql: `SELECT balance FROM assets WHERE userId = ? AND type = 'Cash'`,
        args: [user.id]
    });
    
    if (cashResult.rows.length === 0 || cashResult.rows[0].balance < amount) {
        return res.status(400).json({ status: 'error', message: 'Insufficient cash balance' });
    }

    // Record a pending transaction (no immediate debit)
    await db.execute({
        sql: `INSERT INTO transactions (id, userId, description, type, amountUSD, status) VALUES (?, ?, ?, 'Withdrawal', ?, 'Pending')`,
        args: [crypto.randomUUID(), user.id, `Withdrawal request of $${amount} to ${destination}`, -amount]
    });

    return res.status(202).json({ status: 'success', message: 'Withdrawal request submitted for review.' });
  } catch(err) {
      console.error('Withdrawal request error:', err);
      return res.status(500).json({ status: 'error', message: 'Database error during withdrawal request.' });
  }
}

// Perform an internal transfer between users.  The sender and recipient must
// exist and the sender must have sufficient funds.  Both portfolios and
// activity logs are updated accordingly.
export async function internalTransfer(req, res) {
  const senderId = req.user.id;
  const { recipientIdentifier, amountUSD, note } = req.body;
  if (!recipientIdentifier || !amountUSD) {
    return res.status(400).json({ status: 'error', message: 'Recipient and amount are required' });
  }
  
  const amount = Number(amountUSD);
  if (amount <= 0) {
    return res.status(400).json({ status: 'error', message: 'Amount must be positive' });
  }

  const tx = await db.transaction('write');
  try {
    const [senderResult, recipientResult] = await Promise.all([
        tx.execute({ sql: `SELECT a.balance, u.username FROM assets a JOIN users u ON u.id = a.userId WHERE a.userId = ? AND a.type = 'Cash'`, args: [senderId] }),
        tx.execute({ sql: `SELECT id, username FROM users WHERE username = ? OR email = ?`, args: [recipientIdentifier, recipientIdentifier] })
    ]);

    if (recipientResult.rows.length === 0) {
        await tx.rollback();
        return res.status(404).json({ status: 'error', message: 'Recipient not found' });
    }
    const recipient = recipientResult.rows[0];

    if (senderResult.rows.length === 0 || senderResult.rows[0].balance < amount) {
        await tx.rollback();
        return res.status(400).json({ status: 'error', message: 'Insufficient cash balance' });
    }
    const sender = senderResult.rows[0];

    // Debit sender
    await tx.execute({
        sql: `UPDATE assets SET balance = balance - ?, valueUSD = valueUSD - ? WHERE userId = ? AND type = 'Cash'`,
        args: [amount, amount, senderId]
    });

    // Credit recipient
    await tx.execute({
        sql: `UPDATE assets SET balance = balance + ?, valueUSD = valueUSD + ? WHERE userId = ? AND type = 'Cash'`,
        args: [amount, amount, recipient.id]
    });

    // Record transactions
    const txIdSender = crypto.randomUUID();
    const txIdRecipient = crypto.randomUUID();
    await tx.execute({
        sql: `INSERT INTO transactions (id, userId, description, type, amountUSD, status) VALUES (?, ?, ?, 'Sent', ?, 'Completed')`,
        args: [txIdSender, senderId, `Sent $${amount} to ${recipient.username}${note ? ` - Note: ${note}` : ''}`, -amount]
    });
    await tx.execute({
        sql: `INSERT INTO transactions (id, userId, description, type, amountUSD, status) VALUES (?, ?, ?, 'Received', ?, 'Completed')`,
        args: [txIdRecipient, recipient.id, `Received $${amount} from ${sender.username}${note ? ` - Note: ${note}` : ''}`, amount]
    });

    await tx.commit();

    // Fetch updated portfolio to return
    const assetsResult = await db.execute({ sql: 'SELECT * FROM assets WHERE userId = ?', args: [senderId]});
    const updatedPortfolio = { ...req.user.portfolio, assets: assetsResult.rows }; // simplified portfolio return

    return res.status(200).json({ status: 'success', data: { updatedPortfolio } });

  } catch(err) {
      await tx.rollback();
      console.error('Internal transfer error:', err);
      return res.status(500).json({ status: 'error', message: 'Database error during internal transfer.' });
  }
}
