CREATE TYPE "public"."admin_role" AS ENUM('super_admin', 'admin', 'moderator', 'support');--> statement-breakpoint
CREATE TYPE "public"."agent_type" AS ENUM('orchestrator', 'blockchain', 'web3', 'payment', 'kyc', 'security', 'publishing', 'quantum', 'analytics', 'monitoring', 'guardian_angel', 'financial_401k', 'financial_ira', 'financial_pension', 'financial_bonds', 'financial_stocks', 'financial_options', 'financial_forex', 'financial_metals', 'financial_commodities', 'financial_mutual_funds', 'financial_reit', 'financial_crypto_derivatives', 'financial_portfolio', 'trading_amm', 'trading_liquidity', 'trading_defi', 'trading_bridge', 'trading_lending', 'trading_gas_optimizer', 'trading_mining', 'trading_advanced', 'wallet_hd', 'wallet_hardware', 'wallet_multisig', 'wallet_seed_management', 'security_privacy', 'platform', 'platform_admin_control', 'platform_admin_dashboard', 'platform_contact_manager', 'platform_communication', 'platform_mail', 'platform_translation', 'platform_education', 'platform_onboarding', 'platform_vip_desk', 'platform_enterprise', 'platform_escrow', 'platform_advanced_services', 'platform_innovative', 'platform_address_book', 'analytics_portfolio', 'analytics_transaction_history', 'analytics_divine_oracle', 'analytics_word', 'analytics_cyberlab', 'analytics_banking', 'nft_minting', 'collectibles', 'smart_contract', 'community_exchange', 'multichain');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('crypto', 'stock', 'bond', 'real_estate', 'ethereal', 'precious_metal', 'collectible');--> statement-breakpoint
CREATE TYPE "public"."background_check_type" AS ENUM('criminal', 'credit', 'employment', 'education', 'professional_license');--> statement-breakpoint
CREATE TYPE "public"."bot_execution_status" AS ENUM('pending', 'running', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."bot_listing_status" AS ENUM('active', 'paused', 'sold_out', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."bot_status" AS ENUM('active', 'idle', 'error', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."broker_account_status" AS ENUM('active', 'inactive', 'suspended', 'pending_verification');--> statement-breakpoint
CREATE TYPE "public"."broker_order_side" AS ENUM('buy', 'sell');--> statement-breakpoint
CREATE TYPE "public"."broker_order_status" AS ENUM('pending', 'submitted', 'filled', 'partially_filled', 'cancelled', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."broker_order_time_in_force" AS ENUM('day', 'gtc', 'ioc', 'fok');--> statement-breakpoint
CREATE TYPE "public"."broker_order_type" AS ENUM('market', 'limit', 'stop', 'stop_limit', 'trailing_stop');--> statement-breakpoint
CREATE TYPE "public"."broker_provider" AS ENUM('alpaca', 'interactive_brokers', 'td_ameritrade', 'binance', 'bybit');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('deploying', 'deployed', 'verified', 'failed');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('ERC20', 'ERC721', 'ERC1155', 'ERC721A', 'custom');--> statement-breakpoint
CREATE TYPE "public"."conversation_memory_type" AS ENUM('task_context', 'project_state', 'user_preferences', 'technical_decisions', 'active_problems', 'conversation_history', 'file_context', 'entity_knowledge');--> statement-breakpoint
CREATE TYPE "public"."crypto_processor" AS ENUM('bitpay', 'binance_pay', 'bybit', 'kucoin', 'luno');--> statement-breakpoint
CREATE TYPE "public"."distribution_platform" AS ENUM('spotify', 'apple_music', 'youtube_music', 'amazon_music', 'tidal', 'soundcloud');--> statement-breakpoint
CREATE TYPE "public"."financial_asset_type" AS ENUM('stock', 'forex', 'bond', 'retirement_401k', 'retirement_ira', 'retirement_pension');--> statement-breakpoint
CREATE TYPE "public"."financial_order_status" AS ENUM('pending', 'executed', 'cancelled', 'failed');--> statement-breakpoint
CREATE TYPE "public"."financial_order_type" AS ENUM('buy', 'sell');--> statement-breakpoint
CREATE TYPE "public"."forum_channel_type" AS ENUM('text', 'voice', 'announcement');--> statement-breakpoint
CREATE TYPE "public"."forum_member_role" AS ENUM('owner', 'admin', 'moderator', 'member', 'muted', 'banned');--> statement-breakpoint
CREATE TYPE "public"."forum_server_visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "public"."kyc_status" AS ENUM('pending', 'in_review', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."metal_form" AS ENUM('bar', 'coin', 'round');--> statement-breakpoint
CREATE TYPE "public"."metal_trade_status" AS ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."metal_type" AS ENUM('gold', 'silver', 'platinum', 'palladium', 'copper');--> statement-breakpoint
CREATE TYPE "public"."mixing_status" AS ENUM('pending', 'mixing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."network" AS ENUM('ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism');--> statement-breakpoint
CREATE TYPE "public"."order_side" AS ENUM('buy', 'sell');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('open', 'partially_filled', 'filled', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('market', 'limit', 'stop_loss', 'stop_limit');--> statement-breakpoint
CREATE TYPE "public"."ownership_location" AS ENUM('vault', 'delivery_pending', 'delivered');--> statement-breakpoint
CREATE TYPE "public"."p2p_dispute_status" AS ENUM('open', 'reviewing', 'resolved', 'escalated');--> statement-breakpoint
CREATE TYPE "public"."p2p_offer_status" AS ENUM('active', 'paused', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."p2p_offer_type" AS ENUM('buy', 'sell');--> statement-breakpoint
CREATE TYPE "public"."p2p_order_status" AS ENUM('created', 'escrowed', 'paid', 'released', 'disputed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."prayer_category" AS ENUM('trade_guidance', 'wisdom', 'gratitude', 'protection', 'prosperity', 'general');--> statement-breakpoint
CREATE TYPE "public"."scripture_category" AS ENUM('trading', 'wisdom', 'prosperity', 'faith', 'protection', 'patience', 'discipline', 'general');--> statement-breakpoint
CREATE TYPE "public"."spectrum_subscription_status" AS ENUM('active', 'paused', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."spectrum_tier" AS ENUM('royal_bronze', 'royal_silver', 'royal_gold', 'kings_court', 'king_david_circle');--> statement-breakpoint
CREATE TYPE "public"."threat_level" AS ENUM('none', 'low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."tithing_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."trading_strategy" AS ENUM('grid', 'dca', 'arbitrage', 'scalping', 'market_making', 'momentum_ai', 'mev');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'confirmed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."wallet_connect_session_status" AS ENUM('active', 'expired', 'disconnected');--> statement-breakpoint
CREATE TABLE "account_merges" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"primary_user_id" varchar NOT NULL,
	"merged_user_ids" jsonb[] NOT NULL,
	"status" text DEFAULT 'pending',
	"assets_transferred" jsonb,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" varchar NOT NULL,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" varchar,
	"details" jsonb,
	"ip_address" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_broadcasts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" varchar NOT NULL,
	"recipient_type" text NOT NULL,
	"recipient_ids" jsonb[],
	"message" text NOT NULL,
	"title" text,
	"priority" text DEFAULT 'normal',
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"role" "admin_role" NOT NULL,
	"permissions" jsonb[],
	"is_active" boolean DEFAULT true,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_users_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "agent_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" varchar NOT NULL,
	"action" text NOT NULL,
	"status" text NOT NULL,
	"input" jsonb,
	"output" jsonb,
	"error_message" text,
	"duration" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "agent_type" NOT NULL,
	"status" "bot_status" DEFAULT 'idle',
	"config" jsonb,
	"capabilities" jsonb[],
	"current_task" text,
	"success_rate" numeric(5, 2) DEFAULT '0',
	"total_operations" integer DEFAULT 0,
	"last_active_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "armor_wallets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"wallet_type" text NOT NULL,
	"address" text NOT NULL,
	"chains" jsonb NOT NULL,
	"daily_limit" numeric(36, 18),
	"requires_two_fa" boolean DEFAULT false,
	"armor_api_key" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "armor_wallets_address_unique" UNIQUE("address")
);
--> statement-breakpoint
CREATE TABLE "article_comments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"comment" text NOT NULL,
	"parent_comment_id" varchar,
	"is_approved" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "background_checks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" varchar NOT NULL,
	"subject_name" text NOT NULL,
	"subject_identifier" text,
	"check_type" "background_check_type" NOT NULL,
	"status" text DEFAULT 'pending',
	"results" jsonb,
	"risk_score" integer,
	"clearance_level" text,
	"requested_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "bankruptcy_records" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_name" text NOT NULL,
	"case_number" text,
	"filing_date" timestamp,
	"chapter" text,
	"status" text,
	"assets" numeric(12, 2),
	"liabilities" numeric(12, 2),
	"court" text,
	"metadata" jsonb,
	"recorded_at" timestamp DEFAULT now(),
	CONSTRAINT "bankruptcy_records_case_number_unique" UNIQUE("case_number")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" varchar NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"featured_image" text,
	"category" text,
	"tags" jsonb[],
	"is_published" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"view_count" integer DEFAULT 0,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "bot_executions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bot_id" varchar NOT NULL,
	"strategy" "trading_strategy" NOT NULL,
	"status" "bot_execution_status" DEFAULT 'pending',
	"entry_price" numeric(36, 18),
	"exit_price" numeric(36, 18),
	"amount" numeric(36, 18) NOT NULL,
	"profit" numeric(36, 18),
	"fees" numeric(36, 18),
	"slippage" numeric(10, 6),
	"order_id" text,
	"tx_hash" text,
	"reason" text,
	"metadata" jsonb,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "bot_learning_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bot_id" varchar NOT NULL,
	"session_type" text NOT NULL,
	"training_dataset" text,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"status" text DEFAULT 'training',
	"performance_before" jsonb,
	"performance_after" jsonb,
	"improvement_rate" numeric(5, 2)
);
--> statement-breakpoint
CREATE TABLE "bot_marketplace_listings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" varchar NOT NULL,
	"bot_id" varchar,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"price" numeric(12, 2),
	"rental_price_hourly" numeric(12, 2),
	"rental_price_daily" numeric(12, 2),
	"subscription_price_monthly" numeric(12, 2),
	"performance_metrics" jsonb,
	"features" jsonb[],
	"images" jsonb[],
	"status" "bot_listing_status" DEFAULT 'active',
	"total_sales" integer DEFAULT 0,
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bot_performance_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bot_id" varchar NOT NULL,
	"period" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"total_trades" integer DEFAULT 0,
	"winning_trades" integer DEFAULT 0,
	"losing_trades" integer DEFAULT 0,
	"total_profit" numeric(36, 18) DEFAULT '0',
	"total_loss" numeric(36, 18) DEFAULT '0',
	"win_rate" numeric(5, 2) DEFAULT '0',
	"sharpe_ratio" numeric(10, 4),
	"max_drawdown" numeric(10, 4),
	"avg_trade_return" numeric(10, 4),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bot_rentals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"renter_id" varchar NOT NULL,
	"listing_id" varchar NOT NULL,
	"rental_type" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"total_cost" numeric(12, 2) NOT NULL,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bot_reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reviewer_id" varchar NOT NULL,
	"listing_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"performance_rating" integer,
	"support_rating" integer,
	"is_verified_purchase" boolean DEFAULT false,
	"helpful_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bot_skills" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bot_id" varchar NOT NULL,
	"skill_name" text NOT NULL,
	"skill_level" integer DEFAULT 0,
	"category" text,
	"experience_points" integer DEFAULT 0,
	"unlocked_at" timestamp DEFAULT now(),
	"last_used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "bot_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscriber_id" varchar NOT NULL,
	"listing_id" varchar NOT NULL,
	"plan" text NOT NULL,
	"monthly_price" numeric(12, 2) NOT NULL,
	"status" text DEFAULT 'active',
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bot_training_data" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bot_id" varchar NOT NULL,
	"data_type" text NOT NULL,
	"input" jsonb NOT NULL,
	"expected_output" jsonb,
	"actual_output" jsonb,
	"reward" numeric(10, 4),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "broker_accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"provider" "broker_provider" NOT NULL,
	"account_type" text NOT NULL,
	"api_key_encrypted" text NOT NULL,
	"api_secret_encrypted" text NOT NULL,
	"account_id" text,
	"status" "broker_account_status" DEFAULT 'active',
	"buying_power" numeric(36, 18) DEFAULT '0',
	"cash_balance" numeric(36, 18) DEFAULT '0',
	"portfolio_value" numeric(36, 18) DEFAULT '0',
	"last_sync_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "broker_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"broker_account_id" varchar NOT NULL,
	"bot_id" varchar,
	"bot_execution_id" varchar,
	"external_order_id" text,
	"symbol" text NOT NULL,
	"order_type" "broker_order_type" NOT NULL,
	"order_side" "broker_order_side" NOT NULL,
	"time_in_force" "broker_order_time_in_force" DEFAULT 'day',
	"quantity" numeric(36, 8) NOT NULL,
	"limit_price" numeric(36, 8),
	"stop_price" numeric(36, 8),
	"filled_quantity" numeric(36, 8) DEFAULT '0',
	"filled_avg_price" numeric(36, 8),
	"status" "broker_order_status" DEFAULT 'pending',
	"fees" numeric(36, 8),
	"reason" text,
	"metadata" jsonb,
	"submitted_at" timestamp DEFAULT now(),
	"filled_at" timestamp,
	"cancelled_at" timestamp,
	CONSTRAINT "broker_orders_external_order_id_unique" UNIQUE("external_order_id")
);
--> statement-breakpoint
CREATE TABLE "broker_positions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"broker_account_id" varchar NOT NULL,
	"symbol" text NOT NULL,
	"quantity" numeric(36, 8) NOT NULL,
	"average_entry_price" numeric(36, 8) NOT NULL,
	"current_price" numeric(36, 8),
	"market_value" numeric(36, 18),
	"unrealized_pl" numeric(36, 18),
	"unrealized_pl_percent" numeric(10, 4),
	"cost_basis" numeric(36, 18),
	"side" text NOT NULL,
	"metadata" jsonb,
	"last_updated_at" timestamp DEFAULT now(),
	CONSTRAINT "broker_positions_broker_account_id_symbol_unique" UNIQUE("broker_account_id","symbol")
);
--> statement-breakpoint
CREATE TABLE "celebrity_content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"celebrity_id" varchar NOT NULL,
	"content_type" text NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"media_url" text,
	"is_exclusive" boolean DEFAULT false,
	"access_level" text DEFAULT 'public',
	"view_count" integer DEFAULT 0,
	"like_count" integer DEFAULT 0,
	"published_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "celebrity_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"stage_name" text NOT NULL,
	"bio" text,
	"category" text,
	"verification_status" text DEFAULT 'pending',
	"follower_count" integer DEFAULT 0,
	"total_staked" numeric(36, 18) DEFAULT '0',
	"profile_image" text,
	"cover_image" text,
	"social_links" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "celebrity_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "channel_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"attachments" jsonb[],
	"is_pinned" boolean DEFAULT false,
	"is_edited" boolean DEFAULT false,
	"reply_to_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"edited_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "charities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"wallet_address" text NOT NULL,
	"tax_id" text NOT NULL,
	"website" text,
	"category" text NOT NULL,
	"logo_url" text,
	"is_active" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"total_received" numeric(36, 18) DEFAULT '0',
	"donor_count" integer DEFAULT 0,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "charities_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"agent_name" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text NOT NULL,
	"agent_type" text,
	"is_active" boolean DEFAULT true,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"last_message_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "chatbot_personas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"personality" text NOT NULL,
	"expertise" jsonb[],
	"system_prompt" text NOT NULL,
	"avatar_url" text,
	"voice_id" text,
	"is_predefined" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"creator_id" varchar,
	"rating" numeric(3, 2) DEFAULT '0',
	"usage_count" integer DEFAULT 0,
	"price" numeric(12, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversation_context" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar,
	"user_id" varchar,
	"context_type" text NOT NULL,
	"context_key" text NOT NULL,
	"context_value" jsonb NOT NULL,
	"relevance_score" integer DEFAULT 100,
	"pinned_until" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversation_memories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar,
	"user_id" varchar,
	"memory_type" "conversation_memory_type" NOT NULL,
	"memory_key" text NOT NULL,
	"memory_value" jsonb NOT NULL,
	"importance" integer DEFAULT 50,
	"confidence" numeric(5, 2) DEFAULT '100',
	"access_count" integer DEFAULT 0,
	"last_accessed_at" timestamp,
	"expires_at" timestamp,
	"tags" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversation_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"tool_calls" jsonb,
	"tool_results" jsonb,
	"embedding" jsonb,
	"tokens" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversation_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"session_identifier" text NOT NULL,
	"title" text,
	"summary" text,
	"started_at" timestamp DEFAULT now(),
	"last_active_at" timestamp DEFAULT now(),
	"ended_at" timestamp,
	"message_count" integer DEFAULT 0,
	"metadata" jsonb,
	CONSTRAINT "conversation_sessions_session_identifier_unique" UNIQUE("session_identifier")
);
--> statement-breakpoint
CREATE TABLE "conversation_tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar,
	"user_id" varchar NOT NULL,
	"task_description" text NOT NULL,
	"task_status" text DEFAULT 'pending',
	"priority" integer DEFAULT 50,
	"completion_percentage" integer DEFAULT 0,
	"dependencies" jsonb,
	"blockers" jsonb,
	"subtasks" jsonb,
	"files_modified" jsonb,
	"agents_used" jsonb,
	"started_at" timestamp,
	"completed_at" timestamp,
	"estimated_duration" integer,
	"actual_duration" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "credit_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"credit_score" integer,
	"report_data" jsonb,
	"provider" text,
	"report_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crypto_payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"processor" "crypto_processor" NOT NULL,
	"processor_invoice_id" text,
	"amount" numeric(36, 18) NOT NULL,
	"currency" text NOT NULL,
	"fiat_amount" numeric(12, 2),
	"fiat_currency" text DEFAULT 'usd',
	"status" text NOT NULL,
	"payment_url" text,
	"qr_code" text,
	"tx_hash" text,
	"expires_at" timestamp,
	"confirmed_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "crypto_payments_processor_invoice_id_unique" UNIQUE("processor_invoice_id")
);
--> statement-breakpoint
CREATE TABLE "dashboard_widgets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"icon" text,
	"default_config" jsonb,
	"is_system_widget" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "distribution_tracks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"song_id" varchar NOT NULL,
	"platform" "distribution_platform" NOT NULL,
	"platform_track_id" text,
	"status" text DEFAULT 'pending',
	"uploaded_at" timestamp,
	"live_at" timestamp,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "ethereal_elements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"element_type" text NOT NULL,
	"power" integer DEFAULT 0,
	"rarity" text NOT NULL,
	"attributes" jsonb,
	"image_url" text,
	"animation_url" text,
	"total_supply" integer,
	"minted_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "ethereal_elements_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ethereal_ownership" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"element_id" varchar NOT NULL,
	"quantity" integer DEFAULT 1,
	"acquired_at" timestamp DEFAULT now(),
	CONSTRAINT "ethereal_ownership_user_id_element_id_unique" UNIQUE("user_id","element_id")
);
--> statement-breakpoint
CREATE TABLE "exchange_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"order_type" "order_type" NOT NULL,
	"order_side" "order_side" NOT NULL,
	"trading_pair" text NOT NULL,
	"price" numeric(36, 18),
	"amount" numeric(36, 18) NOT NULL,
	"filled" numeric(36, 18) DEFAULT '0',
	"status" "order_status" DEFAULT 'open',
	"total" numeric(36, 18),
	"fees" numeric(36, 18),
	"network" "network" NOT NULL,
	"external_order_id" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "fan_bets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fan_id" varchar NOT NULL,
	"celebrity_id" varchar NOT NULL,
	"bet_type" text NOT NULL,
	"description" text NOT NULL,
	"amount_bet" numeric(36, 18) NOT NULL,
	"odds" numeric(10, 4) NOT NULL,
	"potential_payout" numeric(36, 18),
	"actual_payout" numeric(36, 18),
	"status" text DEFAULT 'pending',
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fan_follows" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fan_id" varchar NOT NULL,
	"celebrity_id" varchar NOT NULL,
	"notifications_enabled" boolean DEFAULT true,
	"followed_at" timestamp DEFAULT now(),
	CONSTRAINT "fan_follows_fan_id_celebrity_id_unique" UNIQUE("fan_id","celebrity_id")
);
--> statement-breakpoint
CREATE TABLE "fan_stakes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fan_id" varchar NOT NULL,
	"celebrity_id" varchar NOT NULL,
	"amount_staked" numeric(36, 18) NOT NULL,
	"currency" text DEFAULT 'USDT',
	"staking_period" integer,
	"expected_return" numeric(10, 4),
	"actual_return" numeric(36, 18),
	"status" text DEFAULT 'active',
	"staked_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "financial_holdings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"asset_type" "financial_asset_type" NOT NULL,
	"symbol" text NOT NULL,
	"quantity" numeric(36, 18) NOT NULL,
	"average_purchase_price" numeric(36, 18) NOT NULL,
	"current_value" numeric(36, 18),
	"total_invested" numeric(36, 18),
	"profit_loss" numeric(36, 18),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "financial_holdings_user_id_asset_type_symbol_unique" UNIQUE("user_id","asset_type","symbol")
);
--> statement-breakpoint
CREATE TABLE "financial_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"asset_type" "financial_asset_type" NOT NULL,
	"symbol" text NOT NULL,
	"order_type" "financial_order_type" NOT NULL,
	"quantity" numeric(36, 18) NOT NULL,
	"price" numeric(36, 18) NOT NULL,
	"total_value" numeric(36, 18) NOT NULL,
	"status" "financial_order_status" DEFAULT 'pending',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"executed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "forum_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"order" integer DEFAULT 0,
	"is_vip_only" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forum_channels" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" varchar NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'text',
	"topic" text,
	"is_private" boolean DEFAULT false,
	"required_role" text,
	"position" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forum_replies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forum_servers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"owner_id" varchar NOT NULL,
	"is_public" boolean DEFAULT false,
	"member_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forum_threads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"is_pinned" boolean DEFAULT false,
	"is_locked" boolean DEFAULT false,
	"view_count" integer DEFAULT 0,
	"reply_count" integer DEFAULT 0,
	"last_reply_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guide_steps" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" varchar NOT NULL,
	"step_number" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"image_url" text,
	"video_url" text,
	"code_snippet" text,
	"estimated_time" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "help_articles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"difficulty" text DEFAULT 'beginner',
	"related_articles" jsonb[],
	"tags" jsonb[],
	"video_url" text,
	"is_published" boolean DEFAULT true,
	"view_count" integer DEFAULT 0,
	"helpful_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "help_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "hit_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"session_id" varchar,
	"event_type" text NOT NULL,
	"event_category" text,
	"event_label" text,
	"event_value" text,
	"page" text,
	"referrer" text,
	"user_agent" text,
	"ip_address" text,
	"country" text,
	"city" text,
	"device" text,
	"browser" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "individual_assets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"asset_type" "asset_type" NOT NULL,
	"market_value" numeric(36, 18) NOT NULL,
	"purchase_price" numeric(36, 18),
	"quantity" numeric(36, 8) DEFAULT '1',
	"metadata" jsonb,
	"image_url" text,
	"certificate_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "jesus_cartel_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"date" timestamp NOT NULL,
	"venue" text NOT NULL,
	"location" text NOT NULL,
	"ticket_url" text,
	"image_url" text,
	"artist_lineup" text[],
	"ticket_price" numeric(10, 2),
	"capacity" integer,
	"attendee_count" integer DEFAULT 0,
	"is_featured" boolean DEFAULT false,
	"status" text DEFAULT 'upcoming',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "jesus_cartel_releases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"artist" text NOT NULL,
	"album_art" text NOT NULL,
	"stream_url" text NOT NULL,
	"release_date" timestamp NOT NULL,
	"genre" text,
	"duration" integer,
	"is_featured" boolean DEFAULT false,
	"stream_count" integer DEFAULT 0,
	"like_count" integer DEFAULT 0,
	"nft_id" varchar,
	"token_id" varchar,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "jesus_cartel_streams" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"release_id" varchar NOT NULL,
	"user_id" varchar,
	"ip_address" text,
	"duration" integer,
	"completion_rate" numeric(5, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "joint_accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_name" text NOT NULL,
	"owner_ids" jsonb[] NOT NULL,
	"permissions" jsonb,
	"total_balance" numeric(36, 18) DEFAULT '0',
	"requires_multi_sig" boolean DEFAULT false,
	"signatures_required" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kyc_records" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"sumsub_applicant_id" text,
	"verification_status" "kyc_status" DEFAULT 'pending',
	"document_type" text,
	"review_result" jsonb,
	"rejection_reason" text,
	"submitted_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp,
	CONSTRAINT "kyc_records_sumsub_applicant_id_unique" UNIQUE("sumsub_applicant_id")
);
--> statement-breakpoint
CREATE TABLE "liquidity_pools" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"pool_name" text NOT NULL,
	"token_a" text NOT NULL,
	"token_b" text NOT NULL,
	"reserve_a" numeric(36, 18) DEFAULT '0',
	"reserve_b" numeric(36, 18) DEFAULT '0',
	"lp_tokens" numeric(36, 18) DEFAULT '0',
	"apy" numeric(10, 4),
	"network" "network" NOT NULL,
	"contract_address" text NOT NULL,
	"total_value_locked" numeric(36, 18),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "metal_inventory" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metal_type" "metal_type" NOT NULL,
	"weight" numeric(12, 4) NOT NULL,
	"purity" numeric(5, 2) DEFAULT '99.99',
	"price_per_ounce" numeric(12, 2) NOT NULL,
	"total_price" numeric(12, 2),
	"supplier" text,
	"vault_location" text,
	"certificate_url" text,
	"is_available" boolean DEFAULT true,
	"image_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "metal_ownership" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"location" "ownership_location" DEFAULT 'vault',
	"purchase_price" numeric(12, 2) NOT NULL,
	"spot_price_at_purchase" numeric(12, 2) NOT NULL,
	"crypto_payment_tx" text,
	"certificate_url" text,
	"delivery_address" text,
	"tracking_number" text,
	"purchased_at" timestamp DEFAULT now(),
	"delivered_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "metal_products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metal" "metal_type" NOT NULL,
	"weight" numeric(12, 4) NOT NULL,
	"form" "metal_form" NOT NULL,
	"product_name" text NOT NULL,
	"description" text,
	"image_url" text,
	"premium" numeric(5, 2) DEFAULT '5.00',
	"in_stock" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "metal_trades" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"inventory_id" varchar NOT NULL,
	"trade_type" text NOT NULL,
	"weight" numeric(12, 4) NOT NULL,
	"price_per_ounce" numeric(12, 2) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"status" "metal_trade_status" DEFAULT 'pending',
	"payment_method" text,
	"delivery_address" text,
	"tracking_number" text,
	"created_at" timestamp DEFAULT now(),
	"delivered_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "mev_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"event_type" text NOT NULL,
	"network" "network" NOT NULL,
	"tx_hash" text,
	"target_tx_hash" text,
	"profit_amount" numeric(36, 18),
	"risk_score" numeric(5, 2),
	"is_protected" boolean DEFAULT false,
	"protection_method" text,
	"metadata" jsonb,
	"detected_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mixing_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"input_address" text NOT NULL,
	"output_address" text NOT NULL,
	"amount" numeric(36, 18) NOT NULL,
	"currency" text NOT NULL,
	"mixing_fee" numeric(36, 18),
	"delay_minutes" integer DEFAULT 30,
	"status" "mixing_status" DEFAULT 'pending',
	"input_tx_hash" text,
	"output_tx_hash" text,
	"mixing_rounds" integer DEFAULT 3,
	"privacy_score" numeric(5, 2),
	"network" "network" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "nft_collections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"description" text,
	"contract_address" text NOT NULL,
	"network" "network" NOT NULL,
	"collection_type" text NOT NULL,
	"total_supply" integer,
	"max_supply" integer,
	"floor_price" numeric(36, 18),
	"volume_traded" numeric(36, 18) DEFAULT '0',
	"royalty_bps" integer DEFAULT 0,
	"royalty_recipient" text,
	"base_uri" text,
	"cover_image" text,
	"deploy_tx_hash" text,
	"is_verified" boolean DEFAULT false,
	"is_public" boolean DEFAULT true,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "nft_collections_contract_address_unique" UNIQUE("contract_address")
);
--> statement-breakpoint
CREATE TABLE "nft_mints" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" varchar,
	"wallet_id" varchar NOT NULL,
	"nft_id" varchar,
	"token_id" text NOT NULL,
	"recipient_address" text NOT NULL,
	"mint_type" text NOT NULL,
	"quantity" integer DEFAULT 1,
	"mint_price" numeric(36, 18),
	"gas_used" text,
	"mint_tx_hash" text,
	"metadata_url" text,
	"rarity_score" numeric(10, 4),
	"rarity_rank" integer,
	"status" text DEFAULT 'pending',
	"network" "network" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"confirmed_at" timestamp,
	CONSTRAINT "nft_mints_mint_tx_hash_unique" UNIQUE("mint_tx_hash")
);
--> statement-breakpoint
CREATE TABLE "nfts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" varchar NOT NULL,
	"contract_address" text NOT NULL,
	"token_id" text NOT NULL,
	"network" "network" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"metadata_url" text,
	"attributes" jsonb,
	"mint_tx_hash" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "p2p_chat_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"sender_id" varchar NOT NULL,
	"message" text NOT NULL,
	"attachments" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "p2p_disputes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"raised_by" varchar NOT NULL,
	"reason" text NOT NULL,
	"evidence" jsonb,
	"status" "p2p_dispute_status" DEFAULT 'open',
	"resolution" text,
	"resolved_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "p2p_offers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" "p2p_offer_type" NOT NULL,
	"cryptocurrency" text NOT NULL,
	"amount" numeric(36, 18) NOT NULL,
	"fiat_currency" text NOT NULL,
	"price_per_unit" numeric(12, 2) NOT NULL,
	"payment_methods" text[],
	"min_amount" numeric(36, 18),
	"max_amount" numeric(36, 18),
	"time_limit" integer DEFAULT 30,
	"terms" text,
	"status" "p2p_offer_status" DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "p2p_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" varchar NOT NULL,
	"buyer_id" varchar NOT NULL,
	"seller_id" varchar NOT NULL,
	"amount" numeric(36, 18) NOT NULL,
	"fiat_amount" numeric(12, 2) NOT NULL,
	"payment_method" text NOT NULL,
	"status" "p2p_order_status" DEFAULT 'created',
	"escrow_tx_hash" text,
	"release_tx_hash" text,
	"dispute_reason" text,
	"created_at" timestamp DEFAULT now(),
	"paid_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "p2p_payment_methods" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"details" jsonb,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "p2p_reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"reviewer_id" varchar NOT NULL,
	"reviewed_user_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"stripe_payment_id" text,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'usd',
	"status" text NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_stripe_payment_id_unique" UNIQUE("stripe_payment_id")
);
--> statement-breakpoint
CREATE TABLE "persona_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"persona_id" varchar NOT NULL,
	"session_id" varchar,
	"assignment_type" text DEFAULT 'manual',
	"is_active" boolean DEFAULT true,
	"assigned_at" timestamp DEFAULT now(),
	CONSTRAINT "persona_assignments_user_id_session_id_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "persona_training" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"persona_id" varchar NOT NULL,
	"training_dataset" text,
	"conversation_samples" jsonb[],
	"feedback_data" jsonb,
	"performance_metrics" jsonb,
	"trained_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pool_distributions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pool_id" varchar NOT NULL,
	"distribution_amount" numeric(36, 18) NOT NULL,
	"distribution_type" text NOT NULL,
	"participants" jsonb,
	"status" text DEFAULT 'pending',
	"distributed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pool_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pool_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"amount_staked" numeric(36, 18) NOT NULL,
	"share_percentage" numeric(10, 6),
	"total_earned" numeric(36, 18) DEFAULT '0',
	"joined_at" timestamp DEFAULT now(),
	"last_claim_at" timestamp,
	CONSTRAINT "pool_participants_pool_id_user_id_unique" UNIQUE("pool_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "prayer_trade_correlations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prayer_id" varchar NOT NULL,
	"trade_id" varchar,
	"bot_execution_id" varchar,
	"outcome" text,
	"profit_loss" numeric(36, 18),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"prayer_text" text NOT NULL,
	"category" "prayer_category" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prediction_markets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"celebrity_id" varchar,
	"question" text NOT NULL,
	"description" text,
	"outcomes" jsonb[] NOT NULL,
	"total_pool" numeric(36, 18) DEFAULT '0',
	"resolution_criteria" text NOT NULL,
	"resolved_outcome" text,
	"status" text DEFAULT 'open',
	"closes_at" timestamp NOT NULL,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "private_session_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" varchar NOT NULL,
	"target_user_id" varchar NOT NULL,
	"session_type" text NOT NULL,
	"duration" integer,
	"price" numeric(12, 2) NOT NULL,
	"status" text DEFAULT 'pending',
	"admin_approved_by" varchar,
	"session_start_time" timestamp,
	"session_end_time" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "public_directory" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_name" text NOT NULL,
	"description" text,
	"category" text,
	"contact_info" jsonb,
	"verification_status" text DEFAULT 'unverified',
	"metadata" jsonb,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quantum_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"algorithm" text NOT NULL,
	"parameters" jsonb,
	"qubits_used" integer,
	"status" text DEFAULT 'queued',
	"result" jsonb,
	"ibm_job_id" text,
	"execution_time" integer,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "scriptures" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"verse" text NOT NULL,
	"reference" text NOT NULL,
	"category" "scripture_category" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "security_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"agent_id" varchar,
	"event_type" text NOT NULL,
	"threat_level" "threat_level" NOT NULL,
	"description" text NOT NULL,
	"ip_address" text,
	"metadata" jsonb,
	"is_resolved" boolean DEFAULT false,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "smart_contracts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"contract_type" "contract_type" NOT NULL,
	"contract_address" text,
	"network" "network" NOT NULL,
	"abi" jsonb,
	"bytecode" text,
	"source_code" text,
	"compiler_version" text,
	"optimization_enabled" boolean DEFAULT true,
	"optimization_runs" integer DEFAULT 200,
	"constructor_args" jsonb,
	"deploy_tx_hash" text,
	"deployed_by" text,
	"gas_used" text,
	"status" "contract_status" DEFAULT 'deploying',
	"is_verified" boolean DEFAULT false,
	"verification_tx_hash" text,
	"etherscan_url" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"deployed_at" timestamp,
	"verified_at" timestamp,
	CONSTRAINT "smart_contracts_contract_address_unique" UNIQUE("contract_address"),
	CONSTRAINT "smart_contracts_deploy_tx_hash_unique" UNIQUE("deploy_tx_hash")
);
--> statement-breakpoint
CREATE TABLE "songs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text NOT NULL,
	"artist" text NOT NULL,
	"album_art" text,
	"audio_file" text,
	"nft_id" varchar,
	"token_id" varchar,
	"metadata" jsonb,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spectrum_earnings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"amount" numeric(36, 18) NOT NULL,
	"apy" numeric(5, 2) NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"distributed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spectrum_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" "spectrum_tier" NOT NULL,
	"name" text NOT NULL,
	"minimum_stake" numeric(36, 18) NOT NULL,
	"apy" numeric(5, 2) NOT NULL,
	"max_allocation" numeric(36, 18),
	"benefits" text[] NOT NULL,
	"features" jsonb NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "spectrum_plans_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
CREATE TABLE "staking_pools" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pool_name" text NOT NULL,
	"description" text,
	"creator_id" varchar NOT NULL,
	"pool_type" text NOT NULL,
	"target_asset" text,
	"min_stake" numeric(36, 18) NOT NULL,
	"max_stake" numeric(36, 18),
	"total_staked" numeric(36, 18) DEFAULT '0',
	"apy" numeric(10, 4),
	"participant_count" integer DEFAULT 0,
	"distribution_schedule" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"end_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "streaming_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"track_id" varchar NOT NULL,
	"platform" "distribution_platform" NOT NULL,
	"plays" integer DEFAULT 0,
	"revenue" numeric(12, 4) DEFAULT '0',
	"listeners" integer DEFAULT 0,
	"country" text,
	"date_recorded" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tithing_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"charity_id" varchar NOT NULL,
	"enabled" boolean DEFAULT true,
	"auto_execute" boolean DEFAULT true,
	"min_profit_threshold" numeric(36, 18) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tithing_configs_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "tithing_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"charity_id" varchar NOT NULL,
	"amount" numeric(36, 18) NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"trade_id" varchar,
	"status" "tithing_status" DEFAULT 'pending',
	"tx_hash" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" varchar NOT NULL,
	"contract_address" text NOT NULL,
	"network" "network" NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"decimals" integer DEFAULT 18,
	"total_supply" numeric(36, 18),
	"deploy_tx_hash" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tokens_contract_address_unique" UNIQUE("contract_address")
);
--> statement-breakpoint
CREATE TABLE "trading_bots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"strategy" "trading_strategy" NOT NULL,
	"exchange" text NOT NULL,
	"trading_pair" text NOT NULL,
	"is_active" boolean DEFAULT false,
	"config" jsonb NOT NULL,
	"risk_limit" numeric(12, 2),
	"daily_limit" numeric(12, 2),
	"total_profit" numeric(36, 18) DEFAULT '0',
	"total_loss" numeric(36, 18) DEFAULT '0',
	"total_trades" integer DEFAULT 0,
	"win_rate" numeric(5, 2) DEFAULT '0',
	"last_execution_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trading_strategies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"strategy_type" text NOT NULL,
	"parameters" jsonb NOT NULL,
	"backtest_results" jsonb,
	"live_performance" jsonb,
	"risk_score" integer,
	"is_public" boolean DEFAULT false,
	"creator_id" varchar,
	"usage_count" integer DEFAULT 0,
	"rating" numeric(3, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trading_system_memory" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bot_id" varchar NOT NULL,
	"memory_type" text NOT NULL,
	"memory_key" text NOT NULL,
	"memory_value" jsonb NOT NULL,
	"confidence" numeric(5, 2) DEFAULT '0',
	"usage_count" integer DEFAULT 0,
	"success_rate" numeric(5, 2) DEFAULT '0',
	"last_accessed" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" varchar NOT NULL,
	"tx_hash" text,
	"network" "network" NOT NULL,
	"type" text NOT NULL,
	"from" text NOT NULL,
	"to" text NOT NULL,
	"value" numeric(36, 18),
	"gas_used" text,
	"status" "transaction_status" DEFAULT 'pending',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"confirmed_at" timestamp,
	CONSTRAINT "transactions_tx_hash_unique" UNIQUE("tx_hash")
);
--> statement-breakpoint
CREATE TABLE "user_dashboard_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"layout" jsonb NOT NULL,
	"theme" text DEFAULT 'dark',
	"preferences" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_dashboard_configs_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_journeys" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"session_id" varchar NOT NULL,
	"path" jsonb[] NOT NULL,
	"events" jsonb[],
	"conversion_goal" text,
	"converted" boolean DEFAULT false,
	"duration" integer,
	"started_at" timestamp DEFAULT now(),
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_prayer_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"enable_pre_trade" boolean DEFAULT true,
	"enable_post_trade" boolean DEFAULT true,
	"preferred_time" text,
	"categories" text[],
	"daily_reminder" boolean DEFAULT false,
	"meditation_duration" integer DEFAULT 5,
	"auto_correlate" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_prayer_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_spectrum_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"tier" "spectrum_tier" NOT NULL,
	"staked_amount" numeric(36, 18) NOT NULL,
	"current_apy" numeric(5, 2) NOT NULL,
	"status" "spectrum_subscription_status" DEFAULT 'active',
	"total_earned" numeric(36, 18) DEFAULT '0',
	"last_earnings_update" timestamp DEFAULT now(),
	"subscribed_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"cancelled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_widget_preferences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"widget_id" varchar NOT NULL,
	"position" jsonb NOT NULL,
	"config" jsonb,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_widget_preferences_user_id_widget_id_unique" UNIQUE("user_id","widget_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"kyc_status" "kyc_status" DEFAULT 'pending',
	"kyc_user_id" text,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wallet_connect_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"wallet_address" text NOT NULL,
	"wallet_type" text NOT NULL,
	"chain_id" integer NOT NULL,
	"network" text NOT NULL,
	"status" "wallet_connect_session_status" DEFAULT 'active',
	"session_data" jsonb,
	"last_used_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"address" text NOT NULL,
	"network" "network" NOT NULL,
	"private_key_encrypted" text NOT NULL,
	"is_main" boolean DEFAULT false,
	"balance" numeric(36, 18) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "wallets_address_unique" UNIQUE("address")
);
--> statement-breakpoint
CREATE TABLE "youtube_videos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"song_id" varchar,
	"video_id" text,
	"title" text NOT NULL,
	"description" text,
	"thumbnail_url" text,
	"video_url" text,
	"view_count" integer DEFAULT 0,
	"like_count" integer DEFAULT 0,
	"comment_count" integer DEFAULT 0,
	"uploaded_at" timestamp DEFAULT now(),
	"published_at" timestamp,
	CONSTRAINT "youtube_videos_video_id_unique" UNIQUE("video_id")
);
--> statement-breakpoint
ALTER TABLE "account_merges" ADD CONSTRAINT "account_merges_primary_user_id_users_id_fk" FOREIGN KEY ("primary_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_id_admin_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_broadcasts" ADD CONSTRAINT "admin_broadcasts_admin_id_admin_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_logs" ADD CONSTRAINT "agent_logs_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "armor_wallets" ADD CONSTRAINT "armor_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_article_id_blog_posts_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."blog_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_parent_comment_id_article_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."article_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_checks" ADD CONSTRAINT "background_checks_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_executions" ADD CONSTRAINT "bot_executions_bot_id_trading_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."trading_bots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_learning_sessions" ADD CONSTRAINT "bot_learning_sessions_bot_id_trading_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."trading_bots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_marketplace_listings" ADD CONSTRAINT "bot_marketplace_listings_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_marketplace_listings" ADD CONSTRAINT "bot_marketplace_listings_bot_id_trading_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."trading_bots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_performance_metrics" ADD CONSTRAINT "bot_performance_metrics_bot_id_trading_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."trading_bots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_rentals" ADD CONSTRAINT "bot_rentals_renter_id_users_id_fk" FOREIGN KEY ("renter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_rentals" ADD CONSTRAINT "bot_rentals_listing_id_bot_marketplace_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."bot_marketplace_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_reviews" ADD CONSTRAINT "bot_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_reviews" ADD CONSTRAINT "bot_reviews_listing_id_bot_marketplace_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."bot_marketplace_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_skills" ADD CONSTRAINT "bot_skills_bot_id_trading_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."trading_bots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_subscriptions" ADD CONSTRAINT "bot_subscriptions_subscriber_id_users_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_subscriptions" ADD CONSTRAINT "bot_subscriptions_listing_id_bot_marketplace_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."bot_marketplace_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_training_data" ADD CONSTRAINT "bot_training_data_bot_id_trading_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."trading_bots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broker_accounts" ADD CONSTRAINT "broker_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broker_orders" ADD CONSTRAINT "broker_orders_broker_account_id_broker_accounts_id_fk" FOREIGN KEY ("broker_account_id") REFERENCES "public"."broker_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broker_orders" ADD CONSTRAINT "broker_orders_bot_id_trading_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."trading_bots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broker_orders" ADD CONSTRAINT "broker_orders_bot_execution_id_bot_executions_id_fk" FOREIGN KEY ("bot_execution_id") REFERENCES "public"."bot_executions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broker_positions" ADD CONSTRAINT "broker_positions_broker_account_id_broker_accounts_id_fk" FOREIGN KEY ("broker_account_id") REFERENCES "public"."broker_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "celebrity_content" ADD CONSTRAINT "celebrity_content_celebrity_id_celebrity_profiles_id_fk" FOREIGN KEY ("celebrity_id") REFERENCES "public"."celebrity_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "celebrity_profiles" ADD CONSTRAINT "celebrity_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_messages" ADD CONSTRAINT "channel_messages_channel_id_forum_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."forum_channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_messages" ADD CONSTRAINT "channel_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatbot_personas" ADD CONSTRAINT "chatbot_personas_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_context" ADD CONSTRAINT "conversation_context_session_id_conversation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."conversation_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_context" ADD CONSTRAINT "conversation_context_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_memories" ADD CONSTRAINT "conversation_memories_session_id_conversation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."conversation_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_memories" ADD CONSTRAINT "conversation_memories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_session_id_conversation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."conversation_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_sessions" ADD CONSTRAINT "conversation_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_tasks" ADD CONSTRAINT "conversation_tasks_session_id_conversation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."conversation_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_tasks" ADD CONSTRAINT "conversation_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_reports" ADD CONSTRAINT "credit_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crypto_payments" ADD CONSTRAINT "crypto_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distribution_tracks" ADD CONSTRAINT "distribution_tracks_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ethereal_ownership" ADD CONSTRAINT "ethereal_ownership_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ethereal_ownership" ADD CONSTRAINT "ethereal_ownership_element_id_ethereal_elements_id_fk" FOREIGN KEY ("element_id") REFERENCES "public"."ethereal_elements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchange_orders" ADD CONSTRAINT "exchange_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fan_bets" ADD CONSTRAINT "fan_bets_fan_id_users_id_fk" FOREIGN KEY ("fan_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fan_bets" ADD CONSTRAINT "fan_bets_celebrity_id_celebrity_profiles_id_fk" FOREIGN KEY ("celebrity_id") REFERENCES "public"."celebrity_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fan_follows" ADD CONSTRAINT "fan_follows_fan_id_users_id_fk" FOREIGN KEY ("fan_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fan_follows" ADD CONSTRAINT "fan_follows_celebrity_id_celebrity_profiles_id_fk" FOREIGN KEY ("celebrity_id") REFERENCES "public"."celebrity_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fan_stakes" ADD CONSTRAINT "fan_stakes_fan_id_users_id_fk" FOREIGN KEY ("fan_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fan_stakes" ADD CONSTRAINT "fan_stakes_celebrity_id_celebrity_profiles_id_fk" FOREIGN KEY ("celebrity_id") REFERENCES "public"."celebrity_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_holdings" ADD CONSTRAINT "financial_holdings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_orders" ADD CONSTRAINT "financial_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_channels" ADD CONSTRAINT "forum_channels_server_id_forum_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."forum_servers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_thread_id_forum_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."forum_threads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_servers" ADD CONSTRAINT "forum_servers_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_category_id_forum_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."forum_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_steps" ADD CONSTRAINT "guide_steps_article_id_help_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."help_articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hit_analytics" ADD CONSTRAINT "hit_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "individual_assets" ADD CONSTRAINT "individual_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jesus_cartel_releases" ADD CONSTRAINT "jesus_cartel_releases_nft_id_nfts_id_fk" FOREIGN KEY ("nft_id") REFERENCES "public"."nfts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jesus_cartel_releases" ADD CONSTRAINT "jesus_cartel_releases_token_id_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jesus_cartel_streams" ADD CONSTRAINT "jesus_cartel_streams_release_id_jesus_cartel_releases_id_fk" FOREIGN KEY ("release_id") REFERENCES "public"."jesus_cartel_releases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jesus_cartel_streams" ADD CONSTRAINT "jesus_cartel_streams_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_records" ADD CONSTRAINT "kyc_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liquidity_pools" ADD CONSTRAINT "liquidity_pools_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metal_ownership" ADD CONSTRAINT "metal_ownership_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metal_ownership" ADD CONSTRAINT "metal_ownership_product_id_metal_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."metal_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metal_trades" ADD CONSTRAINT "metal_trades_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metal_trades" ADD CONSTRAINT "metal_trades_inventory_id_metal_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."metal_inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mev_events" ADD CONSTRAINT "mev_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mixing_requests" ADD CONSTRAINT "mixing_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_collections" ADD CONSTRAINT "nft_collections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_mints" ADD CONSTRAINT "nft_mints_collection_id_nft_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."nft_collections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_mints" ADD CONSTRAINT "nft_mints_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_mints" ADD CONSTRAINT "nft_mints_nft_id_nfts_id_fk" FOREIGN KEY ("nft_id") REFERENCES "public"."nfts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nfts" ADD CONSTRAINT "nfts_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_chat_messages" ADD CONSTRAINT "p2p_chat_messages_order_id_p2p_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."p2p_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_chat_messages" ADD CONSTRAINT "p2p_chat_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_disputes" ADD CONSTRAINT "p2p_disputes_order_id_p2p_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."p2p_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_disputes" ADD CONSTRAINT "p2p_disputes_raised_by_users_id_fk" FOREIGN KEY ("raised_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_disputes" ADD CONSTRAINT "p2p_disputes_resolved_by_admin_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_offers" ADD CONSTRAINT "p2p_offers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_orders" ADD CONSTRAINT "p2p_orders_offer_id_p2p_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."p2p_offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_orders" ADD CONSTRAINT "p2p_orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_orders" ADD CONSTRAINT "p2p_orders_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_payment_methods" ADD CONSTRAINT "p2p_payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_reviews" ADD CONSTRAINT "p2p_reviews_order_id_p2p_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."p2p_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_reviews" ADD CONSTRAINT "p2p_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_reviews" ADD CONSTRAINT "p2p_reviews_reviewed_user_id_users_id_fk" FOREIGN KEY ("reviewed_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona_assignments" ADD CONSTRAINT "persona_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona_assignments" ADD CONSTRAINT "persona_assignments_persona_id_chatbot_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."chatbot_personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona_assignments" ADD CONSTRAINT "persona_assignments_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona_training" ADD CONSTRAINT "persona_training_persona_id_chatbot_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."chatbot_personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pool_distributions" ADD CONSTRAINT "pool_distributions_pool_id_staking_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."staking_pools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pool_participants" ADD CONSTRAINT "pool_participants_pool_id_staking_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."staking_pools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pool_participants" ADD CONSTRAINT "pool_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_trade_correlations" ADD CONSTRAINT "prayer_trade_correlations_prayer_id_prayers_id_fk" FOREIGN KEY ("prayer_id") REFERENCES "public"."prayers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_trade_correlations" ADD CONSTRAINT "prayer_trade_correlations_bot_execution_id_bot_executions_id_fk" FOREIGN KEY ("bot_execution_id") REFERENCES "public"."bot_executions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayers" ADD CONSTRAINT "prayers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_markets" ADD CONSTRAINT "prediction_markets_celebrity_id_celebrity_profiles_id_fk" FOREIGN KEY ("celebrity_id") REFERENCES "public"."celebrity_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "private_session_requests" ADD CONSTRAINT "private_session_requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "private_session_requests" ADD CONSTRAINT "private_session_requests_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "private_session_requests" ADD CONSTRAINT "private_session_requests_admin_approved_by_admin_users_id_fk" FOREIGN KEY ("admin_approved_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quantum_jobs" ADD CONSTRAINT "quantum_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_contracts" ADD CONSTRAINT "smart_contracts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_nft_id_nfts_id_fk" FOREIGN KEY ("nft_id") REFERENCES "public"."nfts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_token_id_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spectrum_earnings" ADD CONSTRAINT "spectrum_earnings_subscription_id_user_spectrum_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."user_spectrum_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spectrum_earnings" ADD CONSTRAINT "spectrum_earnings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staking_pools" ADD CONSTRAINT "staking_pools_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaming_analytics" ADD CONSTRAINT "streaming_analytics_track_id_distribution_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."distribution_tracks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tithing_configs" ADD CONSTRAINT "tithing_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tithing_configs" ADD CONSTRAINT "tithing_configs_charity_id_charities_id_fk" FOREIGN KEY ("charity_id") REFERENCES "public"."charities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tithing_history" ADD CONSTRAINT "tithing_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tithing_history" ADD CONSTRAINT "tithing_history_charity_id_charities_id_fk" FOREIGN KEY ("charity_id") REFERENCES "public"."charities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tithing_history" ADD CONSTRAINT "tithing_history_trade_id_bot_executions_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."bot_executions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_bots" ADD CONSTRAINT "trading_bots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_strategies" ADD CONSTRAINT "trading_strategies_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_system_memory" ADD CONSTRAINT "trading_system_memory_bot_id_trading_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."trading_bots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_dashboard_configs" ADD CONSTRAINT "user_dashboard_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_journeys" ADD CONSTRAINT "user_journeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_prayer_settings" ADD CONSTRAINT "user_prayer_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_spectrum_subscriptions" ADD CONSTRAINT "user_spectrum_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_spectrum_subscriptions" ADD CONSTRAINT "user_spectrum_subscriptions_plan_id_spectrum_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."spectrum_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_widget_preferences" ADD CONSTRAINT "user_widget_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_widget_preferences" ADD CONSTRAINT "user_widget_preferences_widget_id_dashboard_widgets_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."dashboard_widgets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_connect_sessions" ADD CONSTRAINT "wallet_connect_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "youtube_videos" ADD CONSTRAINT "youtube_videos_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");