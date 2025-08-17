import crypto from 'crypto';
import { db } from '../lib/db.js';

// Return the user's current KYC status.  A rejection reason is included if
// applicable, otherwise null.
export async function getKycStatus(req, res) {
  // User object is attached by auth middleware and is up-to-date
  const { kycStatus, kycRejectionReason } = req.user;
  return res.status(200).json({ status: kycStatus, rejectionReason: kycRejectionReason || null });
}

// Submit KYC documents.  In this simplified backend we accept the
// submission and mark the status as 'Pending'.  No files are processed.
export async function submitKyc(req, res) {
  const userId = req.user.id;
  try {
    await db.execute({
        sql: 'UPDATE users SET kycStatus = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        args: ['Pending', userId]
    });
    return res.status(202).json({ status: 'success', message: 'Documents submitted for review.' });
  } catch(err) {
      console.error('Error submitting KYC:', err);
      return res.status(500).json({ status: 'error', message: 'Database error during KYC submission.' });
  }
}

// Summarise taxable events for a given year.  We calculate realised gains
// and losses from the transaction history by summing positive and
// negative amounts on trade transactions.  Net result is gains minus
// losses.
export async function getTaxSummary(req, res) {
  const userId = req.user.id;
  const year = req.query.year || new Date().getFullYear();
  
  try {
    const result = await db.execute({
        // Note: In SQLite, date functions might need adjustments.
        // Assuming dates are stored in ISO 8601 format (YYYY-MM-DD...).
        sql: `SELECT type, amountUSD FROM transactions WHERE userId = ? AND strftime('%Y', date) = ? AND type = 'Trade'`,
        args: [userId, String(year)]
    });

    let gains = 0;
    let losses = 0;
    result.rows.forEach((tx) => {
        if (tx.amountUSD > 0) gains += tx.amountUSD;
        else losses += Math.abs(tx.amountUSD);
    });
    
    const netResult = gains - losses;
    return res.status(200).json({ status: 'success', data: { realizedGains: Number(gains.toFixed(2)), realizedLosses: Number(losses.toFixed(2)), netResult: Number(netResult.toFixed(2)) } });

  } catch(err) {
      console.error('Error getting tax summary:', err);
      return res.status(500).json({ status: 'error', message: 'Database error fetching tax summary.' });
  }
}

// Return referral statistics for the user. This remains mock as the referral
// system tables are not defined in the core schema.
export function getReferralsSummary(req, res) {
  const user = req.user;
  const mockReferralStats = {
      totalReferrals: 0,
      totalEarnings: 0,
      referralTree: {},
      activity: [],
  };
  return res.status(200).json({ status: 'success', data: user.referralStats || mockReferralStats });
}

// Initiate a privacy mix transaction.  This is a stateless operation in the
// current design and does not require DB interaction.
export function mixPrivacy(req, res) {
  const { assetTicker, network, amount, destinationAddress, privacyLevel } = req.body;
  if (!assetTicker || !network || !amount || !destinationAddress || privacyLevel === undefined) {
    return res.status(400).json({ status: 'error', message: 'Missing mix parameters' });
  }
  const mixTransaction = {
    id: `mix-${crypto.randomUUID()}`,
    assetTicker: assetTicker.toUpperCase(),
    network,
    amount: Number(amount),
    destinationAddress,
    privacyLevel: Number(privacyLevel),
    status: 'Awaiting Deposit',
    createdAt: new Date().toISOString(),
  };
  return res.status(201).json({ status: 'success', data: mixTransaction });
}
