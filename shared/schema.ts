import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, decimal, pgEnum, index, unique } from "drizzle-orm/pg-core";
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

// P2P Trading System
export const p2pOfferTypeEnum = pgEnum("p2p_offer_type", ["buy", "sell"]);
export const p2pOfferStatusEnum = pgEnum("p2p_offer_status", ["active", "paused", "completed", "cancelled"]);
export const p2pOrderStatusEnum = pgEnum("p2p_order_status", ["created", "escrowed", "paid", "released", "disputed", "cancelled", "completed"]);
export const p2pDisputeStatusEnum = pgEnum("p2p_dispute_status", ["open", "reviewing", "resolved", "escalated"]);

export const p2pOffers = pgTable("p2p_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: p2pOfferTypeEnum("type").notNull(),
  cryptocurrency: text("cryptocurrency").notNull(), // BTC, ETH, USDT, etc.
  amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
  fiatCurrency: text("fiat_currency").notNull(), // USD, EUR, etc.
  pricePerUnit: decimal("price_per_unit", { precision: 12, scale: 2 }).notNull(),
  paymentMethods: text("payment_methods").array(), // bank_transfer, paypal, etc.
  minAmount: decimal("min_amount", { precision: 36, scale: 18 }),
  maxAmount: decimal("max_amount", { precision: 36, scale: 18 }),
  timeLimit: integer("time_limit").default(30), // minutes
  terms: text("terms"),
  status: p2pOfferStatusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const p2pOrders = pgTable("p2p_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id").references(() => p2pOffers.id).notNull(),
  buyerId: varchar("buyer_id").references(() => users.id).notNull(),
  sellerId: varchar("seller_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
  fiatAmount: decimal("fiat_amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: p2pOrderStatusEnum("status").default("created"),
  escrowTxHash: text("escrow_tx_hash"),
  releaseTxHash: text("release_tx_hash"),
  disputeReason: text("dispute_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  paidAt: timestamp("paid_at"),
  completedAt: timestamp("completed_at"),
});

export const p2pPaymentMethods = pgTable("p2p_payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // bank_transfer, paypal, venmo, cash_app, zelle, etc.
  details: jsonb("details"), // account number, email, etc.
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const p2pChatMessages = pgTable("p2p_chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => p2pOrders.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const p2pDisputes = pgTable("p2p_disputes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => p2pOrders.id).notNull(),
  raisedBy: varchar("raised_by").references(() => users.id).notNull(),
  reason: text("reason").notNull(),
  evidence: jsonb("evidence"),
  status: p2pDisputeStatusEnum("status").default("open"),
  resolution: text("resolution"),
  resolvedBy: varchar("resolved_by").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const p2pReviews = pgTable("p2p_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => p2pOrders.id).notNull(),
  reviewerId: varchar("reviewer_id").references(() => users.id).notNull(),
  reviewedUserId: varchar("reviewed_user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// WalletConnect Sessions
export const walletConnectSessionStatusEnum = pgEnum("wallet_connect_session_status", ["active", "expired", "disconnected"]);

export const walletConnectSessions = pgTable("wallet_connect_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  walletAddress: text("wallet_address").notNull(),
  walletType: text("wallet_type").notNull(), // metamask, trust, rainbow, coinbase, etc.
  chainId: integer("chain_id").notNull(),
  network: text("network").notNull(), // ethereum, polygon, bsc, etc.
  status: walletConnectSessionStatusEnum("status").default("active"),
  sessionData: jsonb("session_data"),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
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

// ============================================
// KINGDOM TRANSFORMATION - NEW FEATURES
// ============================================

// Dynamic Dashboard System
export const userDashboardConfigs = pgTable("user_dashboard_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  layout: jsonb("layout").notNull(), // Grid layout configuration
  theme: text("theme").default("dark"),
  preferences: jsonb("preferences"), // Widget visibility, sizes, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // stats, chart, quick-action, news-feed, etc.
  description: text("description"),
  icon: text("icon"),
  defaultConfig: jsonb("default_config"),
  isSystemWidget: boolean("is_system_widget").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userWidgetPreferences = pgTable("user_widget_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  widgetId: varchar("widget_id").references(() => dashboardWidgets.id).notNull(),
  position: jsonb("position").notNull(), // { x, y, w, h }
  config: jsonb("config"), // Widget-specific settings
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userWidgetUnique: unique().on(table.userId, table.widgetId),
}));

// Admin Panel Infrastructure
export const adminRoleEnum = pgEnum("admin_role", ["super_admin", "admin", "moderator", "support"]);

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  role: adminRoleEnum("role").notNull(),
  permissions: jsonb("permissions").array(), // Specific permissions
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").references(() => adminUsers.id).notNull(),
  action: text("action").notNull(), // user_banned, post_deleted, etc.
  targetType: text("target_type"), // user, post, transaction
  targetId: varchar("target_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminBroadcasts = pgTable("admin_broadcasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").references(() => adminUsers.id).notNull(),
  recipientType: text("recipient_type").notNull(), // all, specific_users, user_group
  recipientIds: jsonb("recipient_ids").array(), // If specific users
  message: text("message").notNull(),
  title: text("title"),
  priority: text("priority").default("normal"), // low, normal, high, urgent
  sentAt: timestamp("sent_at").defaultNow(),
});

// Individual Assets & Ethereal Elements
export const assetTypeEnum = pgEnum("asset_type", ["crypto", "stock", "bond", "real_estate", "ethereal", "precious_metal", "collectible"]);

export const individualAssets = pgTable("individual_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  assetType: assetTypeEnum("asset_type").notNull(),
  marketValue: decimal("market_value", { precision: 36, scale: 18 }).notNull(),
  purchasePrice: decimal("purchase_price", { precision: 36, scale: 18 }),
  quantity: decimal("quantity", { precision: 36, scale: 8 }).default("1"),
  metadata: jsonb("metadata"), // Asset-specific data
  imageUrl: text("image_url"),
  certificateUrl: text("certificate_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const etherealElements = pgTable("ethereal_elements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  elementType: text("element_type").notNull(), // spiritual, divine, quantum, dimensional
  power: integer("power").default(0), // Power level 0-1000
  rarity: text("rarity").notNull(), // common, rare, epic, legendary, divine
  attributes: jsonb("attributes"), // Special properties
  imageUrl: text("image_url"),
  animationUrl: text("animation_url"),
  totalSupply: integer("total_supply"),
  mintedCount: integer("minted_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const etherealOwnership = pgTable("ethereal_ownership", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  elementId: varchar("element_id").references(() => etherealElements.id).notNull(),
  quantity: integer("quantity").default(1),
  acquiredAt: timestamp("acquired_at").defaultNow(),
}, (table) => ({
  userElementUnique: unique().on(table.userId, table.elementId),
}));

// Bot Marketplace System
export const botListingStatusEnum = pgEnum("bot_listing_status", ["active", "paused", "sold_out", "inactive"]);

export const botMarketplaceListings = pgTable("bot_marketplace_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").references(() => users.id).notNull(),
  botId: varchar("bot_id").references(() => tradingBots.id), // Reference if selling existing bot
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // trading, research, automation, etc.
  price: decimal("price", { precision: 12, scale: 2 }),
  rentalPriceHourly: decimal("rental_price_hourly", { precision: 12, scale: 2 }),
  rentalPriceDaily: decimal("rental_price_daily", { precision: 12, scale: 2 }),
  subscriptionPriceMonthly: decimal("subscription_price_monthly", { precision: 12, scale: 2 }),
  performanceMetrics: jsonb("performance_metrics"), // Win rate, ROI, etc.
  features: jsonb("features").array(),
  images: jsonb("images").array(),
  status: botListingStatusEnum("status").default("active"),
  totalSales: integer("total_sales").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const botRentals = pgTable("bot_rentals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  renterId: varchar("renter_id").references(() => users.id).notNull(),
  listingId: varchar("listing_id").references(() => botMarketplaceListings.id).notNull(),
  rentalType: text("rental_type").notNull(), // hourly, daily, weekly
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  totalCost: decimal("total_cost", { precision: 12, scale: 2 }).notNull(),
  status: text("status").default("active"), // active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const botSubscriptions = pgTable("bot_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriberId: varchar("subscriber_id").references(() => users.id).notNull(),
  listingId: varchar("listing_id").references(() => botMarketplaceListings.id).notNull(),
  plan: text("plan").notNull(), // basic, pro, enterprise
  monthlyPrice: decimal("monthly_price", { precision: 12, scale: 2 }).notNull(),
  status: text("status").default("active"), // active, cancelled, paused
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const botReviews = pgTable("bot_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewerId: varchar("reviewer_id").references(() => users.id).notNull(),
  listingId: varchar("listing_id").references(() => botMarketplaceListings.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  title: text("title"),
  content: text("content").notNull(),
  performanceRating: integer("performance_rating"), // 1-5
  supportRating: integer("support_rating"), // 1-5
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bot Learning & Training System
export const botLearningSession = pgTable("bot_learning_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").references(() => tradingBots.id).notNull(),
  sessionType: text("session_type").notNull(), // supervised, reinforcement, transfer
  trainingDataset: text("training_dataset"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  status: text("status").default("training"), // training, completed, failed
  performanceBefore: jsonb("performance_before"),
  performanceAfter: jsonb("performance_after"),
  improvementRate: decimal("improvement_rate", { precision: 5, scale: 2 }),
});

export const botTrainingData = pgTable("bot_training_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").references(() => tradingBots.id).notNull(),
  dataType: text("data_type").notNull(), // market_data, user_feedback, strategy_result
  input: jsonb("input").notNull(),
  expectedOutput: jsonb("expected_output"),
  actualOutput: jsonb("actual_output"),
  reward: decimal("reward", { precision: 10, scale: 4 }), // For reinforcement learning
  createdAt: timestamp("created_at").defaultNow(),
});

export const botSkills = pgTable("bot_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").references(() => tradingBots.id).notNull(),
  skillName: text("skill_name").notNull(),
  skillLevel: integer("skill_level").default(0), // 0-100
  category: text("category"), // analysis, execution, risk_management, etc.
  experiencePoints: integer("experience_points").default(0),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
});

// Celebrity Fan Platform (TWinn System)
export const celebrityProfiles = pgTable("celebrity_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  stageName: text("stage_name").notNull(),
  bio: text("bio"),
  category: text("category"), // musician, athlete, influencer, etc.
  verificationStatus: text("verification_status").default("pending"), // pending, verified, rejected
  followerCount: integer("follower_count").default(0),
  totalStaked: decimal("total_staked", { precision: 36, scale: 18 }).default("0"),
  profileImage: text("profile_image"),
  coverImage: text("cover_image"),
  socialLinks: jsonb("social_links"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fanFollows = pgTable("fan_follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fanId: varchar("fan_id").references(() => users.id).notNull(),
  celebrityId: varchar("celebrity_id").references(() => celebrityProfiles.id).notNull(),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  followedAt: timestamp("followed_at").defaultNow(),
}, (table) => ({
  fanCelebrityUnique: unique().on(table.fanId, table.celebrityId),
}));

export const fanStakes = pgTable("fan_stakes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fanId: varchar("fan_id").references(() => users.id).notNull(),
  celebrityId: varchar("celebrity_id").references(() => celebrityProfiles.id).notNull(),
  amountStaked: decimal("amount_staked", { precision: 36, scale: 18 }).notNull(),
  currency: text("currency").default("USDT"),
  stakingPeriod: integer("staking_period"), // Days
  expectedReturn: decimal("expected_return", { precision: 10, scale: 4 }), // Percentage
  actualReturn: decimal("actual_return", { precision: 36, scale: 18 }),
  status: text("status").default("active"), // active, completed, withdrawn
  stakedAt: timestamp("staked_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const fanBets = pgTable("fan_bets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fanId: varchar("fan_id").references(() => users.id).notNull(),
  celebrityId: varchar("celebrity_id").references(() => celebrityProfiles.id).notNull(),
  betType: text("bet_type").notNull(), // achievement, milestone, event_outcome
  description: text("description").notNull(),
  amountBet: decimal("amount_bet", { precision: 36, scale: 18 }).notNull(),
  odds: decimal("odds", { precision: 10, scale: 4 }).notNull(),
  potentialPayout: decimal("potential_payout", { precision: 36, scale: 18 }),
  actualPayout: decimal("actual_payout", { precision: 36, scale: 18 }),
  status: text("status").default("pending"), // pending, won, lost, cancelled
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const predictionMarkets = pgTable("prediction_markets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  celebrityId: varchar("celebrity_id").references(() => celebrityProfiles.id),
  question: text("question").notNull(),
  description: text("description"),
  outcomes: jsonb("outcomes").array().notNull(), // Possible outcomes
  totalPool: decimal("total_pool", { precision: 36, scale: 18 }).default("0"),
  resolutionCriteria: text("resolution_criteria").notNull(),
  resolvedOutcome: text("resolved_outcome"),
  status: text("status").default("open"), // open, closed, resolved
  closesAt: timestamp("closes_at").notNull(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const celebrityContent = pgTable("celebrity_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  celebrityId: varchar("celebrity_id").references(() => celebrityProfiles.id).notNull(),
  contentType: text("content_type").notNull(), // post, video, audio, exclusive
  title: text("title").notNull(),
  content: text("content"),
  mediaUrl: text("media_url"),
  isExclusive: boolean("is_exclusive").default(false),
  accessLevel: text("access_level").default("public"), // public, followers, stakers, premium
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  publishedAt: timestamp("published_at").defaultNow(),
});

// Hit System & Analytics
export const hitAnalytics = pgTable("hit_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  eventType: text("event_type").notNull(), // page_view, click, form_submit, etc.
  eventCategory: text("event_category"),
  eventLabel: text("event_label"),
  eventValue: text("event_value"),
  page: text("page"),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  country: text("country"),
  city: text("city"),
  device: text("device"), // mobile, tablet, desktop
  browser: text("browser"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userJourneys = pgTable("user_journeys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id").notNull(),
  path: jsonb("path").array().notNull(), // Array of pages visited
  events: jsonb("events").array(), // Key events in journey
  conversionGoal: text("conversion_goal"),
  converted: boolean("converted").default(false),
  duration: integer("duration"), // Session duration in seconds
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

// Help & Documentation System
export const helpArticles = pgTable("help_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(), // getting_started, features, troubleshooting, etc.
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  difficulty: text("difficulty").default("beginner"), // beginner, intermediate, advanced
  relatedArticles: jsonb("related_articles").array(),
  tags: jsonb("tags").array(),
  videoUrl: text("video_url"),
  isPublished: boolean("is_published").default(true),
  viewCount: integer("view_count").default(0),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const guideSteps = pgTable("guide_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").references(() => helpArticles.id).notNull(),
  stepNumber: integer("step_number").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  codeSnippet: text("code_snippet"),
  estimatedTime: integer("estimated_time"), // Minutes
  createdAt: timestamp("created_at").defaultNow(),
});

// Discord-Style Forum Enhancement
export const forumServers = pgTable("forum_servers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  isPublic: boolean("is_public").default(false),
  memberCount: integer("member_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forumChannels = pgTable("forum_channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").references(() => forumServers.id).notNull(),
  name: text("name").notNull(),
  type: text("type").default("text"), // text, voice, announcement
  topic: text("topic"),
  isPrivate: boolean("is_private").default(false),
  requiredRole: text("required_role"),
  position: integer("position").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const channelMessages = pgTable("channel_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").references(() => forumChannels.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  attachments: jsonb("attachments").array(),
  isPinned: boolean("is_pinned").default(false),
  isEdited: boolean("is_edited").default(false),
  replyToId: varchar("reply_to_id"), // Self-reference - relation defined below
  createdAt: timestamp("created_at").defaultNow(),
  editedAt: timestamp("edited_at"),
});

export const privateSessionRequests = pgTable("private_session_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").references(() => users.id).notNull(),
  targetUserId: varchar("target_user_id").references(() => users.id).notNull(),
  sessionType: text("session_type").notNull(), // chat, call, video
  duration: integer("duration"), // Minutes
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  status: text("status").default("pending"), // pending, approved, rejected, completed
  adminApprovedBy: varchar("admin_approved_by").references(() => adminUsers.id),
  sessionStartTime: timestamp("session_start_time"),
  sessionEndTime: timestamp("session_end_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Account Merging & Pooling
export const jointAccounts = pgTable("joint_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountName: text("account_name").notNull(),
  ownerIds: jsonb("owner_ids").array().notNull(), // Array of user IDs
  permissions: jsonb("permissions"), // Who can do what
  totalBalance: decimal("total_balance", { precision: 36, scale: 18 }).default("0"),
  requiresMultiSig: boolean("requires_multi_sig").default(false),
  signaturesRequired: integer("signatures_required").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accountMerges = pgTable("account_merges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  primaryUserId: varchar("primary_user_id").references(() => users.id).notNull(),
  mergedUserIds: jsonb("merged_user_ids").array().notNull(),
  status: text("status").default("pending"), // pending, in_progress, completed, failed
  assetsTransferred: jsonb("assets_transferred"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stakingPools = pgTable("staking_pools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poolName: text("pool_name").notNull(),
  description: text("description"),
  creatorId: varchar("creator_id").references(() => users.id).notNull(),
  poolType: text("pool_type").notNull(), // celebrity_stake, yield_farming, liquidity, etc.
  targetAsset: text("target_asset"), // What's being staked/invested in
  minStake: decimal("min_stake", { precision: 36, scale: 18 }).notNull(),
  maxStake: decimal("max_stake", { precision: 36, scale: 18 }),
  totalStaked: decimal("total_staked", { precision: 36, scale: 18 }).default("0"),
  apy: decimal("apy", { precision: 10, scale: 4 }), // Annual percentage yield
  participantCount: integer("participant_count").default(0),
  distributionSchedule: text("distribution_schedule"), // daily, weekly, monthly
  status: text("status").default("active"), // active, paused, closed
  createdAt: timestamp("created_at").defaultNow(),
  endDate: timestamp("end_date"),
});

export const poolParticipants = pgTable("pool_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poolId: varchar("pool_id").references(() => stakingPools.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  amountStaked: decimal("amount_staked", { precision: 36, scale: 18 }).notNull(),
  sharePercentage: decimal("share_percentage", { precision: 10, scale: 6 }),
  totalEarned: decimal("total_earned", { precision: 36, scale: 18 }).default("0"),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastClaimAt: timestamp("last_claim_at"),
}, (table) => ({
  poolUserUnique: unique().on(table.poolId, table.userId),
}));

export const poolDistributions = pgTable("pool_distributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poolId: varchar("pool_id").references(() => stakingPools.id).notNull(),
  distributionAmount: decimal("distribution_amount", { precision: 36, scale: 18 }).notNull(),
  distributionType: text("distribution_type").notNull(), // profit, reward, dividend
  participants: jsonb("participants"), // Array of {userId, amount}
  status: text("status").default("pending"), // pending, processing, completed
  distributedAt: timestamp("distributed_at").defaultNow(),
});

// AI Chat Enhanced with Custom Personas
export const chatbotPersonas = pgTable("chatbot_personas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  personality: text("personality").notNull(), // friendly, professional, witty, etc.
  expertise: jsonb("expertise").array(), // Areas of knowledge
  systemPrompt: text("system_prompt").notNull(),
  avatarUrl: text("avatar_url"),
  voiceId: text("voice_id"), // For voice synthesis
  isPredefined: boolean("is_predefined").default(false),
  isPublic: boolean("is_public").default(false),
  creatorId: varchar("creator_id").references(() => users.id),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  usageCount: integer("usage_count").default(0),
  price: decimal("price", { precision: 12, scale: 2 }), // For marketplace
  createdAt: timestamp("created_at").defaultNow(),
});

export const personaAssignments = pgTable("persona_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  personaId: varchar("persona_id").references(() => chatbotPersonas.id).notNull(),
  sessionId: varchar("session_id").references(() => chatSessions.id),
  assignmentType: text("assignment_type").default("manual"), // manual, automatic, temporary
  isActive: boolean("is_active").default(true),
  assignedAt: timestamp("assigned_at").defaultNow(),
}, (table) => ({
  userSessionUnique: unique().on(table.userId, table.sessionId),
}));

export const personaTraining = pgTable("persona_training", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personaId: varchar("persona_id").references(() => chatbotPersonas.id).notNull(),
  trainingDataset: text("training_dataset"),
  conversationSamples: jsonb("conversation_samples").array(),
  feedbackData: jsonb("feedback_data"),
  performanceMetrics: jsonb("performance_metrics"),
  trainedAt: timestamp("trained_at").defaultNow(),
});

// Jesus Cartel Distribution & Streaming
export const distributionPlatformEnum = pgEnum("distribution_platform", ["spotify", "apple_music", "youtube_music", "amazon_music", "tidal", "soundcloud"]);

export const distributionTracks = pgTable("distribution_tracks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  songId: varchar("song_id").references(() => songs.id).notNull(),
  platform: distributionPlatformEnum("platform").notNull(),
  platformTrackId: text("platform_track_id"),
  status: text("status").default("pending"), // pending, live, failed
  uploadedAt: timestamp("uploaded_at"),
  liveAt: timestamp("live_at"),
  metadata: jsonb("metadata"),
});

export const youtubeVideos = pgTable("youtube_videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  songId: varchar("song_id").references(() => songs.id),
  videoId: text("video_id").unique(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  publishedAt: timestamp("published_at"),
});

export const streamingAnalytics = pgTable("streaming_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackId: varchar("track_id").references(() => distributionTracks.id).notNull(),
  platform: distributionPlatformEnum("platform").notNull(),
  plays: integer("plays").default(0),
  revenue: decimal("revenue", { precision: 12, scale: 4 }).default("0"),
  listeners: integer("listeners").default(0),
  country: text("country"),
  dateRecorded: timestamp("date_recorded").defaultNow(),
});

// Guardian Angel Enhancement - Background Checks
export const backgroundCheckTypeEnum = pgEnum("background_check_type", ["criminal", "credit", "employment", "education", "professional_license"]);

export const backgroundChecks = pgTable("background_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").references(() => users.id).notNull(),
  subjectName: text("subject_name").notNull(),
  subjectIdentifier: text("subject_identifier"), // SSN, email, etc. (encrypted)
  checkType: backgroundCheckTypeEnum("check_type").notNull(),
  status: text("status").default("pending"), // pending, in_progress, completed, failed
  results: jsonb("results"),
  riskScore: integer("risk_score"), // 0-100
  clearanceLevel: text("clearance_level"), // clear, caution, denied
  requestedAt: timestamp("requested_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const publicDirectory = pgTable("public_directory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // person, business, organization
  entityName: text("entity_name").notNull(),
  description: text("description"),
  category: text("category"),
  contactInfo: jsonb("contact_info"),
  verification_status: text("verification_status").default("unverified"),
  metadata: jsonb("metadata"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bankruptcyRecords = pgTable("bankruptcy_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectName: text("subject_name").notNull(),
  caseNumber: text("case_number").unique(),
  filingDate: timestamp("filing_date"),
  chapter: text("chapter"), // Chapter 7, 11, 13, etc.
  status: text("status"), // filed, dismissed, discharged
  assets: decimal("assets", { precision: 12, scale: 2 }),
  liabilities: decimal("liabilities", { precision: 12, scale: 2 }),
  court: text("court"),
  metadata: jsonb("metadata"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const creditReports = pgTable("credit_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  creditScore: integer("credit_score"),
  reportData: jsonb("report_data"), // Full report from bureau
  provider: text("provider"), // Equifax, Experian, TransUnion
  reportDate: timestamp("report_date").defaultNow(),
});

// Trading Bots Arsenal - System Memory
export const tradingSystemMemory = pgTable("trading_system_memory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").references(() => tradingBots.id).notNull(),
  memoryType: text("memory_type").notNull(), // pattern, strategy, market_condition
  memoryKey: text("memory_key").notNull(),
  memoryValue: jsonb("memory_value").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).default("0"), // 0-100
  usageCount: integer("usage_count").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("0"),
  lastAccessed: timestamp("last_accessed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tradingStrategies = pgTable("trading_strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  strategyType: text("strategy_type").notNull(),
  parameters: jsonb("parameters").notNull(),
  backtestResults: jsonb("backtest_results"),
  livePerformance: jsonb("live_performance"),
  riskScore: integer("risk_score"), // 0-100
  isPublic: boolean("is_public").default(false),
  creatorId: varchar("creator_id").references(() => users.id),
  usageCount: integer("usage_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const botPerformanceMetrics = pgTable("bot_performance_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").references(() => tradingBots.id).notNull(),
  period: text("period").notNull(), // daily, weekly, monthly
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalTrades: integer("total_trades").default(0),
  winningTrades: integer("winning_trades").default(0),
  losingTrades: integer("losing_trades").default(0),
  totalProfit: decimal("total_profit", { precision: 36, scale: 18 }).default("0"),
  totalLoss: decimal("total_loss", { precision: 36, scale: 18 }).default("0"),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).default("0"),
  sharpeRatio: decimal("sharpe_ratio", { precision: 10, scale: 4 }),
  maxDrawdown: decimal("max_drawdown", { precision: 10, scale: 4 }),
  avgTradeReturn: decimal("avg_trade_return", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
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
  // Kingdom Transformation Relations
  dashboardConfig: one(userDashboardConfigs),
  widgetPreferences: many(userWidgetPreferences),
  adminUser: one(adminUsers),
  individualAssets: many(individualAssets),
  etherealOwnership: many(etherealOwnership),
  botListings: many(botMarketplaceListings),
  botRentals: many(botRentals),
  botSubscriptions: many(botSubscriptions),
  botReviews: many(botReviews),
  celebrityProfile: one(celebrityProfiles),
  fanFollows: many(fanFollows),
  fanStakes: many(fanStakes),
  fanBets: many(fanBets),
  hitAnalytics: many(hitAnalytics),
  userJourneys: many(userJourneys),
  forumServersOwned: many(forumServers),
  channelMessages: many(channelMessages),
  privateSessionRequests: many(privateSessionRequests),
  poolParticipants: many(poolParticipants),
  personaAssignments: many(personaAssignments),
  backgroundChecks: many(backgroundChecks),
  creditReports: many(creditReports),
  p2pOffers: many(p2pOffers),
  p2pOrdersAsBuyer: many(p2pOrders),
  p2pOrdersAsSeller: many(p2pOrders),
  p2pPaymentMethods: many(p2pPaymentMethods),
  p2pChatMessages: many(p2pChatMessages),
  p2pDisputesRaised: many(p2pDisputes),
  p2pReviewsGiven: many(p2pReviews),
  p2pReviewsReceived: many(p2pReviews),
  walletConnectSessions: many(walletConnectSessions),
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

export const p2pOffersRelations = relations(p2pOffers, ({ one, many }) => ({
  user: one(users, {
    fields: [p2pOffers.userId],
    references: [users.id],
  }),
  orders: many(p2pOrders),
}));

export const p2pOrdersRelations = relations(p2pOrders, ({ one, many }) => ({
  offer: one(p2pOffers, {
    fields: [p2pOrders.offerId],
    references: [p2pOffers.id],
  }),
  buyer: one(users, {
    fields: [p2pOrders.buyerId],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [p2pOrders.sellerId],
    references: [users.id],
  }),
  chatMessages: many(p2pChatMessages),
  disputes: many(p2pDisputes),
  reviews: many(p2pReviews),
}));

export const p2pPaymentMethodsRelations = relations(p2pPaymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [p2pPaymentMethods.userId],
    references: [users.id],
  }),
}));

export const p2pChatMessagesRelations = relations(p2pChatMessages, ({ one }) => ({
  order: one(p2pOrders, {
    fields: [p2pChatMessages.orderId],
    references: [p2pOrders.id],
  }),
  sender: one(users, {
    fields: [p2pChatMessages.senderId],
    references: [users.id],
  }),
}));

export const p2pDisputesRelations = relations(p2pDisputes, ({ one }) => ({
  order: one(p2pOrders, {
    fields: [p2pDisputes.orderId],
    references: [p2pOrders.id],
  }),
  raisedByUser: one(users, {
    fields: [p2pDisputes.raisedBy],
    references: [users.id],
  }),
  resolvedByAdmin: one(adminUsers, {
    fields: [p2pDisputes.resolvedBy],
    references: [adminUsers.id],
  }),
}));

export const p2pReviewsRelations = relations(p2pReviews, ({ one }) => ({
  order: one(p2pOrders, {
    fields: [p2pReviews.orderId],
    references: [p2pOrders.id],
  }),
  reviewer: one(users, {
    fields: [p2pReviews.reviewerId],
    references: [users.id],
  }),
  reviewedUser: one(users, {
    fields: [p2pReviews.reviewedUserId],
    references: [users.id],
  }),
}));

export const walletConnectSessionsRelations = relations(walletConnectSessions, ({ one }) => ({
  user: one(users, {
    fields: [walletConnectSessions.userId],
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

// Kingdom Transformation Relations
export const userDashboardConfigsRelations = relations(userDashboardConfigs, ({ one }) => ({
  user: one(users, {
    fields: [userDashboardConfigs.userId],
    references: [users.id],
  }),
}));

export const userWidgetPreferencesRelations = relations(userWidgetPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userWidgetPreferences.userId],
    references: [users.id],
  }),
  widget: one(dashboardWidgets, {
    fields: [userWidgetPreferences.widgetId],
    references: [dashboardWidgets.id],
  }),
}));

export const adminUsersRelations = relations(adminUsers, ({ one, many }) => ({
  user: one(users, {
    fields: [adminUsers.userId],
    references: [users.id],
  }),
  auditLogs: many(adminAuditLogs),
  broadcasts: many(adminBroadcasts),
}));

export const adminAuditLogsRelations = relations(adminAuditLogs, ({ one }) => ({
  admin: one(adminUsers, {
    fields: [adminAuditLogs.adminId],
    references: [adminUsers.id],
  }),
}));

export const adminBroadcastsRelations = relations(adminBroadcasts, ({ one }) => ({
  admin: one(adminUsers, {
    fields: [adminBroadcasts.adminId],
    references: [adminUsers.id],
  }),
}));

export const individualAssetsRelations = relations(individualAssets, ({ one }) => ({
  user: one(users, {
    fields: [individualAssets.userId],
    references: [users.id],
  }),
}));

export const etherealOwnershipRelations = relations(etherealOwnership, ({ one }) => ({
  user: one(users, {
    fields: [etherealOwnership.userId],
    references: [users.id],
  }),
  element: one(etherealElements, {
    fields: [etherealOwnership.elementId],
    references: [etherealElements.id],
  }),
}));

export const botMarketplaceListingsRelations = relations(botMarketplaceListings, ({ one, many }) => ({
  seller: one(users, {
    fields: [botMarketplaceListings.sellerId],
    references: [users.id],
  }),
  bot: one(tradingBots, {
    fields: [botMarketplaceListings.botId],
    references: [tradingBots.id],
  }),
  rentals: many(botRentals),
  subscriptions: many(botSubscriptions),
  reviews: many(botReviews),
}));

export const botRentalsRelations = relations(botRentals, ({ one }) => ({
  renter: one(users, {
    fields: [botRentals.renterId],
    references: [users.id],
  }),
  listing: one(botMarketplaceListings, {
    fields: [botRentals.listingId],
    references: [botMarketplaceListings.id],
  }),
}));

export const botSubscriptionsRelations = relations(botSubscriptions, ({ one }) => ({
  subscriber: one(users, {
    fields: [botSubscriptions.subscriberId],
    references: [users.id],
  }),
  listing: one(botMarketplaceListings, {
    fields: [botSubscriptions.listingId],
    references: [botMarketplaceListings.id],
  }),
}));

export const botReviewsRelations = relations(botReviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [botReviews.reviewerId],
    references: [users.id],
  }),
  listing: one(botMarketplaceListings, {
    fields: [botReviews.listingId],
    references: [botMarketplaceListings.id],
  }),
}));

export const botLearningSessionRelations = relations(botLearningSession, ({ one }) => ({
  bot: one(tradingBots, {
    fields: [botLearningSession.botId],
    references: [tradingBots.id],
  }),
}));

export const botTrainingDataRelations = relations(botTrainingData, ({ one }) => ({
  bot: one(tradingBots, {
    fields: [botTrainingData.botId],
    references: [tradingBots.id],
  }),
}));

export const botSkillsRelations = relations(botSkills, ({ one }) => ({
  bot: one(tradingBots, {
    fields: [botSkills.botId],
    references: [tradingBots.id],
  }),
}));

export const celebrityProfilesRelations = relations(celebrityProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [celebrityProfiles.userId],
    references: [users.id],
  }),
  followers: many(fanFollows),
  stakes: many(fanStakes),
  bets: many(fanBets),
  predictionMarkets: many(predictionMarkets),
  content: many(celebrityContent),
}));

export const fanFollowsRelations = relations(fanFollows, ({ one }) => ({
  fan: one(users, {
    fields: [fanFollows.fanId],
    references: [users.id],
  }),
  celebrity: one(celebrityProfiles, {
    fields: [fanFollows.celebrityId],
    references: [celebrityProfiles.id],
  }),
}));

export const fanStakesRelations = relations(fanStakes, ({ one }) => ({
  fan: one(users, {
    fields: [fanStakes.fanId],
    references: [users.id],
  }),
  celebrity: one(celebrityProfiles, {
    fields: [fanStakes.celebrityId],
    references: [celebrityProfiles.id],
  }),
}));

export const fanBetsRelations = relations(fanBets, ({ one }) => ({
  fan: one(users, {
    fields: [fanBets.fanId],
    references: [users.id],
  }),
  celebrity: one(celebrityProfiles, {
    fields: [fanBets.celebrityId],
    references: [celebrityProfiles.id],
  }),
}));

export const predictionMarketsRelations = relations(predictionMarkets, ({ one }) => ({
  celebrity: one(celebrityProfiles, {
    fields: [predictionMarkets.celebrityId],
    references: [celebrityProfiles.id],
  }),
}));

export const celebrityContentRelations = relations(celebrityContent, ({ one }) => ({
  celebrity: one(celebrityProfiles, {
    fields: [celebrityContent.celebrityId],
    references: [celebrityProfiles.id],
  }),
}));

export const hitAnalyticsRelations = relations(hitAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [hitAnalytics.userId],
    references: [users.id],
  }),
}));

export const userJourneysRelations = relations(userJourneys, ({ one }) => ({
  user: one(users, {
    fields: [userJourneys.userId],
    references: [users.id],
  }),
}));

export const guideStepsRelations = relations(guideSteps, ({ one }) => ({
  article: one(helpArticles, {
    fields: [guideSteps.articleId],
    references: [helpArticles.id],
  }),
}));

export const forumServersRelations = relations(forumServers, ({ one, many }) => ({
  owner: one(users, {
    fields: [forumServers.ownerId],
    references: [users.id],
  }),
  channels: many(forumChannels),
}));

export const forumChannelsRelations = relations(forumChannels, ({ one, many }) => ({
  server: one(forumServers, {
    fields: [forumChannels.serverId],
    references: [forumServers.id],
  }),
  messages: many(channelMessages),
}));

export const channelMessagesRelations = relations(channelMessages, ({ one }) => ({
  channel: one(forumChannels, {
    fields: [channelMessages.channelId],
    references: [forumChannels.id],
  }),
  user: one(users, {
    fields: [channelMessages.userId],
    references: [users.id],
  }),
}));

export const privateSessionRequestsRelations = relations(privateSessionRequests, ({ one }) => ({
  requester: one(users, {
    fields: [privateSessionRequests.requesterId],
    references: [users.id],
  }),
  targetUser: one(users, {
    fields: [privateSessionRequests.targetUserId],
    references: [users.id],
  }),
  adminApprover: one(adminUsers, {
    fields: [privateSessionRequests.adminApprovedBy],
    references: [adminUsers.id],
  }),
}));

export const stakingPoolsRelations = relations(stakingPools, ({ one, many }) => ({
  creator: one(users, {
    fields: [stakingPools.creatorId],
    references: [users.id],
  }),
  participants: many(poolParticipants),
  distributions: many(poolDistributions),
}));

export const poolParticipantsRelations = relations(poolParticipants, ({ one }) => ({
  pool: one(stakingPools, {
    fields: [poolParticipants.poolId],
    references: [stakingPools.id],
  }),
  user: one(users, {
    fields: [poolParticipants.userId],
    references: [users.id],
  }),
}));

export const poolDistributionsRelations = relations(poolDistributions, ({ one }) => ({
  pool: one(stakingPools, {
    fields: [poolDistributions.poolId],
    references: [stakingPools.id],
  }),
}));

export const chatbotPersonasRelations = relations(chatbotPersonas, ({ one, many }) => ({
  creator: one(users, {
    fields: [chatbotPersonas.creatorId],
    references: [users.id],
  }),
  assignments: many(personaAssignments),
  training: many(personaTraining),
}));

export const personaAssignmentsRelations = relations(personaAssignments, ({ one }) => ({
  user: one(users, {
    fields: [personaAssignments.userId],
    references: [users.id],
  }),
  persona: one(chatbotPersonas, {
    fields: [personaAssignments.personaId],
    references: [chatbotPersonas.id],
  }),
  session: one(chatSessions, {
    fields: [personaAssignments.sessionId],
    references: [chatSessions.id],
  }),
}));

export const personaTrainingRelations = relations(personaTraining, ({ one }) => ({
  persona: one(chatbotPersonas, {
    fields: [personaTraining.personaId],
    references: [chatbotPersonas.id],
  }),
}));

export const distributionTracksRelations = relations(distributionTracks, ({ one }) => ({
  song: one(songs, {
    fields: [distributionTracks.songId],
    references: [songs.id],
  }),
}));

export const youtubeVideosRelations = relations(youtubeVideos, ({ one }) => ({
  song: one(songs, {
    fields: [youtubeVideos.songId],
    references: [songs.id],
  }),
}));

export const streamingAnalyticsRelations = relations(streamingAnalytics, ({ one }) => ({
  track: one(distributionTracks, {
    fields: [streamingAnalytics.trackId],
    references: [distributionTracks.id],
  }),
}));

export const backgroundChecksRelations = relations(backgroundChecks, ({ one }) => ({
  requester: one(users, {
    fields: [backgroundChecks.requesterId],
    references: [users.id],
  }),
}));

export const creditReportsRelations = relations(creditReports, ({ one }) => ({
  user: one(users, {
    fields: [creditReports.userId],
    references: [users.id],
  }),
}));

export const tradingSystemMemoryRelations = relations(tradingSystemMemory, ({ one }) => ({
  bot: one(tradingBots, {
    fields: [tradingSystemMemory.botId],
    references: [tradingBots.id],
  }),
}));

export const tradingStrategiesRelations = relations(tradingStrategies, ({ one }) => ({
  creator: one(users, {
    fields: [tradingStrategies.creatorId],
    references: [users.id],
  }),
}));

export const botPerformanceMetricsRelations = relations(botPerformanceMetrics, ({ one }) => ({
  bot: one(tradingBots, {
    fields: [botPerformanceMetrics.botId],
    references: [tradingBots.id],
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

export const insertP2POfferSchema = createInsertSchema(p2pOffers).omit({
  id: true,
  createdAt: true,
});

export const insertP2POrderSchema = createInsertSchema(p2pOrders).omit({
  id: true,
  createdAt: true,
  paidAt: true,
  completedAt: true,
});

export const insertP2PPaymentMethodSchema = createInsertSchema(p2pPaymentMethods).omit({
  id: true,
  createdAt: true,
});

export const insertP2PChatMessageSchema = createInsertSchema(p2pChatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertP2PDisputeSchema = createInsertSchema(p2pDisputes).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertP2PReviewSchema = createInsertSchema(p2pReviews).omit({
  id: true,
  createdAt: true,
});

export const insertWalletConnectSessionSchema = createInsertSchema(walletConnectSessions).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
});

export type InsertWalletConnectSession = z.infer<typeof insertWalletConnectSessionSchema>;
export type WalletConnectSession = typeof walletConnectSessions.$inferSelect;

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

export type InsertP2POffer = z.infer<typeof insertP2POfferSchema>;
export type P2POffer = typeof p2pOffers.$inferSelect;

export type InsertP2POrder = z.infer<typeof insertP2POrderSchema>;
export type P2POrder = typeof p2pOrders.$inferSelect;

export type InsertP2PPaymentMethod = z.infer<typeof insertP2PPaymentMethodSchema>;
export type P2PPaymentMethod = typeof p2pPaymentMethods.$inferSelect;

export type InsertP2PChatMessage = z.infer<typeof insertP2PChatMessageSchema>;
export type P2PChatMessage = typeof p2pChatMessages.$inferSelect;

export type InsertP2PDispute = z.infer<typeof insertP2PDisputeSchema>;
export type P2PDispute = typeof p2pDisputes.$inferSelect;

export type InsertP2PReview = z.infer<typeof insertP2PReviewSchema>;
export type P2PReview = typeof p2pReviews.$inferSelect;

export type InsertTradingBot = z.infer<typeof insertTradingBotSchema>;
export type TradingBot = typeof tradingBots.$inferSelect;

export type InsertBotExecution = z.infer<typeof insertBotExecutionSchema>;
export type BotExecution = typeof botExecutions.$inferSelect;

export type InsertArmorWallet = z.infer<typeof insertArmorWalletSchema>;
export type ArmorWallet = typeof armorWallets.$inferSelect;

export type InsertMevEvent = z.infer<typeof insertMevEventSchema>;
export type MevEvent = typeof mevEvents.$inferSelect;

export type InsertExchangeOrder = z.infer<typeof insertExchangeOrderSchema>;
export type ExchangeOrder = typeof exchangeOrders.$inferSelect;

export type InsertLiquidityPool = z.infer<typeof insertLiquidityPoolSchema>;
export type LiquidityPool = typeof liquidityPools.$inferSelect;

export type InsertMixingRequest = z.infer<typeof insertMixingRequestSchema>;
export type MixingRequest = typeof mixingRequests.$inferSelect;

export type InsertForumCategory = z.infer<typeof insertForumCategorySchema>;
export type ForumCategory = typeof forumCategories.$inferSelect;

export type InsertForumThread = z.infer<typeof insertForumThreadSchema>;
export type ForumThread = typeof forumThreads.$inferSelect;

export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type ForumReply = typeof forumReplies.$inferSelect;

export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertMetalInventory = z.infer<typeof insertMetalInventorySchema>;
export type MetalInventory = typeof metalInventory.$inferSelect;

export type InsertMetalTrade = z.infer<typeof insertMetalTradeSchema>;
export type MetalTrade = typeof metalTrades.$inferSelect;

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Kingdom Transformation Insert Schemas
export const insertUserDashboardConfigSchema = createInsertSchema(userDashboardConfigs).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserDashboardConfig = z.infer<typeof insertUserDashboardConfigSchema>;
export type UserDashboardConfig = typeof userDashboardConfigs.$inferSelect;

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).omit({ id: true, createdAt: true });
export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;

export const insertUserWidgetPreferenceSchema = createInsertSchema(userWidgetPreferences).omit({ id: true, createdAt: true });
export type InsertUserWidgetPreference = z.infer<typeof insertUserWidgetPreferenceSchema>;
export type UserWidgetPreference = typeof userWidgetPreferences.$inferSelect;

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({ id: true, createdAt: true });
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

export const insertAdminAuditLogSchema = createInsertSchema(adminAuditLogs).omit({ id: true, createdAt: true });
export type InsertAdminAuditLog = z.infer<typeof insertAdminAuditLogSchema>;
export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;

export const insertAdminBroadcastSchema = createInsertSchema(adminBroadcasts).omit({ id: true, sentAt: true });
export type InsertAdminBroadcast = z.infer<typeof insertAdminBroadcastSchema>;
export type AdminBroadcast = typeof adminBroadcasts.$inferSelect;

export const insertIndividualAssetSchema = createInsertSchema(individualAssets).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertIndividualAsset = z.infer<typeof insertIndividualAssetSchema>;
export type IndividualAsset = typeof individualAssets.$inferSelect;

export const insertEtherealElementSchema = createInsertSchema(etherealElements).omit({ id: true, createdAt: true });
export type InsertEtherealElement = z.infer<typeof insertEtherealElementSchema>;
export type EtherealElement = typeof etherealElements.$inferSelect;

export const insertEtherealOwnershipSchema = createInsertSchema(etherealOwnership).omit({ id: true, acquiredAt: true });
export type InsertEtherealOwnership = z.infer<typeof insertEtherealOwnershipSchema>;
export type EtherealOwnership = typeof etherealOwnership.$inferSelect;

export const insertBotMarketplaceListingSchema = createInsertSchema(botMarketplaceListings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBotMarketplaceListing = z.infer<typeof insertBotMarketplaceListingSchema>;
export type BotMarketplaceListing = typeof botMarketplaceListings.$inferSelect;

export const insertBotRentalSchema = createInsertSchema(botRentals).omit({ id: true, createdAt: true });
export type InsertBotRental = z.infer<typeof insertBotRentalSchema>;
export type BotRental = typeof botRentals.$inferSelect;

export const insertBotSubscriptionSchema = createInsertSchema(botSubscriptions).omit({ id: true, createdAt: true });
export type InsertBotSubscription = z.infer<typeof insertBotSubscriptionSchema>;
export type BotSubscription = typeof botSubscriptions.$inferSelect;

export const insertBotReviewSchema = createInsertSchema(botReviews).omit({ id: true, createdAt: true });
export type InsertBotReview = z.infer<typeof insertBotReviewSchema>;
export type BotReview = typeof botReviews.$inferSelect;

export const insertBotLearningSessionSchema = createInsertSchema(botLearningSession).omit({ id: true, startedAt: true });
export type InsertBotLearningSession = z.infer<typeof insertBotLearningSessionSchema>;
export type BotLearningSession = typeof botLearningSession.$inferSelect;

export const insertBotTrainingDataSchema = createInsertSchema(botTrainingData).omit({ id: true, createdAt: true });
export type InsertBotTrainingData = z.infer<typeof insertBotTrainingDataSchema>;
export type BotTrainingData = typeof botTrainingData.$inferSelect;

export const insertBotSkillSchema = createInsertSchema(botSkills).omit({ id: true, unlockedAt: true });
export type InsertBotSkill = z.infer<typeof insertBotSkillSchema>;
export type BotSkill = typeof botSkills.$inferSelect;

export const insertCelebrityProfileSchema = createInsertSchema(celebrityProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCelebrityProfile = z.infer<typeof insertCelebrityProfileSchema>;
export type CelebrityProfile = typeof celebrityProfiles.$inferSelect;

export const insertFanFollowSchema = createInsertSchema(fanFollows).omit({ id: true, followedAt: true });
export type InsertFanFollow = z.infer<typeof insertFanFollowSchema>;
export type FanFollow = typeof fanFollows.$inferSelect;

export const insertFanStakeSchema = createInsertSchema(fanStakes).omit({ id: true, stakedAt: true });
export type InsertFanStake = z.infer<typeof insertFanStakeSchema>;
export type FanStake = typeof fanStakes.$inferSelect;

export const insertFanBetSchema = createInsertSchema(fanBets).omit({ id: true, createdAt: true });
export type InsertFanBet = z.infer<typeof insertFanBetSchema>;
export type FanBet = typeof fanBets.$inferSelect;

export const insertPredictionMarketSchema = createInsertSchema(predictionMarkets).omit({ id: true, createdAt: true });
export type InsertPredictionMarket = z.infer<typeof insertPredictionMarketSchema>;
export type PredictionMarket = typeof predictionMarkets.$inferSelect;

export const insertCelebrityContentSchema = createInsertSchema(celebrityContent).omit({ id: true, publishedAt: true });
export type InsertCelebrityContent = z.infer<typeof insertCelebrityContentSchema>;
export type CelebrityContent = typeof celebrityContent.$inferSelect;

export const insertHitAnalyticsSchema = createInsertSchema(hitAnalytics).omit({ id: true, createdAt: true });
export type InsertHitAnalytics = z.infer<typeof insertHitAnalyticsSchema>;
export type HitAnalytics = typeof hitAnalytics.$inferSelect;

export const insertUserJourneySchema = createInsertSchema(userJourneys).omit({ id: true, startedAt: true });
export type InsertUserJourney = z.infer<typeof insertUserJourneySchema>;
export type UserJourney = typeof userJourneys.$inferSelect;

export const insertHelpArticleSchema = createInsertSchema(helpArticles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertHelpArticle = z.infer<typeof insertHelpArticleSchema>;
export type HelpArticle = typeof helpArticles.$inferSelect;

export const insertGuideStepSchema = createInsertSchema(guideSteps).omit({ id: true, createdAt: true });
export type InsertGuideStep = z.infer<typeof insertGuideStepSchema>;
export type GuideStep = typeof guideSteps.$inferSelect;

export const insertForumServerSchema = createInsertSchema(forumServers).omit({ id: true, createdAt: true });
export type InsertForumServer = z.infer<typeof insertForumServerSchema>;
export type ForumServer = typeof forumServers.$inferSelect;

export const insertForumChannelSchema = createInsertSchema(forumChannels).omit({ id: true, createdAt: true });
export type InsertForumChannel = z.infer<typeof insertForumChannelSchema>;
export type ForumChannel = typeof forumChannels.$inferSelect;

export const insertChannelMessageSchema = createInsertSchema(channelMessages).omit({ id: true, createdAt: true });
export type InsertChannelMessage = z.infer<typeof insertChannelMessageSchema>;
export type ChannelMessage = typeof channelMessages.$inferSelect;

export const insertPrivateSessionRequestSchema = createInsertSchema(privateSessionRequests).omit({ id: true, createdAt: true });
export type InsertPrivateSessionRequest = z.infer<typeof insertPrivateSessionRequestSchema>;
export type PrivateSessionRequest = typeof privateSessionRequests.$inferSelect;

export const insertJointAccountSchema = createInsertSchema(jointAccounts).omit({ id: true, createdAt: true });
export type InsertJointAccount = z.infer<typeof insertJointAccountSchema>;
export type JointAccount = typeof jointAccounts.$inferSelect;

export const insertAccountMergeSchema = createInsertSchema(accountMerges).omit({ id: true, createdAt: true });
export type InsertAccountMerge = z.infer<typeof insertAccountMergeSchema>;
export type AccountMerge = typeof accountMerges.$inferSelect;

export const insertStakingPoolSchema = createInsertSchema(stakingPools).omit({ id: true, createdAt: true });
export type InsertStakingPool = z.infer<typeof insertStakingPoolSchema>;
export type StakingPool = typeof stakingPools.$inferSelect;

export const insertPoolParticipantSchema = createInsertSchema(poolParticipants).omit({ id: true, joinedAt: true });
export type InsertPoolParticipant = z.infer<typeof insertPoolParticipantSchema>;
export type PoolParticipant = typeof poolParticipants.$inferSelect;

export const insertPoolDistributionSchema = createInsertSchema(poolDistributions).omit({ id: true, distributedAt: true });
export type InsertPoolDistribution = z.infer<typeof insertPoolDistributionSchema>;
export type PoolDistribution = typeof poolDistributions.$inferSelect;

export const insertChatbotPersonaSchema = createInsertSchema(chatbotPersonas).omit({ id: true, createdAt: true });
export type InsertChatbotPersona = z.infer<typeof insertChatbotPersonaSchema>;
export type ChatbotPersona = typeof chatbotPersonas.$inferSelect;

export const insertPersonaAssignmentSchema = createInsertSchema(personaAssignments).omit({ id: true, assignedAt: true });
export type InsertPersonaAssignment = z.infer<typeof insertPersonaAssignmentSchema>;
export type PersonaAssignment = typeof personaAssignments.$inferSelect;

export const insertPersonaTrainingSchema = createInsertSchema(personaTraining).omit({ id: true, trainedAt: true });
export type InsertPersonaTraining = z.infer<typeof insertPersonaTrainingSchema>;
export type PersonaTraining = typeof personaTraining.$inferSelect;

export const insertDistributionTrackSchema = createInsertSchema(distributionTracks).omit({ id: true });
export type InsertDistributionTrack = z.infer<typeof insertDistributionTrackSchema>;
export type DistributionTrack = typeof distributionTracks.$inferSelect;

export const insertYoutubeVideoSchema = createInsertSchema(youtubeVideos).omit({ id: true, uploadedAt: true });
export type InsertYoutubeVideo = z.infer<typeof insertYoutubeVideoSchema>;
export type YoutubeVideo = typeof youtubeVideos.$inferSelect;

export const insertStreamingAnalyticsSchema = createInsertSchema(streamingAnalytics).omit({ id: true, dateRecorded: true });
export type InsertStreamingAnalytics = z.infer<typeof insertStreamingAnalyticsSchema>;
export type StreamingAnalytics = typeof streamingAnalytics.$inferSelect;

export const insertBackgroundCheckSchema = createInsertSchema(backgroundChecks).omit({ id: true, requestedAt: true });
export type InsertBackgroundCheck = z.infer<typeof insertBackgroundCheckSchema>;
export type BackgroundCheck = typeof backgroundChecks.$inferSelect;

export const insertPublicDirectorySchema = createInsertSchema(publicDirectory).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPublicDirectory = z.infer<typeof insertPublicDirectorySchema>;
export type PublicDirectory = typeof publicDirectory.$inferSelect;

export const insertBankruptcyRecordSchema = createInsertSchema(bankruptcyRecords).omit({ id: true, recordedAt: true });
export type InsertBankruptcyRecord = z.infer<typeof insertBankruptcyRecordSchema>;
export type BankruptcyRecord = typeof bankruptcyRecords.$inferSelect;

export const insertCreditReportSchema = createInsertSchema(creditReports).omit({ id: true, reportDate: true });
export type InsertCreditReport = z.infer<typeof insertCreditReportSchema>;
export type CreditReport = typeof creditReports.$inferSelect;

export const insertTradingSystemMemorySchema = createInsertSchema(tradingSystemMemory).omit({ id: true, createdAt: true });
export type InsertTradingSystemMemory = z.infer<typeof insertTradingSystemMemorySchema>;
export type TradingSystemMemory = typeof tradingSystemMemory.$inferSelect;

export const insertTradingStrategySchema = createInsertSchema(tradingStrategies).omit({ id: true, createdAt: true });
export type InsertTradingStrategy = z.infer<typeof insertTradingStrategySchema>;
export type TradingStrategy = typeof tradingStrategies.$inferSelect;

export const insertBotPerformanceMetricsSchema = createInsertSchema(botPerformanceMetrics).omit({ id: true, createdAt: true });
export type InsertBotPerformanceMetrics = z.infer<typeof insertBotPerformanceMetricsSchema>;
export type BotPerformanceMetrics = typeof botPerformanceMetrics.$inferSelect;
