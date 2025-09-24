# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

### Using Bun (Preferred - 10x faster)
```bash
# Install dependencies
bun install

# Development server
bun run dev              # Webpack dev server on port 4000
bun run bun:dev         # Bun server with hot reload
bun run bun:start       # Production Bun server

# Build
bun run build           # Webpack production build
bun run bun:build      # Bun standalone binary

# Production
bun run production:start    # Start in production mode
bun run production:build    # Full production build
```

### Using Node.js
```bash
npm install
npm run dev             # Webpack dev server on port 4000
npm run build          # Production build
npm run start          # Start server
```

### Testing and Quality
```bash
bun run lint           # Run ESLint
bun run typecheck      # TypeScript type checking
bun test              # Run tests (if using Bun test runner)
npm run test:integration   # Integration tests
npm run test:services     # Service tests
```

### Database
```bash
npm run db:migrate     # Run all migrations
npm run db:setup      # Setup database
psql $DATABASE_URL -f migrations/001-production-schema.sql
psql $DATABASE_URL -f migrations/002-fintech-schema.sql
```

## Architecture Overview

### Tech Stack
- **Runtime**: Bun (primary) / Node.js (fallback)
- **Backend**: Bun server (`bun-server.ts`) with native TypeScript
- **Frontend**: React 19 with TypeScript, bundled with Webpack
- **Database**: PostgreSQL (production) with connection pooling
- **Styling**: Tailwind CSS
- **Authentication**: JWT with Argon2id password hashing (Bun) or bcrypt (Node)

### Project Structure

```
valifi/
├── bots/                 # Modular bot system (50+ financial bots)
│   ├── banking-bot/     # Core banking operations
│   ├── trading-bot/     # Trading automation
│   ├── armor-crypto-bot/ # ArmorWallet integration
│   └── ...              # Various domain-specific bots
├── components/          # React UI components
├── lib/
│   └── core/           # Core framework (KingdomCore, AIEngine, DatabaseKingdom)
├── migrations/         # PostgreSQL schema migrations
├── pages/             # Next.js pages (API routes)
│   └── api/           # API endpoints
├── src/               # Frontend source
│   ├── auth/          # Authentication components
│   ├── config/        # Configuration
│   ├── middleware/    # Express/API middleware
│   └── services/      # Service layer
├── bun-server.ts      # Bun production server
└── webpack.config.js  # Frontend bundling
```

### Core Architecture Patterns

1. **Modular Bot Framework**: Each bot extends `KingdomBot` base class and is self-contained with its own logic. Bots are registered in `pages/api/bot.ts` and dynamically loaded based on request routing.

2. **Unified API Endpoint**: Single `/api/bot` endpoint routes requests to appropriate bot modules based on `bot` and `action` parameters in the request body.

3. **Database Architecture**:
   - PostgreSQL with connection pooling (max 20 connections)
   - Core tables: users, wallets, transactions, trading_bots, user_sessions
   - Automatic timestamp triggers for updated_at columns
   - JSONB fields for flexible metadata storage

4. **Authentication Flow**:
   - JWT-based authentication with secure token generation
   - Argon2id password hashing (Bun) for maximum security
   - Session management with refresh tokens
   - Two-factor authentication support

5. **Frontend Architecture**:
   - React 19 with TypeScript
   - Component-based architecture in `components/`
   - API service layer in `services/api.ts`
   - Currency context provider for multi-currency support
   - Internationalization with i18next

## Key Integration Points

### External Services (from deployment-guide.md)
- **AWS RDS PostgreSQL**: Production database
- **ArmorWallet**: Crypto wallet integration (`bots/armor-crypto-bot/`)
- **Alpaca**: Trading and market data
- **Interactive Brokers**: Advanced trading
- **Stripe/Plaid/Coinbase**: Payment processing
- **Jumio/Chainalysis**: KYC/AML compliance

### Environment Variables Required
```env
DATABASE_URL           # PostgreSQL connection string
JWT_SECRET            # JWT signing secret
PORT                  # Server port (default: 3001)
NODE_ENV              # production/development
```

See `.env.production.template` for complete list of production environment variables.

## Development Notes

### Bun vs Node.js
The codebase is optimized for Bun runtime which provides:
- Native TypeScript execution (no compilation)
- Built-in SQLite, WebSocket support
- 10x faster startup and request handling
- Native Argon2 password hashing
- Built-in test runner and bundler

### Code Style
- **Formatter**: Biome with 2-space indentation
- **Linter**: ESLint with recommended rules
- **TypeScript**: Relaxed mode (`strict: false`, `noImplicitAny: false`)

### WebSocket Support
Bun server includes WebSocket handler for real-time features:
- Trading bot updates
- Live market data
- Real-time notifications

### Performance Optimizations
- Connection pooling for PostgreSQL
- Webpack code splitting for frontend
- Bun's native performance (500k+ requests/sec capability)
- Argon2id for secure and fast password hashing