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
  exchangeOrders,
  liquidityPools,
  mixingRequests,
  forumCategories,
  forumThreads,
  forumReplies,
  chatSessions,
  chatMessages,
  metalInventory,
  metalTrades,
  blogPosts,
  userDashboardConfigs,
  dashboardWidgets,
  userWidgetPreferences,
  adminUsers,
  adminAuditLogs,
  adminBroadcasts,
  botMarketplaceListings,
  botRentals,
  botSubscriptions,
  botReviews,
  botLearningSession,
  botTrainingData,
  botSkills,
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
  type ExchangeOrder,
  type InsertExchangeOrder,
  type LiquidityPool,
  type InsertLiquidityPool,
  type MixingRequest,
  type InsertMixingRequest,
  type ForumCategory,
  type InsertForumCategory,
  type ForumThread,
  type InsertForumThread,
  type ForumReply,
  type InsertForumReply,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage,
  type MetalInventory,
  type InsertMetalInventory,
  type MetalTrade,
  type InsertMetalTrade,
  type BlogPost,
  type InsertBlogPost,
  type UserDashboardConfig,
  type InsertUserDashboardConfig,
  type DashboardWidget,
  type InsertDashboardWidget,
  type UserWidgetPreference,
  type InsertUserWidgetPreference,
  type AdminUser,
  type InsertAdminUser,
  type AdminAuditLog,
  type InsertAdminAuditLog,
  type AdminBroadcast,
  type InsertAdminBroadcast,
  type BotMarketplaceListing,
  type InsertBotMarketplaceListing,
  type BotRental,
  type InsertBotRental,
  type BotSubscription,
  type InsertBotSubscription,
  type BotReview,
  type InsertBotReview,
  type BotLearningSession,
  type InsertBotLearningSession,
  type BotTrainingData,
  type InsertBotTrainingData,
  type BotSkill,
  type InsertBotSkill,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, asc } from "drizzle-orm";

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

  // Exchange Orders
  getExchangeOrder(id: string): Promise<ExchangeOrder | undefined>;
  getExchangeOrdersByUserId(userId: string): Promise<ExchangeOrder[]>;
  createExchangeOrder(order: InsertExchangeOrder): Promise<ExchangeOrder>;

  // Liquidity Pools
  getLiquidityPool(id: string): Promise<LiquidityPool | undefined>;
  getAllLiquidityPools(): Promise<LiquidityPool[]>;
  createLiquidityPool(pool: InsertLiquidityPool): Promise<LiquidityPool>;

  // Mixing Requests
  getMixingRequest(id: string): Promise<MixingRequest | undefined>;
  getMixingRequestsByUserId(userId: string): Promise<MixingRequest[]>;
  createMixingRequest(request: InsertMixingRequest): Promise<MixingRequest>;

  // Forum Categories
  getForumCategory(id: string): Promise<ForumCategory | undefined>;
  getAllForumCategories(): Promise<ForumCategory[]>;
  createForumCategory(category: InsertForumCategory): Promise<ForumCategory>;

  // Forum Threads
  getForumThread(id: string): Promise<ForumThread | undefined>;
  getAllForumThreads(): Promise<ForumThread[]>;
  createForumThread(thread: InsertForumThread): Promise<ForumThread>;

  // Forum Replies
  getForumReply(id: string): Promise<ForumReply | undefined>;
  getAllForumReplies(): Promise<ForumReply[]>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;

  // Chat Sessions
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getChatSessionsByUserId(userId: string): Promise<ChatSession[]>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;

  // Chat Messages
  getChatMessage(id: string): Promise<ChatMessage | undefined>;
  getChatMessagesBySessionId(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Metal Inventory
  getMetalInventoryItem(id: string): Promise<MetalInventory | undefined>;
  getMetalInventoryByUserId(userId: string): Promise<MetalInventory[]>;
  createMetalInventory(item: InsertMetalInventory): Promise<MetalInventory>;

  // Metal Trades
  getMetalTrade(id: string): Promise<MetalTrade | undefined>;
  getMetalTradesByUserId(userId: string): Promise<MetalTrade[]>;
  createMetalTrade(trade: InsertMetalTrade): Promise<MetalTrade>;

  // Blog Posts
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;

  // Dashboard System
  getUserDashboardConfig(userId: string): Promise<UserDashboardConfig | undefined>;
  createOrUpdateDashboardConfig(config: InsertUserDashboardConfig): Promise<UserDashboardConfig>;
  getDashboardWidgets(): Promise<DashboardWidget[]>;
  createDashboardWidget(widget: InsertDashboardWidget): Promise<DashboardWidget>;
  getUserWidgetPreferences(userId: string): Promise<UserWidgetPreference[]>;
  createOrUpdateWidgetPreference(pref: InsertUserWidgetPreference): Promise<UserWidgetPreference>;
  deleteWidgetPreference(userId: string, widgetId: string): Promise<boolean>;

  // Admin Panel
  getAdminUser(userId: string): Promise<AdminUser | undefined>;
  getAllAdminUsers(): Promise<AdminUser[]>;
  adminUserExists(userId: string): Promise<boolean>;
  createAdminUser(admin: InsertAdminUser): Promise<AdminUser>;
  updateAdminRole(userId: string, role: string): Promise<boolean>;
  getAdminAuditLogs(limit?: number): Promise<AdminAuditLog[]>;
  createAdminAuditLog(log: InsertAdminAuditLog): Promise<AdminAuditLog>;
  getAdminBroadcasts(limit?: number): Promise<AdminBroadcast[]>;
  createAdminBroadcast(broadcast: InsertAdminBroadcast): Promise<AdminBroadcast>;
  markBroadcastAsSent(id: string): Promise<void>;

  // Bot Marketplace
  getBotMarketplaceListings(): Promise<BotMarketplaceListing[]>;
  getBotMarketplaceListing(id: string): Promise<BotMarketplaceListing | undefined>;
  createBotMarketplaceListing(listing: InsertBotMarketplaceListing): Promise<BotMarketplaceListing>;
  updateBotMarketplaceListing(id: string, updates: Partial<InsertBotMarketplaceListing>): Promise<boolean>;

  // Bot Rentals
  getBotRental(id: string): Promise<BotRental | undefined>;
  getUserBotRentals(userId: string): Promise<BotRental[]>;
  createBotRental(rental: InsertBotRental): Promise<BotRental>;
  updateBotRental(id: string, updates: Partial<InsertBotRental>): Promise<boolean>;

  // Bot Subscriptions
  getBotSubscription(id: string): Promise<BotSubscription | undefined>;
  getUserBotSubscriptions(userId: string): Promise<BotSubscription[]>;
  createBotSubscription(subscription: InsertBotSubscription): Promise<BotSubscription>;
  updateBotSubscription(id: string, updates: Partial<InsertBotSubscription>): Promise<boolean>;

  // Bot Reviews
  getBotReviews(listingId: string): Promise<BotReview[]>;
  createBotReview(review: InsertBotReview): Promise<BotReview>;

  // Bot Learning
  getBotLearningSessions(botId: string): Promise<BotLearningSession[]>;
  createBotLearningSession(session: InsertBotLearningSession): Promise<BotLearningSession>;
  updateBotLearningSession(id: string, updates: Partial<InsertBotLearningSession>): Promise<boolean>;
  createBotTrainingData(data: InsertBotTrainingData): Promise<BotTrainingData>;
  getBotTrainingData(botId: string): Promise<BotTrainingData[]>;

  // Bot Skills
  getBotSkills(botId: string): Promise<BotSkill[]>;
  createBotSkill(skill: InsertBotSkill): Promise<BotSkill>;
  updateBotSkill(id: string, updates: Partial<InsertBotSkill>): Promise<boolean>;
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

  // Exchange Orders
  async getExchangeOrder(id: string): Promise<ExchangeOrder | undefined> {
    const [order] = await db.select().from(exchangeOrders).where(eq(exchangeOrders.id, id));
    return order || undefined;
  }

  async getExchangeOrdersByUserId(userId: string): Promise<ExchangeOrder[]> {
    return db.select().from(exchangeOrders).where(eq(exchangeOrders.userId, userId)).orderBy(desc(exchangeOrders.createdAt));
  }

  async createExchangeOrder(insertOrder: InsertExchangeOrder): Promise<ExchangeOrder> {
    const [order] = await db.insert(exchangeOrders).values(insertOrder).returning();
    return order;
  }

  // Liquidity Pools
  async getLiquidityPool(id: string): Promise<LiquidityPool | undefined> {
    const [pool] = await db.select().from(liquidityPools).where(eq(liquidityPools.id, id));
    return pool || undefined;
  }

  async getAllLiquidityPools(): Promise<LiquidityPool[]> {
    return db.select().from(liquidityPools).orderBy(desc(liquidityPools.createdAt));
  }

  async createLiquidityPool(insertPool: InsertLiquidityPool): Promise<LiquidityPool> {
    const [pool] = await db.insert(liquidityPools).values(insertPool).returning();
    return pool;
  }

  // Mixing Requests
  async getMixingRequest(id: string): Promise<MixingRequest | undefined> {
    const [request] = await db.select().from(mixingRequests).where(eq(mixingRequests.id, id));
    return request || undefined;
  }

  async getMixingRequestsByUserId(userId: string): Promise<MixingRequest[]> {
    return db.select().from(mixingRequests).where(eq(mixingRequests.userId, userId)).orderBy(desc(mixingRequests.createdAt));
  }

  async createMixingRequest(insertRequest: InsertMixingRequest): Promise<MixingRequest> {
    const [request] = await db.insert(mixingRequests).values(insertRequest).returning();
    return request;
  }

  // Forum Categories
  async getForumCategory(id: string): Promise<ForumCategory | undefined> {
    const [category] = await db.select().from(forumCategories).where(eq(forumCategories.id, id));
    return category || undefined;
  }

  async getAllForumCategories(): Promise<ForumCategory[]> {
    return db.select().from(forumCategories).orderBy(desc(forumCategories.createdAt));
  }

  async createForumCategory(insertCategory: InsertForumCategory): Promise<ForumCategory> {
    const [category] = await db.insert(forumCategories).values(insertCategory).returning();
    return category;
  }

  // Forum Threads
  async getForumThread(id: string): Promise<ForumThread | undefined> {
    const [thread] = await db.select().from(forumThreads).where(eq(forumThreads.id, id));
    return thread || undefined;
  }

  async getAllForumThreads(): Promise<ForumThread[]> {
    return db.select().from(forumThreads).orderBy(desc(forumThreads.createdAt));
  }

  async createForumThread(insertThread: InsertForumThread): Promise<ForumThread> {
    const [thread] = await db.insert(forumThreads).values(insertThread).returning();
    return thread;
  }

  // Forum Replies
  async getForumReply(id: string): Promise<ForumReply | undefined> {
    const [reply] = await db.select().from(forumReplies).where(eq(forumReplies.id, id));
    return reply || undefined;
  }

  async getAllForumReplies(): Promise<ForumReply[]> {
    return db.select().from(forumReplies).orderBy(desc(forumReplies.createdAt));
  }

  async createForumReply(insertReply: InsertForumReply): Promise<ForumReply> {
    const [reply] = await db.insert(forumReplies).values(insertReply).returning();
    return reply;
  }

  // Chat Sessions
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session || undefined;
  }

  async getChatSessionsByUserId(userId: string): Promise<ChatSession[]> {
    return db.select().from(chatSessions).where(eq(chatSessions.userId, userId)).orderBy(desc(chatSessions.createdAt));
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const [session] = await db.insert(chatSessions).values(insertSession).returning();
    return session;
  }

  // Chat Messages
  async getChatMessage(id: string): Promise<ChatMessage | undefined> {
    const [message] = await db.select().from(chatMessages).where(eq(chatMessages.id, id));
    return message || undefined;
  }

  async getChatMessagesBySessionId(sessionId: string): Promise<ChatMessage[]> {
    return db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(chatMessages.createdAt);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(insertMessage).returning();
    return message;
  }

  // Metal Inventory
  async getMetalInventoryItem(id: string): Promise<MetalInventory | undefined> {
    const [item] = await db.select().from(metalInventory).where(eq(metalInventory.id, id));
    return item || undefined;
  }

  async getMetalInventoryByUserId(userId: string): Promise<MetalInventory[]> {
    // Get inventory items from trades associated with this user
    const userTrades = await db.select({ inventoryId: metalTrades.inventoryId })
      .from(metalTrades)
      .where(eq(metalTrades.userId, userId));
    
    if (userTrades.length === 0) return [];
    
    const inventoryIds = Array.from(new Set(userTrades.map(t => t.inventoryId)));
    return db.select().from(metalInventory)
      .where(sql`${metalInventory.id} = ANY(${inventoryIds})`)
      .orderBy(desc(metalInventory.createdAt));
  }

  async createMetalInventory(insertItem: InsertMetalInventory): Promise<MetalInventory> {
    const [item] = await db.insert(metalInventory).values(insertItem).returning();
    return item;
  }

  // Metal Trades
  async getMetalTrade(id: string): Promise<MetalTrade | undefined> {
    const [trade] = await db.select().from(metalTrades).where(eq(metalTrades.id, id));
    return trade || undefined;
  }

  async getMetalTradesByUserId(userId: string): Promise<MetalTrade[]> {
    return db.select().from(metalTrades).where(eq(metalTrades.userId, userId)).orderBy(desc(metalTrades.createdAt));
  }

  async createMetalTrade(insertTrade: InsertMetalTrade): Promise<MetalTrade> {
    const [trade] = await db.insert(metalTrades).values(insertTrade).returning();
    return trade;
  }

  // Blog Posts
  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post || undefined;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values(insertPost).returning();
    return post;
  }

  // Dashboard System
  async getUserDashboardConfig(userId: string) {
    return await db.query.userDashboardConfigs.findFirst({
      where: eq(userDashboardConfigs.userId, userId),
    });
  }

  async createOrUpdateDashboardConfig(config: InsertUserDashboardConfig) {
    const existing = await this.getUserDashboardConfig(config.userId);
    if (existing) {
      const [updated] = await db.update(userDashboardConfigs)
        .set({ ...config, updatedAt: new Date() })
        .where(eq(userDashboardConfigs.userId, config.userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(userDashboardConfigs).values(config).returning();
    return created;
  }

  async getDashboardWidgets() {
    return await db.query.dashboardWidgets.findMany({
      orderBy: [asc(dashboardWidgets.type)],
    });
  }

  async createDashboardWidget(widget: InsertDashboardWidget) {
    const [created] = await db.insert(dashboardWidgets).values(widget).returning();
    return created;
  }

  async getUserWidgetPreferences(userId: string) {
    return await db.query.userWidgetPreferences.findMany({
      where: eq(userWidgetPreferences.userId, userId),
      with: { widget: true },
    });
  }

  async createOrUpdateWidgetPreference(pref: InsertUserWidgetPreference) {
    const [result] = await db.insert(userWidgetPreferences)
      .values(pref)
      .onConflictDoUpdate({
        target: [userWidgetPreferences.userId, userWidgetPreferences.widgetId],
        set: {
          position: pref.position,
          config: pref.config,
          isVisible: pref.isVisible,
        },
      })
      .returning();
    return result;
  }

  async deleteWidgetPreference(userId: string, widgetId: string) {
    const result = await db.delete(userWidgetPreferences)
      .where(and(
        eq(userWidgetPreferences.userId, userId),
        eq(userWidgetPreferences.widgetId, widgetId)
      ))
      .returning();
    return result.length > 0;
  }

  // Admin Panel
  async getAdminUser(userId: string) {
    return await db.query.adminUsers.findFirst({
      where: eq(adminUsers.userId, userId),
      with: { user: true },
    });
  }

  async getAllAdminUsers() {
    return await db.query.adminUsers.findMany({
      with: { user: true },
      orderBy: [asc(adminUsers.createdAt)],
    });
  }

  async adminUserExists(userId: string) {
    const admin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.userId, userId),
    });
    return !!admin;
  }

  async createAdminUser(admin: InsertAdminUser) {
    const [created] = await db.insert(adminUsers).values(admin).returning();
    return created;
  }

  async updateAdminRole(userId: string, role: string) {
    const result = await db.update(adminUsers)
      .set({ role: role as any })
      .where(eq(adminUsers.userId, userId))
      .returning();
    return result.length > 0;
  }

  async getAdminAuditLogs(limit: number = 100) {
    return await db.query.adminAuditLogs.findMany({
      orderBy: [desc(adminAuditLogs.createdAt)],
      limit,
      with: { admin: { with: { user: true } } },
    });
  }

  async createAdminAuditLog(log: InsertAdminAuditLog) {
    const [created] = await db.insert(adminAuditLogs).values(log).returning();
    return created;
  }

  async getAdminBroadcasts(limit: number = 50) {
    return await db.query.adminBroadcasts.findMany({
      orderBy: [desc(adminBroadcasts.sentAt)],
      limit,
      with: { admin: { with: { user: true } } },
    });
  }

  async createAdminBroadcast(broadcast: InsertAdminBroadcast) {
    const [created] = await db.insert(adminBroadcasts).values(broadcast).returning();
    return created;
  }

  async markBroadcastAsSent(id: string) {
    await db.update(adminBroadcasts)
      .set({ sentAt: new Date() })
      .where(eq(adminBroadcasts.id, id));
  }

  // Bot Marketplace
  async getBotMarketplaceListings() {
    return await db.query.botMarketplaceListings.findMany({
      with: { seller: true },
      orderBy: [desc(botMarketplaceListings.createdAt)],
    });
  }

  async getBotMarketplaceListing(id: string) {
    return await db.query.botMarketplaceListings.findFirst({
      where: eq(botMarketplaceListings.id, id),
      with: { seller: true },
    });
  }

  async createBotMarketplaceListing(listing: InsertBotMarketplaceListing) {
    const [created] = await db.insert(botMarketplaceListings).values(listing).returning();
    return created;
  }

  async updateBotMarketplaceListing(id: string, updates: Partial<InsertBotMarketplaceListing>) {
    const result = await db.update(botMarketplaceListings)
      .set(updates)
      .where(eq(botMarketplaceListings.id, id))
      .returning();
    return result.length > 0;
  }

  // Bot Rentals
  async getBotRental(id: string) {
    return await db.query.botRentals.findFirst({
      where: eq(botRentals.id, id),
      with: { 
        listing: { with: { seller: true } },
        renter: true 
      },
    });
  }

  async getUserBotRentals(userId: string) {
    return await db.query.botRentals.findMany({
      where: eq(botRentals.renterId, userId),
      with: { 
        listing: { with: { seller: true } },
        renter: true 
      },
      orderBy: [desc(botRentals.startTime)],
    });
  }

  async createBotRental(rental: InsertBotRental) {
    const [created] = await db.insert(botRentals).values(rental).returning();
    return created;
  }

  async updateBotRental(id: string, updates: Partial<InsertBotRental>) {
    const result = await db.update(botRentals)
      .set(updates)
      .where(eq(botRentals.id, id))
      .returning();
    return result.length > 0;
  }

  // Bot Subscriptions
  async getBotSubscription(id: string) {
    return await db.query.botSubscriptions.findFirst({
      where: eq(botSubscriptions.id, id),
      with: { 
        listing: { with: { seller: true } },
        subscriber: true 
      },
    });
  }

  async getUserBotSubscriptions(userId: string) {
    return await db.query.botSubscriptions.findMany({
      where: eq(botSubscriptions.subscriberId, userId),
      with: { 
        listing: { with: { seller: true } },
        subscriber: true 
      },
      orderBy: [desc(botSubscriptions.currentPeriodStart)],
    });
  }

  async createBotSubscription(subscription: InsertBotSubscription) {
    const [created] = await db.insert(botSubscriptions).values(subscription).returning();
    return created;
  }

  async updateBotSubscription(id: string, updates: Partial<InsertBotSubscription>) {
    const result = await db.update(botSubscriptions)
      .set(updates)
      .where(eq(botSubscriptions.id, id))
      .returning();
    return result.length > 0;
  }

  // Bot Reviews
  async getBotReviews(listingId: string) {
    return await db.query.botReviews.findMany({
      where: eq(botReviews.listingId, listingId),
      with: { reviewer: true },
      orderBy: [desc(botReviews.createdAt)],
    });
  }

  async createBotReview(review: InsertBotReview) {
    const [created] = await db.insert(botReviews).values(review).returning();
    return created;
  }

  // Bot Learning
  async getBotLearningSessions(botId: string) {
    return await db.query.botLearningSession.findMany({
      where: eq(botLearningSession.botId, botId),
      orderBy: [desc(botLearningSession.startedAt)],
    });
  }

  async createBotLearningSession(session: InsertBotLearningSession) {
    const [created] = await db.insert(botLearningSession).values(session).returning();
    return created;
  }

  async updateBotLearningSession(id: string, updates: Partial<InsertBotLearningSession>) {
    const result = await db.update(botLearningSession)
      .set(updates)
      .where(eq(botLearningSession.id, id))
      .returning();
    return result.length > 0;
  }

  async createBotTrainingData(data: InsertBotTrainingData) {
    const [created] = await db.insert(botTrainingData).values(data).returning();
    return created;
  }

  async getBotTrainingData(botId: string) {
    return await db.query.botTrainingData.findMany({
      where: eq(botTrainingData.botId, botId),
      orderBy: [asc(botTrainingData.createdAt)],
    });
  }

  // Bot Skills
  async getBotSkills(botId: string) {
    return await db.query.botSkills.findMany({
      where: eq(botSkills.botId, botId),
      orderBy: [asc(botSkills.unlockedAt)],
    });
  }

  async createBotSkill(skill: InsertBotSkill) {
    const [created] = await db.insert(botSkills).values(skill).returning();
    return created;
  }

  async updateBotSkill(id: string, updates: Partial<InsertBotSkill>) {
    const result = await db.update(botSkills)
      .set(updates)
      .where(eq(botSkills.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
