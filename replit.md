# Valifi Kingdom Fintech Platform

## Overview

Valifi is a divine fintech platform that combines multi-agent AI orchestration with real blockchain integration, live payment processing, and quantum computing capabilities. The platform serves as a comprehensive financial ecosystem with 63+ autonomous AI agents handling everything from Web3 wallet management to KYC compliance, trading automation, and NFT publishing for the Jesus Cartel music ministry.

Built with a modern TypeScript stack, the platform leverages LangGraph for stateful multi-agent workflows, real blockchain networks (Ethereum, Polygon, BSC, Arbitrum, Optimism), live payment processors (Stripe, PayPal, BitPay, Binance Pay), and production-grade security with encryption services and Guardian Angel threat detection.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Styling**
- React 18 with TypeScript using Vite as the build tool
- TailwindCSS with custom design system inspired by Stripe and Coinbase
- Shadcn/ui component library (New York style) with Radix UI primitives
- Dark mode primary with optional light mode for trading views
- Custom color palette: divine gold accents (#FFD700), covenant blue, Kingdom standard theming

**State Management**
- TanStack Query (React Query) for server state and API caching
- Wouter for client-side routing (lightweight alternative to React Router)
- Custom hooks for authentication, mobile detection, and toast notifications

**UI Components**
- Complete Shadcn/ui component set: forms, dialogs, dropdowns, charts, calendars
- Custom sidebar navigation with collapsible groups
- Real-time WebSocket integration for live updates

### Backend Architecture

**Core Server**
- Express.js server with TypeScript
- Replit Auth integration for authentication (OpenID Connect)
- Session management with PostgreSQL-backed session store
- Custom middleware for request logging and error handling

**Multi-Agent Orchestration**
- LangGraph state graph for coordinating 63+ specialized AI agents
- Agent types: orchestrator, blockchain, payment, KYC, security, publishing, quantum, analytics, monitoring, Guardian Angel
- Stateful workflows with persistent checkpointing
- Agent router distributes tasks based on agent specialization

**API Architecture**
- RESTful endpoints organized by domain (wallets, transactions, NFTs, agents, songs, payments)
- Zod schema validation on all inputs
- Structured error handling with HTTP status codes
- Real-time updates via Socket.IO WebSocket service

### Data Storage Solutions

**Primary Database**
- PostgreSQL via Neon serverless database (@neondatabase/serverless)
- Drizzle ORM for type-safe database operations
- Schema-first approach with automated migrations

**Database Schema Design**
- Users table with Replit Auth integration (OpenID claims)
- Wallets: multi-chain support with encrypted private key storage
- Transactions: blockchain transaction tracking with status enums
- NFTs & Tokens: ERC-721/ERC-20 contract tracking
- Songs: Jesus Cartel publishing pipeline metadata
- Agents & Agent Logs: multi-agent execution tracking
- Security Events: Guardian Angel threat monitoring
- Payments: Stripe/PayPal/crypto payment records
- KYC Records: Sumsub integration for compliance
- Quantum Jobs: IBM Quantum API job tracking
- Crypto Payments: multi-processor invoice tracking (BitPay, Binance Pay, Bybit, KuCoin, Luno)
- Trading Bots: 7 active strategies with stateful execution
- Bot Executions: trade history with P&L analytics
- Armor Wallets: AI-powered MCP wallet custody
- MEV Events: sandwich attack and frontrunning monitoring

**Session Storage**
- PostgreSQL sessions table for Replit Auth
- Redis integration ready (configured but optional)

### Authentication & Authorization

**Authentication Strategy**
- Replit Auth (OpenID Connect) as primary authentication
- Session-based auth with secure HTTP-only cookies
- JWT tokens for API authentication (infrastructure present)
- OAuth provider support (Google, GitHub, Twitter - configured)

**Security Measures**
- Encryption service using AES-256-GCM for sensitive data (private keys, mnemonics)
- User-specific encryption keys derived via PBKDF2
- Master encryption key requirement enforced at startup
- RBAC system with admin flags
- Multi-factor authentication support in schema

### External Service Integrations

**Blockchain Networks**
- Ethers.js v6 for Web3 interactions
- Multi-chain support: Ethereum, Polygon, BSC, Arbitrum, Optimism
- Network configurations with RPC endpoints and explorers
- Wallet generation with HD derivation paths
- Real on-chain balance queries and transaction submission

**Payment Processors**

*Fiat Payments*
- Stripe: cards, ACH, webhooks for real-time updates
- PayPal SDK: orders, subscriptions, payouts
- Plaid: bank account linking and transfers

*Crypto Payments*
- BitPay: invoice generation with QR codes
- Binance Pay: merchant integration
- Bybit: crypto payment processing
- KuCoin Pay: order creation
- Luno: deposit/withdrawal APIs
- Coinbase Commerce: crypto checkout flows

**Trading & Market Data**
- Armor Wallet SDK: MPC-TEE Web3 wallet with AI trading, natural language execution
- Trading Bot System: 7 active strategies with stateful persistence
  - Grid Trading: automated buy/sell at price intervals with boundary detection
  - DCA: dollar-cost averaging at configured intervals
  - Arbitrage: spatial + spot-futures price differential capture
  - Scalping: rapid micro-profit trading on volatility
  - Market Making: bid/ask spread layering for liquidity provision
  - Momentum AI: RSI/MACD/volume pattern recognition with AI scoring
  - MEV: mempool monitoring with Kingdom ethics protection
- Market data integrations: Polygon.io, Alpha Vantage, IEX Cloud
- Broker APIs: Alpaca (paper & live trading), Interactive Brokers Gateway

**AI & ML Services**
- Anthropic Claude (@anthropic-ai/sdk)
- Google Gemini (@google/genai)
- LangChain Core & LangGraph for agent workflows
- Custom Guardian Angel security bot with threat detection

**KYC & Compliance**
- Sumsub API: biometric verification, document scanning, liveness detection
- AML transaction monitoring
- Sanctions screening
- Automated compliance workflows

**Quantum Computing**
- IBM Quantum API integration
- Portfolio optimization algorithms
- Risk analysis computations
- Quantum-resistant encryption preparation

**Content & Publishing**
- Jesus Cartel automated pipeline: Song → NFT (ERC-721) → Token (ERC-20)
- IPFS metadata storage for NFTs
- Smart contract deployment automation
- Liquidity pool initialization

**Real-Time Infrastructure**
- Socket.IO WebSocket server for live updates
- Channel subscriptions: blockchain, payments, security, agents, quantum
- Alchemy webhooks for blockchain event monitoring
- DEX aggregator price feeds

**Security & Monitoring**
- Guardian Angel Bot: ML threat detection, penetration testing, attack simulations
- Immutable security event audit log
- Threat level classification: none, low, medium, high, critical
- Automated incident response workflows

**Development & Deployment**
- Vite dev server with HMR
- Replit-specific plugins: runtime error overlay, cartographer, dev banner
- TypeScript strict mode with path aliases
- ESBuild for production bundling
- Environment-based configuration (development/production)