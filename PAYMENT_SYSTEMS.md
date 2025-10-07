# Valifi Kingdom Payment Systems - Complete Reference

## Overview
Valifi Kingdom supports multiple payment rails for maximum flexibility: fiat payments, cryptocurrency payments, peer-to-peer trading, and Web3 wallet integration.

---

## 1. FIAT PAYMENT SYSTEMS

### 1.1 Stripe Integration
**Status:** ✅ Fully Implemented  
**Service:** `server/routes.ts` (Stripe webhooks)  
**Database:** `payments` table  

**Capabilities:**
- Credit/debit card payments
- ACH bank transfers
- Real-time webhook processing
- Payment intent creation
- Subscription management

**API Endpoints:**
- `POST /api/payments/stripe/intent` - Create payment intent
- `POST /api/payments/stripe/webhook` - Webhook handler
- `GET /api/payments` - List user payments

**Environment Variables:**
- `STRIPE_SECRET_KEY` - Stripe API key
- `VITE_STRIPE_PUBLIC_KEY` - Frontend publishable key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret

**Database Schema:**
```typescript
payments {
  id: varchar (UUID)
  userId: varchar (FK to users)
  stripePaymentId: text (unique)
  amount: decimal(12,2)
  currency: text (default: 'usd')
  status: text (succeeded, pending, failed)
  description: text
  metadata: jsonb
  createdAt: timestamp
}
```

---

### 1.2 PayPal Integration
**Status:** ✅ Implemented  
**Service:** `@paypal/paypal-server-sdk`  

**Capabilities:**
- PayPal orders
- Subscription billing
- Payouts to users
- Express checkout

**API Endpoints:**
- `POST /api/payments/paypal/order` - Create PayPal order
- `POST /api/payments/paypal/subscription` - Create subscription
- `POST /api/payments/paypal/payout` - Send payout

**Environment Variables:**
- `PAYPAL_CLIENT_ID` - PayPal app client ID
- `PAYPAL_CLIENT_SECRET` - PayPal app secret

---

### 1.3 Plaid Integration
**Status:** ✅ Implemented  
**Service:** Plaid SDK  

**Capabilities:**
- Bank account verification
- ACH transfers
- Account balance checking
- Transaction history

**API Endpoints:**
- `POST /api/plaid/link-token` - Create link token
- `POST /api/plaid/exchange-token` - Exchange public token
- `POST /api/plaid/transfer` - Initiate ACH transfer

**Environment Variables:**
- `PLAID_CLIENT_ID`
- `PLAID_SECRET`
- `PLAID_ENV` (sandbox, development, production)

---

## 2. CRYPTOCURRENCY PAYMENT SYSTEMS

### 2.1 Direct Blockchain Payments
**Status:** ✅ Fully Implemented  
**Service:** `server/web3Service.ts`  
**Database:** `cryptoPayments` table  

**Supported Networks:**
1. **Ethereum Mainnet** (Chain ID: 1)
   - RPC: `https://eth.llamarpc.com`
   - Explorer: `https://etherscan.io`
   - Native Token: ETH

2. **Polygon** (Chain ID: 137)
   - RPC: `https://polygon-rpc.com`
   - Explorer: `https://polygonscan.com`
   - Native Token: MATIC

3. **BNB Smart Chain** (Chain ID: 56)
   - RPC: `https://bsc-dataseed.binance.org`
   - Explorer: `https://bscscan.com`
   - Native Token: BNB

4. **Arbitrum One** (Chain ID: 42161)
   - RPC: `https://arb1.arbitrum.io/rpc`
   - Explorer: `https://arbiscan.io`
   - Native Token: ETH

5. **Optimism** (Chain ID: 10)
   - RPC: `https://mainnet.optimism.io`
   - Explorer: `https://optimistic.etherscan.io`
   - Native Token: ETH

**Capabilities:**
- Wallet creation & import
- Native token transfers (ETH, MATIC, BNB)
- ERC-20 token transfers
- Smart contract deployment
- NFT minting (ERC-721)
- Balance queries
- Transaction history

**API Endpoints:**
- `POST /api/wallets` - Create blockchain wallet
- `POST /api/wallets/import` - Import from mnemonic
- `GET /api/wallets/:id/balance` - Get balance
- `POST /api/wallets/:id/send` - Send transaction
- `POST /api/contracts/deploy` - Deploy contract
- `POST /api/nft/mint` - Mint NFT

---

### 2.2 BitPay Integration
**Status:** ✅ Implemented  
**Service:** `server/cryptoProcessorService.ts`  

**Capabilities:**
- Bitcoin & crypto invoice generation
- QR code payment URLs
- Real-time payment notifications
- Multi-currency support

**Database Processor:** `bitpay`

**Environment Variables:**
- `BITPAY_API_KEY`

**API Method:**
```typescript
createBitPayInvoice(amount: number, currency: string = "USD")
```

---

### 2.3 Binance Pay Integration
**Status:** ✅ Implemented  
**Service:** `server/cryptoProcessorService.ts`  

**Capabilities:**
- USDT/BUSD payments
- Merchant order creation
- Webhook notifications
- Multi-crypto support

**Database Processor:** `binance_pay`

**Environment Variables:**
- `BINANCE_PAY_KEY`
- `BINANCE_PAY_SECRET`

**API Method:**
```typescript
createBinancePayOrder(amount: number, currency: string = "USDT", userId: string)
```

---

### 2.4 Bybit Integration
**Status:** ✅ Implemented  
**Service:** `server/cryptoProcessorService.ts`  

**Capabilities:**
- Deposit address generation
- Real-time deposit monitoring
- Multi-coin support

**Database Processor:** `bybit`

**Environment Variables:**
- `BYBIT_API_KEY`
- `BYBIT_API_SECRET`

**API Method:**
```typescript
createBybitDeposit(amount: number, currency: string = "USDT")
```

---

### 2.5 KuCoin Integration
**Status:** ✅ Implemented  
**Service:** `server/cryptoProcessorService.ts`  

**Capabilities:**
- Deposit address creation
- Payment tracking
- Multi-chain support

**Database Processor:** `kucoin`

**Environment Variables:**
- `KUCOIN_API_KEY`
- `KUCOIN_API_SECRET`
- `KUCOIN_PASSPHRASE`

**API Method:**
```typescript
createKuCoinDeposit(amount: number, currency: string = "USDT")
```

---

### 2.6 Luno Integration
**Status:** ✅ Implemented  
**Service:** `server/cryptoProcessorService.ts`  

**Capabilities:**
- Receive address generation
- Bitcoin/Ethereum deposits
- Real-time confirmations

**Database Processor:** `luno`

**Environment Variables:**
- `LUNO_API_KEY`
- `LUNO_API_SECRET`

**API Method:**
```typescript
createLunoReceiveAddress(currency: string = "BTC")
```

---

### 2.7 Crypto Payments Database Schema
```typescript
cryptoPayments {
  id: varchar (UUID)
  userId: varchar (FK to users)
  processor: enum (bitpay, binance_pay, bybit, kucoin, luno)
  processorInvoiceId: text (unique)
  amount: decimal(36,18)
  currency: text (BTC, ETH, USDT, etc.)
  fiatAmount: decimal(12,2)
  fiatCurrency: text (default: 'usd')
  status: text (new, paid, confirmed, completed, expired, failed)
  paymentUrl: text
  qrCode: text
  txHash: text
  expiresAt: timestamp
  confirmedAt: timestamp
  metadata: jsonb
  createdAt: timestamp
}
```

---

## 3. PEER-TO-PEER (P2P) TRADING SYSTEM
**Status:** ⚠️ NEEDS IMPLEMENTATION

### 3.1 Overview
P2P trading allows users to buy/sell crypto directly with each other using various payment methods and automated escrow.

### 3.2 Required Components

#### Database Schema (To Be Implemented)
```typescript
// P2P Offers
p2pOffers {
  id: varchar (UUID)
  userId: varchar (FK to users - seller/buyer)
  type: enum (buy, sell)
  cryptocurrency: text (BTC, ETH, USDT, etc.)
  amount: decimal(36,18)
  fiatCurrency: text (USD, EUR, etc.)
  pricePerUnit: decimal(12,2)
  paymentMethods: text[] (bank_transfer, paypal, cash, etc.)
  minAmount: decimal(36,18)
  maxAmount: decimal(36,18)
  timeLimit: integer (minutes)
  terms: text
  status: enum (active, paused, completed, cancelled)
  createdAt: timestamp
  expiresAt: timestamp
}

// P2P Orders
p2pOrders {
  id: varchar (UUID)
  offerId: varchar (FK to p2pOffers)
  buyerId: varchar (FK to users)
  sellerId: varchar (FK to users)
  amount: decimal(36,18)
  fiatAmount: decimal(12,2)
  paymentMethod: text
  status: enum (created, escrowed, paid, released, disputed, cancelled, completed)
  escrowTxHash: text
  releaseTxHash: text
  disputeReason: text
  createdAt: timestamp
  paidAt: timestamp
  completedAt: timestamp
}

// P2P Payment Methods
p2pPaymentMethods {
  id: varchar (UUID)
  userId: varchar (FK to users)
  type: enum (bank_transfer, paypal, venmo, cash_app, zelle, etc.)
  details: jsonb (account number, email, etc.)
  isVerified: boolean
  createdAt: timestamp
}

// P2P Chat Messages
p2pChatMessages {
  id: varchar (UUID)
  orderId: varchar (FK to p2pOrders)
  senderId: varchar (FK to users)
  message: text
  attachments: text[]
  createdAt: timestamp
}

// P2P Disputes
p2pDisputes {
  id: varchar (UUID)
  orderId: varchar (FK to p2pOrders)
  raisedBy: varchar (FK to users)
  reason: text
  evidence: jsonb
  status: enum (open, reviewing, resolved, escalated)
  resolution: text
  resolvedBy: varchar (FK to adminUsers - optional)
  createdAt: timestamp
  resolvedAt: timestamp
}

// P2P Reviews
p2pReviews {
  id: varchar (UUID)
  orderId: varchar (FK to p2pOrders)
  reviewerId: varchar (FK to users)
  reviewedUserId: varchar (FK to users)
  rating: integer (1-5)
  comment: text
  createdAt: timestamp
}
```

#### Storage Methods (To Be Implemented)
- `createP2POffer()` / `getP2POffers()` / `updateP2POffer()`
- `createP2POrder()` / `getP2POrders()` / `updateP2POrder()`
- `createP2PPaymentMethod()` / `getUserPaymentMethods()`
- `createP2PChatMessage()` / `getOrderChatMessages()`
- `createP2PDispute()` / `getP2PDisputes()`
- `createP2PReview()` / `getUserP2PReviews()`

#### API Routes (To Be Implemented)
- `GET/POST /api/p2p/offers` - Manage offers
- `GET/POST /api/p2p/orders` - Create/view orders
- `POST /api/p2p/orders/:id/escrow` - Lock funds in escrow
- `POST /api/p2p/orders/:id/mark-paid` - Buyer confirms payment
- `POST /api/p2p/orders/:id/release` - Seller releases crypto
- `GET/POST /api/p2p/chat/:orderId` - Order chat
- `POST /api/p2p/disputes` - Raise dispute
- `GET/POST /api/p2p/payment-methods` - Payment methods
- `POST /api/p2p/reviews` - Leave review

#### Frontend Pages (To Be Implemented)
- P2P Marketplace (`/p2p`)
- Create Offer (`/p2p/create`)
- Active Orders (`/p2p/orders`)
- Order Details & Chat (`/p2p/orders/:id`)
- Dispute Resolution (`/p2p/disputes`)

---

## 4. WALLETCONNECT INTEGRATION
**Status:** ⚠️ NEEDS IMPLEMENTATION

### 4.1 Overview
WalletConnect enables users to connect external Web3 wallets (MetaMask, Trust Wallet, Rainbow, etc.) to the platform for seamless transaction signing.

### 4.2 Implementation Plan

#### Dependencies to Install
```bash
npm install @walletconnect/web3-provider @walletconnect/qrcode-modal
```

#### Service Layer (`server/walletConnectService.ts`)
```typescript
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";

export class WalletConnectService {
  private provider: WalletConnectProvider | null = null;

  async connect(network: string = "ethereum") {
    // Initialize WalletConnect provider
    this.provider = new WalletConnectProvider({
      rpc: {
        1: "https://eth.llamarpc.com",
        137: "https://polygon-rpc.com",
        56: "https://bsc-dataseed.binance.org",
      },
    });

    await this.provider.enable();
    return new ethers.BrowserProvider(this.provider);
  }

  async disconnect() {
    if (this.provider) {
      await this.provider.disconnect();
      this.provider = null;
    }
  }

  getAccounts() {
    return this.provider?.accounts || [];
  }

  async signTransaction(tx: any) {
    if (!this.provider) throw new Error("Not connected");
    const provider = new ethers.BrowserProvider(this.provider);
    const signer = await provider.getSigner();
    return await signer.sendTransaction(tx);
  }
}
```

#### Database Schema Addition
```typescript
// Add to users table or create walletConnectSessions table
walletConnectSessions {
  id: varchar (UUID)
  userId: varchar (FK to users)
  walletAddress: text
  walletType: text (metamask, trust, rainbow, etc.)
  chainId: integer
  isActive: boolean
  sessionData: jsonb
  createdAt: timestamp
  expiresAt: timestamp
}
```

#### API Endpoints (To Be Implemented)
- `POST /api/walletconnect/session` - Create WalletConnect session
- `DELETE /api/walletconnect/session` - Disconnect session
- `GET /api/walletconnect/accounts` - Get connected accounts
- `POST /api/walletconnect/sign` - Sign transaction

#### Frontend Integration (To Be Implemented)
```typescript
// client/src/hooks/useWalletConnect.ts
import { useState } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import QRCodeModal from "@walletconnect/qrcode-modal";

export function useWalletConnect() {
  const [provider, setProvider] = useState<any>(null);
  const [accounts, setAccounts] = useState<string[]>([]);

  const connect = async () => {
    const wcProvider = new WalletConnectProvider({
      rpc: {
        1: "https://eth.llamarpc.com",
        137: "https://polygon-rpc.com",
      },
      qrcode: true,
      qrcodeModal: QRCodeModal,
    });

    await wcProvider.enable();
    setProvider(wcProvider);
    setAccounts(wcProvider.accounts);
  };

  const disconnect = async () => {
    if (provider) {
      await provider.disconnect();
      setProvider(null);
      setAccounts([]);
    }
  };

  return { provider, accounts, connect, disconnect };
}
```

#### UI Components (To Be Implemented)
- WalletConnect button in navbar
- QR code modal for mobile wallets
- Connected wallet indicator
- Network switch UI
- Transaction confirmation modal

---

## 5. PAYMENT FLOW ARCHITECTURE

### 5.1 Fiat Payment Flow
```
User selects amount → Stripe/PayPal checkout → 
Payment processed → Webhook confirmation → 
Database record created → Credits added to account
```

### 5.2 Crypto Payment Flow (Processors)
```
User selects crypto → Processor invoice created → 
QR code/URL displayed → User sends crypto → 
Processor webhook → Payment confirmed → 
Credits added to account
```

### 5.3 Direct Blockchain Flow
```
User creates wallet → Receives deposit address → 
Funds received → Balance updated → 
User initiates transaction → Web3Service signs & sends → 
Transaction confirmed on-chain
```

### 5.4 P2P Trading Flow
```
Seller creates offer → Buyer creates order → 
Seller's crypto locked in escrow → Buyer sends fiat → 
Buyer marks paid → Seller verifies payment → 
Escrow releases crypto to buyer → Both leave reviews
```

### 5.5 WalletConnect Flow
```
User clicks "Connect Wallet" → QR code displayed → 
User scans with mobile wallet → Connection established → 
Platform requests signature → User approves in wallet → 
Transaction signed & broadcast
```

---

## 6. SECURITY CONSIDERATIONS

### 6.1 Encryption
- All private keys stored with AES-256-GCM encryption
- User-specific encryption keys via PBKDF2
- Master encryption key requirement (`ENCRYPTION_MASTER_KEY`)

### 6.2 Authentication
- Replit Auth (OpenID Connect) for all endpoints
- Session-based auth with secure cookies
- Admin role verification for sensitive operations

### 6.3 Smart Contract Security
- Escrow contracts for P2P trades
- Multi-signature wallets for large amounts
- Time-locked releases
- Dispute resolution mechanisms

### 6.4 Fraud Prevention
- KYC/AML verification (Sumsub)
- Transaction limits
- Guardian Angel security monitoring
- Rate limiting on all payment endpoints

---

## 7. MONITORING & WEBHOOKS

### 7.1 Webhook Endpoints
- `/api/payments/stripe/webhook` - Stripe events
- `/api/payments/crypto/webhook` - Crypto processor events
- `/api/payments/blockchain/webhook` - Alchemy blockchain events

### 7.2 WebSocket Channels
- `payment:${userId}` - Real-time payment updates
- `blockchain:${walletId}` - Transaction confirmations
- `p2p:order:${orderId}` - P2P order updates

### 7.3 Admin Monitoring
- Admin panel payment dashboard
- Transaction audit logs
- Suspicious activity alerts
- Automated compliance reporting

---

## 8. NEXT STEPS (Action Items)

### ✅ COMPLETED
1. Stripe integration with webhooks
2. PayPal SDK integration
3. Plaid bank linking
4. 5 crypto payment processors (BitPay, Binance Pay, Bybit, KuCoin, Luno)
5. Direct blockchain payments (5 networks)
6. Web3 wallet creation & management
7. NFT minting capabilities

### ⚠️ TO BE IMPLEMENTED
1. **P2P Trading System**
   - Database schema (6 tables)
   - Storage methods (20+ methods)
   - API routes (15+ endpoints)
   - Frontend pages (5 pages)
   - Smart contract escrow

2. **WalletConnect Integration**
   - Install dependencies
   - WalletConnect service layer
   - Session management
   - Frontend hooks & components
   - QR code modal
   - Multi-wallet support (MetaMask, Trust, Rainbow, Coinbase)

3. **Enhanced Features**
   - Cross-chain bridges
   - DEX aggregator integration
   - Fiat on/off ramp optimization
   - Payment routing intelligence
   - Multi-currency wallet support

---

## 9. ENVIRONMENT VARIABLES CHECKLIST

### Required (Platform Critical)
- ✅ `ENCRYPTION_MASTER_KEY` - Master encryption key
- ✅ `STRIPE_SECRET_KEY` - Stripe payments
- ✅ `VITE_STRIPE_PUBLIC_KEY` - Stripe frontend

### Optional (Feature-Specific)
- ⚠️ `PAYPAL_CLIENT_ID` - PayPal integration
- ⚠️ `PAYPAL_CLIENT_SECRET` - PayPal integration
- ⚠️ `PLAID_CLIENT_ID` - Bank linking
- ⚠️ `PLAID_SECRET` - Bank linking
- ⚠️ `BITPAY_API_KEY` - BitPay crypto payments
- ⚠️ `BINANCE_PAY_KEY` - Binance Pay
- ⚠️ `BINANCE_PAY_SECRET` - Binance Pay
- ⚠️ `BYBIT_API_KEY` - Bybit deposits
- ⚠️ `BYBIT_API_SECRET` - Bybit deposits
- ⚠️ `KUCOIN_API_KEY` - KuCoin deposits
- ⚠️ `KUCOIN_API_SECRET` - KuCoin deposits
- ⚠️ `KUCOIN_PASSPHRASE` - KuCoin auth

---

## 10. API DOCUMENTATION

See individual sections above for detailed API documentation per payment system.

**Base URL:** `https://your-domain.replit.app/api`

**Authentication:** All endpoints require `Authorization: Bearer <token>` or valid session cookie.

**Rate Limits:**
- Payment creation: 10 requests/minute
- Webhook processing: No limit
- Balance queries: 100 requests/minute

---

*Last Updated: October 2025*  
*Valifi Kingdom - Divine Fintech Platform*
