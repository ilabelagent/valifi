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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  songs: many(songs),
  payments: many(payments),
  kycRecords: many(kycRecords),
  quantumJobs: many(quantumJobs),
  securityEvents: many(securityEvents),
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
