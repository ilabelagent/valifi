import { db } from '../lib/db.js';

// Fetches the profile and settings for the authenticated user.
export async function getUserProfile(req, res) {
  const userId = req.user.id;
  try {
    // The user object from the middleware might be stale, so we refetch.
    const userResult = await db.execute({
      sql: `SELECT id, fullName, username, email, profilePhotoUrl, kycStatus, kycRejectionReason, createdAt, updatedAt FROM users WHERE id = ?`,
      args: [userId]
    });
    
    if (userResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const profile = userResult.rows[0];

    const settingsResult = await db.execute({
        sql: 'SELECT * FROM user_settings WHERE userId = ?',
        args: [userId]
    });
    
    let settings = {};
    if (settingsResult.rows.length > 0) {
        const dbSettings = settingsResult.rows[0];
        settings = {
            twoFactorAuth: {
                enabled: Boolean(dbSettings.twoFactorEnabled),
                method: dbSettings.twoFactorMethod,
            },
            loginAlerts: Boolean(dbSettings.loginAlerts),
            preferences: JSON.parse(dbSettings.preferences || '{}'),
            privacy: JSON.parse(dbSettings.privacy || '{}'),
            vaultRecovery: JSON.parse(dbSettings.vaultRecovery || '{}'),
        }
    }

    const sessionsResult = await db.execute({
        sql: 'SELECT * FROM active_sessions WHERE userId = ? ORDER BY lastActive DESC',
        args: [userId]
    });


    const responseData = {
        profile,
        settings,
        sessions: sessionsResult.rows
    };

    return res.status(200).json({ success: true, data: responseData });
  } catch(err) {
      console.error('Error fetching user profile:', err);
      return res.status(500).json({ success: false, message: 'Database error fetching user data.' });
  }
}

// Updates the user's settings.
export async function updateUserSettings(req, res) {
  const userId = req.user.id;
  const { profile, settings } = req.body;
  
  let tx;
  try {
      tx = await db.transaction('write');
      if (profile) {
        await tx.execute({
            sql: 'UPDATE users SET fullName = ?, username = ?, profilePhotoUrl = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            args: [profile.fullName, profile.username, profile.profilePhotoUrl, userId]
        });
      }

      if (settings) {
          await tx.execute({
              sql: `UPDATE user_settings SET 
                twoFactorEnabled = ?, 
                twoFactorMethod = ?, 
                loginAlerts = ?, 
                preferences = ?, 
                privacy = ?
                WHERE userId = ?`,
              args: [
                  settings.twoFactorAuth.enabled,
                  settings.twoFactorAuth.method,
                  settings.loginAlerts,
                  JSON.stringify(settings.preferences || {}),
                  JSON.stringify(settings.privacy || {}),
                  userId
              ]
          });
      }
      
      await tx.commit();
      
      // Refetch the updated data to send back
      return getUserProfile(req, res);

  } catch(err) {
      if (tx) {
        try { await tx.rollback(); } catch (e) { console.error('Failed to rollback transaction:', e); }
      }
      console.error('Error updating settings:', err);
      return res.status(500).json({ success: false, message: 'Database error updating settings.' });
  }
}