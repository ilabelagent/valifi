import { db } from '../lib/db.js';

// Mark a single notification as read.
export async function markAsRead(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    await db.execute({
      sql: 'UPDATE notifications SET isRead = TRUE WHERE id = ? AND userId = ?',
      args: [id, userId],
    });
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    return res.status(500).json({ status: 'error', message: 'Database error.' });
  }
}

// Delete a single notification.
export async function deleteNotification(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    await db.execute({
      sql: 'DELETE FROM notifications WHERE id = ? AND userId = ?',
      args: [id, userId],
    });
    return res.status(204).end();
  } catch (err) {
    console.error('Error deleting notification:', err);
    return res.status(500).json({ status: 'error', message: 'Database error.' });
  }
}

// Mark all notifications as read.
export async function markAllAsRead(req, res) {
  const userId = req.user.id;
  try {
    await db.execute({
      sql: 'UPDATE notifications SET isRead = TRUE WHERE userId = ? AND isRead = FALSE',
      args: [userId],
    });
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    return res.status(500).json({ status: 'error', message: 'Database error.' });
  }
}

// Clear all read notifications.
export async function clearAll(req, res) {
  const userId = req.user.id;
  try {
    await db.execute({
      sql: 'DELETE FROM notifications WHERE userId = ? AND isRead = TRUE',
      args: [userId],
    });
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('Error clearing read notifications:', err);
    return res.status(500).json({ status: 'error', message: 'Database error.' });
  }
}
