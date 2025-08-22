import crypto from 'crypto';
import { db } from '../lib/db.js';

export async function reviewLoan(req, res) {
  const { loanId, approve, rejectionReason } = req.body;
  if (!loanId || approve === undefined) {
    return res.status(400).json({ success: false, message: 'loanId and approve flag are required' });
  }
  if (!approve && !rejectionReason) {
    return res.status(400).json({ success: false, message: 'Rejection reason is required when rejecting a loan.' });
  }

  let tx;
  try {
    tx = await db.transaction('write');
    const loanResult = await tx.execute({
      sql: 'SELECT * FROM loan_applications WHERE id = ?',
      args: [loanId],
    });

    if (loanResult.rows.length === 0) {
      await tx.rollback();
      return res.status(404).json({ success: false, message: 'Loan not found.' });
    }
    const loan = loanResult.rows[0];
    const loanAmount = Number(loan.amount);
    
    if (loan.status !== 'Pending') {
        await tx.rollback();
        return res.status(400).json({ success: false, message: `Loan is not in 'Pending' state. Current state: ${loan.status}` });
    }

    if (approve) {
      const termInDays = Number(loan.term);
      const startDate = new Date();
      const dueDate = new Date(startDate);
      dueDate.setDate(startDate.getDate() + termInDays);

      const details = {
          startDate: startDate.toISOString(),
          dueDate: dueDate.toISOString(),
          repaymentProgress: 0,
      };

      await tx.execute({
        sql: `UPDATE loan_applications SET status = 'Active', details = ? WHERE id = ?`,
        args: [JSON.stringify(details), loanId],
      });
      await tx.execute({
        sql: `UPDATE assets SET balance = balance + ?, valueUSD = valueUSD + ? WHERE userId = ? AND type = 'Cash'`,
        args: [loanAmount, loanAmount, loan.userId],
      });
    } else {
      await tx.execute({
        sql: `UPDATE loan_applications SET status = 'Rejected', rejectionReason = ? WHERE id = ?`,
        args: [rejectionReason, loanId],
      });
      // Return collateralized asset to active status
      await tx.execute({
          sql: `UPDATE assets SET status = 'Active' WHERE id = ? AND status = 'Collateralized'`,
          args: [loan.collateralAssetId]
      });
    }

    await tx.commit();
    return res.status(200).json({ success: true, message: `Loan ${approve ? 'approved' : 'rejected'}.` });
  } catch (err) {
    if (tx) {
        try { await tx.rollback(); } catch(e) { console.error('Failed to rollback transaction:', e); }
    }
    console.error('Error reviewing loan:', err);
    return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}


export async function reviewKyc(req, res) {
  const { userId, approve, rejectionReason } = req.body;
  if (!userId || approve === undefined) {
    return res.status(400).json({ success: false, message: 'userId and approve status are required' });
  }
  if (!approve && !rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
  }
  
  const newStatus = approve ? 'Approved' : 'Rejected';
  
  try {
      await db.execute({
          sql: `UPDATE users SET kycStatus = ?, kycRejectionReason = ? WHERE id = ?`,
          args: [newStatus, approve ? null : rejectionReason, userId]
      });
      res.status(200).json({ success: true, message: `User KYC status updated to ${newStatus}` });
  } catch (err) {
      console.error('Error reviewing KYC:', err);
      res.status(500).json({ success: false, message: 'An internal error occurred.' });
  }
}

export async function listUsers(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function addReit(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function watchWallet(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }