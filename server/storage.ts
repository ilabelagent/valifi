import {
  users,
  wallets,
  transactions,
  nfts,
  tokens,
  songs,
  agents,
  agentLogs,
  securityEvents,
  payments,
  kycRecords,
  quantumJobs,
  cryptoPayments,
  tradingBots,
  botExecutions,
  armorWallets,
  mevEvents,
  type User,
  type InsertUser,
  type UpsertUser,
  type Wallet,
  type InsertWallet,
  type Transaction,
  type InsertTransaction,
  type Nft,
  type InsertNft,
  type Token,
  type InsertToken,
  type Song,
  type InsertSong,
  type Agent,
  type InsertAgent,
  type AgentLog,
  type InsertAgentLog,
  type SecurityEvent,
  type InsertSecurityEvent,
  type Payment,
  type InsertPayment,
  type KycRecord,
  type InsertKycRecord,
  type QuantumJob,
  type InsertQuantumJob,
  type CryptoPayment,
  type InsertCryptoPayment,
  type TradingBot,
  type InsertTradingBot,
  type BotExecution,
  type InsertBotExecution,
  type ArmorWallet,
  type InsertArmorWallet,
  type MevEvent,
  type InsertMevEvent,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users (Replit Auth compatible)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserKycStatus(userId: string, status: string, kycUserId?: string): Promise<void>;

  // Wallets
  getWallet(id: string): Promise<Wallet | undefined>;
  getWalletsByUserId(userId: string): Promise<Wallet[]>;
  getWalletByAddress(address: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(id: string, balance: string): Promise<void>;

  // Transactions
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionsByWalletId(walletId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: string, status: string, txHash?: string): Promise<void>;

  // NFTs
  getNft(id: string): Promise<Nft | undefined>;
  getNftsByWalletId(walletId: string): Promise<Nft[]>;
  createNft(nft: InsertNft): Promise<Nft>;

  // Tokens
  getToken(id: string): Promise<Token | undefined>;
  getTokensByWalletId(walletId: string): Promise<Token[]>;
  getTokenByContractAddress(address: string): Promise<Token | undefined>;
  createToken(token: InsertToken): Promise<Token>;

  // Songs (Jesus Cartel)
  getSong(id: string): Promise<Song | undefined>;
  getSongsByUserId(userId: string): Promise<Song[]>;
  getSongsWithDetailsByUserId(userId: string): Promise<any[]>;
  createSong(song: InsertSong): Promise<Song>;
  updateSongPublication(id: string, nftId?: string, tokenId?: string): Promise<void>;

  // Agents
  getAgent(id: string): Promise<Agent | undefined>;
  getAllAgents(): Promise<Agent[]>;
  getAgentsByType(type: string): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgentStatus(id: string, status: string, currentTask?: string): Promise<void>;
  updateAgentMetrics(id: string, successRate: string, totalOps: number): Promise<void>;

  // Agent Logs
  createAgentLog(log: InsertAgentLog): Promise<AgentLog>;
  getAgentLogs(agentId: string, limit?: number): Promise<AgentLog[]>;

  // Security Events
  getSecurityEvent(id: string): Promise<SecurityEvent | undefined>;
  getSecurityEventsByUserId(userId: string): Promise<SecurityEvent[]>;
  getUnresolvedSecurityEvents(): Promise<SecurityEvent[]>;
  createSecurityEvent(event: InsertSecurityEvent): Promise<SecurityEvent>;
  resolveSecurityEvent(id: string): Promise<void>;

  // Payments
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByUserId(userId: string): Promise<Payment[]>;
  getPaymentByStripeId(stripeId: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: string, status: string): Promise<void>;

  // KYC Records
  getKycRecord(id: string): Promise<KycRecord | undefined>;
  getKycRecordByUserId(userId: string): Promise<KycRecord | undefined>;
  createKycRecord(record: InsertKycRecord): Promise<KycRecord>;
  updateKycVerification(id: string, status: string, result?: any): Promise<void>;

  // Quantum Jobs
  getQuantumJob(id: string): Promise<QuantumJob | undefined>;
  getQuantumJobsByUserId(userId: string): Promise<QuantumJob[]>;
  createQuantumJob(job: InsertQuantumJob): Promise<QuantumJob>;
  updateQuantumJobStatus(id: string, status: string, result?: any): Promise<void>;

  // Crypto Payments
  getCryptoPayment(id: string): Promise<CryptoPayment | undefined>;
  getCryptoPaymentsByUserId(userId: string): Promise<CryptoPayment[]>;
  getCryptoPaymentByInvoiceId(invoiceId: string): Promise<CryptoPayment | undefined>;
  createCryptoPayment(payment: InsertCryptoPayment): Promise<CryptoPayment>;
  updateCryptoPaymentStatus(id: string, status: string, txHash?: string): Promise<void>;

  // Trading Bots
  getBot(id: string): Promise<TradingBot | undefined>;
  getUserBots(userId: string): Promise<TradingBot[]>;
  createBot(bot: InsertTradingBot): Promise<TradingBot>;
  updateBot(id: string, updates: Partial<TradingBot>): Promise<void>;
  deleteBot(id: string): Promise<void>;

  // Bot Executions
  getBotExecution(id: string): Promise<BotExecution | undefined>;
  getBotExecutions(botId: string): Promise<BotExecution[]>;
  createBotExecution(execution: InsertBotExecution): Promise<BotExecution>;
  updateBotExecutionStatus(id: string, status: string): Promise<void>;

  // Armor Wallets
  getArmorWallet(id: string): Promise<ArmorWallet | undefined>;
  getArmorWalletsByUserId(userId: string): Promise<ArmorWallet[]>;
  getArmorWalletByAddress(address: string): Promise<ArmorWallet | undefined>;
  createArmorWallet(wallet: InsertArmorWallet): Promise<ArmorWallet>;
  updateArmorWallet(id: string, updates: Partial<ArmorWallet>): Promise<void>;

  // MEV Events
  getMevEvent(id: string): Promise<MevEvent | undefined>;
  getMevEventsByUserId(userId: string): Promise<MevEvent[]>;
  getMevEventsByNetwork(network: string): Promise<MevEvent[]>;
  createMevEvent(event: InsertMevEvent): Promise<MevEvent>;
}

export class DatabaseStorage implements IStorage {
  // Users (Replit Auth compatible)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserKycStatus(userId: string, status: string, kycUserId?: string): Promise<void> {
    await db
      .update(users)
      .set({ kycStatus: status as any, kycUserId })
      .where(eq(users.id, userId));
  }

  // Wallets
  async getWallet(id: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet || undefined;
  }

  async getWalletsByUserId(userId: string): Promise<Wallet[]> {
    return db.select().from(wallets).where(eq(wallets.userId, userId));
  }

  async getWalletByAddress(address: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.address, address));
    return wallet || undefined;
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const [wallet] = await db.insert(wallets).values(insertWallet).returning();
    return wallet;
  }

  async updateWalletBalance(id: string, balance: string): Promise<void> {
    await db.update(wallets).set({ balance }).where(eq(wallets.id, id));
  }

  // Transactions
  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [tx] = await db.select().from(transactions).where(eq(transactions.id, id));
    return tx || undefined;
  }

  async getTransactionsByWalletId(walletId: string): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.walletId, walletId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [tx] = await db.insert(transactions).values(insertTransaction).returning();
    return tx;
  }

  async updateTransactionStatus(id: string, status: string, txHash?: string): Promise<void> {
    const updates: any = { status };
    if (txHash) updates.txHash = txHash;
    if (status === "confirmed") updates.confirmedAt = new Date();
    await db.update(transactions).set(updates).where(eq(transactions.id, id));
  }

  // NFTs
  async getNft(id: string): Promise<Nft | undefined> {
    const [nft] = await db.select().from(nfts).where(eq(nfts.id, id));
    return nft || undefined;
  }

  async getNftsByWalletId(walletId: string): Promise<Nft[]> {
    return db.select().from(nfts).where(eq(nfts.walletId, walletId));
  }

  async createNft(insertNft: InsertNft): Promise<Nft> {
    const [nft] = await db.insert(nfts).values(insertNft).returning();
    return nft;
  }

  // Tokens
  async getToken(id: string): Promise<Token | undefined> {
    const [token] = await db.select().from(tokens).where(eq(tokens.id, id));
    return token || undefined;
  }

  async getTokensByWalletId(walletId: string): Promise<Token[]> {
    return db.select().from(tokens).where(eq(tokens.walletId, walletId));
  }

  async getTokenByContractAddress(address: string): Promise<Token | undefined> {
    const [token] = await db.select().from(tokens).where(eq(tokens.contractAddress, address));
    return token || undefined;
  }

  async createToken(insertToken: InsertToken): Promise<Token> {
    const [token] = await db.insert(tokens).values(insertToken).returning();
    return token;
  }

  // Songs
  async getSong(id: string): Promise<Song | undefined> {
    const [song] = await db.select().from(songs).where(eq(songs.id, id));
    return song || undefined;
  }

  async getSongsByUserId(userId: string): Promise<Song[]> {
    return db.select().from(songs).where(eq(songs.userId, userId));
  }

  async getSongsWithDetailsByUserId(userId: string): Promise<any[]> {
    const songsWithDetails = await db
      .select({
        song: songs,
        nft: nfts,
        token: tokens,
      })
      .from(songs)
      .leftJoin(nfts, eq(songs.nftId, nfts.id))
      .leftJoin(tokens, eq(songs.tokenId, tokens.id))
      .where(eq(songs.userId, userId));
    
    return songsWithDetails.map(row => ({
      ...row.song,
      nftDetails: row.nft,
      tokenDetails: row.token,
    }));
  }

  async createSong(insertSong: InsertSong): Promise<Song> {
    const [song] = await db.insert(songs).values(insertSong).returning();
    return song;
  }

  async updateSongPublication(id: string, nftId?: string, tokenId?: string): Promise<void> {
    await db
      .update(songs)
      .set({
        nftId,
        tokenId,
        isPublished: true,
        publishedAt: new Date(),
      })
      .where(eq(songs.id, id));
  }

  // Agents
  async getAgent(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }

  async getAllAgents(): Promise<Agent[]> {
    return db.select().from(agents);
  }

  async getAgentsByType(type: string): Promise<Agent[]> {
    return db.select().from(agents).where(eq(agents.type, type as any));
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db.insert(agents).values(insertAgent).returning();
    return agent;
  }

  async updateAgentStatus(id: string, status: string, currentTask?: string): Promise<void> {
    await db
      .update(agents)
      .set({
        status: status as any,
        currentTask,
        lastActiveAt: new Date(),
      })
      .where(eq(agents.id, id));
  }

  async updateAgentMetrics(id: string, successRate: string, totalOps: number): Promise<void> {
    await db
      .update(agents)
      .set({
        successRate,
        totalOperations: totalOps,
      })
      .where(eq(agents.id, id));
  }

  // Agent Logs
  async createAgentLog(insertLog: InsertAgentLog): Promise<AgentLog> {
    const [log] = await db.insert(agentLogs).values(insertLog).returning();
    return log;
  }

  async getAgentLogs(agentId: string, limit: number = 100): Promise<AgentLog[]> {
    return db
      .select()
      .from(agentLogs)
      .where(eq(agentLogs.agentId, agentId))
      .orderBy(desc(agentLogs.createdAt))
      .limit(limit);
  }

  // Security Events
  async getSecurityEvent(id: string): Promise<SecurityEvent | undefined> {
    const [event] = await db.select().from(securityEvents).where(eq(securityEvents.id, id));
    return event || undefined;
  }

  async getSecurityEventsByUserId(userId: string): Promise<SecurityEvent[]> {
    return db
      .select()
      .from(securityEvents)
      .where(eq(securityEvents.userId, userId))
      .orderBy(desc(securityEvents.createdAt));
  }

  async getUnresolvedSecurityEvents(): Promise<SecurityEvent[]> {
    return db
      .select()
      .from(securityEvents)
      .where(eq(securityEvents.isResolved, false))
      .orderBy(desc(securityEvents.createdAt));
  }

  async createSecurityEvent(insertEvent: InsertSecurityEvent): Promise<SecurityEvent> {
    const [event] = await db.insert(securityEvents).values(insertEvent).returning();
    return event;
  }

  async resolveSecurityEvent(id: string): Promise<void> {
    await db
      .update(securityEvents)
      .set({
        isResolved: true,
        resolvedAt: new Date(),
      })
      .where(eq(securityEvents.id, id));
  }

  // Payments
  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  async getPaymentByStripeId(stripeId: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.stripePaymentId, stripeId));
    return payment || undefined;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async updatePaymentStatus(id: string, status: string): Promise<void> {
    await db.update(payments).set({ status }).where(eq(payments.id, id));
  }

  // KYC Records
  async getKycRecord(id: string): Promise<KycRecord | undefined> {
    const [record] = await db.select().from(kycRecords).where(eq(kycRecords.id, id));
    return record || undefined;
  }

  async getKycRecordByUserId(userId: string): Promise<KycRecord | undefined> {
    const [record] = await db.select().from(kycRecords).where(eq(kycRecords.userId, userId));
    return record || undefined;
  }

  async createKycRecord(insertRecord: InsertKycRecord): Promise<KycRecord> {
    const [record] = await db.insert(kycRecords).values(insertRecord).returning();
    return record;
  }

  async updateKycVerification(id: string, status: string, result?: any): Promise<void> {
    const updates: any = { verificationStatus: status };
    if (result) updates.reviewResult = result;
    if (status !== "pending") updates.reviewedAt = new Date();
    await db.update(kycRecords).set(updates).where(eq(kycRecords.id, id));
  }

  // Quantum Jobs
  async getQuantumJob(id: string): Promise<QuantumJob | undefined> {
    const [job] = await db.select().from(quantumJobs).where(eq(quantumJobs.id, id));
    return job || undefined;
  }

  async getQuantumJobsByUserId(userId: string): Promise<QuantumJob[]> {
    return db
      .select()
      .from(quantumJobs)
      .where(eq(quantumJobs.userId, userId))
      .orderBy(desc(quantumJobs.createdAt));
  }

  async createQuantumJob(insertJob: InsertQuantumJob): Promise<QuantumJob> {
    const [job] = await db.insert(quantumJobs).values(insertJob).returning();
    return job;
  }

  async updateQuantumJobStatus(id: string, status: string, result?: any): Promise<void> {
    const updates: any = { status };
    if (result) updates.result = result;
    if (status === "completed" || status === "failed") updates.completedAt = new Date();
    await db.update(quantumJobs).set(updates).where(eq(quantumJobs.id, id));
  }

  // Crypto Payments
  async getCryptoPayment(id: string): Promise<CryptoPayment | undefined> {
    const [payment] = await db.select().from(cryptoPayments).where(eq(cryptoPayments.id, id));
    return payment || undefined;
  }

  async getCryptoPaymentsByUserId(userId: string): Promise<CryptoPayment[]> {
    return db.select().from(cryptoPayments).where(eq(cryptoPayments.userId, userId)).orderBy(desc(cryptoPayments.createdAt));
  }

  async getCryptoPaymentByInvoiceId(invoiceId: string): Promise<CryptoPayment | undefined> {
    const [payment] = await db.select().from(cryptoPayments).where(eq(cryptoPayments.processorInvoiceId, invoiceId));
    return payment || undefined;
  }

  async createCryptoPayment(insertPayment: InsertCryptoPayment): Promise<CryptoPayment> {
    const [payment] = await db.insert(cryptoPayments).values(insertPayment).returning();
    return payment;
  }

  async updateCryptoPaymentStatus(id: string, status: string, txHash?: string): Promise<void> {
    const updates: any = { status };
    if (txHash) updates.txHash = txHash;
    if (status === "confirmed" || status === "completed") updates.confirmedAt = new Date();
    await db.update(cryptoPayments).set(updates).where(eq(cryptoPayments.id, id));
  }

  // Trading Bots
  async getBot(id: string): Promise<TradingBot | undefined> {
    const [bot] = await db.select().from(tradingBots).where(eq(tradingBots.id, id));
    return bot || undefined;
  }

  async getUserBots(userId: string): Promise<TradingBot[]> {
    return db.select().from(tradingBots).where(eq(tradingBots.userId, userId)).orderBy(desc(tradingBots.createdAt));
  }

  async createBot(insertBot: InsertTradingBot): Promise<TradingBot> {
    const [bot] = await db.insert(tradingBots).values(insertBot).returning();
    return bot;
  }

  async updateBot(id: string, updates: Partial<TradingBot>): Promise<void> {
    await db.update(tradingBots).set({ ...updates, updatedAt: new Date() }).where(eq(tradingBots.id, id));
  }

  async deleteBot(id: string): Promise<void> {
    await db.delete(tradingBots).where(eq(tradingBots.id, id));
  }

  // Bot Executions
  async getBotExecution(id: string): Promise<BotExecution | undefined> {
    const [execution] = await db.select().from(botExecutions).where(eq(botExecutions.id, id));
    return execution || undefined;
  }

  async getBotExecutions(botId: string): Promise<BotExecution[]> {
    return db.select().from(botExecutions).where(eq(botExecutions.botId, botId)).orderBy(desc(botExecutions.startedAt));
  }

  async createBotExecution(insertExecution: InsertBotExecution): Promise<BotExecution> {
    const [execution] = await db.insert(botExecutions).values(insertExecution).returning();
    return execution;
  }

  async updateBotExecutionStatus(id: string, status: string): Promise<void> {
    const updates: any = { status };
    if (status === "completed" || status === "failed" || status === "cancelled") {
      updates.completedAt = new Date();
    }
    await db.update(botExecutions).set(updates).where(eq(botExecutions.id, id));
  }

  // Armor Wallets
  async getArmorWallet(id: string): Promise<ArmorWallet | undefined> {
    const [wallet] = await db.select().from(armorWallets).where(eq(armorWallets.id, id));
    return wallet || undefined;
  }

  async getArmorWalletsByUserId(userId: string): Promise<ArmorWallet[]> {
    return db.select().from(armorWallets).where(eq(armorWallets.userId, userId)).orderBy(desc(armorWallets.createdAt));
  }

  async getArmorWalletByAddress(address: string): Promise<ArmorWallet | undefined> {
    const [wallet] = await db.select().from(armorWallets).where(eq(armorWallets.address, address));
    return wallet || undefined;
  }

  async createArmorWallet(insertWallet: InsertArmorWallet): Promise<ArmorWallet> {
    const [wallet] = await db.insert(armorWallets).values(insertWallet).returning();
    return wallet;
  }

  async updateArmorWallet(id: string, updates: Partial<ArmorWallet>): Promise<void> {
    await db.update(armorWallets).set({ ...updates, updatedAt: new Date() }).where(eq(armorWallets.id, id));
  }

  // MEV Events
  async getMevEvent(id: string): Promise<MevEvent | undefined> {
    const [event] = await db.select().from(mevEvents).where(eq(mevEvents.id, id));
    return event || undefined;
  }

  async getMevEventsByUserId(userId: string): Promise<MevEvent[]> {
    return db.select().from(mevEvents).where(eq(mevEvents.userId, userId)).orderBy(desc(mevEvents.detectedAt));
  }

  async getMevEventsByNetwork(network: string): Promise<MevEvent[]> {
    return db.select().from(mevEvents).where(sql`${mevEvents.network} = ${network}`).orderBy(desc(mevEvents.detectedAt));
  }

  async createMevEvent(insertEvent: InsertMevEvent): Promise<MevEvent> {
    const [event] = await db.insert(mevEvents).values(insertEvent).returning();
    return event;
  }
}

export const storage = new DatabaseStorage();
