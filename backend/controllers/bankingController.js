import crypto from 'crypto';
import { db } from '../lib/db.js';

// List all linked bank accounts for the user.
export async function getBankAccounts(req, res) {
  const userId = req.user.id;
  try {
    const result = await db.execute({
      sql: 'SELECT id, countryCode, nickname, details, status, rejectionReason, accountDisplay FROM bank_accounts WHERE userId = ?',
      args: [userId],
    });
    const accounts = result.rows.map(row => ({
        ...row,
        details: JSON.parse(row.details)
    }));
    return res.status(200).json({ status: 'success', data: accounts });
  } catch (err) {
    console.error('Error getting bank accounts:', err);
    return res.status(500).json({ status: 'error', message: 'Database error fetching accounts.' });
  }
}

// Link a new bank account. The account is added with a status of 'Pending'.
export async function addBankAccount(req, res) {
  const userId = req.user.id;
  const { countryCode, nickname, details, accountDisplay } = req.body;

  if (!countryCode || !nickname || !details || !accountDisplay) {
    return res.status(400).json({ status: 'error', message: 'Missing bank account fields' });
  }

  const id = crypto.randomUUID();
  const account = {
    id,
    userId,
    countryCode,
    nickname,
    details,
    status: 'Pending',
    accountDisplay,
  };

  try {
    await db.execute({
      sql: 'INSERT INTO bank_accounts (id, userId, countryCode, nickname, details, status, accountDisplay) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [id, userId, countryCode, nickname, JSON.stringify(details), 'Pending', accountDisplay],
    });

    // Simulate async verification
    setTimeout(async () => {
        try {
            await db.execute({
                sql: `UPDATE bank_accounts SET status = 'Verified' WHERE id = ? AND status = 'Pending'`,
                args: [id]
            });
            console.log(`Bank account ${id} auto-verified.`);
        } catch(e) {
            console.error(`Error auto-verifying bank account ${id}:`, e);
        }
    }, 10000);

    return res.status(202).json({ status: 'success', data: account });
  } catch (err) {
    console.error('Error adding bank account:', err);
    return res.status(500).json({ status: 'error', message: 'Database error linking account.' });
  }
}

// Delete a bank account.
export async function deleteBankAccount(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    await db.execute({
      sql: 'DELETE FROM bank_accounts WHERE id = ? AND userId = ?',
      args: [id, userId],
    });
    return res.status(204).end();
  } catch (err) {
    console.error('Error deleting bank account:', err);
    return res.status(500).json({ status: 'error', message: 'Database error deleting account.' });
  }
}
