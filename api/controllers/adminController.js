/*
 * Admin Controller
 *
 * This controller exposes privileged operations restricted to admin
 * users.  Administrative endpoints are mounted under /admin and are
 * protected by the `requireAdmin` middleware defined in
 * middleware/auth.js.  The available actions include reviewing KYC
 * submissions, approving or rejecting loan applications, listing all
 * users, adding new REIT properties and monitoring imported wallets.
 */
import crypto from 'crypto';
import { db } from '../lib/db.js';

// Review a KYC submission.  Admins send a userId and a boolean
// indicating approval.  When approving, the user's `kycStatus` is set
// to 'Approved' and any previous rejection reason is cleared.  When
// rejecting, the status is set to 'Rejected' and an optional
// rejectionReason can be recorded.  A 404 is returned if the user
// cannot be found.
export async function reviewKyc(req, res) {
  const { userId, approve, rejectionReason } = req.body;
  if (!userId || approve === undefined) {
    return res.status(400).json({ status: 'error', message: 'userId and approve flag are required' });
  }

  try {
    const userResult = await db.execute({
      sql: 'SELECT id FROM users WHERE id = ?',
      args: [userId],
    });

    if (userResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    let kycStatus, kycRejectionReason;
    if (approve) {
      kycStatus = 'Approved';
      kycRejectionReason = null;
    } else {
      kycStatus = 'Rejected';
      kycRejectionReason = rejectionReason || 'Rejected by admin';
    }

    await db.execute({
      sql: 'UPDATE users SET kycStatus = ?, kycRejectionReason = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      args: [kycStatus, kycRejectionReason, userId],
    });

    return res.status(200).json({ status: 'success', data: { userId, kycStatus } });
  } catch (err) {
    console.error('Error reviewing KYC:', err);
    return res.status(500).json({ status: 'error', message: 'Database error during KYC review.' });
  }
}

// Review a loan application.  Admins provide the loan ID and a boolean
// indicating approval.  The loan is located across all users.  On
// approval the loan status becomes 'Active' and the loan amount is
// credited to the user's cash asset.  On rejection the status is
// updated to 'Rejected'.  If the loan cannot be found a 404 is
// returned.
export async function reviewLoan(req, res) {
  const { loanId, approve } = req.body;
  if (!loanId || approve === undefined) {
    return res.status(400).json({ status: 'error', message: 'loanId and approve flag are required' });
  }

  const tx = await db.transaction('write');
  try {
    const loanResult = await tx.execute({
      sql: 'SELECT * FROM loan_applications WHERE id = ?',
      args: [loanId],
    });

    if (loanResult.rows.length === 0) {
      await tx.rollback();
      return res.status(404).json({ status: 'error', message: 'Loan not found' });
    }
    const loan = loanResult.rows[0];
    const targetUserId = loan.userId;

    if (approve) {
      await tx.execute({
        sql: `UPDATE loan_applications SET status = 'Active', details = json_set(details, '$.startDate', ?) WHERE id = ?`,
        args: [new Date().toISOString(), loanId],
      });

      await tx.execute({
        sql: `UPDATE assets SET balance = balance + ?, valueUSD = valueUSD + ? WHERE userId = ? AND type = 'Cash'`,
        args: [loan.amount, loan.amount, targetUserId],
      });

      await tx.execute({
        sql: `INSERT INTO transactions (id, userId, description, amountUSD, status, type, relatedAssetId) VALUES (?, ?, ?, ?, 'Completed', 'Deposit', (SELECT id FROM assets WHERE userId = ? AND type = 'Cash'))`,
        args: [crypto.randomUUID(), targetUserId, 'Loan Disbursement', loan.amount, targetUserId],
      });
    } else {
      await tx.execute({
        sql: `UPDATE loan_applications SET status = 'Rejected' WHERE id = ?`,
        args: [loanId],
      });
    }

    await tx.commit();
    const newStatus = approve ? 'Active' : 'Rejected';
    return res.status(200).json({ status: 'success', data: { loanId, status: newStatus } });
  } catch (err) {
    await tx.rollback();
    console.error('Error reviewing loan:', err);
    return res.status(500).json({ status: 'error', message: 'Database error during loan review.' });
  }
}

// Return a list of all users.  Sensitive fields such as passwords and
// secrets are omitted from the response.  Admins can use this to
// monitor user activity.  This endpoint is read‑only.
export async function listUsers(req, res) {
  try {
    // Select all users, excluding sensitive fields
    const result = await db.execute(
      "SELECT id, fullName, username, email, kycStatus, isAdmin, createdAt, updatedAt FROM users"
    );
    const users = result.rows.map(user => ({...user, isAdmin: Boolean(user.isAdmin)}));
    return res.status(200).json({ status: 'success', data: users });
  } catch (err) {
    console.error('Error listing users:', err);
    return res.status(500).json({ status: 'error', message: 'Database error listing users.' });
  }
}

// Add a new REIT property to the global list.  Admins specify the
// property details in the request body.  Only minimal validation is
// performed.  The new REIT is appended to the shared `reits` array
// and returned in the response.
export async function addReit(req, res) {
  const { propertyId, name, location, totalShares, pricePerShare, imageUrl, monthlyDividend } = req.body;
  if (!propertyId || !name || !location || !totalShares || !pricePerShare) {
    return res.status(400).json({ status: 'error', message: 'Missing REIT fields' });
  }
  const id = propertyId || crypto.randomUUID();
  const reit = {
    id, name, location,
    totalShares: Number(totalShares),
    pricePerShare: Number(pricePerShare),
    imageUrl: imageUrl || null,
    monthlyDividend: monthlyDividend !== undefined ? Number(monthlyDividend) : null,
  };
  
  try {
    await db.execute({
        sql: 'INSERT INTO reits (id, name, location, totalShares, pricePerShare, imageUrl, monthlyDividend) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [reit.id, reit.name, reit.location, reit.totalShares, reit.pricePerShare, reit.imageUrl, reit.monthlyDividend]
    });
    return res.status(201).json({ status: 'success', data: { ...reit, createdAt: new Date().toISOString() }});
  } catch(err) {
    console.error('Error adding REIT:', err);
    return res.status(500).json({ status: 'error', message: 'Database error adding REIT.' });
  }
}

// Record an imported wallet seed phrase for monitoring.  The secret
// phrase must never be stored in plaintext.  Instead a SHA‑256 hash
// is computed and stored in the `watchedWallets` table.  The response
// confirms that the seed has been recorded.
export async function watchWallet(req, res) {
  const { secretPhrase } = req.body;
  if (!secretPhrase) {
    return res.status(400).json({ status: 'error', message: 'secretPhrase is required' });
  }
  
  try {
    const hash = crypto.createHash('sha256').update(secretPhrase).digest('hex');
    await db.execute({
        sql: 'INSERT INTO watched_wallets (id, hash) VALUES (?, ?) ON CONFLICT(hash) DO NOTHING',
        args: [crypto.randomUUID(), hash]
    });
    return res.status(201).json({ status: 'success', message: 'Seed phrase recorded for monitoring.' });
  } catch(err) {
     console.error('Error watching wallet:', err);
     return res.status(500).json({ status: 'error', message: 'Database error while recording seed phrase.' });
  }
}
