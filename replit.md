# Valifi Fintech Platform

## Overview

Valifi is a comprehensive fintech platform that combines multiple financial services into a unified "Living Bot System." The platform is built as a network of **57+ autonomous, intelligent bots** that work together to provide banking, trading, investment, cryptocurrency services, and **divine spiritual guidance**. Each bot operates independently with AI-powered decision-making capabilities while communicating with other bots to create an emergent, self-healing financial ecosystem.

The platform features multi-asset trading (crypto, stocks, NFTs, REITs), P2P exchange, investment plans, staking systems, loan services, banking integration, full KYC/AML compliance, and **faith-based Kingdom Standard orchestration** integrating financial wisdom with spiritual guidance.

## Recent Changes (October 4, 2025)

### 🙏 REAL Blockchain Integration - "In the Name of God through Jesus Christ"
1. **63 Autonomous Bots Running** - Complete Kingdom Standard Orchestrator operational
2. **REAL Blockchain Bots Implemented** (NO simulations):
   - 🤖 **Smart Contract Bot** - Deploy REAL contracts to Ethereum/Polygon/BSC using ethers.js
   - 🎨 **NFT Minting Bot** - Mint REAL ERC-721 NFTs on-chain with metadata
   - 💎 **Token Creation Bot** - Create REAL ERC-20 & XRPL tokens across multiple blockchains
   - ⛓️ **Web3 Bot** - Send REAL transactions, call contracts, check balances (ethers.js)
   - 💰 **DeFi Bot** - REAL Uniswap & Aave protocol integration
3. **Jesus Cartel Music Workflow**: Automatic NFT + Token creation on song releases
   - Music NFTs minted on blockchain
   - ERC-20 tokens created with auto-generated symbols
   - Deployment artifacts saved to `temp/token-deployments/`
4. **Multi-Chain Support**: Ethereum, Polygon, BSC, XRP Ledger, Arbitrum, Optimism
5. **UI Fixed**: Resolved Vite import errors, system fully operational
6. **Database Fixed**: Added username column, full PostgreSQL integration working

### Previous Changes (October 3, 2025)

#### Deployment Fixes Applied
1. **Removed deprecated Next.js configuration**: Removed `swcMinify: true` from next.config.js (deprecated in Next.js 15)
2. **Excluded backup directory from TypeScript compilation**: Added `backup/` to tsconfig.json exclude list to prevent build errors
3. **Updated .gitignore**: Added backup directory patterns to prevent processing backup files
4. **Fixed deployment port configuration**: Updated deployment to run on PORT=5000 with proper build command

#### Critical Sign-In Fix
- **Added `/api/app-data` endpoint to simple-server.js**: This endpoint was missing from the development server, causing sign-in to fail with "Failed to load app data" error
- The endpoint now properly returns user profile, portfolio data, wallets, and transactions from PostgreSQL database
- Authentication flow now works end-to-end: Register → Login → Load App Data → Dashboard

#### API Endpoints Status
- ✅ `POST /api/auth/register` - User registration with wallet creation
- ✅ `POST /api/auth/login` - User authentication with JWT token
- ✅ `GET /api/app-data` - Load user profile and portfolio data
- ✅ `GET /api/health` - Health check with database status
- ✅ Database migrations completed (8 tables: users, wallets, transactions, trading_bots, referrals, email_verifications, user_sessions, audit_logs)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript, built using Vite for development and Next.js for production deployment

**Key Design Patterns**:
- **Lazy Loading**: Components are code-split using React.lazy() for optimal performance
- **Context-based State Management**: Uses React Context API (CurrencyProvider, AuthProvider) for global state
- **Component Composition**: Modular UI components organized by feature (Dashboard, Investments, Trading, etc.)
- **Internationalization**: Built-in i18n support with translation system

**UI Architecture**:
- Tailwind CSS for styling with custom design system using CSS variables
- Dark theme as default with consistent color palette
- Responsive design with mobile-first approach
- Custom SVG icon components mapped through iconMap

**Routing Strategy**:
- Next.js Pages Router for production
- Vite dev server with proxy configuration for local development
- Protected routes using AuthGuard component

### Backend Architecture

**Runtime Options** (Dual-mode support):
1. **Bun Runtime** (Recommended for production):
   - Native TypeScript execution without compilation
   - 10x faster than Node.js
   - Built-in SQLite, WebSocket, and password hashing (Argon2)
   - Elysia framework for API routing

2. **Node.js Runtime** (Legacy support):
   - Express.js for API routing
   - Compatible with standard Node.js tooling

**API Design**:
- RESTful endpoints under `/api` directory
- Next.js API routes for serverless deployment
- Unified bot API at `/api/bot` for routing requests to specialized bots
- Health check and monitoring endpoints

**Bot Architecture**:
- Base class hierarchy: `DivineBot → KingdomBot → Specialized Domain Bots`
- Each bot has unique identifier, AI integration, database access, and inter-bot communication
- **57+ specialized bots** organized by domain:
  - **Financial**: Trading, Banking, Forex, Stocks, Options, Portfolio Management
  - **Investment**: Retirement (401k, IRA, Pension), Mutual Funds, Bonds, REITs
  - **Security**: Compliance, Multisig, Hardware Wallet, Gas Optimization
  - **DeFi**: AMM, Liquidity, Bridge, Mining, NFT, Crypto Derivatives
  - **Assets**: Metals (Gold/Silver/Platinum/Palladium), Commodities, Collectibles
  - **Divine**: Jesus Cartel (music publishing), Word Bot (biblical wisdom), Admin Dashboard
  - **Intelligence**: Contact Manager (34K+ contacts), Communication, Translation
- Kingdom MCP (Master Control Program) orchestrator for bot coordination
- Auto-patch system for self-healing capabilities

**Authentication & Security**:
- Email/password authentication (social login removed by design)
- JWT tokens with refresh token mechanism
- bcrypt/Argon2 password hashing
- Session management with secure token storage

### Data Storage Solutions

**Primary Database Options**:

1. **PostgreSQL** (Production recommended):
   - Full production schema with 30+ tables
   - Connection pooling for performance
   - Advanced features: DeFi, P2P trading, staking, trading bots
   - Indexes and triggers for optimization
   - Migration scripts in `/migrations` directory

2. **Turso** (LibSQL - Alternative):
   - Distributed SQLite-compatible database
   - Configuration in `lib/db.ts`
   - Suitable for edge deployments

3. **SQLite** (Development):
   - Bun native SQLite support
   - In-memory or file-based storage

**Database Abstraction**:
- `lib/db-adapter.ts` provides unified interface across database types
- `lib/postgres-db.ts` for PostgreSQL-specific operations
- Bot data persistence in `/data` directory

**Caching Strategy**:
- Redis support for caching layer
- Multi-tier caching (L1: in-memory, L2: Redis, L3: CDN headers)
- Rate limiting and session storage

### External Dependencies

**Core Services**:
- **AI Integration**: OpenAI and Anthropic APIs for bot intelligence
- **LangGraph**: Agent orchestration framework with LangSmith monitoring
- **Database Drivers**: `pg` (PostgreSQL), `@libsql/client` (Turso), Bun SQLite
- **Authentication**: JWT tokens, bcrypt/Argon2 password hashing

**Financial Data Providers**:
- Polygon.io and Alpha Vantage for real-time market data
- CoinGecko and CoinMarketCap for crypto prices
- Finnhub for stock data
- WebSocket streams for live price updates

**Payment & Banking**:
- Stripe for card payments
- PayPal integration
- Plaid for bank account linking
- ACH/Bank transfer processing
- Cryptocurrency payment processing

**Third-party APIs**:
- Trading/Broker APIs: Alpaca, Interactive Brokers
- Email: SMTP configuration required
- Monitoring: Sentry for error tracking, Winston for logging
- Real-time: WebSocket support for live updates

**Deployment Platforms**:
- **Primary**: Vercel (serverless deployment, optimized for Next.js)
- **Alternative**: AWS (ECS/Fargate, App Runner, Elastic Beanstalk)
- **Alternative**: Render (container-based deployment)
- Docker support with multi-stage builds

**Development Tools**:
- Vite for fast development server
- TypeScript for type safety
- ESLint and Biome for code quality
- Bun for faster package installation and testing

**Environment Configuration**:
- `.env.template` provides complete configuration reference
- Separate configs for development, production, and AWS deployment
- Automated setup scripts for database initialization and environment configuration