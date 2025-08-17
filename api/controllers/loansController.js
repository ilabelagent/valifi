import crypto from 'crypto';
import { db } from '../lib/db.js';

const processLoan = (loan) => ({
    ...loan,
    amount: Number(loan.amount),
    term: Number(loan.term),
    interestRate: Number(loan.interestRate),
    details: typeof loan.details === 'string' ? JSON.parse(loan.details) : loan.details,
});

export async function getLoans(req, res) {
  try {
    const result = await db.execute({ sql: 'SELECT * FROM loan_applications WHERE userId = ? ORDER BY createdAt DESC', args: [req.user.id] });
    return res.status(200).json({ success: true, data: result.rows.map(processLoan) });
  } catch(err) {
      console.error('Error fetching loans:', err);
      return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}

export async function applyForLoan(req, res) {
  const user = req.user;
  const { amount, term, collateralAssetId, reason } = req.body;
  const amt = Number(amount);

  // Business logic checks (abbreviated for clarity)
  if (user.kycStatus !== 'Approved') {
    return res.status(403).json({ success: false, message: 'KYC approval required.' });
  }
  
  let tx;
  try {
    tx = await db.transaction('write');
    // ... (Perform all eligibility checks from business-logic.md here)
    const id = crypto.randomUUID();
    const loan = {
        id, userId: user.id, amount: amt, term: Number(term), interestRate: 5.0, collateralAssetId,
        status: 'Pending', reason, createdAt: new Date().toISOString(), details: {}
    };

    await tx.execute({
        sql: `INSERT INTO loan_applications (id, userId, amount, term, interestRate, collateralAssetId, status, reason, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, user.id, amt, Number(term), 5.0, collateralAssetId, 'Pending', reason, '{}']
    });
    
    await tx.commit();
    return res.status(202).json({ success: true, data: loan });
  } catch(err) {
      if (tx) await tx.rollback();
      console.error('Error applying for loan:', err);
      return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}

export async function repayLoan(req, res) {
    return res.status(501).json({ success: false, message: 'Not implemented' });
}
