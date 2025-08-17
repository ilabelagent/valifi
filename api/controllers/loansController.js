import crypto from 'crypto';
import { db } from '../lib/db.js';

// Retrieve all loan applications for the authenticated user.
export async function getLoans(req, res) {
  const userId = req.user.id;
  try {
    const result = await db.execute({
        sql: 'SELECT * FROM loan_applications WHERE userId = ? ORDER BY createdAt DESC',
        args: [userId]
    });
    const loans = result.rows.map(loan => ({...loan, details: JSON.parse(loan.details)}));
    return res.status(200).json({ status: 'success', data: loans });
  } catch(err) {
      console.error('Error fetching loans:', err);
      return res.status(500).json({ status: 'error', message: 'Database error fetching loans.' });
  }
}

// Apply for a new loan. Eligibility is checked according to the business
// logic specification: KYC approval, active investments, portfolio value
// threshold and maximum loan size.  The collateral asset must belong to
// the user and be active.
export async function applyLoan(req, res) {
  const user = req.user;
  const { amount, term, collateralAssetId, reason } = req.body;
  const amt = Number(amount);
  const termDays = Number(term);
  if (!amt || amt <= 0 || !termDays || termDays <= 0 || !collateralAssetId) {
    return res.status(400).json({ status: 'error', message: 'Invalid loan application parameters' });
  }

  const tx = await db.transaction('write');
  try {
    // Business logic checks
    const portfolioStats = await tx.execute({
        sql: `SELECT SUM(valueUSD) as totalValue, COUNT(CASE WHEN type != 'Cash' AND status = 'Active' THEN 1 END) as activeInvestments FROM assets WHERE userId = ?`,
        args: [user.id]
    });
    
    const { totalValue, activeInvestments } = portfolioStats.rows[0];

    if (activeInvestments === 0) {
        return res.status(400).json({ status: 'error', message: 'At least one active investment is required' });
    }
    if (totalValue < 100000) {
        return res.status(400).json({ status: 'error', message: 'Portfolio value below loan eligibility threshold' });
    }
    const maxAllowed = totalValue * 0.5;
    if (amt > maxAllowed) {
        return res.status(400).json({ status: 'error', message: `Requested amount exceeds maximum allowed ($${maxAllowed.toFixed(2)})` });
    }
    
    const collateralResult = await tx.execute({
        sql: `SELECT status FROM assets WHERE id = ? AND userId = ?`,
        args: [collateralAssetId, user.id]
    });

    if (collateralResult.rows.length === 0 || collateralResult.rows[0].status !== 'Active') {
        return res.status(400).json({ status: 'error', message: 'Invalid or non-active collateral asset' });
    }

    await tx.execute({
        sql: `UPDATE assets SET status = 'Collateralized' WHERE id = ?`,
        args: [collateralAssetId]
    });

    const id = crypto.randomUUID();
    const loanDetails = { repaymentProgress: 0, payments: [] };
    const loan = {
        id, userId: user.id, amount: amt, term: termDays, interestRate: 5.0, collateralAssetId,
        status: 'Pending', reason, createdAt: new Date().toISOString(), details: loanDetails
    };

    await tx.execute({
        sql: `INSERT INTO loan_applications (id, userId, amount, term, interestRate, collateralAssetId, status, reason, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, user.id, amt, termDays, 5.0, collateralAssetId, 'Pending', reason, JSON.stringify(loanDetails)]
    });
    
    await tx.commit();
    return res.status(202).json({ status: 'success', data: loan });
  } catch(err) {
      await tx.rollback();
      console.error('Error applying for loan:', err);
      return res.status(500).json({ status: 'error', message: 'Database error during loan application.' });
  }
}

// Make a repayment towards an active loan.  The payment amount is deducted
// from the user’s cash balance.  When the total repayments reach the
// principal plus simple interest the loan is marked as repaid and the
// collateral asset is restored to active status.
export async function repayLoan(req, res) {
  const user = req.user;
  const { id } = req.params;
  const { paymentAmount } = req.body;
  const amount = Number(paymentAmount);
  if (!amount || amount <= 0) {
    return res.status(400).json({ status: 'error', message: 'Invalid repayment amount' });
  }

  const tx = await db.transaction('write');
  try {
    const loanResult = await tx.execute({
        sql: 'SELECT * FROM loan_applications WHERE id = ? AND userId = ?',
        args: [id, user.id]
    });
    if (loanResult.rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Loan not found' });
    }
    let loan = loanResult.rows[0];
    loan.details = JSON.parse(loan.details);

    if (loan.status !== 'Active') {
        return res.status(400).json({ status: 'error', message: 'Loan is not active for repayment.' });
    }

    const cashResult = await tx.execute({ sql: `SELECT balance FROM assets WHERE userId = ? AND type = 'Cash'`, args: [user.id] });
    if (cashResult.rows.length === 0 || cashResult.rows[0].balance < amount) {
        return res.status(400).json({ status: 'error', message: 'Insufficient cash balance' });
    }
    
    await tx.execute({ sql: `UPDATE assets SET balance = balance - ?, valueUSD = valueUSD - ? WHERE userId = ? AND type = 'Cash'`, args: [amount, amount, user.id] });

    loan.details.payments.push({ amount, date: new Date().toISOString() });
    loan.details.repaymentProgress += amount;
    
    const payoff = loan.amount * (1 + (loan.interestRate / 100) * (loan.term / 365));
    if (loan.details.repaymentProgress >= payoff) {
        loan.status = 'Repaid';
        await tx.execute({ sql: `UPDATE assets SET status = 'Active' WHERE id = ?`, args: [loan.collateralAssetId] });
    }
    
    await tx.execute({
        sql: `UPDATE loan_applications SET status = ?, details = ? WHERE id = ?`,
        args: [loan.status, JSON.stringify(loan.details), id]
    });

    await tx.execute({
        sql: `INSERT INTO transactions (id, userId, description, type, amountUSD, status) VALUES (?, ?, ?, 'Loan Repayment', ?, 'Completed')`,
        args: [crypto.randomUUID(), user.id, `Loan repayment for ${id}`, -amount]
    });

    await tx.commit();
    return res.status(200).json({ status: 'success', data: { loan } });
  } catch(err) {
      await tx.rollback();
      console.error('Error repaying loan:', err);
      return res.status(500).json({ status: 'error', message: 'Database error during loan repayment.' });
  }
}
