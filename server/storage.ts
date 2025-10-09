import {
  users,
  wallets,
  transactions,
  nfts,
  tokens,
  songs,
  jesusCartelReleases,
  jesusCartelEvents,
  jesusCartelStreams,
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
  metalProducts,
  metalOwnership,
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
  tradingSystemMemory,
  p2pOffers,
  p2pOrders,
  p2pPaymentMethods,
  p2pChatMessages,
  p2pDisputes,
  p2pReviews,
  walletConnectSessions,
  celebrityProfiles,
  fanFollows,
  fanStakes,
  fanBets,
  predictionMarkets,
  celebrityContent,
  brokerAccounts,
  brokerOrders,
  brokerPositions,
  spectrumPlans,
  userSpectrumSubscriptions,
  spectrumEarnings,
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
  type JesusCartelRelease,
  type InsertJesusCartelRelease,
  type JesusCartelEvent,
  type InsertJesusCartelEvent,
  type JesusCartelStream,
  type InsertJesusCartelStream,
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
  type MetalProduct,
  type InsertMetalProduct,
  type MetalOwnership,
  type InsertMetalOwnership,
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
  type TradingSystemMemory,
  type InsertTradingSystemMemory,
  type P2POffer,
  type InsertP2POffer,
  type P2POrder,
  type InsertP2POrder,
  type P2PPaymentMethod,
  type InsertP2PPaymentMethod,
  type P2PChatMessage,
  type InsertP2PChatMessage,
  type P2PDispute,
  type InsertP2PDispute,
  type P2PReview,
  type InsertP2PReview,
  type WalletConnectSession,
  type InsertWalletConnectSession,
  type CelebrityProfile,
  type InsertCelebrityProfile,
  type FanFollow,
  type InsertFanFollow,
  type FanStake,
  type InsertFanStake,
  type FanBet,
  type InsertFanBet,
  type PredictionMarket,
  type InsertPredictionMarket,
  type CelebrityContent,
  type InsertCelebrityContent,
  financialOrders,
  financialHoldings,
  type FinancialOrder,
  type InsertFinancialOrder,
  type FinancialHolding,
  type InsertFinancialHolding,
  spectrumPlans,
  userSpectrumSubscriptions,
  spectrumEarnings,
  type SpectrumPlan,
  type InsertSpectrumPlan,
  type UserSpectrumSubscription,
  type InsertUserSpectrumSubscription,
  type SpectrumEarning,
  type InsertSpectrumEarning,
  type BrokerAccount,
  type InsertBrokerAccount,
  type BrokerOrder,
  type InsertBrokerOrder,
  type BrokerPosition,
  type InsertBrokerPosition,
  individualAssets,
  etherealElements,
  etherealOwnership,
  type IndividualAsset,
  type InsertIndividualAsset,
  type EtherealElement,
  type InsertEtherealElement,
  type EtherealOwnership,
  type InsertEtherealOwnership,
  prayers,
  scriptures,
  prayerTradeCorrelations,
  userPrayerSettings,
  type Prayer,
  type InsertPrayer,
  type Scripture,
  type InsertScripture,
  type PrayerTradeCorrelation,
  type InsertPrayerTradeCorrelation,
  type UserPrayerSettings,
  type InsertUserPrayerSettings,
  charities,
  tithingConfigs,
  tithingHistory,
  type Charity,
  type InsertCharity,
  type TithingConfig,
  type InsertTithingConfig,
  type TithingHistory,
  type InsertTithingHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, asc } from "drizzle-orm";

export interface IStorage {
  // Users (Replit Auth compatible)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(limit?: number, offset?: number): Promise<User[]>;
  getTotalUsersCount(): Promise<number>;
  updateUserStatus(userId: string, isAdmin: boolean): Promise<void>;
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
  
  // Jesus Cartel Releases
  getLatestReleases(limit?: number): Promise<JesusCartelRelease[]>;
  getFeaturedReleases(): Promise<JesusCartelRelease[]>;
  getRelease(id: string): Promise<JesusCartelRelease | undefined>;
  createRelease(release: InsertJesusCartelRelease): Promise<JesusCartelRelease>;
  updateRelease(id: string, updates: Partial<InsertJesusCartelRelease>): Promise<void>;
  deleteRelease(id: string): Promise<void>;
  incrementStreamCount(releaseId: string): Promise<void>;
  incrementLikeCount(releaseId: string): Promise<void>;
  
  // Jesus Cartel Events
  getUpcomingEvents(limit?: number): Promise<JesusCartelEvent[]>;
  getFeaturedEvents(): Promise<JesusCartelEvent[]>;
  getEvent(id: string): Promise<JesusCartelEvent | undefined>;
  createEvent(event: InsertJesusCartelEvent): Promise<JesusCartelEvent>;
  updateEvent(id: string, updates: Partial<InsertJesusCartelEvent>): Promise<void>;
  deleteEvent(id: string): Promise<void>;
  
  // Jesus Cartel Stream Tracking
  trackStream(stream: InsertJesusCartelStream): Promise<JesusCartelStream>;
  getReleaseStreams(releaseId: string): Promise<JesusCartelStream[]>;
  getUserStreams(userId: string): Promise<JesusCartelStream[]>;

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
  getAllBots(limit?: number, offset?: number): Promise<any[]>;
  getTotalBotsCount(): Promise<number>;
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

  // Precious Metals Exchange
  getAllMetalProducts(): Promise<MetalProduct[]>;
  getMetalProduct(id: string): Promise<MetalProduct | undefined>;
  createMetalProduct(product: InsertMetalProduct): Promise<MetalProduct>;
  getUserMetalOwnership(userId: string): Promise<MetalOwnership[]>;
  getMetalOwnership(id: string): Promise<MetalOwnership | undefined>;
  createMetalOwnership(ownership: InsertMetalOwnership): Promise<MetalOwnership>;
  updateMetalOwnershipLocation(id: string, location: string, deliveryAddress?: string, trackingNumber?: string): Promise<void>;

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

  // Trading System Memory
  getTradingSystemMemory(botId: string): Promise<TradingSystemMemory[]>;
  getTradingSystemMemoryByKey(botId: string, memoryType: string, memoryKey: string): Promise<TradingSystemMemory | undefined>;
  createTradingSystemMemory(memory: InsertTradingSystemMemory): Promise<TradingSystemMemory>;
  updateTradingSystemMemory(id: string, updates: Partial<InsertTradingSystemMemory>): Promise<boolean>;

  // Broker Integration
  getBrokerAccount(id: string): Promise<BrokerAccount | undefined>;
  getUserBrokerAccounts(userId: string): Promise<BrokerAccount[]>;
  createBrokerAccount(account: InsertBrokerAccount): Promise<BrokerAccount>;
  updateBrokerAccount(id: string, updates: Partial<InsertBrokerAccount>): Promise<BrokerAccount | undefined>;
  getBrokerOrder(id: string): Promise<BrokerOrder | undefined>;
  getBrokerOrderByExternalId(externalOrderId: string): Promise<BrokerOrder | undefined>;
  getBrokerOrdersByAccountId(brokerAccountId: string): Promise<BrokerOrder[]>;
  createBrokerOrder(order: InsertBrokerOrder): Promise<BrokerOrder>;
  updateBrokerOrder(id: string, updates: Partial<InsertBrokerOrder>): Promise<BrokerOrder | undefined>;
  getBrokerPosition(id: string): Promise<BrokerPosition | undefined>;
  getBrokerPositionBySymbol(brokerAccountId: string, symbol: string): Promise<BrokerPosition | undefined>;
  getBrokerPositionsByAccountId(brokerAccountId: string): Promise<BrokerPosition[]>;
  createBrokerPosition(position: InsertBrokerPosition): Promise<BrokerPosition>;
  updateBrokerPosition(id: string, updates: Partial<InsertBrokerPosition>): Promise<BrokerPosition | undefined>;

  // P2P Trading
  getP2POffers(type?: string): Promise<P2POffer[]>;
  getP2POffer(id: string): Promise<P2POffer | undefined>;
  createP2POffer(offer: InsertP2POffer): Promise<P2POffer>;
  updateP2POffer(id: string, updates: Partial<InsertP2POffer>): Promise<boolean>;

  getP2POrders(userId: string): Promise<P2POrder[]>;
  getP2POrder(id: string): Promise<P2POrder | undefined>;
  createP2POrder(order: InsertP2POrder): Promise<P2POrder>;
  updateP2POrder(id: string, updates: Partial<InsertP2POrder>): Promise<boolean>;

  getUserP2PPaymentMethods(userId: string): Promise<P2PPaymentMethod[]>;
  createP2PPaymentMethod(method: InsertP2PPaymentMethod): Promise<P2PPaymentMethod>;

  getOrderChatMessages(orderId: string): Promise<P2PChatMessage[]>;
  createP2PChatMessage(message: InsertP2PChatMessage): Promise<P2PChatMessage>;

  getP2PDisputes(status?: string): Promise<P2PDispute[]>;
  getP2PDispute(id: string): Promise<P2PDispute | undefined>;
  createP2PDispute(dispute: InsertP2PDispute): Promise<P2PDispute>;
  updateP2PDispute(id: string, updates: Partial<InsertP2PDispute>): Promise<boolean>;

  getUserP2PReviews(userId: string): Promise<P2PReview[]>;
  createP2PReview(review: InsertP2PReview): Promise<P2PReview>;

  // WalletConnect
  getWalletConnectSessions(userId: string): Promise<WalletConnectSession[]>;
  getActiveWalletSession(userId: string, walletAddress: string): Promise<WalletConnectSession | undefined>;
  createWalletConnectSession(session: InsertWalletConnectSession): Promise<WalletConnectSession>;
  updateWalletSessionStatus(id: string, status: string): Promise<boolean>;
  disconnectWalletSession(id: string): Promise<boolean>;

  // Celebrity Fan Platform (TWinn System)
  getCelebrityProfile(id: string): Promise<CelebrityProfile | undefined>;
  getCelebrityProfileByUserId(userId: string): Promise<CelebrityProfile | undefined>;
  getAllCelebrityProfiles(status?: string): Promise<CelebrityProfile[]>;
  createCelebrityProfile(profile: InsertCelebrityProfile): Promise<CelebrityProfile>;
  updateCelebrityProfile(id: string, updates: Partial<InsertCelebrityProfile>): Promise<boolean>;
  updateCelebrityFollowerCount(id: string, count: number): Promise<void>;
  updateCelebrityTotalStaked(id: string, amount: string): Promise<void>;
  
  getCelebrityFollows(celebrityId: string): Promise<FanFollow[]>;
  getUserFollows(fanId: string): Promise<FanFollow[]>;
  isFollowing(fanId: string, celebrityId: string): Promise<boolean>;
  createFollow(follow: InsertFanFollow): Promise<FanFollow>;
  deleteFollow(fanId: string, celebrityId: string): Promise<boolean>;
  
  getCelebrityStakes(celebrityId: string): Promise<FanStake[]>;
  getUserStakes(fanId: string): Promise<FanStake[]>;
  createStake(stake: InsertFanStake): Promise<FanStake>;
  updateStakeStatus(id: string, status: string): Promise<void>;
  
  getCelebrityBets(celebrityId: string): Promise<FanBet[]>;
  getUserBets(fanId: string): Promise<FanBet[]>;
  createBet(bet: InsertFanBet): Promise<FanBet>;
  updateBetStatus(id: string, status: string, payout?: string): Promise<void>;
  
  getPredictionMarkets(celebrityId?: string): Promise<PredictionMarket[]>;
  getPredictionMarket(id: string): Promise<PredictionMarket | undefined>;
  createPredictionMarket(market: InsertPredictionMarket): Promise<PredictionMarket>;
  updatePredictionMarket(id: string, updates: Partial<InsertPredictionMarket>): Promise<boolean>;
  
  getCelebrityContent(celebrityId: string): Promise<CelebrityContent[]>;
  getCelebrityContentItem(id: string): Promise<CelebrityContent | undefined>;
  createCelebrityContent(content: InsertCelebrityContent): Promise<CelebrityContent>;
  updateContentViews(id: string): Promise<void>;
  updateContentLikes(id: string): Promise<void>;

  // Financial Services
  createFinancialOrder(order: InsertFinancialOrder): Promise<FinancialOrder>;
  getFinancialOrdersByUserId(userId: string): Promise<FinancialOrder[]>;
  getFinancialOrder(id: string): Promise<FinancialOrder | undefined>;
  updateFinancialOrderStatus(id: string, status: string): Promise<void>;
  
  createFinancialHolding(holding: InsertFinancialHolding): Promise<FinancialHolding>;
  getFinancialHoldingsByUserId(userId: string): Promise<FinancialHolding[]>;
  getFinancialHoldingsByAssetType(userId: string, assetType: string): Promise<FinancialHolding[]>;
  updateFinancialHolding(userId: string, assetType: string, symbol: string, updates: Partial<FinancialHolding>): Promise<void>;

  // Spectrum Investment Plans
  getAllSpectrumPlans(): Promise<SpectrumPlan[]>;
  getSpectrumPlan(id: string): Promise<SpectrumPlan | undefined>;
  getSpectrumPlanByTier(tier: string): Promise<SpectrumPlan | undefined>;
  createSpectrumPlan(plan: InsertSpectrumPlan): Promise<SpectrumPlan>;
  updateSpectrumPlan(id: string, updates: Partial<InsertSpectrumPlan>): Promise<void>;
  
  getUserSpectrumSubscription(userId: string): Promise<UserSpectrumSubscription | undefined>;
  getUserSpectrumSubscriptionById(id: string): Promise<UserSpectrumSubscription | undefined>;
  createSpectrumSubscription(subscription: InsertUserSpectrumSubscription): Promise<UserSpectrumSubscription>;
  updateSpectrumSubscription(id: string, updates: Partial<InsertUserSpectrumSubscription>): Promise<void>;
  cancelSpectrumSubscription(id: string): Promise<void>;
  
  getSpectrumEarnings(userId: string): Promise<SpectrumEarning[]>;
  getSpectrumEarningsBySubscription(subscriptionId: string): Promise<SpectrumEarning[]>;
  createSpectrumEarning(earning: InsertSpectrumEarning): Promise<SpectrumEarning>;
  getAllActiveSpectrumSubscriptions(): Promise<UserSpectrumSubscription[]>;

  // Individual Assets & Ethereal Elements
  getAllEtherealElements(): Promise<EtherealElement[]>;
  getEtherealElement(id: string): Promise<EtherealElement | undefined>;
  createEtherealElement(element: InsertEtherealElement): Promise<EtherealElement>;
  updateEtherealElementMintCount(id: string, mintedCount: number): Promise<void>;
  
  getEtherealOwnership(userId: string, elementId: string): Promise<EtherealOwnership | undefined>;
  getUserEtherealOwnerships(userId: string): Promise<any[]>;
  createEtherealOwnership(ownership: InsertEtherealOwnership): Promise<EtherealOwnership>;
  updateEtherealOwnershipQuantity(userId: string, elementId: string, quantity: number): Promise<void>;
  
  getIndividualAsset(id: string): Promise<IndividualAsset | undefined>;
  getUserIndividualAssets(userId: string): Promise<IndividualAsset[]>;
  getUserAssetsByType(userId: string, assetType: string): Promise<IndividualAsset[]>;
  createIndividualAsset(asset: InsertIndividualAsset): Promise<IndividualAsset>;
  updateIndividualAssetValue(id: string, marketValue: string): Promise<void>;

  // Prayer Integration System
  createPrayer(prayer: InsertPrayer): Promise<Prayer>;
  getUserPrayers(userId: string, limit?: number): Promise<Prayer[]>;
  getPrayer(id: string): Promise<Prayer | undefined>;
  
  createScripture(scripture: InsertScripture): Promise<Scripture>;
  getAllScriptures(): Promise<Scripture[]>;
  getScripturesByCategory(category?: string): Promise<Scripture[]>;
  getScripturesCount(): Promise<number>;
  
  createPrayerTradeCorrelation(correlation: InsertPrayerTradeCorrelation): Promise<PrayerTradeCorrelation>;
  getUserPrayerCorrelations(userId: string): Promise<PrayerTradeCorrelation[]>;
  getPrayerCorrelation(id: string): Promise<PrayerTradeCorrelation | undefined>;

  getUserPrayerSettings(userId: string): Promise<UserPrayerSettings | undefined>;
  upsertUserPrayerSettings(settings: InsertUserPrayerSettings): Promise<UserPrayerSettings>;
  updateUserPrayerSettings(userId: string, updates: Partial<InsertUserPrayerSettings>): Promise<void>;

  // Auto-Tithing System
  getAllCharities(): Promise<Charity[]>;
  getActiveCharities(): Promise<Charity[]>;
  getCharity(id: string): Promise<Charity | undefined>;
  createCharity(charity: InsertCharity): Promise<Charity>;
  updateCharity(id: string, updates: Partial<InsertCharity>): Promise<void>;
  updateCharityTotals(id: string, amount: string): Promise<void>;
  
  getTithingConfigByUserId(userId: string): Promise<TithingConfig | undefined>;
  createTithingConfig(config: InsertTithingConfig): Promise<TithingConfig>;
  updateTithingConfig(id: string, updates: Partial<InsertTithingConfig>): Promise<void>;
  
  getTithingHistory(userId: string, filters?: { startDate?: Date; endDate?: Date; status?: string }): Promise<TithingHistory[]>;
  getTithingHistoryItem(id: string): Promise<TithingHistory | undefined>;
  createTithingHistory(history: InsertTithingHistory): Promise<TithingHistory>;
  updateTithingHistory(id: string, updates: Partial<InsertTithingHistory>): Promise<TithingHistory>;
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

  async getAllUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    return db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt));
  }

  async getTotalUsersCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return result[0]?.count || 0;
  }

  async updateUserStatus(userId: string, isAdmin: boolean): Promise<void> {
    await db.update(users).set({ isAdmin }).where(eq(users.id, userId));
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

  // Jesus Cartel Releases
  async getLatestReleases(limit: number = 10): Promise<JesusCartelRelease[]> {
    return db
      .select()
      .from(jesusCartelReleases)
      .orderBy(desc(jesusCartelReleases.releaseDate))
      .limit(limit);
  }

  async getFeaturedReleases(): Promise<JesusCartelRelease[]> {
    return db
      .select()
      .from(jesusCartelReleases)
      .where(eq(jesusCartelReleases.isFeatured, true))
      .orderBy(desc(jesusCartelReleases.releaseDate));
  }

  async getRelease(id: string): Promise<JesusCartelRelease | undefined> {
    const [release] = await db
      .select()
      .from(jesusCartelReleases)
      .where(eq(jesusCartelReleases.id, id));
    return release || undefined;
  }

  async createRelease(release: InsertJesusCartelRelease): Promise<JesusCartelRelease> {
    const [newRelease] = await db
      .insert(jesusCartelReleases)
      .values(release)
      .returning();
    return newRelease;
  }

  async updateRelease(id: string, updates: Partial<InsertJesusCartelRelease>): Promise<void> {
    await db
      .update(jesusCartelReleases)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jesusCartelReleases.id, id));
  }

  async deleteRelease(id: string): Promise<void> {
    await db.delete(jesusCartelReleases).where(eq(jesusCartelReleases.id, id));
  }

  async incrementStreamCount(releaseId: string): Promise<void> {
    await db
      .update(jesusCartelReleases)
      .set({ streamCount: sql`${jesusCartelReleases.streamCount} + 1` })
      .where(eq(jesusCartelReleases.id, releaseId));
  }

  async incrementLikeCount(releaseId: string): Promise<void> {
    await db
      .update(jesusCartelReleases)
      .set({ likeCount: sql`${jesusCartelReleases.likeCount} + 1` })
      .where(eq(jesusCartelReleases.id, releaseId));
  }

  // Jesus Cartel Events
  async getUpcomingEvents(limit: number = 10): Promise<JesusCartelEvent[]> {
    return db
      .select()
      .from(jesusCartelEvents)
      .where(eq(jesusCartelEvents.status, "upcoming"))
      .orderBy(asc(jesusCartelEvents.date))
      .limit(limit);
  }

  async getFeaturedEvents(): Promise<JesusCartelEvent[]> {
    return db
      .select()
      .from(jesusCartelEvents)
      .where(eq(jesusCartelEvents.isFeatured, true))
      .orderBy(asc(jesusCartelEvents.date));
  }

  async getEvent(id: string): Promise<JesusCartelEvent | undefined> {
    const [event] = await db
      .select()
      .from(jesusCartelEvents)
      .where(eq(jesusCartelEvents.id, id));
    return event || undefined;
  }

  async createEvent(event: InsertJesusCartelEvent): Promise<JesusCartelEvent> {
    const [newEvent] = await db
      .insert(jesusCartelEvents)
      .values(event)
      .returning();
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<InsertJesusCartelEvent>): Promise<void> {
    await db
      .update(jesusCartelEvents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jesusCartelEvents.id, id));
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(jesusCartelEvents).where(eq(jesusCartelEvents.id, id));
  }

  // Jesus Cartel Stream Tracking
  async trackStream(stream: InsertJesusCartelStream): Promise<JesusCartelStream> {
    const [newStream] = await db
      .insert(jesusCartelStreams)
      .values(stream)
      .returning();
    
    await this.incrementStreamCount(stream.releaseId);
    
    return newStream;
  }

  async getReleaseStreams(releaseId: string): Promise<JesusCartelStream[]> {
    return db
      .select()
      .from(jesusCartelStreams)
      .where(eq(jesusCartelStreams.releaseId, releaseId))
      .orderBy(desc(jesusCartelStreams.createdAt));
  }

  async getUserStreams(userId: string): Promise<JesusCartelStream[]> {
    return db
      .select()
      .from(jesusCartelStreams)
      .where(eq(jesusCartelStreams.userId, userId))
      .orderBy(desc(jesusCartelStreams.createdAt));
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

  async getAllBots(limit: number = 50, offset: number = 0): Promise<any[]> {
    const botsWithStats = await db
      .select({
        bot: tradingBots,
        user: users,
        skillsCount: sql<number>`(SELECT COUNT(*) FROM ${botSkills} WHERE ${botSkills.botId} = ${tradingBots.id})`,
        sessionsCount: sql<number>`(SELECT COUNT(*) FROM ${botLearningSession} WHERE ${botLearningSession.botId} = ${tradingBots.id})`,
        avgSkillLevel: sql<number>`(SELECT AVG(${botSkills.skillLevel}) FROM ${botSkills} WHERE ${botSkills.botId} = ${tradingBots.id})`,
      })
      .from(tradingBots)
      .leftJoin(users, eq(tradingBots.userId, users.id))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tradingBots.createdAt));
    
    return botsWithStats.map(row => ({
      ...row.bot,
      user: row.user,
      skillsCount: row.skillsCount || 0,
      sessionsCount: row.sessionsCount || 0,
      avgSkillLevel: row.avgSkillLevel || 0,
    }));
  }

  async getTotalBotsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(tradingBots);
    return result[0]?.count || 0;
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

  // Precious Metals Exchange
  async getAllMetalProducts(): Promise<MetalProduct[]> {
    return db.select().from(metalProducts).orderBy(asc(metalProducts.metal));
  }

  async getMetalProduct(id: string): Promise<MetalProduct | undefined> {
    const [product] = await db.select().from(metalProducts).where(eq(metalProducts.id, id));
    return product || undefined;
  }

  async createMetalProduct(insertProduct: InsertMetalProduct): Promise<MetalProduct> {
    const [product] = await db.insert(metalProducts).values(insertProduct).returning();
    return product;
  }

  async getUserMetalOwnership(userId: string): Promise<MetalOwnership[]> {
    return db.select().from(metalOwnership).where(eq(metalOwnership.userId, userId)).orderBy(desc(metalOwnership.purchasedAt));
  }

  async getMetalOwnership(id: string): Promise<MetalOwnership | undefined> {
    const [ownership] = await db.select().from(metalOwnership).where(eq(metalOwnership.id, id));
    return ownership || undefined;
  }

  async createMetalOwnership(insertOwnership: InsertMetalOwnership): Promise<MetalOwnership> {
    const [ownership] = await db.insert(metalOwnership).values(insertOwnership).returning();
    return ownership;
  }

  async updateMetalOwnershipLocation(id: string, location: string, deliveryAddress?: string, trackingNumber?: string): Promise<void> {
    await db.update(metalOwnership)
      .set({ 
        location: location as any,
        deliveryAddress,
        trackingNumber,
        deliveredAt: location === 'delivered' ? sql`NOW()` : undefined
      })
      .where(eq(metalOwnership.id, id));
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

  // Trading System Memory
  async getTradingSystemMemory(botId: string) {
    return await db.query.tradingSystemMemory.findMany({
      where: eq(tradingSystemMemory.botId, botId),
      orderBy: [desc(tradingSystemMemory.lastAccessed)],
    });
  }

  async getTradingSystemMemoryByKey(botId: string, memoryType: string, memoryKey: string) {
    const result = await db.query.tradingSystemMemory.findFirst({
      where: and(
        eq(tradingSystemMemory.botId, botId),
        eq(tradingSystemMemory.memoryType, memoryType),
        eq(tradingSystemMemory.memoryKey, memoryKey)
      ),
    });
    return result || undefined;
  }

  async createTradingSystemMemory(memory: InsertTradingSystemMemory) {
    const [created] = await db.insert(tradingSystemMemory).values(memory).returning();
    return created;
  }

  async updateTradingSystemMemory(id: string, updates: Partial<InsertTradingSystemMemory>) {
    const result = await db.update(tradingSystemMemory)
      .set({ ...updates, lastAccessed: new Date() })
      .where(eq(tradingSystemMemory.id, id))
      .returning();
    return result.length > 0;
  }

  // Broker Integration
  async getBrokerAccount(id: string) {
    return await db.query.brokerAccounts.findFirst({
      where: eq(brokerAccounts.id, id),
    });
  }

  async getUserBrokerAccounts(userId: string) {
    return await db.query.brokerAccounts.findMany({
      where: eq(brokerAccounts.userId, userId),
      orderBy: [desc(brokerAccounts.createdAt)],
    });
  }

  async createBrokerAccount(account: InsertBrokerAccount) {
    const [created] = await db.insert(brokerAccounts).values(account).returning();
    return created;
  }

  async updateBrokerAccount(id: string, updates: Partial<InsertBrokerAccount>) {
    const [updated] = await db.update(brokerAccounts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(brokerAccounts.id, id))
      .returning();
    return updated;
  }

  async getBrokerOrder(id: string) {
    return await db.query.brokerOrders.findFirst({
      where: eq(brokerOrders.id, id),
    });
  }

  async getBrokerOrderByExternalId(externalOrderId: string) {
    return await db.query.brokerOrders.findFirst({
      where: eq(brokerOrders.externalOrderId, externalOrderId),
    });
  }

  async getBrokerOrdersByAccountId(brokerAccountId: string) {
    return await db.query.brokerOrders.findMany({
      where: eq(brokerOrders.brokerAccountId, brokerAccountId),
      orderBy: [desc(brokerOrders.submittedAt)],
    });
  }

  async createBrokerOrder(order: InsertBrokerOrder) {
    const [created] = await db.insert(brokerOrders).values(order).returning();
    return created;
  }

  async updateBrokerOrder(id: string, updates: Partial<InsertBrokerOrder>) {
    const [updated] = await db.update(brokerOrders)
      .set(updates)
      .where(eq(brokerOrders.id, id))
      .returning();
    return updated;
  }

  async getBrokerPosition(id: string) {
    return await db.query.brokerPositions.findFirst({
      where: eq(brokerPositions.id, id),
    });
  }

  async getBrokerPositionBySymbol(brokerAccountId: string, symbol: string) {
    return await db.query.brokerPositions.findFirst({
      where: and(
        eq(brokerPositions.brokerAccountId, brokerAccountId),
        eq(brokerPositions.symbol, symbol)
      ),
    });
  }

  async getBrokerPositionsByAccountId(brokerAccountId: string) {
    return await db.query.brokerPositions.findMany({
      where: eq(brokerPositions.brokerAccountId, brokerAccountId),
      orderBy: [desc(brokerPositions.lastUpdatedAt)],
    });
  }

  async createBrokerPosition(position: InsertBrokerPosition) {
    const [created] = await db.insert(brokerPositions).values(position).returning();
    return created;
  }

  async updateBrokerPosition(id: string, updates: Partial<InsertBrokerPosition>) {
    const [updated] = await db.update(brokerPositions)
      .set({ ...updates, lastUpdatedAt: new Date() })
      .where(eq(brokerPositions.id, id))
      .returning();
    return updated;
  }

  // P2P Trading
  async getP2POffers(type?: string) {
    if (type) {
      return await db.query.p2pOffers.findMany({
        where: eq(p2pOffers.type, type as any),
        with: { user: true },
        orderBy: [desc(p2pOffers.createdAt)],
      });
    }
    return await db.query.p2pOffers.findMany({
      with: { user: true },
      orderBy: [desc(p2pOffers.createdAt)],
    });
  }

  async getP2POffer(id: string) {
    return await db.query.p2pOffers.findFirst({
      where: eq(p2pOffers.id, id),
      with: { user: true },
    });
  }

  async createP2POffer(offer: InsertP2POffer) {
    const [created] = await db.insert(p2pOffers).values(offer).returning();
    return created;
  }

  async updateP2POffer(id: string, updates: Partial<InsertP2POffer>) {
    const result = await db.update(p2pOffers)
      .set(updates)
      .where(eq(p2pOffers.id, id))
      .returning();
    return result.length > 0;
  }

  async getP2POrders(userId: string) {
    return await db.query.p2pOrders.findMany({
      where: sql`${p2pOrders.buyerId} = ${userId} OR ${p2pOrders.sellerId} = ${userId}`,
      with: {
        offer: { with: { user: true } },
        buyer: true,
        seller: true,
      },
      orderBy: [desc(p2pOrders.createdAt)],
    });
  }

  async getP2POrder(id: string) {
    return await db.query.p2pOrders.findFirst({
      where: eq(p2pOrders.id, id),
      with: {
        offer: { with: { user: true } },
        buyer: true,
        seller: true,
      },
    });
  }

  async createP2POrder(order: InsertP2POrder) {
    const [created] = await db.insert(p2pOrders).values(order).returning();
    return created;
  }

  async updateP2POrder(id: string, updates: Partial<InsertP2POrder>) {
    const result = await db.update(p2pOrders)
      .set(updates)
      .where(eq(p2pOrders.id, id))
      .returning();
    return result.length > 0;
  }

  async getUserP2PPaymentMethods(userId: string) {
    return await db.query.p2pPaymentMethods.findMany({
      where: eq(p2pPaymentMethods.userId, userId),
      orderBy: [desc(p2pPaymentMethods.createdAt)],
    });
  }

  async createP2PPaymentMethod(method: InsertP2PPaymentMethod) {
    const [created] = await db.insert(p2pPaymentMethods).values(method).returning();
    return created;
  }

  async getOrderChatMessages(orderId: string) {
    return await db.query.p2pChatMessages.findMany({
      where: eq(p2pChatMessages.orderId, orderId),
      with: { sender: true },
      orderBy: [asc(p2pChatMessages.createdAt)],
    });
  }

  async createP2PChatMessage(message: InsertP2PChatMessage) {
    const [created] = await db.insert(p2pChatMessages).values(message).returning();
    return created;
  }

  async getP2PDisputes(status?: string) {
    if (status) {
      return await db.query.p2pDisputes.findMany({
        where: eq(p2pDisputes.status, status as any),
        with: {
          order: { with: { offer: true, buyer: true, seller: true } },
          raisedByUser: true,
          resolvedByAdmin: { with: { user: true } },
        },
        orderBy: [desc(p2pDisputes.createdAt)],
      });
    }
    return await db.query.p2pDisputes.findMany({
      with: {
        order: { with: { offer: true, buyer: true, seller: true } },
        raisedByUser: true,
        resolvedByAdmin: { with: { user: true } },
      },
      orderBy: [desc(p2pDisputes.createdAt)],
    });
  }

  async getP2PDispute(id: string) {
    return await db.query.p2pDisputes.findFirst({
      where: eq(p2pDisputes.id, id),
      with: {
        order: { with: { offer: true, buyer: true, seller: true } },
        raisedByUser: true,
        resolvedByAdmin: { with: { user: true } },
      },
    });
  }

  async createP2PDispute(dispute: InsertP2PDispute) {
    const [created] = await db.insert(p2pDisputes).values(dispute).returning();
    return created;
  }

  async updateP2PDispute(id: string, updates: Partial<InsertP2PDispute>) {
    const result = await db.update(p2pDisputes)
      .set(updates)
      .where(eq(p2pDisputes.id, id))
      .returning();
    return result.length > 0;
  }

  async getUserP2PReviews(userId: string) {
    return await db.query.p2pReviews.findMany({
      where: eq(p2pReviews.reviewedUserId, userId),
      with: {
        reviewer: true,
        order: true,
      },
      orderBy: [desc(p2pReviews.createdAt)],
    });
  }

  async createP2PReview(review: InsertP2PReview) {
    const [created] = await db.insert(p2pReviews).values(review).returning();
    return created;
  }

  // WalletConnect
  async getWalletConnectSessions(userId: string) {
    return await db.query.walletConnectSessions.findMany({
      where: eq(walletConnectSessions.userId, userId),
      orderBy: [desc(walletConnectSessions.lastUsedAt)],
    });
  }

  async getActiveWalletSession(userId: string, walletAddress: string) {
    return await db.query.walletConnectSessions.findFirst({
      where: and(
        eq(walletConnectSessions.userId, userId),
        eq(walletConnectSessions.walletAddress, walletAddress),
        eq(walletConnectSessions.status, "active")
      ),
    });
  }

  async createWalletConnectSession(session: InsertWalletConnectSession) {
    const [created] = await db.insert(walletConnectSessions).values(session).returning();
    return created;
  }

  async updateWalletSessionStatus(id: string, status: string) {
    const result = await db.update(walletConnectSessions)
      .set({ status: status as any, lastUsedAt: new Date() })
      .where(eq(walletConnectSessions.id, id))
      .returning();
    return result.length > 0;
  }

  async disconnectWalletSession(id: string) {
    const result = await db.update(walletConnectSessions)
      .set({ status: "disconnected", lastUsedAt: new Date() })
      .where(eq(walletConnectSessions.id, id))
      .returning();
    return result.length > 0;
  }

  // Celebrity Fan Platform (TWinn System)
  async getCelebrityProfile(id: string) {
    return await db.query.celebrityProfiles.findFirst({
      where: eq(celebrityProfiles.id, id),
    });
  }

  async getCelebrityProfileByUserId(userId: string) {
    return await db.query.celebrityProfiles.findFirst({
      where: eq(celebrityProfiles.userId, userId),
    });
  }

  async getAllCelebrityProfiles(status?: string) {
    if (status) {
      return await db.query.celebrityProfiles.findMany({
        where: eq(celebrityProfiles.verificationStatus, status),
        orderBy: [desc(celebrityProfiles.followerCount)],
      });
    }
    return await db.query.celebrityProfiles.findMany({
      orderBy: [desc(celebrityProfiles.followerCount)],
    });
  }

  async createCelebrityProfile(profile: InsertCelebrityProfile) {
    const [created] = await db.insert(celebrityProfiles).values(profile).returning();
    return created;
  }

  async updateCelebrityProfile(id: string, updates: Partial<InsertCelebrityProfile>) {
    const result = await db.update(celebrityProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(celebrityProfiles.id, id))
      .returning();
    return result.length > 0;
  }

  async updateCelebrityFollowerCount(id: string, count: number) {
    await db.update(celebrityProfiles)
      .set({ followerCount: count, updatedAt: new Date() })
      .where(eq(celebrityProfiles.id, id));
  }

  async updateCelebrityTotalStaked(id: string, amount: string) {
    await db.update(celebrityProfiles)
      .set({ totalStaked: amount, updatedAt: new Date() })
      .where(eq(celebrityProfiles.id, id));
  }

  async getCelebrityFollows(celebrityId: string) {
    return await db.query.fanFollows.findMany({
      where: eq(fanFollows.celebrityId, celebrityId),
      orderBy: [desc(fanFollows.followedAt)],
    });
  }

  async getUserFollows(fanId: string) {
    return await db.query.fanFollows.findMany({
      where: eq(fanFollows.fanId, fanId),
      orderBy: [desc(fanFollows.followedAt)],
    });
  }

  async isFollowing(fanId: string, celebrityId: string) {
    const follow = await db.query.fanFollows.findFirst({
      where: and(
        eq(fanFollows.fanId, fanId),
        eq(fanFollows.celebrityId, celebrityId)
      ),
    });
    return !!follow;
  }

  async createFollow(follow: InsertFanFollow) {
    const [created] = await db.insert(fanFollows).values(follow).returning();
    return created;
  }

  async deleteFollow(fanId: string, celebrityId: string) {
    const result = await db.delete(fanFollows)
      .where(and(
        eq(fanFollows.fanId, fanId),
        eq(fanFollows.celebrityId, celebrityId)
      ))
      .returning();
    return result.length > 0;
  }

  async getCelebrityStakes(celebrityId: string) {
    return await db.query.fanStakes.findMany({
      where: eq(fanStakes.celebrityId, celebrityId),
      orderBy: [desc(fanStakes.stakedAt)],
    });
  }

  async getUserStakes(fanId: string) {
    return await db.query.fanStakes.findMany({
      where: eq(fanStakes.fanId, fanId),
      orderBy: [desc(fanStakes.stakedAt)],
    });
  }

  async createStake(stake: InsertFanStake) {
    const [created] = await db.insert(fanStakes).values(stake).returning();
    return created;
  }

  async updateStakeStatus(id: string, status: string) {
    await db.update(fanStakes)
      .set({ status, ...(status === "completed" ? { completedAt: new Date() } : {}) })
      .where(eq(fanStakes.id, id));
  }

  async getCelebrityBets(celebrityId: string) {
    return await db.query.fanBets.findMany({
      where: eq(fanBets.celebrityId, celebrityId),
      orderBy: [desc(fanBets.createdAt)],
    });
  }

  async getUserBets(fanId: string) {
    return await db.query.fanBets.findMany({
      where: eq(fanBets.fanId, fanId),
      orderBy: [desc(fanBets.createdAt)],
    });
  }

  async createBet(bet: InsertFanBet) {
    const [created] = await db.insert(fanBets).values(bet).returning();
    return created;
  }

  async updateBetStatus(id: string, status: string, payout?: string) {
    const updates: any = { status, resolvedAt: new Date() };
    if (payout) updates.actualPayout = payout;
    await db.update(fanBets).set(updates).where(eq(fanBets.id, id));
  }

  async getPredictionMarkets(celebrityId?: string) {
    if (celebrityId) {
      return await db.query.predictionMarkets.findMany({
        where: eq(predictionMarkets.celebrityId, celebrityId),
        orderBy: [desc(predictionMarkets.createdAt)],
      });
    }
    return await db.query.predictionMarkets.findMany({
      orderBy: [desc(predictionMarkets.createdAt)],
    });
  }

  async getPredictionMarket(id: string) {
    return await db.query.predictionMarkets.findFirst({
      where: eq(predictionMarkets.id, id),
    });
  }

  async createPredictionMarket(market: InsertPredictionMarket) {
    const [created] = await db.insert(predictionMarkets).values(market).returning();
    return created;
  }

  async updatePredictionMarket(id: string, updates: Partial<InsertPredictionMarket>) {
    const result = await db.update(predictionMarkets)
      .set(updates)
      .where(eq(predictionMarkets.id, id))
      .returning();
    return result.length > 0;
  }

  async getCelebrityContent(celebrityId: string) {
    return await db.query.celebrityContent.findMany({
      where: eq(celebrityContent.celebrityId, celebrityId),
      orderBy: [desc(celebrityContent.publishedAt)],
    });
  }

  async getCelebrityContentItem(id: string) {
    return await db.query.celebrityContent.findFirst({
      where: eq(celebrityContent.id, id),
    });
  }

  async createCelebrityContent(content: InsertCelebrityContent) {
    const [created] = await db.insert(celebrityContent).values(content).returning();
    return created;
  }

  async updateContentViews(id: string) {
    await db.update(celebrityContent)
      .set({ viewCount: sql`${celebrityContent.viewCount} + 1` })
      .where(eq(celebrityContent.id, id));
  }

  async updateContentLikes(id: string) {
    await db.update(celebrityContent)
      .set({ likeCount: sql`${celebrityContent.likeCount} + 1` })
      .where(eq(celebrityContent.id, id));
  }

  // Financial Services
  async createFinancialOrder(order: InsertFinancialOrder): Promise<FinancialOrder> {
    const [created] = await db.insert(financialOrders).values(order).returning();
    return created;
  }

  async getFinancialOrdersByUserId(userId: string): Promise<FinancialOrder[]> {
    return db.select().from(financialOrders)
      .where(eq(financialOrders.userId, userId))
      .orderBy(desc(financialOrders.createdAt));
  }

  async getFinancialOrder(id: string): Promise<FinancialOrder | undefined> {
    const [order] = await db.select().from(financialOrders).where(eq(financialOrders.id, id));
    return order || undefined;
  }

  async updateFinancialOrderStatus(id: string, status: string): Promise<void> {
    const updates: any = { status };
    if (status === "executed") updates.executedAt = new Date();
    await db.update(financialOrders).set(updates).where(eq(financialOrders.id, id));
  }

  async createFinancialHolding(holding: InsertFinancialHolding): Promise<FinancialHolding> {
    const [created] = await db.insert(financialHoldings).values(holding).returning();
    return created;
  }

  async getFinancialHoldingsByUserId(userId: string): Promise<FinancialHolding[]> {
    return db.select().from(financialHoldings)
      .where(eq(financialHoldings.userId, userId))
      .orderBy(desc(financialHoldings.updatedAt));
  }

  async getFinancialHoldingsByAssetType(userId: string, assetType: string): Promise<FinancialHolding[]> {
    return db.select().from(financialHoldings)
      .where(and(
        eq(financialHoldings.userId, userId),
        eq(financialHoldings.assetType, assetType as any)
      ));
  }

  async updateFinancialHolding(userId: string, assetType: string, symbol: string, updates: Partial<FinancialHolding>): Promise<void> {
    await db.update(financialHoldings)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(financialHoldings.userId, userId),
        eq(financialHoldings.assetType, assetType as any),
        eq(financialHoldings.symbol, symbol)
      ));
  }

  // Spectrum Investment Plans
  async getAllSpectrumPlans(): Promise<SpectrumPlan[]> {
    return db.select().from(spectrumPlans)
      .where(eq(spectrumPlans.isActive, true))
      .orderBy(asc(spectrumPlans.displayOrder));
  }

  async getSpectrumPlan(id: string): Promise<SpectrumPlan | undefined> {
    const [plan] = await db.select().from(spectrumPlans).where(eq(spectrumPlans.id, id));
    return plan || undefined;
  }

  async getSpectrumPlanByTier(tier: string): Promise<SpectrumPlan | undefined> {
    const [plan] = await db.select().from(spectrumPlans).where(eq(spectrumPlans.tier, tier as any));
    return plan || undefined;
  }

  async createSpectrumPlan(plan: InsertSpectrumPlan): Promise<SpectrumPlan> {
    const [created] = await db.insert(spectrumPlans).values(plan).returning();
    return created;
  }

  async updateSpectrumPlan(id: string, updates: Partial<InsertSpectrumPlan>): Promise<void> {
    await db.update(spectrumPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(spectrumPlans.id, id));
  }

  async getUserSpectrumSubscription(userId: string): Promise<UserSpectrumSubscription | undefined> {
    const [subscription] = await db.select().from(userSpectrumSubscriptions)
      .where(and(
        eq(userSpectrumSubscriptions.userId, userId),
        eq(userSpectrumSubscriptions.status, "active" as any)
      ))
      .orderBy(desc(userSpectrumSubscriptions.subscribedAt));
    return subscription || undefined;
  }

  async getUserSpectrumSubscriptionById(id: string): Promise<UserSpectrumSubscription | undefined> {
    const [subscription] = await db.select().from(userSpectrumSubscriptions)
      .where(eq(userSpectrumSubscriptions.id, id));
    return subscription || undefined;
  }

  async createSpectrumSubscription(subscription: InsertUserSpectrumSubscription): Promise<UserSpectrumSubscription> {
    const [created] = await db.insert(userSpectrumSubscriptions).values(subscription).returning();
    return created;
  }

  async updateSpectrumSubscription(id: string, updates: Partial<InsertUserSpectrumSubscription>): Promise<void> {
    await db.update(userSpectrumSubscriptions)
      .set(updates)
      .where(eq(userSpectrumSubscriptions.id, id));
  }

  async cancelSpectrumSubscription(id: string): Promise<void> {
    await db.update(userSpectrumSubscriptions)
      .set({ 
        status: "cancelled" as any,
        cancelledAt: new Date()
      })
      .where(eq(userSpectrumSubscriptions.id, id));
  }

  async getSpectrumEarnings(userId: string): Promise<SpectrumEarning[]> {
    return db.select().from(spectrumEarnings)
      .where(eq(spectrumEarnings.userId, userId))
      .orderBy(desc(spectrumEarnings.distributedAt));
  }

  async getSpectrumEarningsBySubscription(subscriptionId: string): Promise<SpectrumEarning[]> {
    return db.select().from(spectrumEarnings)
      .where(eq(spectrumEarnings.subscriptionId, subscriptionId))
      .orderBy(desc(spectrumEarnings.distributedAt));
  }

  async createSpectrumEarning(earning: InsertSpectrumEarning): Promise<SpectrumEarning> {
    const [created] = await db.insert(spectrumEarnings).values(earning).returning();
    return created;
  }

  async getAllActiveSpectrumSubscriptions(): Promise<UserSpectrumSubscription[]> {
    return db.select().from(userSpectrumSubscriptions)
      .where(eq(userSpectrumSubscriptions.status, "active" as any))
      .orderBy(asc(userSpectrumSubscriptions.subscribedAt));
  }

  // Individual Assets & Ethereal Elements
  async getAllEtherealElements(): Promise<EtherealElement[]> {
    return db.select().from(etherealElements).orderBy(desc(etherealElements.createdAt));
  }

  async getEtherealElement(id: string): Promise<EtherealElement | undefined> {
    const [element] = await db.select().from(etherealElements).where(eq(etherealElements.id, id));
    return element || undefined;
  }

  async createEtherealElement(element: InsertEtherealElement): Promise<EtherealElement> {
    const [created] = await db.insert(etherealElements).values(element).returning();
    return created;
  }

  async updateEtherealElementMintCount(id: string, mintedCount: number): Promise<void> {
    await db.update(etherealElements)
      .set({ mintedCount })
      .where(eq(etherealElements.id, id));
  }

  async getEtherealOwnership(userId: string, elementId: string): Promise<EtherealOwnership | undefined> {
    const [ownership] = await db.select().from(etherealOwnership)
      .where(and(
        eq(etherealOwnership.userId, userId),
        eq(etherealOwnership.elementId, elementId)
      ));
    return ownership || undefined;
  }

  async getUserEtherealOwnerships(userId: string): Promise<any[]> {
    return db.select({
      ownership: etherealOwnership,
      element: etherealElements,
    })
    .from(etherealOwnership)
    .leftJoin(etherealElements, eq(etherealOwnership.elementId, etherealElements.id))
    .where(eq(etherealOwnership.userId, userId))
    .orderBy(desc(etherealOwnership.acquiredAt));
  }

  async createEtherealOwnership(ownership: InsertEtherealOwnership): Promise<EtherealOwnership> {
    const [created] = await db.insert(etherealOwnership).values(ownership).returning();
    return created;
  }

  async updateEtherealOwnershipQuantity(userId: string, elementId: string, quantity: number): Promise<void> {
    await db.update(etherealOwnership)
      .set({ quantity })
      .where(and(
        eq(etherealOwnership.userId, userId),
        eq(etherealOwnership.elementId, elementId)
      ));
  }

  async getIndividualAsset(id: string): Promise<IndividualAsset | undefined> {
    const [asset] = await db.select().from(individualAssets).where(eq(individualAssets.id, id));
    return asset || undefined;
  }

  async getUserIndividualAssets(userId: string): Promise<IndividualAsset[]> {
    return db.select().from(individualAssets)
      .where(eq(individualAssets.userId, userId))
      .orderBy(desc(individualAssets.createdAt));
  }

  async getUserAssetsByType(userId: string, assetType: string): Promise<IndividualAsset[]> {
    return db.select().from(individualAssets)
      .where(and(
        eq(individualAssets.userId, userId),
        eq(individualAssets.assetType, assetType as any)
      ))
      .orderBy(desc(individualAssets.createdAt));
  }

  async createIndividualAsset(asset: InsertIndividualAsset): Promise<IndividualAsset> {
    const [created] = await db.insert(individualAssets).values(asset).returning();
    return created;
  }

  async updateIndividualAssetValue(id: string, marketValue: string): Promise<void> {
    await db.update(individualAssets)
      .set({ marketValue, updatedAt: new Date() })
      .where(eq(individualAssets.id, id));
  }

  // Prayer Integration System
  async createPrayer(prayer: InsertPrayer): Promise<Prayer> {
    const [created] = await db.insert(prayers).values(prayer).returning();
    return created;
  }

  async getUserPrayers(userId: string, limit?: number): Promise<Prayer[]> {
    const query = db.select().from(prayers)
      .where(eq(prayers.userId, userId))
      .orderBy(desc(prayers.createdAt));
    
    if (limit) {
      return query.limit(limit);
    }
    return query;
  }

  async getPrayer(id: string): Promise<Prayer | undefined> {
    const [prayer] = await db.select().from(prayers).where(eq(prayers.id, id));
    return prayer || undefined;
  }

  async createScripture(scripture: InsertScripture): Promise<Scripture> {
    const [created] = await db.insert(scriptures).values(scripture).returning();
    return created;
  }

  async getAllScriptures(): Promise<Scripture[]> {
    return db.select().from(scriptures).orderBy(desc(scriptures.createdAt));
  }

  async getScripturesByCategory(category?: string): Promise<Scripture[]> {
    if (!category) {
      return this.getAllScriptures();
    }
    return db.select().from(scriptures)
      .where(eq(scriptures.category, category as any))
      .orderBy(desc(scriptures.createdAt));
  }

  async getScripturesCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(scriptures);
    return result[0]?.count || 0;
  }

  async createPrayerTradeCorrelation(correlation: InsertPrayerTradeCorrelation): Promise<PrayerTradeCorrelation> {
    const [created] = await db.insert(prayerTradeCorrelations).values(correlation).returning();
    return created;
  }

  async getUserPrayerCorrelations(userId: string): Promise<PrayerTradeCorrelation[]> {
    return db.select({
      correlation: prayerTradeCorrelations,
    })
    .from(prayerTradeCorrelations)
    .innerJoin(prayers, eq(prayerTradeCorrelations.prayerId, prayers.id))
    .where(eq(prayers.userId, userId))
    .orderBy(desc(prayerTradeCorrelations.createdAt))
    .then(results => results.map(r => r.correlation));
  }

  async getPrayerCorrelation(id: string): Promise<PrayerTradeCorrelation | undefined> {
    const [correlation] = await db.select().from(prayerTradeCorrelations)
      .where(eq(prayerTradeCorrelations.id, id));
    return correlation || undefined;
  }

  async getUserPrayerSettings(userId: string): Promise<UserPrayerSettings | undefined> {
    const [settings] = await db.select().from(userPrayerSettings)
      .where(eq(userPrayerSettings.userId, userId));
    return settings || undefined;
  }

  async upsertUserPrayerSettings(settings: InsertUserPrayerSettings): Promise<UserPrayerSettings> {
    const [result] = await db.insert(userPrayerSettings)
      .values(settings)
      .onConflictDoUpdate({
        target: userPrayerSettings.userId,
        set: { ...settings, updatedAt: new Date() },
      })
      .returning();
    return result;
  }

  async updateUserPrayerSettings(userId: string, updates: Partial<InsertUserPrayerSettings>): Promise<void> {
    await db.update(userPrayerSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userPrayerSettings.userId, userId));
  }

  // Auto-Tithing System
  async getAllCharities(): Promise<Charity[]> {
    return db.select().from(charities).orderBy(asc(charities.name));
  }

  async getActiveCharities(): Promise<Charity[]> {
    return db.select().from(charities)
      .where(eq(charities.isActive, true))
      .orderBy(asc(charities.name));
  }

  async getCharity(id: string): Promise<Charity | undefined> {
    const [charity] = await db.select().from(charities).where(eq(charities.id, id));
    return charity || undefined;
  }

  async createCharity(charity: InsertCharity): Promise<Charity> {
    const [created] = await db.insert(charities).values(charity).returning();
    return created;
  }

  async updateCharity(id: string, updates: Partial<InsertCharity>): Promise<void> {
    await db.update(charities)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(charities.id, id));
  }

  async updateCharityTotals(id: string, amount: string): Promise<void> {
    const charity = await this.getCharity(id);
    if (!charity) return;
    
    const newTotal = (parseFloat(charity.totalReceived || "0") + parseFloat(amount)).toString();
    const newDonorCount = (charity.donorCount || 0) + 1;
    
    await db.update(charities)
      .set({ 
        totalReceived: newTotal, 
        donorCount: newDonorCount,
        updatedAt: new Date() 
      })
      .where(eq(charities.id, id));
  }

  async getTithingConfigByUserId(userId: string): Promise<TithingConfig | undefined> {
    const [config] = await db.select().from(tithingConfigs)
      .where(eq(tithingConfigs.userId, userId));
    return config || undefined;
  }

  async createTithingConfig(config: InsertTithingConfig): Promise<TithingConfig> {
    const [created] = await db.insert(tithingConfigs).values(config).returning();
    return created;
  }

  async updateTithingConfig(id: string, updates: Partial<InsertTithingConfig>): Promise<void> {
    await db.update(tithingConfigs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tithingConfigs.id, id));
  }

  async getTithingHistory(
    userId: string, 
    filters?: { startDate?: Date; endDate?: Date; status?: string }
  ): Promise<TithingHistory[]> {
    let query = db.select().from(tithingHistory)
      .where(eq(tithingHistory.userId, userId));

    if (filters?.startDate || filters?.endDate || filters?.status) {
      const conditions = [eq(tithingHistory.userId, userId)];
      
      if (filters.startDate) {
        conditions.push(sql`${tithingHistory.createdAt} >= ${filters.startDate}`);
      }
      if (filters.endDate) {
        conditions.push(sql`${tithingHistory.createdAt} <= ${filters.endDate}`);
      }
      if (filters.status) {
        conditions.push(eq(tithingHistory.status, filters.status as any));
      }

      return db.select().from(tithingHistory)
        .where(and(...conditions))
        .orderBy(desc(tithingHistory.createdAt));
    }

    return db.select().from(tithingHistory)
      .where(eq(tithingHistory.userId, userId))
      .orderBy(desc(tithingHistory.createdAt));
  }

  async getTithingHistoryItem(id: string): Promise<TithingHistory | undefined> {
    const [item] = await db.select().from(tithingHistory).where(eq(tithingHistory.id, id));
    return item || undefined;
  }

  async createTithingHistory(history: InsertTithingHistory): Promise<TithingHistory> {
    const [created] = await db.insert(tithingHistory).values(history).returning();
    return created;
  }

  async updateTithingHistory(id: string, updates: Partial<InsertTithingHistory>): Promise<TithingHistory> {
    const [updated] = await db.update(tithingHistory)
      .set(updates)
      .where(eq(tithingHistory.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
