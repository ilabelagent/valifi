# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Valifi Kingdom** is a divine fintech platform combining multi-agent AI orchestration with real blockchain integration, live payment processing, and financial services. The platform features 63+ autonomous AI agents powered by LangGraph, real blockchain operations across 5 networks (Ethereum, Polygon, BSC, Arbitrum, Optimism), live payment processing through 9+ processors, and comprehensive financial services (stocks, bonds, forex, metals).

**Tech Stack:**
- **Backend:** Express.js + TypeScript, PostgreSQL (Neon), Drizzle ORM, LangGraph for agent orchestration
- **Frontend:** React 18 + TypeScript, Vite, TailwindCSS, Shadcn/ui, Wouter routing, TanStack Query
- **Blockchain:** ethers.js v6 for multi-chain Web3 operations
- **Real-Time:** Socket.IO for WebSocket communication
- **Payments:** Stripe, PayPal, Plaid (fiat); BitPay, Binance Pay, direct blockchain (crypto)

## Development Commands

**Start Development Server:**
```bash
npm run dev
```
Runs both frontend (Vite) and backend (tsx with watch mode) on port 5000.

**Type Checking:**
```bash
npm run check
```
Runs TypeScript compiler in check mode without emitting files.

**Database Operations:**
```bash
npm run db:push
```
Push Drizzle schema changes to PostgreSQL database. Schema file: `shared/schema.ts` (3128 lines, 50+ tables).

**Build for Production:**
```bash
npm run build
```
Builds frontend (Vite) and bundles backend (esbuild) to `dist/` directory.

**Start Production Server:**
```bash
npm start
```
Runs the compiled production server from `dist/index.js`.

## Architecture Overview

### Multi-Agent System (LangGraph)

The platform uses **LangGraph** for stateful multi-agent orchestration. All 63+ agents operate in two modes:

**Local Mode:** Direct bot execution for simple tasks
```typescript
const result = await botStocks.getQuote('AAPL');
```

**Parallel Agentic Mode:** Multi-agent orchestration for complex workflows
```typescript
const result = await agentOrchestrator.execute(
  "Analyze portfolio and execute trades",
  "auto" // Router determines best agent(s)
);
```

**Agent Categories:**
- **Core Agents (11):** orchestrator, blockchain, web3, payment, kyc, security, publishing, quantum, analytics, monitoring, guardian_angel
- **Financial Services (13):** 401k, IRA, pension, bonds, stocks, options, forex, metals, commodities, mutual funds, REIT, crypto derivatives, portfolio
- **Trading & DeFi (8):** AMM, liquidity provider, DeFi, bridge, lending, gas optimizer, mining, advanced trading
- **Wallet & Security (5):** HD wallet, hardware wallet, multisig, seed management, privacy
- **Platform Services (15):** admin control, dashboard, contact manager, communication, mail, translation, education, onboarding, VIP desk, enterprise, escrow, advanced services, innovative, address book, platform
- **Analytics (6):** portfolio analytics, transaction history, divine oracle, word bot, cyberlab, banking
- **NFT & Collectibles (3):** NFT minting, collectibles, smart contract
- **Community (2):** community exchange, multichain

**Key Files:**
- `server/agentOrchestrator.ts` - LangGraph state machine and routing logic
- `server/financialServicesBot.ts` - Financial service agents
- `server/advancedTradingBot.ts` - Trading and DeFi agents
- `server/walletSecurityBot.ts` - Wallet and security agents
- `server/platformServicesBot.ts` - Platform service agents
- `server/analyticsBot.ts` - Analytics agents
- `server/nftBot.ts` - NFT agents
- `server/communityBot.ts` - Community agents

### Persistent Learning System

Bots learn and improve continuously through:
- `server/botLearningService.ts` - Learning loop with training data recording
- **Database tables:** `bot_learning_sessions`, `bot_training_data`, `bot_skills`, `trading_system_memory`
- **Skill progression:** 10 levels (0-10), exponential XP requirements
- **Memory bank:** Patterns stored with confidence scores and success rates

After every agent execution, the system logs training data, updates memory, and progresses skills based on success/failure.

### Database Schema (50+ Tables, 3128 lines)

**Location:** `shared/schema.ts`

**Core Design Patterns:**
- Schema-first approach with Drizzle ORM
- Composite unique constraints on join tables prevent duplicate relationships
- Foreign key relationships with cascade rules
- Timestamp tracking (createdAt, updatedAt) for audit trails
- Status enums for workflow state management
- JSONB columns for flexible schemas (kingdomFeaturesEnabled, metadata)

**Major Table Groups:**
- **User Management:** users, sessions, user_dashboard_configs, user_widget_preferences
- **Blockchain:** wallets, transactions, nfts, tokens, smart_contracts, wallet_connect_sessions
- **Trading & Bots:** tradingBots, bot_learning_sessions, bot_training_data, bot_skills, trading_system_memory, trades, portfolios
- **Financial Services:** financialAccounts, payments, cryptoPayments
- **P2P Trading (6 tables):** p2pOffers, p2pOrders, p2pPaymentMethods, p2pChatMessages, p2pDisputes, p2pReviews
- **Celebrity Platform (6 tables):** celebrityProfiles, celebrityFollows, celebrityStakes, celebrityBets, celebrityPredictions, celebrityContent
- **Admin:** adminUsers, adminAuditLogs, adminBroadcasts, agents, agent_logs
- **Kingdom Features:** individualAssets, etherealElements, etherealOwnership, spectrum investment plans

**Database Configuration:** `drizzle.config.ts` points to `shared/schema.ts` with migrations in `./migrations`.

### API Routes (100+ endpoints)

**Location:** `server/routes.ts` (222k+ chars)

**Route Organization:**
- `/api/user` - User profile, settings, KYC
- `/api/wallets` - Multi-chain wallet operations
- `/api/transactions` - Blockchain transaction tracking
- `/api/nfts` - NFT minting and management
- `/api/agents` - Agent execution and monitoring
- `/api/payments` - Fiat and crypto payment processing
- `/api/p2p` - P2P trading offers, orders, chat, disputes (18 endpoints)
- `/api/trading` - Manual and bot trading
- `/api/financial-services` - Live market data (stocks, forex, bonds, metals)
- `/api/quantum` - IBM Quantum computing integration
- `/api/security` - Guardian Angel threat monitoring
- `/api/admin` - Admin panel operations (user management, bot training, analytics, broadcasts)
- `/api/wallet-connect` - External wallet integration (4 endpoints)
- `/api/kingdom` - Kingdom-specific features (Spectrum, prayer, tithing, ethereal elements)

All routes use Zod schema validation, structured error handling, and session-based authentication.

### Frontend Architecture

**Entry Point:** `client/src/main.tsx`
- React 18 with strict mode
- TanStack Query for server state management
- Wouter for client-side routing (lightweight alternative to React Router)
- WebSocket connection for real-time updates

**Key Directories:**
- `client/src/pages/` - Page components (dashboard, trading, financial-services, wallet, nft, p2p, celebrity-platform, bot-marketplace, admin, etc.)
- `client/src/components/` - Reusable UI components (Shadcn/ui based)
- `client/src/hooks/` - Custom React hooks (authentication, mobile detection, toast notifications)
- `client/src/lib/` - Utility functions

**Styling:**
- TailwindCSS with custom design system
- Shadcn/ui component library (New York style) with Radix UI primitives
- Dark mode primary with optional light mode
- Custom color palette: divine gold (#FFD700), covenant blue, Kingdom theming

**State Management Pattern:**
- TanStack Query for all API calls
- WebSocket subscriptions for real-time updates
- Query cache invalidation on WebSocket events

### Real-Time Infrastructure (WebSocket)

**Service:** `server/websocketService.ts`

Socket.IO channels:
- `blockchain` - Blockchain transaction updates
- `payments` - Payment status changes
- `security` - Threat detection alerts
- `agents` - Agent execution logs
- `quantum` - Quantum job status
- `trading` - Trading bot updates
- `market` - Live market data
- `p2p` - P2P order updates and chat messages

**Usage Pattern:**
```typescript
// Server emits
io.to('trading').emit('pnl_update', { userId, profit, change });

// Client receives
socket.on('pnl_update', (data) => {
  queryClient.invalidateQueries(['portfolio']);
});
```

### External Service Integrations

**Blockchain (5 networks):**
- `server/web3Service.ts` - Ethers.js v6 wrapper for multi-chain operations
- Networks: Ethereum, Polygon, BSC, Arbitrum, Optimism
- Operations: Wallet generation, balance queries, transaction submission, ERC-20/ERC-721 deployment

**Payment Processors (9+):**
- **Fiat:** Stripe, PayPal, Plaid
- **Crypto:** BitPay, Binance Pay, Bybit, KuCoin, Luno
- **Direct Blockchain:** Web3Service for on-chain payments

**Market Data:**
- `server/marketDataService.ts` - Live data with 1-minute caching
- **Stocks:** Alpha Vantage API
- **Forex:** Twelve Data API
- **Metals:** Metals-API
- **Bonds:** Alpha Vantage
- Fallback mock data for demo mode

**Trading:**
- `server/alpacaBrokerService.ts` - Alpaca paper & live trading
- `server/brokerIntegrationService.ts` - Multi-broker integration
- `server/tradingBotService.ts` - Bot execution with 7 strategies (grid, DCA, arbitrage, scalping, market making, momentum AI, MEV)

**AI/ML:**
- Anthropic Claude SDK
- Google Gemini SDK
- LangChain Core & LangGraph for workflows

**KYC & Compliance:**
- Sumsub API integration for biometric verification

**Quantum Computing:**
- IBM Quantum API for portfolio optimization and risk analysis

**Content Publishing:**
- `server/jesusCartelService.ts` - Jesus Cartel NFT automation pipeline
- `server/ipfsService.ts` - IPFS metadata storage

### Authentication & Security

**Authentication:**
- Replit Auth (OpenID Connect) as primary authentication (`server/replitAuth.ts`)
- Session-based auth with PostgreSQL-backed session store
- Sessions table required for Replit Auth

**Encryption:**
- `server/encryptionService.ts` - AES-256-GCM for sensitive data
- User-specific encryption keys derived via PBKDF2
- Master encryption key required at startup (env variable)
- Private keys and mnemonics encrypted before storage

**Authorization:**
- Role-based access control (user, admin, celebrity)
- Feature-based permissions (Kingdom features via `kingdomFeaturesEnabled` JSONB column)
- API middleware: `isAuthenticated`, `isAdmin`
- Frontend route guards

### Kingdom Feature System

Admins can selectively enable Kingdom-specific features per user:

**Feature Gating Pattern:**
```typescript
// Backend permission check
if (!user.kingdomFeaturesEnabled?.includes('spectrum_plans')) {
  return res.status(403).json({ error: 'Access denied' });
}

// Frontend access check
const hasAccess = user.kingdomFeaturesEnabled?.includes('spectrum_plans');
{hasAccess && <SpectrumPlansSection />}
```

**Available Kingdom Features:**
- `spectrum_plans` - High-yield staking tiers
- `precious_metals` - Gold/silver trading
- `ethereal_elements` - Divine collectibles
- `prayer_integration` - Scripture-guided decisions
- `auto_tithing` - Automatic charitable giving
- `divine_oracle` - Predictive analytics
- `guardian_angel_premium` - Advanced security

**Kingdom Services:**
- `server/spectrumService.ts` - Investment plan management with daily compounding
- `server/prayerService.ts` - Prayer integration and scripture library
- `server/tithingService.ts` - Auto-tithing automation
- `server/etherealService.ts` - Ethereal element management

## Important Development Notes

### Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `MASTER_ENCRYPTION_KEY` - For encrypting sensitive data
- `REPLIT_AUTH_*` - Replit Auth configuration
- API keys for external services (Stripe, PayPal, Alpaca, Alpha Vantage, etc.)

### Agent Development

When creating or modifying agents:
1. Define agent in `agentTypeEnum` in `shared/schema.ts`
2. Implement agent logic in appropriate bot file
3. Register agent in `agentOrchestrator.ts`
4. Add routing logic for the new agent type
5. Ensure learning integration via `botLearningService.ts`

### Database Migrations

When modifying schema:
1. Edit `shared/schema.ts`
2. Run `npm run db:push` to apply changes
3. Test with existing data to ensure no breaking changes
4. Consider data migration scripts for production

### WebSocket Events

When adding new real-time features:
1. Define event types in `server/websocketService.ts`
2. Emit events from appropriate service
3. Subscribe to events in frontend components
4. Invalidate TanStack Query cache on updates

### Trading Bot Development

Bot strategies are defined in `server/tradingBotService.ts`:
- **Grid Trading:** Buy/sell at price intervals
- **DCA:** Dollar-cost averaging
- **Arbitrage:** Price differential capture
- **Scalping:** Rapid micro-profit trading
- **Market Making:** Bid/ask spread layering
- **Momentum AI:** AI-powered pattern recognition
- **MEV:** Mempool monitoring with ethics protection

All bots use persistent state via `trading_system_memory` table and learn from execution via `botLearningService`.

### P2P Trading System

Complete P2P infrastructure with 6 tables and 18 API endpoints:
- Offer creation with payment methods and limits
- Order execution with escrow support
- Real-time chat for buyer-seller communication
- Dispute resolution with admin oversight
- Post-trade review system

### Payment Processing

When adding new payment methods:
1. Add processor to `cryptoProcessorEnum` in schema (if crypto)
2. Implement service in `server/cryptoProcessorService.ts`
3. Add routes in `server/routes.ts`
4. Update frontend payment selection UI
5. Test with sandbox/testnet credentials

### Admin Panel Features

Admin panel (`/admin`) includes:
- User management (view, edit permissions, assign Kingdom features)
- Bot training dashboard (supervised/reinforcement/transfer learning)
- System analytics (users, bots, sessions, win rates)
- Broadcast messaging (platform-wide or targeted)
- Activity logs (immutable audit trail)

## Testing

No automated test suite is currently configured. Test manually by:
1. Start dev server: `npm run dev`
2. Test API endpoints via frontend UI or curl
3. Monitor logs for errors
4. Check database state via Drizzle Studio or SQL client

## Deployment

Platform is designed for Replit deployment:
- Vite dev server with HMR in development
- Static file serving in production
- Single port (5000) serves both API and frontend
- Environment-based configuration
