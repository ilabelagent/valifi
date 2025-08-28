const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * MailBot simulates sending and receiving messages for users.  It
 * stores mail in an in‑memory mailbox keyed by user ID.  Because
 * there is no real mail delivery here, sending a message simply
 * appends it to the recipient's inbox and logs the action.  It also
 * supports sending generic notifications.
 */
class MailBot extends KingdomBot {
  constructor(core) {
    super(core);
    if (!MailBot.mailboxes) {
      MailBot.mailboxes = {};
    }
  }
  async initialize() {
    this.logDivineAction('Mail Bot Initialised');
    return true;
  }
  async execute(params = {}) {
    const action = params.action || 'status';
    switch (action) {
      case 'send_mail':
        return this.sendMail(params);
      case 'get_messages':
        return this.getMessages(params);
      case 'notify':
        return this.sendNotification(params);
      default:
        return { success: false, message: 'Unknown mail action.' };
    }
  }
  /**
   * Send an email.  Expects user_id, to_email, subject and body.
   */
  sendMail({ user_id, to_email, subject, body }) {
    if (!user_id || !to_email || !subject || !body) {
      return { success: false, message: 'Missing mail fields.' };
    }
    const msg = {
      id: Date.now(),
      from: user_id,
      to: to_email,
      subject,
      body,
      timestamp: Date.now(),
    };
    if (!MailBot.mailboxes[to_email]) MailBot.mailboxes[to_email] = [];
    MailBot.mailboxes[to_email].push(msg);
    this.logDivineAction('Mail Sent', { from: user_id, to: to_email, subject });
    return { success: true, message: 'Mail queued for delivery.' };
  }
  /**
   * Retrieve all messages for a user email.  Expects email or user_id.
   */
  getMessages({ email, user_id }) {
    const inbox = MailBot.mailboxes[email || user_id] || [];
    return { success: true, messages: inbox };
  }
  /**
   * Send a generic notification.  Expects user_id and message.
   */
  sendNotification({ user_id, message }) {
    if (!user_id || !message) return { success: false, message: 'Missing notification fields.' };
    if (!MailBot.mailboxes[user_id]) MailBot.mailboxes[user_id] = [];
    const notification = {
      id: Date.now(),
      type: 'notification',
      message,
      timestamp: Date.now(),
    };
    MailBot.mailboxes[user_id].push(notification);
    this.logDivineAction('Notification Sent', { to: user_id });
    return { success: true, message: 'Notification delivered.' };
  }
  getCapabilities() {
    return {
      mail: ['send_mail', 'get_messages', 'notify'],
    };
  }
}
module.exports = MailBot;