// Production-Only Bot Module Base Class
// All bot modules must extend this class to ensure production mode

const { createClient } = require('@libsql/client');

class ProductionKingdomBot {
  constructor(core) {
    this.core = core;
    this.name = 'ProductionBot';
    this.version = '1.0.0';
    this.description = 'Production-only bot base class';
    
    // Enforce production mode
    this.enforceProduction();
    
    // Initialize database connection
    this.initializeDatabase();
  }

  enforceProduction() {
    // Check if demo mode is disabled
    if (process.env.DISABLE_DEMO_MODE !== 'true') {
      throw new Error(`${this.name}: Demo mode must be disabled in production`);
    }

    // Check if database is required
    if (process.env.REQUIRE_DATABASE !== 'true') {
      throw new Error(`${this.name}: Database is required in production`);
    }

    // Check environment
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`WARNING: ${this.name} running in ${process.env.NODE_ENV} mode`);
    }
  }

  initializeDatabase() {
    // Require database configuration
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      throw new Error(`${this.name}: Database configuration missing`);
    }

    // Create database client
    this.db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    });
  }

  async initialize() {
    // Verify database connection
    try {
      await this.db.execute('SELECT 1');
      console.log(`${this.name}: Database connection verified`);
    } catch (error) {
      throw new Error(`${this.name}: Database connection failed - ${error.message}`);
    }
  }

  async execute(params) {
    // Enforce production checks on every execution
    this.enforceProduction();
    
    // No demo data allowed
    if (params.demo || params.test || params.mock) {
      throw new Error(`${this.name}: Demo/test/mock operations not allowed in production`);
    }

    // Require authentication for all operations
    if (!params.userId && !params.token) {
      throw new Error(`${this.name}: Authentication required for all operations`);
    }

    // Verify user exists in database
    if (params.userId) {
      const result = await this.db.execute({
        sql: 'SELECT id FROM users WHERE id = ?',
        args: [params.userId]
      });

      if (result.rows.length === 0) {
        throw new Error(`${this.name}: User not found in database`);
      }
    }

    // Execute the actual bot logic
    return await this.executeProduction(params);
  }

  async executeProduction(params) {
    // Override in child classes
    throw new Error(`${this.name}: executeProduction must be implemented`);
  }

  // No simulation methods allowed
  simulateData() {
    throw new Error(`${this.name}: Simulation not allowed in production`);
  }

  // No mock methods allowed
  getMockData() {
    throw new Error(`${this.name}: Mock data not allowed in production`);
  }

  // No demo methods allowed
  getDemoUser() {
    throw new Error(`${this.name}: Demo users not allowed in production`);
  }

  // Only real database operations
  async getDatabaseData(query, params) {
    return await this.db.execute({
      sql: query,
      args: params
    });
  }

  // Validate all data is from database
  validateRealData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error(`${this.name}: Invalid data format`);
    }

    // Check for demo/mock indicators
    const dataStr = JSON.stringify(data).toLowerCase();
    if (dataStr.includes('demo') || dataStr.includes('mock') || dataStr.includes('test')) {
      throw new Error(`${this.name}: Demo/mock/test data detected`);
    }

    return true;
  }

  async integrateWithKingdom() {
    if (this.core) {
      this.core.registerBot(this);
      console.log(`${this.name}: Registered in production mode`);
    }
  }

  onEvent(eventName, data) {
    // Production-only event handling
    if (eventName.toLowerCase().includes('demo') || eventName.toLowerCase().includes('test')) {
      console.error(`${this.name}: Demo/test events not allowed`);
      return;
    }
    
    console.log(`${this.name}: Production event received:`, eventName);
  }
}

module.exports = ProductionKingdomBot;