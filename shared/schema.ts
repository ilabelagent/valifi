import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, decimal, pgEnum, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for status tracking
export const kycStatusEnum = pgEnum("kyc_status", ["pending", "in_review", "approved", "rejected"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "confirmed", "failed"]);
export const botStatusEnum = pgEnum("bot_status", ["active", "idle", "error", "maintenance"]);
export const agentTypeEnum = pgEnum("agent_type", [
  "orchestrator", 
  "blockchain", 
  "payment", 
  "kyc", 
  "security", 
  "publishing", 
  "quantum", 
  "analytics",
  "monitoring",
  "guardian_angel"
]);
export const threatLevelEnum = pgEnum("threat_level", ["none", "low", "medium", "high", "critical"]);
export const networkEnum = pgEnum("network", ["ethereum", "polygon", "bsc", "arbitrum", "optimism"]);
export const cryptoProcessorEnum = pgEnum("crypto_processor", ["bitpay", "binance_pay", "bybit", "kucoin", "luno"]);
export const tradingStrategyEnum = pgEnum("trading_strategy", ["grid", "dca", "arbitrage", "scalping", "market_making", "momentum_ai", "mev"]);
export const botExecutionStatusEnum = pgEnum("bot_execution_status", ["pending", "running", "completed", "failed", "cancelled"]);

// Session storage table - REQUIRED for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - Compatible with Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  kycStatus: kycStatusEnum("kyc_status").default("pending"),
  kycUserId: text("kyc_user_id"), // Sumsub user ID
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blockchain wallets
export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  address: text("address").notNull().unique(),
  network: networkEnum("network").notNull(),
  privateKeyEncrypted: text("private_key_encrypted").notNull(), // Encrypted with master key
  isMain: boolean("is_main").default(false),
  balance: decimal("balance", { precision: 36, scale: 18 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blockchain transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").references(() => wallets.id).notNull(),
  txHash: text("tx_hash").unique(),
  network: networkEnum("network").notNull(),
  type: text("type").notNull(), // transfer, nft_mint, token_deploy, etc.
  from: text("from").notNull(),
  to: text("to").notNull(),
  value: decimal("value", { precision: 36, scale: 18 }),
  gasUsed: text("gas_used"),
  status: transactionStatusEnum("status").default("pending"),
  metadata: jsonb("metadata"), // Additional tx data
  createdAt: timestamp("created_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

// NFT collections and tokens
export const nfts = pgTable("nfts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").references(() => wallets.id).notNull(),
  contractAddress: text("contract_address").notNull(),
  tokenId: text("token_id").notNull(),
  network: networkEnum("network").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  metadataUrl: text("metadata_url"), // IPFS URL
  attributes: jsonb("attributes"),
  mintTxHash: text("mint_tx_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ERC-20 tokens
export const tokens = pgTable("tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").references(() => wallets.id).notNull(),
  contractAddress: text("contract_address").notNull().unique(),
  network: networkEnum("network").notNull(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  decimals: integer("decimals").default(18),
  totalSupply: decimal("total_supply", { precision: 36, scale: 18 }),
  deployTxHash: text("deploy_tx_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Jesus Cartel songs (publishing pipeline)
export const songs = pgTable("songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  albumArt: text("album_art"), // IPFS hash
  audioFile: text("audio_file"), // IPFS hash
  nftId: varchar("nft_id").references(() => nfts.id),
  tokenId: varchar("token_id").references(() => tokens.id),
  metadata: jsonb("metadata"),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Multi-agent system
export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: agentTypeEnum("type").notNull(),
  status: botStatusEnum("status").default("idle"),
  config: jsonb("config"), // Agent-specific configuration
  capabilities: jsonb("capabilities").array(), // What this agent can do
  currentTask: text("current_task"),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("0"),
  totalOperations: integer("total_operations").default(0),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Agent communications and task logs
export const agentLogs = pgTable("agent_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").references(() => agents.id).notNull(),
  action: text("action").notNull(),
  status: text("status").notNull(), // success, failed, pending
  input: jsonb("input"),
  output: jsonb("output"),
  errorMessage: text("error_message"),
  duration: integer("duration"), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Security system (Guardian Angel)
export const securityEvents = pgTable("security_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  agentId: varchar("agent_id").references(() => agents.id),
  eventType: text("event_type").notNull(), // suspicious_login, threat_detected, etc.
  threatLevel: threatLevelEnum("threat_level").notNull(),
  description: text("description").notNull(),
  ipAddress: text("ip_address"),
  metadata: jsonb("metadata"),
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment transactions (Stripe)
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  stripePaymentId: text("stripe_payment_id").unique(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("usd"),
  status: text("status").notNull(), // succeeded, pending, failed
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// KYC verification records
export const kycRecords = pgTable("kyc_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sumsubApplicantId: text("sumsub_applicant_id").unique(),
  verificationStatus: kycStatusEnum("verification_status").default("pending"),
  documentType: text("document_type"),
  reviewResult: jsonb("review_result"),
  rejectionReason: text("rejection_reason"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

// Quantum computing jobs
export const quantumJobs = pgTable("quantum_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  algorithm: text("algorithm").notNull(),
  parameters: jsonb("parameters"),
  qubitsUsed: integer("qubits_used"),
  status: text("status").default("queued"), // queued, running, completed, failed
  result: jsonb("result"),
  ibmJobId: text("ibm_job_id"),
  executionTime: integer("execution_time"), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Crypto payment processors
export const cryptoPayments = pgTable("crypto_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  processor: cryptoProcessorEnum("processor").notNull(),
  processorInvoiceId: text("processor_invoice_id").unique(), // BitPay invoice ID, Binance order ID, etc.
  amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
  currency: text("currency").notNull(), // BTC, ETH, USDT, etc.
  fiatAmount: decimal("fiat_amount", { precision: 12, scale: 2 }),
  fiatCurrency: text("fiat_currency").default("usd"),
  status: text("status").notNull(), // new, paid, confirmed, completed, expired, failed
  paymentUrl: text("payment_url"), // Customer payment URL
  qrCode: text("qr_code"), // Payment QR code URL
  txHash: text("tx_hash"), // Blockchain transaction hash
  expiresAt: timestamp("expires_at"),
  confirmedAt: timestamp("confirmed_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Trading bot configurations
export const tradingBots = pgTable("trading_bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  strategy: tradingStrategyEnum("strategy").notNull(),
  exchange: text("exchange").notNull(), // binance, bybit, kucoin, etc.
  tradingPair: text("trading_pair").notNull(), // BTC/USDT, ETH/BTC, etc.
  isActive: boolean("is_active").default(false),
  config: jsonb("config").notNull(), // Strategy-specific parameters
  riskLimit: decimal("risk_limit", { precision: 12, scale: 2 }), // Max risk per trade
  dailyLimit: decimal("daily_limit", { precision: 12, scale: 2 }), // Max daily loss limit
  totalProfit: decimal("total_profit", { precision: 36, scale: 18 }).default("0"),
  totalLoss: decimal("total_loss", { precision: 36, scale: 18 }).default("0"),
  totalTrades: integer("total_trades").default(0),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).default("0"),
  lastExecutionAt: timestamp("last_execution_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trading bot executions (individual trades)
export const botExecutions = pgTable("bot_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").references(() => tradingBots.id).notNull(),
  strategy: tradingStrategyEnum("strategy").notNull(),
  status: botExecutionStatusEnum("status").default("pending"),
  entryPrice: decimal("entry_price", { precision: 36, scale: 18 }),
  exitPrice: decimal("exit_price", { precision: 36, scale: 18 }),
  amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
  profit: decimal("profit", { precision: 36, scale: 18 }),
  fees: decimal("fees", { precision: 36, scale: 18 }),
  slippage: decimal("slippage", { precision: 10, scale: 6 }), // Percentage
  orderId: text("order_id"), // Exchange order ID
  txHash: text("tx_hash"), // For DEX trades
  reason: text("reason"), // Entry/exit reason
  metadata: jsonb("metadata"), // Indicators, signals, etc.
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Armor Wallet integrations
export const armorWallets = pgTable("armor_wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  walletType: text("wallet_type").notNull(), // standard, trading
  address: text("address").notNull().unique(),
  chains: jsonb("chains").notNull(), // Array of supported chains
  dailyLimit: decimal("daily_limit", { precision: 36, scale: 18 }),
  requiresTwoFa: boolean("requires_two_fa").default(false),
  armorApiKey: text("armor_api_key"), // Encrypted
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// MEV and mempool monitoring
export const mevEvents = pgTable("mev_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  eventType: text("event_type").notNull(), // sandwich, frontrun, backrun, arbitrage
  network: networkEnum("network").notNull(),
  txHash: text("tx_hash"),
  targetTxHash: text("target_tx_hash"), // The transaction being MEV'd
  profitAmount: decimal("profit_amount", { precision: 36, scale: 18 }),
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }), // 0-100
  isProtected: boolean("is_protected").default(false),
  protectionMethod: text("protection_method"), // private_relayer, etc.
  metadata: jsonb("metadata"),
  detectedAt: timestamp("detected_at").defaultNow(),
});

// Exchange platform for coin procurement
export const orderTypeEnum = pgEnum("order_type", ["market", "limit", "stop_loss", "stop_limit"]);
export const orderSideEnum = pgEnum("order_side", ["buy", "sell"]);
export const orderStatusEnum = pgEnum("order_status", ["open", "partially_filled", "filled", "cancelled", "expired"]);

export const exchangeOrders = pgTable("exchange_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  orderType: orderTypeEnum("order_type").notNull(),
  orderSide: orderSideEnum("order_side").notNull(),
  tradingPair: text("trading_pair").notNull(), // BTC/USDT, ETH/USDT
  price: decimal("price", { precision: 36, scale: 18 }),
  amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
  filled: decimal("filled", { precision: 36, scale: 18 }).default("0"),
  status: orderStatusEnum("status").default("open"),
  total: decimal("total", { precision: 36, scale: 18 }),
  fees: decimal("fees", { precision: 36, scale: 18 }),
  network: networkEnum("network").notNull(),
  externalOrderId: text("external_order_id"), // Exchange order ID
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const liquidityPools = pgTable("liquidity_pools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  poolName: text("pool_name").notNull(),
  tokenA: text("token_a").notNull(), // Token symbol
  tokenB: text("token_b").notNull(),
  reserveA: decimal("reserve_a", { precision: 36, scale: 18 }).default("0"),
  reserveB: decimal("reserve_b", { precision: 36, scale: 18 }).default("0"),
  lpTokens: decimal("lp_tokens", { precision: 36, scale: 18 }).default("0"),
  apy: decimal("apy", { precision: 10, scale: 4 }), // Annual percentage yield
  network: networkEnum("network").notNull(),
  contractAddress: text("contract_address").notNull(),
  totalValueLocked: decimal("total_value_locked", { precision: 36, scale: 18 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coin mixing service for privacy
export const mixingStatusEnum = pgEnum("mixing_status", ["pending", "mixing", "completed", "failed"]);

export const mixingRequests = pgTable("mixing_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  inputAddress: text("input_address").notNull(),
  outputAddress: text("output_address").notNull(),
  amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
  currency: text("currency").notNull(), // BTC, ETH, etc.
  mixingFee: decimal("mixing_fee", { precision: 36, scale: 18 }),
  delayMinutes: integer("delay_minutes").default(30), // Mixing delay for privacy
  status: mixingStatusEnum("status").default("pending"),
  inputTxHash: text("input_tx_hash"),
  outputTxHash: text("output_tx_hash"),
  mixingRounds: integer("mixing_rounds").default(3), // Number of mixing iterations
  privacyScore: decimal("privacy_score", { precision: 5, scale: 2 }), // 0-100
  network: networkEnum("network").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// VIP Community and Forum
export const forumCategories = pgTable("forum_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"), // Lucide icon name
  order: integer("order").default(0),
  isVipOnly: boolean("is_vip_only").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forumThreads = pgTable("forum_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => forumCategories.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  viewCount: integer("view_count").default(0),
  replyCount: integer("reply_count").default(0),
  lastReplyAt: timestamp("last_reply_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forumReplies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").references(() => forumThreads.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Chat Automator
export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  agentType: text("agent_type"), // Which AI agent is handling this
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  lastMessageAt: timestamp("last_message_at"),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => chatSessions.id).notNull(),
  role: text("role").notNull(), // user, assistant, system
  content: text("content").notNull(),
  agentName: text("agent_name"), // Which specific agent responded
  metadata: jsonb("metadata"), // Citations, tool calls, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Metals and Gold Trading
export const metalTypeEnum = pgEnum("metal_type", ["gold", "silver", "platinum", "palladium", "copper"]);
export const metalTradeStatusEnum = pgEnum("metal_trade_status", ["pending", "confirmed", "shipped", "delivered", "cancelled"]);

export const metalInventory = pgTable("metal_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metalType: metalTypeEnum("metal_type").notNull(),
  weight: decimal("weight", { precision: 12, scale: 4 }).notNull(), // Troy ounces
  purity: decimal("purity", { precision: 5, scale: 2 }).default("99.99"), // Percentage
  pricePerOunce: decimal("price_per_ounce", { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }),
  supplier: text("supplier"),
  vaultLocation: text("vault_location"),
  certificateUrl: text("certificate_url"), // Authenticity certificate
  isAvailable: boolean("is_available").default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const metalTrades = pgTable("metal_trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  inventoryId: varchar("inventory_id").references(() => metalInventory.id).notNull(),
  tradeType: text("trade_type").notNull(), // buy, sell
  weight: decimal("weight", { precision: 12, scale: 4 }).notNull(),
  pricePerOunce: decimal("price_per_ounce", { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
  status: metalTradeStatusEnum("status").default("pending"),
  paymentMethod: text("payment_method"), // crypto, fiat
  deliveryAddress: text("delivery_address"),
  trackingNumber: text("tracking_number"),
  createdAt: timestamp("created_at").defaultNow(),
  deliveredAt: timestamp("delivered_at"),
});

// Blog and News Section
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  category: text("category"), // exchange_update, platform_news, market_analysis, etc.
  tags: jsonb("tags").array(),
  isPublished: boolean("is_published").default(false),
  viewCount: integer("view_count").default(0),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  songs: many(songs),
  payments: many(payments),
  kycRecords: many(kycRecords),
  quantumJobs: many(quantumJobs),
  securityEvents: many(securityEvents),
  cryptoPayments: many(cryptoPayments),
  tradingBots: many(tradingBots),
  armorWallets: many(armorWallets),
  mevEvents: many(mevEvents),
  exchangeOrders: many(exchangeOrders),
  liquidityPools: many(liquidityPools),
  mixingRequests: many(mixingRequests),
  forumThreads: many(forumThreads),
  forumReplies: many(forumReplies),
  chatSessions: many(chatSessions),
  metalTrades: many(metalTrades),
  blogPosts: many(blogPosts),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  nfts: many(nfts),
  tokens: many(tokens),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
}));

export const nftsRelations = relations(nfts, ({ one }) => ({
  wallet: one(wallets, {
    fields: [nfts.walletId],
    references: [wallets.id],
  }),
}));

export const tokensRelations = relations(tokens, ({ one }) => ({
  wallet: one(wallets, {
    fields: [tokens.walletId],
    references: [wallets.id],
  }),
}));

export const songsRelations = relations(songs, ({ one }) => ({
  user: one(users, {
    fields: [songs.userId],
    references: [users.id],
  }),
  nft: one(nfts, {
    fields: [songs.nftId],
    references: [nfts.id],
  }),
  token: one(tokens, {
    fields: [songs.tokenId],
    references: [tokens.id],
  }),
}));

export const agentsRelations = relations(agents, ({ many }) => ({
  logs: many(agentLogs),
  securityEvents: many(securityEvents),
}));

export const agentLogsRelations = relations(agentLogs, ({ one }) => ({
  agent: one(agents, {
    fields: [agentLogs.agentId],
    references: [agents.id],
  }),
}));

export const securityEventsRelations = relations(securityEvents, ({ one }) => ({
  user: one(users, {
    fields: [securityEvents.userId],
    references: [users.id],
  }),
  agent: one(agents, {
    fields: [securityEvents.agentId],
    references: [agents.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const kycRecordsRelations = relations(kycRecords, ({ one }) => ({
  user: one(users, {
    fields: [kycRecords.userId],
    references: [users.id],
  }),
}));

export const quantumJobsRelations = relations(quantumJobs, ({ one }) => ({
  user: one(users, {
    fields: [quantumJobs.userId],
    references: [users.id],
  }),
}));

export const cryptoPaymentsRelations = relations(cryptoPayments, ({ one }) => ({
  user: one(users, {
    fields: [cryptoPayments.userId],
    references: [users.id],
  }),
}));

export const tradingBotsRelations = relations(tradingBots, ({ one, many }) => ({
  user: one(users, {
    fields: [tradingBots.userId],
    references: [users.id],
  }),
  executions: many(botExecutions),
}));

export const botExecutionsRelations = relations(botExecutions, ({ one }) => ({
  bot: one(tradingBots, {
    fields: [botExecutions.botId],
    references: [tradingBots.id],
  }),
}));

export const armorWalletsRelations = relations(armorWallets, ({ one }) => ({
  user: one(users, {
    fields: [armorWallets.userId],
    references: [users.id],
  }),
}));

export const mevEventsRelations = relations(mevEvents, ({ one }) => ({
  user: one(users, {
    fields: [mevEvents.userId],
    references: [users.id],
  }),
}));

export const exchangeOrdersRelations = relations(exchangeOrders, ({ one }) => ({
  user: one(users, {
    fields: [exchangeOrders.userId],
    references: [users.id],
  }),
}));

export const liquidityPoolsRelations = relations(liquidityPools, ({ one }) => ({
  user: one(users, {
    fields: [liquidityPools.userId],
    references: [users.id],
  }),
}));

export const mixingRequestsRelations = relations(mixingRequests, ({ one }) => ({
  user: one(users, {
    fields: [mixingRequests.userId],
    references: [users.id],
  }),
}));

export const forumThreadsRelations = relations(forumThreads, ({ one, many }) => ({
  user: one(users, {
    fields: [forumThreads.userId],
    references: [users.id],
  }),
  category: one(forumCategories, {
    fields: [forumThreads.categoryId],
    references: [forumCategories.id],
  }),
  replies: many(forumReplies),
}));

export const forumRepliesRelations = relations(forumReplies, ({ one }) => ({
  user: one(users, {
    fields: [forumReplies.userId],
    references: [users.id],
  }),
  thread: one(forumThreads, {
    fields: [forumReplies.threadId],
    references: [forumThreads.id],
  }),
}));

export const forumCategoriesRelations = relations(forumCategories, ({ many }) => ({
  threads: many(forumThreads),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export const metalTradesRelations = relations(metalTrades, ({ one }) => ({
  user: one(users, {
    fields: [metalTrades.userId],
    references: [users.id],
  }),
  inventory: one(metalInventory, {
    fields: [metalTrades.inventoryId],
    references: [metalInventory.id],
  }),
}));

export const metalInventoryRelations = relations(metalInventory, ({ many }) => ({
  trades: many(metalTrades),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));

// Insert schemas for forms
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  confirmedAt: true,
});

export const insertNftSchema = createInsertSchema(nfts).omit({
  id: true,
  createdAt: true,
});

export const insertTokenSchema = createInsertSchema(tokens).omit({
  id: true,
  createdAt: true,
});

export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
  nftId: true,
  tokenId: true,
  isPublished: true,
  publishedAt: true,
  createdAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
});

export const insertSecurityEventSchema = createInsertSchema(securityEvents).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertKycRecordSchema = createInsertSchema(kycRecords).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
});

export const insertQuantumJobSchema = createInsertSchema(quantumJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertCryptoPaymentSchema = createInsertSchema(cryptoPayments).omit({
  id: true,
  createdAt: true,
  confirmedAt: true,
});

export const insertTradingBotSchema = createInsertSchema(tradingBots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastExecutionAt: true,
  totalProfit: true,
  totalLoss: true,
  totalTrades: true,
  winRate: true,
});

export const insertBotExecutionSchema = createInsertSchema(botExecutions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertArmorWalletSchema = createInsertSchema(armorWallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMevEventSchema = createInsertSchema(mevEvents).omit({
  id: true,
  detectedAt: true,
});

export const insertExchangeOrderSchema = createInsertSchema(exchangeOrders).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertLiquidityPoolSchema = createInsertSchema(liquidityPools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMixingRequestSchema = createInsertSchema(mixingRequests).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertForumCategorySchema = createInsertSchema(forumCategories).omit({
  id: true,
  createdAt: true,
});

export const insertForumThreadSchema = createInsertSchema(forumThreads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastReplyAt: true,
  viewCount: true,
  replyCount: true,
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertMetalInventorySchema = createInsertSchema(metalInventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMetalTradeSchema = createInsertSchema(metalTrades).omit({
  id: true,
  createdAt: true,
  deliveredAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  viewCount: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert; // For Replit Auth

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertNft = z.infer<typeof insertNftSchema>;
export type Nft = typeof nfts.$inferSelect;

export type InsertToken = z.infer<typeof insertTokenSchema>;
export type Token = typeof tokens.$inferSelect;

export type InsertSong = z.infer<typeof insertSongSchema>;
export type Song = typeof songs.$inferSelect;

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export type InsertAgentLog = typeof agentLogs.$inferInsert;
export type AgentLog = typeof agentLogs.$inferSelect;

export type InsertSecurityEvent = z.infer<typeof insertSecurityEventSchema>;
export type SecurityEvent = typeof securityEvents.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertKycRecord = z.infer<typeof insertKycRecordSchema>;
export type KycRecord = typeof kycRecords.$inferSelect;

export type InsertQuantumJob = z.infer<typeof insertQuantumJobSchema>;
export type QuantumJob = typeof quantumJobs.$inferSelect;

export type InsertCryptoPayment = z.infer<typeof insertCryptoPaymentSchema>;
export type CryptoPayment = typeof cryptoPayments.$inferSelect;

export type InsertTradingBot = z.infer<typeof insertTradingBotSchema>;
export type TradingBot = typeof tradingBots.$inferSelect;

export type InsertBotExecution = z.infer<typeof insertBotExecutionSchema>;
export type BotExecution = typeof botExecutions.$inferSelect;

export type InsertArmorWallet = z.infer<typeof insertArmorWalletSchema>;
export type ArmorWallet = typeof armorWallets.$inferSelect;

export type InsertMevEvent = z.infer<typeof insertMevEventSchema>;
export type MevEvent = typeof mevEvents.$inferSelect;
