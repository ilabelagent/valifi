import crypto from 'crypto';
import { db } from '../lib/db.js';

export async function reviewLoan(req, res) {
  const { loanId, approve } = req.body;
  if (!loanId || approve === undefined) {
    return res.status(400).json({ success: false, message: 'loanId and approve flag are required' });
  }

  try {
    await db.execute('BEGIN');
    const loanResult = await db.execute({
      sql: 'SELECT * FROM loan_applications WHERE id = ?',
      args: [loanId],
    });

    if (loanResult.rows.length === 0) {
      await db.execute('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Loan not found.' });
    }
    const loan = loanResult.rows[0];
    const loanAmount = Number(loan.amount);

    if (approve) {
      await db.execute({
        sql: `UPDATE loan_applications SET status = 'Active', details = json_set(details, '$.startDate', ?) WHERE id = ?`,
        args: [new Date().toISOString(), loanId],
      });
      await db.execute({
        sql: `UPDATE assets SET balance = balance + ?, valueUSD = valueUSD + ? WHERE userId = ? AND type = 'Cash'`,
        args: [loanAmount, loanAmount, loan.userId],
      });
    } else {
      await db.execute({
        sql: `UPDATE loan_applications SET status = 'Rejected' WHERE id = ?`,
        args: [loanId],
      });
      // Return collateralized asset to active status
      await db.execute({
          sql: `UPDATE assets SET status = 'Active' WHERE id = ? AND status = 'Collateralized'`,
          args: [loan.collateralAssetId]
      });
    }

    await db.execute('COMMIT');
    return res.status(200).json({ success: true, message: `Loan ${approve ? 'approved' : 'rejected'}.` });
  } catch (err) {
    try { await db.execute('ROLLBACK'); } catch(e) { console.error('Failed to rollback transaction:', e); }
    console.error('Error reviewing loan:', err);
    return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}

// Other admin functions would go here and also include robust error handling
export async function reviewKyc(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function listUsers(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function addReit(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function watchWallet(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
