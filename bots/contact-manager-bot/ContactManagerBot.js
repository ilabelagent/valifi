/**
 * CONTACT MANAGER BOT
 * Manages 34K+ contacts with AI-powered organization
 */

const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');

class ContactManagerBot extends EventEmitter {
  constructor() {
    super();
    this.name = "ContactManagerBot";
    this.contacts = new Map();
    this.contactsLoaded = false;
    
    console.log('📇 Contact Manager Bot initialized');
  }

  async initialize() {
    await this.loadContacts();
    return { success: true };
  }

  async loadContacts() {
    try {
      const vcfPath = path.join(__dirname, '../../attached_assets/contacts_1759537344902.vcf');
      const vcfContent = await fs.readFile(vcfPath, 'utf8');
      
      const vcards = vcfContent.split('BEGIN:VCARD').filter(v => v.trim());
      
      for (const vcard of vcards) {
        const contact = this.parseVCard(vcard);
        if (contact.id) {
          this.contacts.set(contact.id, contact);
        }
      }
      
      this.contactsLoaded = true;
      console.log(`📇 Loaded ${this.contacts.size} contacts`);
      
    } catch (error) {
      console.error('❌ Failed to load contacts:', error.message);
    }
  }

  parseVCard(vcard) {
    const contact = {
      id: Date.now() + Math.random(),
      name: '',
      email: '',
      phone: '',
      organization: ''
    };

    const fnMatch = vcard.match(/FN:(.*?)\\n/);
    if (fnMatch) contact.name = fnMatch[1].trim();

    const emailMatch = vcard.match(/EMAIL[^:]*:(.*?)\\n/);
    if (emailMatch) contact.email = emailMatch[1].trim();

    const telMatch = vcard.match(/TEL[^:]*:(.*?)\\n/);
    if (telMatch) contact.phone = telMatch[1].trim();

    const orgMatch = vcard.match(/ORG:(.*?)\\n/);
    if (orgMatch) contact.organization = orgMatch[1].trim();

    return contact;
  }

  async execute(params = {}) {
    const action = params.action;
    
    switch (action) {
      case 'get_stats':
        return {
          success: true,
          stats: {
            totalContacts: this.contacts.size,
            loaded: this.contactsLoaded
          }
        };
      
      case 'search':
        return await this.searchContacts(params.query);
      
      case 'get_contact':
        return { success: true, contact: this.contacts.get(params.id) };
      
      default:
        return { success: false, error: `Unknown action: ${action}` };
    }
  }

  async searchContacts(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    for (const [id, contact] of this.contacts) {
      if (
        contact.name.toLowerCase().includes(lowerQuery) ||
        contact.email.toLowerCase().includes(lowerQuery) ||
        contact.organization.toLowerCase().includes(lowerQuery)
      ) {
        results.push(contact);
        if (results.length >= 50) break;
      }
    }
    
    return { success: true, results, total: results.length };
  }
}

module.exports = ContactManagerBot;
