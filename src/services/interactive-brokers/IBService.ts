import net from 'net';
import { EventEmitter } from 'events';
import { pgPool } from '../../config/aws-rds-config';
import crypto from 'crypto';

interface IBConfig {
  host: string;
  port: number;
  clientId: number;
  encryptionKey: string;
}

interface IBConnection {
  socket: net.Socket;
  connected: boolean;
  nextOrderId: number;
  reqId: number;
}

interface IBOrder {
  symbol: string;
  action: 'BUY' | 'SELL';
  totalQuantity: number;
  orderType: 'MKT' | 'LMT' | 'STP' | 'STP LMT';
  lmtPrice?: number;
  auxPrice?: number;
  tif: 'DAY' | 'GTC' | 'IOC' | 'FOK';
}

interface IBPosition {
  account: string;
  contract: {
    symbol: string;
    secType: string;
    exchange: string;
    currency: string;
  };
  position: number;
  marketPrice: number;
  marketValue: number;
  averageCost: number;
  unrealizedPNL: number;
  realizedPNL: number;
}

export class InteractiveBrokersService extends EventEmitter {
  private config: IBConfig;
  private connection: IBConnection | null = null;
  private messageBuffer: Buffer = Buffer.alloc(0);
  private accounts: Set<string> = new Set();

  constructor() {
    super();
    this.config = {
      host: process.env.IB_GATEWAY_HOST || 'localhost',
      port: parseInt(process.env.IB_GATEWAY_PORT || '7497'),
      clientId: parseInt(process.env.IB_CLIENT_ID || '1'),
      encryptionKey: process.env.IB_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
    };
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.config.encryptionKey, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.config.encryptionKey, 'hex'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();

      this.connection = {
        socket,
        connected: false,
        nextOrderId: 1,
        reqId: 1
      };

      socket.connect(this.config.port, this.config.host, () => {
        console.log('✅ Connected to Interactive Brokers Gateway');
        this.connection!.connected = true;
        this.sendHandshake();
        resolve();
      });

      socket.on('data', (data) => {
        this.handleIncomingData(data);
      });

      socket.on('error', (error) => {
        console.error('❌ IB Connection error:', error);
        this.connection!.connected = false;
        reject(error);
      });

      socket.on('close', () => {
        console.log('IB Connection closed');
        this.connection!.connected = false;
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          this.connect();
        }, 5000);
      });
    });
  }

  private sendHandshake(): void {
    if (!this.connection?.socket) return;

    // Send API version and client ID
    const message = this.encodeMessage(['71', '2', this.config.clientId.toString()]);
    this.connection.socket.write(message);
  }

  private encodeMessage(fields: string[]): Buffer {
    let message = '';
    for (const field of fields) {
      message += field + '\0';
    }
    const length = Buffer.byteLength(message, 'utf8');
    const lengthBuffer = Buffer.allocUnsafe(4);
    lengthBuffer.writeInt32BE(length, 0);
    return Buffer.concat([lengthBuffer, Buffer.from(message, 'utf8')]);
  }

  private handleIncomingData(data: Buffer): void {
    this.messageBuffer = Buffer.concat([this.messageBuffer, data]);

    while (this.messageBuffer.length >= 4) {
      const messageLength = this.messageBuffer.readInt32BE(0);

      if (this.messageBuffer.length >= messageLength + 4) {
        const messageData = this.messageBuffer.slice(4, messageLength + 4);
        this.messageBuffer = this.messageBuffer.slice(messageLength + 4);

        const message = messageData.toString('utf8').split('\0').filter(field => field !== '');
        this.processMessage(message);
      } else {
        break;
      }
    }
  }

  private processMessage(message: string[]): void {
    if (message.length === 0) return;

    const messageType = message[0];

    switch (messageType) {
      case '1': // Error message
        this.handleError(message);
        break;
      case '9': // Next valid order ID
        this.handleNextValidId(message);
        break;
      case '7': // Position data
        this.handlePositionData(message);
        break;
      case '3': // Order status
        this.handleOrderStatus(message);
        break;
      case '15': // Managed accounts
        this.handleManagedAccounts(message);
        break;
      default:
        // Handle other message types as needed
        break;
    }
  }

  private handleError(message: string[]): void {
    const reqId = message[2];
    const errorCode = message[3];
    const errorMsg = message[4];
    console.error(`IB Error [${errorCode}]: ${errorMsg} (Request ID: ${reqId})`);
  }

  private handleNextValidId(message: string[]): void {
    this.connection!.nextOrderId = parseInt(message[2]);
    console.log(`Next valid order ID: ${this.connection!.nextOrderId}`);
    this.requestManagedAccounts();
  }

  private handlePositionData(message: string[]): void {
    // Parse position data from IB message format
    const position: IBPosition = {
      account: message[2],
      contract: {
        symbol: message[4],
        secType: message[5],
        exchange: message[7],
        currency: message[8]
      },
      position: parseFloat(message[9]),
      marketPrice: parseFloat(message[10]),
      marketValue: parseFloat(message[11]),
      averageCost: parseFloat(message[12]),
      unrealizedPNL: parseFloat(message[13]),
      realizedPNL: parseFloat(message[14])
    };

    this.emit('positionData', position);
  }

  private handleOrderStatus(message: string[]): void {
    const orderStatus = {
      orderId: message[2],
      status: message[3],
      filled: parseFloat(message[4]),
      remaining: parseFloat(message[5]),
      avgFillPrice: parseFloat(message[6]),
      permId: message[7],
      parentId: message[8],
      lastFillPrice: parseFloat(message[9]),
      clientId: message[10],
      whyHeld: message[11]
    };

    this.emit('orderStatus', orderStatus);
  }

  private handleManagedAccounts(message: string[]): void {
    const accountsList = message[2];
    const accounts = accountsList.split(',').filter(acc => acc.trim() !== '');
    accounts.forEach(account => this.accounts.add(account));
    console.log('Managed accounts:', Array.from(this.accounts));
  }

  private requestManagedAccounts(): void {
    if (!this.connection?.socket) return;
    const message = this.encodeMessage(['17', '1']);
    this.connection.socket.write(message);
  }

  async createTradingAccount(userId: string, accountNumber: string): Promise<any> {
    try {
      // Encrypt account credentials
      const encryptedAccountNumber = this.encrypt(accountNumber);

      const query = `
        INSERT INTO trading_accounts (
          user_id, broker, account_number, account_status, is_paper_trading
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const result = await pgPool.query(query, [
        userId,
        'interactive_brokers',
        encryptedAccountNumber,
        'active',
        false
      ]);

      return {
        success: true,
        account: result.rows[0]
      };
    } catch (error) {
      console.error('Error creating IB trading account:', error);
      throw error;
    }
  }

  async placeOrder(orderData: {
    userId: string;
    symbol: string;
    action: 'BUY' | 'SELL';
    quantity: number;
    orderType: 'MKT' | 'LMT' | 'STP' | 'STP LMT';
    limitPrice?: number;
    stopPrice?: number;
    timeInForce: 'DAY' | 'GTC' | 'IOC' | 'FOK';
  }): Promise<any> {
    try {
      if (!this.connection?.connected) {
        throw new Error('Not connected to IB Gateway');
      }

      const orderId = this.connection.nextOrderId++;

      // Create order message
      const orderMessage = [
        '3', // Place order message type
        '45', // Version
        orderId.toString(),
        '', // Contract ID
        orderData.symbol,
        'STK', // Security type
        '', // Last trade date
        '0', // Strike
        '', // Right
        '1', // Multiplier
        'SMART', // Exchange
        '', // Primary exchange
        'USD', // Currency
        '', // Local symbol
        '', // Trading class
        '', // Include expired
        '', // Sec ID type
        '', // Sec ID
        orderData.action,
        orderData.quantity.toString(),
        orderData.orderType,
        orderData.limitPrice?.toString() || '',
        orderData.stopPrice?.toString() || '',
        orderData.timeInForce,
        '', // Good after time
        '', // Good till date
        '0', // OCA group
        '', // Account
        '', // Open close
        '0', // Origin
        '', // Order ref
        '1', // Transmit
        '', // Parent ID
        '0', // Block order
        '0', // Sweep to fill
        '0', // Display size
        '0', // Trigger method
        '0', // Outside RTH
        '0', // Hidden
        '', // Discretionary amount
        '', // Good after time
        '', // Financial advisor group
        '', // Financial advisor method
        '', // Financial advisor percentage
        '', // Financial advisor profile
        '', // Model code
        '', // Short sale slot
        '', // Designated location
        '0', // Exempt code
        '', // OCA type
        '', // Rule 80A
        '', // Settling firm
        '0', // All or none
        '', // Minimum quantity
        '', // Percent offset
        '0', // Electronic trade only
        '0', // Firm quote only
        '', // NBBO price cap
        '0', // Auction strategy
        '', // Starting price
        '', // Stock ref price
        '', // Delta
        '', // Stock range lower
        '', // Stock range upper
        '0', // Override percentage constraints
        '', // Volatility
        '0', // Volatility type
        '', // Delta neutral order type
        '', // Delta neutral aux price
        '', // Delta neutral con ID
        '', // Delta neutral settling firm
        '', // Delta neutral clearing account
        '', // Delta neutral clearing intent
        '', // Delta neutral open close
        '0', // Delta neutral short sale
        '0', // Delta neutral short sale slot
        '', // Delta neutral designated location
        '0', // Continuous update
        '0', // Reference price type
        '', // Trail stop price
        '', // Trailing percent
        '', // Basis points
        '', // Basis points type
        '', // Combo legs description
        '0', // Combo legs count
        '0', // Smart combo routing params count
        '', // Scale init level size
        '', // Scale subs level size
        '', // Scale price increment
        '', // Scale price adjust value
        '', // Scale price adjust interval
        '', // Scale profit offset
        '0', // Scale auto reset
        '', // Scale init position
        '', // Scale init fill qty
        '0', // Scale random percent
        '', // Scale table
        '', // Active start time
        '', // Active stop time
        '', // Hedge type
        '', // Hedge param
        '0', // Opt out smart routing
        '', // Clearing account
        '', // Clearing intent
        '0', // Not held
        '0', // Delta neutral
        '0', // Algo strategy
        '0', // Algo params count
        '0', // Smart combo routing params
        '', // What if
        '0', // Solicited
        '0', // Random size flag
        '0', // Random price flag
        '0', // Conditions count
        '0', // Adjusted order type
        '', // Trigger price
        '', // Limit price offset
        '', // Adjusted stop price
        '', // Adjusted stop limit price
        '', // Adjusted trailing amount
        '0', // Adjustable trailing unit
        '', // Model code
        '', // Ext operator
        '0', // Soft dollar tier
        '', // Cash qty
        '', // Mifid II decision maker
        '', // Mifid II decision algo
        '', // Mifid II execution trader
        '', // Mifid II execution algo
        '0', // Don't use auto price for hedge
        '0', // Is oms container
        '0', // Discretionary up to
        '0', // Use price mgmt algo
        '0' // Duration
      ];

      const message = this.encodeMessage(orderMessage);
      this.connection.socket.write(message);

      // Store order in database
      const query = `
        INSERT INTO orders (
          user_id, order_type, side, symbol, quantity, price, stop_price,
          time_in_force, status, broker_order_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const result = await pgPool.query(query, [
        orderData.userId,
        orderData.orderType.toLowerCase(),
        orderData.action.toLowerCase(),
        orderData.symbol,
        orderData.quantity,
        orderData.limitPrice,
        orderData.stopPrice,
        orderData.timeInForce.toLowerCase(),
        'submitted',
        orderId.toString()
      ]);

      return {
        success: true,
        order: result.rows[0],
        ibOrderId: orderId
      };
    } catch (error) {
      console.error('Error placing IB order:', error);
      throw error;
    }
  }

  async requestPositions(): void {
    if (!this.connection?.connected) {
      throw new Error('Not connected to IB Gateway');
    }

    const message = this.encodeMessage(['61', '1']);
    this.connection.socket.write(message);
  }

  async requestAccountUpdates(account?: string): void {
    if (!this.connection?.connected) {
      throw new Error('Not connected to IB Gateway');
    }

    const selectedAccount = account || Array.from(this.accounts)[0] || '';
    const message = this.encodeMessage(['6', '2', '1', selectedAccount]);
    this.connection.socket.write(message);
  }

  async getMarketData(symbol: string): Promise<void> {
    if (!this.connection?.connected) {
      throw new Error('Not connected to IB Gateway');
    }

    const reqId = this.connection.reqId++;
    const message = this.encodeMessage([
      '1', // Market data request
      '11', // Version
      reqId.toString(),
      '', // Contract ID
      symbol,
      'STK', // Security type
      '', // Last trade date
      '0', // Strike
      '', // Right
      '1', // Multiplier
      'SMART', // Exchange
      '', // Primary exchange
      'USD', // Currency
      '', // Local symbol
      '', // Trading class
      '0', // Include expired
      '', // Sec ID type
      '', // Sec ID
      '', // Generic tick list
      '0', // Snapshot
      '0', // Regulatory snapshot
      '0' // Market data options
    ]);

    this.connection.socket.write(message);
  }

  disconnect(): void {
    if (this.connection?.socket) {
      this.connection.socket.end();
      this.connection.connected = false;
    }
  }
}

export default new InteractiveBrokersService();