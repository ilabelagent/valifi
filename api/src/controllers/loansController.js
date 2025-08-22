import crypto from 'crypto';
import { db } from '../lib/db.js';

const processLoan = (loan) => ({
    ...loan,
    amount: Number(loan.amount),
    term: Number(loan.term),
    interestRate: Number(loan.interestRate),
    repaymentProgress: Number(loan.repaymentProgress || 0),
    finalAmountRepaid: Number(loan.finalAmountRepaid || 0),
    interestPaid: Number(loan.interestPaid || 0),
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
        status: 'Pending', reason, createdAt: new Date().toISOString()
    };

    await tx.execute({
        sql: `INSERT INTO loan_applications (id, userId, amount, term, interestRate, collateralAssetId, status, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, user.id, amt, Number(term), 5.0, collateralAssetId, 'Pending', reason]
    });
    
    // Mark collateral asset
    await tx.execute({sql: `UPDATE assets SET status = 'Collateralized' WHERE id = ?`, args: [collateralAssetId]});

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
    const { id } = req.params;
    const { paymentAmount } = req.body;
    const userId = req.user.id;
    const amountToPay = Number(paymentAmount);

    if (!amountToPay || amountToPay <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid payment amount.' });
    }

    let tx;
    try {
        tx = await db.transaction('write');
        
        const [loanResult, cashResult] = await Promise.all([
             tx.execute({ sql: 'SELECT * FROM loan_applications WHERE id = ? AND userId = ?', args: [id, userId] }),
             tx.execute({ sql: 'SELECT balance FROM assets WHERE userId = ? AND type = "Cash"', args: [userId] })
        ]);

        if (loanResult.rows.length === 0) {
            await tx.rollback();
            return res.status(404).json({ success: false, message: 'Active loan not found.' });
        }
        if (cashResult.rows.length === 0 || Number(cashResult.rows[0].balance) < amountToPay) {
            await tx.rollback();
            return res.status(400).json({ success: false, message: 'Insufficient cash balance for repayment.' });
        }

        const loan = processLoan(loanResult.rows[0]);
        const totalDue = loan.amount * (1 + loan.interestRate / 100);
        const totalPaid = loan.finalAmountRepaid; // Assuming details json stores this
        const remainingDue = totalDue - totalPaid;

        if (amountToPay > remainingDue) {
            await tx.rollback();
            return res.status(400).json({ success: false, message: `Payment of ${amountToPay} exceeds remaining balance of ${remainingDue}.` });
        }
        
        // Debit user's cash
        await tx.execute({ sql: 'UPDATE assets SET balance = balance - ?, valueUSD = valueUSD - ? WHERE userId = ? AND type = "Cash"', args: [amountToPay, amountToPay, userId] });

        // Update loan progress
        const newTotalPaid = totalPaid + amountToPay;
        const newProgress = (newTotalPaid / totalDue) * 100;
        const isFullyRepaid = newTotalPaid >= totalDue;

        await tx.execute({
            sql: `UPDATE loan_applications SET finalAmountRepaid = ?, repaymentProgress = ?, status = ? WHERE id = ?`,
            args: [newTotalPaid, newProgress, isFullyRepaid ? 'Repaid' : loan.status, id]
        });

        if (isFullyRepaid) {
             // Un-collateralize asset
            await tx.execute({ sql: `UPDATE assets SET status = 'Active' WHERE id = ? AND status = 'Collateralized'`, args: [loan.collateralAssetId] });
        }
        
        await tx.commit();
        res.status(200).json({ success: true, message: 'Payment successful.' });

    } catch (err) {
        if (tx) { try { await tx.rollback(); } catch(e) {} }
        console.error('Error repaying loan:', err);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
}