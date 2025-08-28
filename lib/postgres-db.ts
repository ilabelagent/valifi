// Enhanced PostgreSQL Database Module for Valifi
import { Pool, PoolClient } from 'pg';
import bcrypt from 'bcryptjs';

// Database configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  max: parseInt(process.env.DB_POOL_SIZE || '20'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = process.env.USE_POSTGRES === 'true' ? new Pool(poolConfig) : null;

// Database helper class
export class ValifiDB {
  private pool: Pool | null;

  constructor() {
    this.pool = pool;
    if (this.pool) {
      this.pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
      });
    }
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    if (!this.pool) {
      console.error('PostgreSQL pool not initialized');
      return false;
    }

    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Database connected at:', result.rows[0].now);
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  // Execute a single query
  async query(text: string, params?: any[]): Promise<any> {
    if (!this.pool) throw new Error('Database not initialized');
    
    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  // Execute a transaction
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!this.pool) throw new Error('Database not initialized');
    
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // User management functions
  async createUser(data: {
    email: string;
    username: string;
    password: string;
    fullName: string;
  }): Promise<any> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const query = `
      INSERT INTO users (email, username, password_hash, full_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, username, full_name, created_at
    `;
    
    const result = await this.query(query, [
      data.email.toLowerCase(),
      data.username.toLowerCase(),
      hashedPassword,
      data.fullName
    ]);
    
    // Create default portfolio
    await this.createPortfolio(result.rows[0].id);
    
    return result.rows[0];
  }

  async findUserByEmail(email: string): Promise<any> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.query(query, [email.toLowerCase()]);
    return result.rows[0];
  }

  async findUserById(id: string): Promise<any> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  async validatePassword(user: any, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  // Session management
  async createSession(userId: string, token: string, refreshToken: string, expiresIn: number = 3600): Promise<any> {
    const query = `
      INSERT INTO sessions (user_id, token, refresh_token, expires_at, refresh_expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const result = await this.query(query, [
      userId, token, refreshToken, expiresAt, refreshExpiresAt
    ]);
    
    return result.rows[0];
  }

  async findSessionByToken(token: string): Promise<any> {
    const query = `
      SELECT s.*, u.email, u.username, u.full_name, u.role
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = $1 AND s.expires_at > NOW() AND s.is_active = true
    `;
    
    const result = await this.query(query, [token]);
    return result.rows[0];
  }

  async invalidateSession(token: string): Promise<boolean> {
    const query = 'UPDATE sessions SET is_active = false WHERE token = $1';
    await this.query(query, [token]);
    return true;
  }

  // Portfolio management
  async createPortfolio(userId: string, name: string = 'Main Portfolio'): Promise<any> {
    const query = `
      INSERT INTO portfolios (user_id, name, is_primary)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await this.query(query, [userId, name, true]);
    return result.rows[0];
  }

  async getPortfolio(userId: string): Promise<any> {
    const query = `
      SELECT p.*, 
        COUNT(DISTINCT a.id) as asset_count,
        COALESCE(SUM(a.total_value_usd), 0) as total_assets_value
      FROM portfolios p
      LEFT JOIN assets a ON p.id = a.portfolio_id
      WHERE p.user_id = $1 AND p.is_primary = true
      GROUP BY p.id
    `;
    
    const result = await this.query(query, [userId]);
    return result.rows[0];
  }

  async getAssets(userId: string): Promise<any[]> {
    const query = `
      SELECT a.* 
      FROM assets a
      JOIN portfolios p ON a.portfolio_id = p.id
      WHERE p.user_id = $1 AND p.is_primary = true
      ORDER BY a.total_value_usd DESC
    `;
    
    const result = await this.query(query, [userId]);
    return result.rows;
  }

  // Transaction management
  async createTransaction(data: {
    userId: string;
    type: string;
    amount: number;
    description?: string;
    assetId?: string;
  }): Promise<any> {
    const query = `
      INSERT INTO transactions (user_id, type, amount, description, asset_id, status)
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING *
    `;
    
    const result = await this.query(query, [
      data.userId,
      data.type,
      data.amount,
      data.description || `${data.type} transaction`,
      data.assetId || null
    ]);
    
    return result.rows[0];
  }

  async getTransactions(userId: string, limit: number = 50): Promise<any[]> {
    const query = `
      SELECT * FROM transactions 
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const result = await this.query(query, [userId, limit]);
    return result.rows;
  }

  // Bot configuration management
  async getBotConfig(userId: string, botType: string): Promise<any> {
    const query = `
      SELECT * FROM bot_configurations
      WHERE user_id = $1 AND bot_type = $2
    `;
    
    const result = await this.query(query, [userId, botType]);
    return result.rows[0];
  }

  async saveBotConfig(userId: string, botType: string, config: any): Promise<any> {
    const query = `
      INSERT INTO bot_configurations (user_id, bot_type, config)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, bot_type)
      DO UPDATE SET config = $3, updated_at = NOW()
      RETURNING *
    `;
    
    const result = await this.query(query, [userId, botType, JSON.stringify(config)]);
    return result.rows[0];
  }

  // Bot logging
  async logBotAction(data: {
    userId: string;
    botType: string;
    action: string;
    status: string;
    requestData?: any;
    responseData?: any;
    errorMessage?: string;
    executionTime?: number;
  }): Promise<void> {
    const query = `
      INSERT INTO bot_logs 
      (user_id, bot_type, action, status, request_data, response_data, error_message, execution_time_ms)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    
    await this.query(query, [
      data.userId,
      data.botType,
      data.action,
      data.status,
      JSON.stringify(data.requestData || {}),
      JSON.stringify(data.responseData || {}),
      data.errorMessage || null,
      data.executionTime || 0
    ]);
  }

  // AI interaction logging
  async logAIInteraction(data: {
    userId: string;
    botType?: string;
    prompt: string;
    response?: string;
    model?: string;
    tokensUsed?: number;
  }): Promise<void> {
    const query = `
      INSERT INTO ai_interactions 
      (user_id, bot_type, prompt, response, model, tokens_used)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    await this.query(query, [
      data.userId,
      data.botType || null,
      data.prompt,
      data.response || null,
      data.model || 'gpt-4',
      data.tokensUsed || 0
    ]);
  }

  // Audit logging
  async createAuditLog(data: {
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    oldValues?: any;
    newValues?: any;
    metadata?: any;
  }): Promise<void> {
    const query = `
      INSERT INTO audit_logs 
      (user_id, action, entity_type, entity_id, old_values, new_values, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    
    await this.query(query, [
      data.userId || null,
      data.action,
      data.entityType || null,
      data.entityId || null,
      JSON.stringify(data.oldValues || {}),
      JSON.stringify(data.newValues || {}),
      JSON.stringify(data.metadata || {})
    ]);
  }

  // Clean up
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

// Export singleton instance
const db = new ValifiDB();
export default db;

// Named exports for specific functionality
export { pool };

// Initialize database on module load
if (process.env.USE_POSTGRES === 'true' && process.env.DATABASE_URL) {
  db.testConnection().catch(err => {
    console.error('Failed to connect to PostgreSQL on startup:', err);
  });
}