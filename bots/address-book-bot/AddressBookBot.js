const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * AddressBookBot scaffolds management of a secure contact list.
 * Users will be able to add, remove and list contacts.  Actions
 * currently return not implemented.
 */
class AddressBookBot extends KingdomBot {
  constructor(core) {
    super(core);
    this.dataFile = 'data/address_book.json';
    const { readData } = require('../../lib/storage');
    // Load or initialize address books keyed by userId
    this.addressBooks = readData(this.dataFile);
  }

  async initialize() {
    this.logDivineAction('Address Book Bot Initialized');
    return true;
  }

  /**
   * Main dispatch for the AddressBookBot.  Supports adding, removing
   * and listing contacts for a user.  Contacts are persisted to
   * data/address_book.json keyed by userId.
   *
   * @param {object} params
   */
  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'add_contact':
        return this.addContact(params);
      case 'remove_contact':
        return this.removeContact(params);
      case 'list_contacts':
        return this.listContacts(params);
      default:
        return { success: false, message: `Unknown action for AddressBookBot: ${action}` };
    }
  }

  /**
   * Adds a contact to a user's address book.
   * @param {{ userId: string, name: string, address: string, chain?: string }} params
   */
  addContact({ userId, name, address, chain }) {
    const { writeData } = require('../../lib/storage');
    userId = userId || 'default';
    if (!name || !address) {
      return { success: false, message: 'Missing name or address' };
    }
    const contact = {
      id: `contact_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      name,
      address,
      chain: chain ? chain.toUpperCase() : 'ETH',
    };
    const list = this.addressBooks[userId] || [];
    list.push(contact);
    this.addressBooks[userId] = list;
    writeData(this.dataFile, this.addressBooks);
    this.logDivineAction('Contact Added', { userId, contact });
    return { success: true, contact };
  }

  /**
   * Removes a contact from a user's address book by id.
   * @param {{ userId: string, contactId: string }} params
   */
  removeContact({ userId, contactId }) {
    const { writeData } = require('../../lib/storage');
    userId = userId || 'default';
    if (!contactId) {
      return { success: false, message: 'Missing contactId' };
    }
    const list = this.addressBooks[userId] || [];
    const idx = list.findIndex((c) => c.id === contactId);
    if (idx < 0) {
      return { success: false, message: 'Contact not found' };
    }
    const removed = list.splice(idx, 1)[0];
    this.addressBooks[userId] = list;
    writeData(this.dataFile, this.addressBooks);
    this.logDivineAction('Contact Removed', { userId, contactId });
    return { success: true, removed };
  }

  /**
   * Lists all contacts for a user.
   * @param {{ userId: string }} params
   */
  listContacts({ userId }) {
    userId = userId || 'default';
    const list = this.addressBooks[userId] || [];
    return { success: true, userId, contacts: list };
  }
}

module.exports = AddressBookBot;