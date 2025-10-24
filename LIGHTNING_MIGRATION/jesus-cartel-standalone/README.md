# Jesus Cartel - Standalone Music Publishing Platform

## 🎵 Overview

Jesus Cartel is an automated music publishing platform that transforms songs into blockchain assets. Extracted from the Valifi Kingdom platform for independent deployment.

### Core Features
- **Automated Publishing Pipeline**: Song → NFT → ERC-20 Token
- **Multi-Chain Support**: Ethereum, Polygon, BSC, Arbitrum, Optimism
- **Music Management**: Releases, events, streams, analytics
- **Blockchain Integration**: Real NFT minting and token deployment

## 🚀 Quick Start (Lightning AI)

### 1. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

###  2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Production Build
```bash
npm run build
npm start
```

## 📦 What's Included

```
jesus-cartel-standalone/
├── src/
│   ├── index.ts                    # Main entry point
│   ├── services/
│   │   ├── jesusCartelService.ts   # Core publishing service
│   │   ├── web3Service.ts          # Blockchain operations
│   │   ├── encryptionService.ts    # Wallet encryption
│   │   └── storage.ts              # Database operations
│   ├── routes/
│   │   └── index.ts                # API routes
│   └── database/
│       ├── db.ts                   # Database connection
│       └── schema.ts               # Database schema
├── scripts/
│   └── build.js                    # Build script
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔌 API Endpoints

### Publishing
- `POST /api/jesus-cartel/songs/:id/publish` - Publish song (NFT + Token)

### Releases
- `GET /api/jesus-cartel/releases` - Get latest releases
- `GET /api/jesus-cartel/releases/featured` - Get featured releases
- `GET /api/jesus-cartel/releases/:id` - Get specific release
- `POST /api/jesus-cartel/releases/:id/like` - Like a release

### Events
- `GET /api/jesus-cartel/events` - Get upcoming events
- `GET /api/jesus-cartel/events/featured` - Get featured events
- `GET /api/jesus-cartel/events/:id` - Get specific event

### Analytics
- `POST /api/jesus-cartel/streams` - Track stream/play

### Admin
- `POST /api/admin/jesus-cartel/releases` - Create release
- `POST /api/admin/jesus-cartel/events` - Create event

## 🔐 Environment Variables

```env
# Server
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/jesus_cartel

# Encryption
ENCRYPTION_MASTER_KEY=your-32-character-or-longer-secret-key

# Blockchain RPC URLs (optional - defaults provided)
ETHEREUM_RPC_URL=https://eth.llamarpc.com
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
OPTIMISM_RPC_URL=https://mainnet.optimism.io
```

## 🗄️ Database Schema

### Tables
- `songs` - Music tracks
- `nfts` - Minted NFTs
- `tokens` - ERC-20 tokens
- `wallets` - User wallets
- `jesusCartelReleases` - Music releases
- `jesusCartelEvents` - Events
- `jesusCartelStreams` - Stream analytics

## 🌐 Multi-Chain Support

Supported networks:
- **Ethereum** (ChainID: 1)
- **Polygon** (ChainID: 137)
- **BSC** (ChainID: 56)
- **Arbitrum** (ChainID: 42161)
- **Optimism** (ChainID: 10)

## 📝 Usage Example

```typescript
// Publish a song
const result = await jesusCartelService.publishSong(
  "song-id",
  "wallet-id",
  {
    mintNFT: true,
    createToken: true,
    network: "polygon",
    tokenSupply: "1000000"
  }
);

console.log(`NFT: ${result.nft.contractAddress}`);
console.log(`Token: ${result.token.contractAddress}`);
```

## 🛠️ Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run dev
```

### Database Management
```bash
npm run db:push    # Push schema changes
npm run db:studio  # Open Drizzle Studio
```

## 🚀 Lightning AI Deployment

1. Create new Lightning AI Studio
2. Upload this directory
3. Install dependencies: `npm install`
4. Configure `.env` file
5. Run database setup: `npm run db:push`
6. Start: `npm start`

## 📄 License

MIT

---

**Extracted from Valifi Kingdom Platform**
**Migration Date:** 2025-10-21
**Status:** Production Ready ✅
