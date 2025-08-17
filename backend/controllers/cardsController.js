import crypto from 'crypto';
import { db } from '../lib/db.js';

const getCardForUser = async (userId) => {
    const result = await db.execute({
        sql: 'SELECT * FROM valifi_cards WHERE userId = ?',
        args: [userId],
    });
    return result.rows.length > 0 ? result.rows[0] : null;
};

// Return the user's card details.  If no card exists, a default object
// indicating that the user has not applied is returned.
export async function getCardDetails(req, res) {
  try {
    const card = await getCardForUser(req.user.id);
    if (!card) {
      return res.status(200).json({ status: 'success', data: { status: 'Not Applied' } });
    }
    return res.status(200).json({ status: 'success', data: card });
  } catch(err) {
    console.error('Error getting card details:', err);
    return res.status(500).json({ status: 'error', message: 'Database error fetching card details.' });
  }
}

// Submit a new card application.  The provided CardApplicationData must
// specify type and currency.  Applications require the user to be KYC
// approved (handled by middleware on the route).  The new card is added
// with a status of 'Pending Approval'.
export async function applyForCard(req, res) {
  const user = req.user;
  const { type, currency, theme } = req.body;
  if (!type || !currency) {
    return res.status(400).json({ status: 'error', message: 'Card type and currency are required' });
  }
  
  try {
    const existingCard = await getCardForUser(user.id);
    if (existingCard) {
        return res.status(400).json({ status: 'error', message: 'User already has a card or an application is pending.' });
    }
    
    const id = crypto.randomUUID();
    const newCard = {
        id,
        userId: user.id,
        status: 'Pending Approval',
        type,
        currency,
        theme: theme || 'default',
        isFrozen: false,
    };

    await db.execute({
        sql: 'INSERT INTO valifi_cards (id, userId, status, type, currency, theme) VALUES (?, ?, ?, ?, ?, ?)',
        args: [id, user.id, 'Pending Approval', type, currency, theme || 'default']
    });

    // Simulate async approval
    setTimeout(async () => {
      try {
        await db.execute({
          sql: `UPDATE valifi_cards SET status = 'Approved', cardNumberHash = ?, expiry = ?, cvvHash = ? WHERE id = ? AND status = 'Pending Approval'`,
          args: [
            crypto.createHash('sha256').update('2637841234567890').digest('hex'),
            '12/28', // This should be encrypted in a real app
            crypto.createHash('sha256').update('123').digest('hex'),
            id,
          ]
        });
        console.log(`Card ${id} auto-approved.`);
      } catch(e) {
        console.error(`Error auto-approving card ${id}:`, e);
      }
    }, 10000);


    return res.status(202).json({ status: 'success', data: { cardDetails: newCard } });
  } catch(err) {
      console.error('Error applying for card:', err);
      return res.status(500).json({ status: 'error', message: 'Database error during card application.' });
  }
}

// Freeze or unfreeze a card.  The request body contains a boolean flag
// indicating the desired state.  Only an existing card may be frozen or
// unfrozen.
export async function freezeCard(req, res) {
  const user = req.user;
  const { freeze } = req.body;
  
  try {
    const card = await getCardForUser(user.id);
    if (!card) {
      return res.status(404).json({ status: 'error', message: 'Card not found' });
    }
    
    await db.execute({
        sql: 'UPDATE valifi_cards SET isFrozen = ? WHERE userId = ?',
        args: [Boolean(freeze), user.id]
    });

    card.isFrozen = Boolean(freeze);
    return res.status(200).json({ status: 'success', data: card });
  } catch(err) {
    console.error('Error freezing card:', err);
    return res.status(500).json({ status: 'error', message: 'Database error during card freeze operation.' });
  }
}
