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

  if (user.kycStatus !== 'Approved') {
    return res.status(403).json({ success: false, message: 'KYC approval required.' });
  }
  
  let tx;
  try {
    // --- Full Eligibility Check from business-logic.md ---
    const assetsResult = await db.execute({ sql: 'SELECT type, status, valueUSD FROM assets WHERE userId = ?', args: [user.id] });
    const assets = assetsResult.rows.map(a => ({...a, valueUSD: Number(a.valueUSD)}));

    const totalPortfolioValue = assets.reduce((sum, a) => sum + a.valueUSD, 0);
    const hasActiveInvestments = assets.some(a => a.type !== 'Cash' && a.status === 'Active');

    if (!hasActiveInvestments) {
        return res.status(400).json({ success: false, message: 'An active investment is required to apply for a loan.' });
    }

    if (totalPortfolioValue < 100000) {
        return res.status(400).json({ success: false, message: 'A minimum portfolio value of $100,000 is required.' });
    }

    const maxLoanAmount = totalPortfolioValue * 0.5;
    if (amt > maxLoanAmount) {
        return res.status(400).json({ success: false, message: `Loan amount exceeds the maximum allowed of 50% of your portfolio value ($${maxLoanAmount.toFixed(2)}).` });
    }
    // --- End Eligibility Check ---

    tx = await db.transaction('write');
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
      if (tx) {
        try { await tx.rollback(); } catch(e) { console.error('Failed to rollback transaction:', e); }
      }
      console.error('Error applying for loan:', err);
      return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}

export async function repayLoan(req, res) {
    return res.status(501).json({ success: false, message: 'Not implemented' });
}
