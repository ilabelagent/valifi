# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

### Development
```bash
# Install dependencies
bun install  # or: npm install

# Development (frontend only)
npm run dev              # Vite dev server on port 4000

# Full-stack development
npm run full-stack       # Runs both Bun backend (port 3001) and Vite frontend (port 4000)
bun run bun:dev         # Bun server with hot reload (port 3001)
```

### Production
```bash
# Build
npm run build                # Vite production build → dist/
npm run production:build     # Alias for npm run build
bun run bun:build           # Bun standalone binary → dist/

# Start production server
npm run production:start     # Node.js server (simple-server.js) on port 3001
npm run start               # Same as above
npm run production:server   # Alternative start command with explicit NODE_ENV
bun run bun:start          # Bun server (bun-server.ts) on port 3001

# AWS-specific commands
npm run aws:build           # Build for AWS deployment
npm run aws:start           # Start Node.js server for AWS
npm run apprunner:install   # Install deps including devDependencies
npm run apprunner:build     # Build for AWS App Runner
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
- **Runtime**: Bun (primary) / Node.js (production fallback)
- **Backend**:
  - `bun-server.ts` - Bun-native server with TypeScript, WebSocket support, Argon2id hashing (primary API server)
  - `simple-server.js` - Node.js/Express server for AWS deployments with bcrypt hashing
  - `pages/api/*` - Legacy Next.js-style API routes (NOT used in production, system uses Vite + Bun/Node servers)
- **Frontend**: React 19 with TypeScript, bundled with Vite (NOT Next.js)
- **Database**: PostgreSQL (production) with connection pooling (max 20 connections)
- **Styling**: Tailwind CSS
- **Authentication**: JWT with Argon2id (Bun) or bcrypt (Node.js)

### Project Structure

```
valifi/
├── bots/                    # Modular bot system (55+ financial bots)
│   ├── banking-bot/        # Core banking operations
│   ├── trading-bot/        # Trading automation
│   ├── armor-crypto-bot/   # ArmorWallet integration
│   ├── defi-bot/           # DeFi operations
│   ├── 401k-bot/           # Retirement accounts
│   └── ...                 # Various domain-specific bots (trading, forex, metals, etc.)
├── components/             # React UI components
├── exchange_updated/       # PHP-based exchange integration (separate legacy system)
│   └── public_html/       # PHP exchange files (wallet.php, metals-exchange.php, etc.)
├── lib/
│   └── core/              # Core framework (KingdomCore, AIEngine, DatabaseKingdom, KingdomBot)
├── migrations/            # PostgreSQL schema migrations
│   ├── 001-production-schema.sql  # Core schema (users, wallets, transactions)
│   └── 002-fintech-schema.sql     # Extended features (trading_bots, etc.)
├── pages/
│   └── api/               # API endpoints (bot.ts routes to bot modules)
├── src/                   # Frontend source
│   ├── config/            # Configuration
│   ├── middleware/        # Express/API middleware
│   └── services/          # Service layer (api.ts)
├── bun-server.ts          # Bun server with WebSocket support
├── simple-server.js       # Express/Node.js production server (AWS)
├── vite.config.ts         # Vite bundler configuration
└── dist/                  # Production build output
```

### Core Architecture Patterns

1. **Dual Server Architecture**:
   - **Bun Server** (`bun-server.ts`): Development and high-performance deployments. Uses native WebSocket, Argon2id hashing, minimal routing with pattern matching.
   - **Node.js Server** (`simple-server.js`): Production fallback for AWS environments. Uses Express middleware, bcrypt hashing, serves static files from `dist/`.
   - Both servers connect to the same PostgreSQL database with identical schema.

2. **Modular Bot Framework**:
   - Base class `KingdomBot` in `lib/core/` provides common interface
   - Each bot (banking, trading, crypto, etc.) is self-contained in `bots/` directory
   - Bot commands processed via POST with `{ bot, action, ...params }` JSON body
   - Note: `pages/api/bot.ts` exists but is legacy code; current production API is in `bun-server.ts` and `simple-server.js`

3. **Database Architecture**:
   - PostgreSQL with connection pooling (max 20 connections, 30s idle timeout, 2-5s connection timeout)
   - Core tables: `users` (email, username, password_hash, first_name, last_name), `wallets` (user_id, wallet_type, currency, balance), `transactions`, `trading_bots`, `user_sessions`
   - Migrations in `migrations/001-production-schema.sql` and `002-fintech-schema.sql`

4. **Authentication Flow**:
   - JWT tokens with 7-day expiration
   - **Bun Server Routes**:
     - `/api/auth/register`: Creates user + default USD wallet, returns JWT (Argon2id hashing)
     - `/api/auth/login`: Validates credentials, returns JWT (Argon2id hashing)
     - `/api/app-data`: Returns user profile, portfolio, wallets, transactions (requires JWT)
     - `/api/health`: Health check endpoint
   - **Node.js Server**: Same routes with bcrypt hashing instead of Argon2id
   - Password hashing: Argon2id (Bun) with memoryCost=4096, timeCost=3 OR bcrypt (Node) with cost=12

5. **Frontend Architecture**:
   - React 19 with TypeScript, bundled by Vite (output: `dist/`)
   - Vite dev server on port 4000 (host: 0.0.0.0), proxies `/api` requests to backend on port 3001
   - Path aliases (vite.config.ts): `@` → `./src`, `@components` → `./components`, `@bots` → `./bots`, `@lib` → `./lib`, `@services` → `./services`
   - i18next for internationalization

6. **Legacy Exchange System**:
   - `exchange_updated/public_html/` contains PHP-based exchange interface (separate from React frontend)
   - Includes wallet management, metals exchange, staking, and admin panels
   - This is a separate system that may be integrated or replaced

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

### Dual Runtime Strategy
- **Bun** (`bun-server.ts`): Native TypeScript, WebSocket, Argon2id, 10x faster startup. Use for local dev and high-performance prod.
- **Node.js** (`simple-server.js`): Express, bcrypt, static file serving. Required for AWS App Runner / EC2 deployments.

### Code Style
- **TypeScript**: Relaxed mode (`strict: false`, `noImplicitAny: false`)
- **Linter**: ESLint with recommended rules
- **Module Resolution**: Node-style with path aliases in tsconfig.json

### WebSocket Support (Bun only)
The `bun-server.ts` includes WebSocket handler for:
- Real-time trading bot updates
- Live market data streams
- Push notifications
WebSocket connections not available in Node.js server.

### Key Configuration Files
- `vite.config.ts`: Frontend bundler, port 4000 (host 0.0.0.0), API proxy to 3001, path aliases
- `tsconfig.json`: Path aliases (`@/*`), target ES2022, JSX preserve, strict=false
- `.env.local` / `.env`: DATABASE_URL, JWT_SECRET, PORT, NODE_ENV
- `.env.production.template`: Complete list of production environment variables (API keys, secrets, etc.)

### Performance Optimizations
- PostgreSQL connection pooling (max 20)
- Vite code splitting and tree shaking
- Bun native performance (500k+ req/sec)
- Argon2id hashing (50% faster than bcrypt)

## Important Implementation Patterns

### Server Selection
When modifying the backend, you must update **both** servers:
- `bun-server.ts` for development and Bun deployments
- `simple-server.js` for Node.js/AWS deployments
Both must maintain identical API contracts.

### Adding New Bots
1. Create bot class extending `KingdomBot` in `bots/{bot-name}/`
2. Implement required methods: `initialize()`, `execute(action, params)`
3. Register bot route in `bun-server.ts` and `simple-server.js` (or use `pages/api/bot.ts` for legacy compatibility)
4. Bot should be autonomous with its own domain logic

### Database Migrations
Run migrations in order:
```bash
# Using npm script (runs all migrations)
npm run db:migrate

# Or manually in order:
psql $DATABASE_URL -f migrations/001-production-schema.sql  # Core schema (users, wallets, transactions, etc.)
psql $DATABASE_URL -f migrations/002-fintech-schema.sql     # Extended features (trading bots, advanced features)

# Setup scripts
npm run db:setup      # Local database setup
npm run db:setup-rds  # AWS RDS setup
```
Do not modify existing migrations; create new numbered files for schema changes.

### Authentication Pattern
Both servers use identical auth flow:
1. Hash password (Argon2id or bcrypt)
2. INSERT user + wallet in transaction
3. Generate JWT with `{ userId, email }` payload
4. Return token with 7-day expiration

Tokens are validated by extracting `Authorization` header and verifying JWT signature.

### Working with Exchange Updated
The `exchange_updated/` directory contains a separate PHP-based exchange system:
- This is a legacy integration for metals trading, staking, and crypto exchange
- Files in `exchange_updated/public_html/` include: `wallet.php`, `metals-exchange.php`, `stake.php`, `admin.php`
- This system is separate from the React/Bun/Node.js stack and may use different authentication
- When integrating or migrating this system, consider how to unify authentication and database access

## Critical Production Notes

### Current Production Setup (as of 2025-09-30)
The system is currently configured with:
- **Database**: PostgreSQL 15 on localhost:5432
  - Database: `valifi_production`
  - User: `valifip`
  - Connection pooling: max 20 connections, 30s idle timeout, 5s connection timeout
  - SSL disabled for localhost, enabled with `rejectUnauthorized: false` for remote connections

- **Server Configuration**:
  - Bun server runs on port 3001 (host: 0.0.0.0 for public access)
  - Vite dev server runs on port 4000 (host: 0.0.0.0 for public access)
  - Vite proxies all `/api/*` requests to `http://localhost:3001`

- **Key API Endpoints** (implemented in `bun-server.ts`):
  - `POST /api/auth/register` - User registration with Argon2id hashing
  - `POST /api/auth/login` - User authentication
  - `GET /api/health` - System health check
  - `GET /api/app-data` - User data (requires JWT in Authorization header)
  - `GET /api/wallet` - Wallet balance
  - `GET /api/transactions` - Recent transactions

### Important Environment Variables
```bash
DATABASE_URL='postgresql://valifip:password@localhost:5432/valifi_production'
PORT=3001
NODE_ENV=production
JWT_SECRET='valifi_jwt_production_secret_2025_secure_key_app_runner_rds'
```

### Running in Production
```bash
# Start Bun server in background
export DATABASE_URL='postgresql://valifip:password@localhost:5432/valifi_production'
export NODE_ENV='production'
export PORT='3001'
nohup bun bun-server.ts > /tmp/bun-server.log 2>&1 &

# Start Vite dev server (or use built dist/ with simple-server.js)
npm run dev  # Development
# OR
npm run build && npm start  # Production with Node.js server
```

### Troubleshooting

**Health check fails (ECONNREFUSED)**:
- Ensure Bun server is running on port 3001: `ps aux | grep bun-server`
- Check logs: `tail -f /tmp/bun-server.log`
- Verify port is listening: `netstat -tuln | grep 3001` or `lsof -i :3001`

**Form fields disabled in frontend**:
- This occurs when `/api/health` endpoint fails
- Frontend sets `dbStatus = 'error'` which disables all form inputs
- Fix: Restart the Bun server

**Database connection errors**:
- For localhost PostgreSQL, ensure `ssl: false` in connection config
- For remote RDS, use `ssl: { rejectUnauthorized: false }`
- Check connection string encoding (avoid special characters in passwords)

**JWT authentication fails**:
- Ensure `Authorization: Bearer <token>` header is present
- Verify JWT_SECRET matches between registration and verification
- Check token format (base64 encoded payload)