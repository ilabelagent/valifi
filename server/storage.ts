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
}

export const storage = new DatabaseStorage();
