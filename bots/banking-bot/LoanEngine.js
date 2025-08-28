/**
 * LoanEngine handles simple loan applications.  Given application data
 * and an underwriting result from the AI engine, it decides whether to
 * approve the loan.  If approved, a repayment schedule is returned.
 */
class LoanEngine {
  constructor(db, ai) {
    this.db = db;
    this.ai = ai;
  }
  async processApplication(data, underwritingResult) {
    // Determine approval based on underwriting decision
    const decision = underwritingResult.underwriting_decision || 'DECLINE';
    const approved = decision === 'APPROVE';
    if (!approved) {
      return { success: true, approved: false, message: 'Loan declined.' };
    }
    const amount = Number(data.amount);
    const term = Number(data.term);
    // Compute simple repayment schedule
    const monthlyRate = 0.05 / 12;
    const monthlyPayment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
    const schedule = [];
    let remaining = amount;
    for (let i = 1; i <= term; i++) {
      const interest = remaining * monthlyRate;
      const principal = monthlyPayment - interest;
      remaining -= principal;
      schedule.push({
        month: i,
        payment: Number(monthlyPayment.toFixed(2)),
        principal: Number(principal.toFixed(2)),
        interest: Number(interest.toFixed(2)),
        balance: Number(Math.max(remaining, 0).toFixed(2)),
      });
    }
    return {
      success: true,
      approved: true,
      message: 'Loan approved.',
      loan_amount: amount,
      term_months: term,
      monthly_payment: Number(monthlyPayment.toFixed(2)),
      repayment_schedule: schedule,
    };
  }
}
module.exports = LoanEngine;