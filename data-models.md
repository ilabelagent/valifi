# Valifi Platform: Data Model Specification

This document details the data models required for the Valifi backend. It is derived from the frontend `types.ts` file and serves as a blueprint for the database schema. The recommended database is PostgreSQL.

## Table of Contents
1.  [Core Models](#1-core-models)
2.  [Investment & Asset Models](#2-investment--asset-models)
3.  [Transaction & Financial Models](#3-transaction--financial-models)
4.  [P2P Exchange Models](#4-p2p-exchange-models)
5.  [Feature-Specific Models](#5-feature-specific-models)
6.  [Relationships Diagram (Conceptual)](#6-relationships-diagram-conceptual)

---

## 1. Core Models

### 1.1 `User`
Stores core user information.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `fullName` | VARCHAR(255) | |
| `username` | VARCHAR(100) | Unique, Indexed |
| `email` | VARCHAR(255) | Unique, Indexed |
| `passwordHash` | VARCHAR(255) | Hashed password (e.g., using bcrypt) |
| `profilePhotoUrl` | TEXT | URL to profile image |
| `kycStatus` | ENUM | 'Not Started', 'Pending', 'Approved', 'Rejected', 'Resubmit Required' |
| `createdAt` | TIMESTAMP WITH TIME ZONE | |
| `updatedAt` | TIMESTAMP WITH TIME ZONE | |

### 1.2 `UserSettings`
A separate table is more scalable than a JSONB column.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `userId` | UUID | Foreign Key to `User.id`, Unique |
| `twoFactorEnabled` | BOOLEAN | Default: false |
| `twoFactorMethod`| ENUM | 'none', 'email', 'sms', 'authenticator' |
| `twoFactorSecret`| TEXT | Encrypted secret for authenticator apps |
| `loginAlerts` | BOOLEAN | Default: true |
| `preferences` | JSONB | Stores currency, language, theme, etc. |
| `privacy` | JSONB | Stores marketing consents, etc. |
| `vaultRecovery` | JSONB | Encrypted recovery details |

### 1.3 `ActiveSession`
Stores active login sessions for security management.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `userId` | UUID | Foreign Key to `User.id` |
| `device` | VARCHAR(255) | e.g., 'Chrome on macOS' |
| `location` | VARCHAR(255) | e.g., 'New York, US' |
| `ipAddress` | INET | |
| `lastActive` | TIMESTAMP WITH TIME ZONE | |
| `createdAt` | TIMESTAMP WITH TIME ZONE | |

---

## 2. Investment & Asset Models

### 2.1 `Asset`
The central table for all user-owned assets. This is a polymorphic table that holds different types of assets.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `userId` | UUID | Foreign Key to `User.id` |
| `name` | VARCHAR(255) | e.g., 'Bitcoin', 'Apple Inc. Stake' |
| `ticker` | VARCHAR(20) | Indexed. e.g., 'BTC', 'AAPL' |
| `type` | ENUM | 'Crypto', 'Stock', 'Cash', 'NFT', 'REIT' |
| `balance` | DECIMAL | For fungible assets like crypto, stock shares, cash |
| `balanceInEscrow` | DECIMAL | Default: 0. For assets held in P2P escrow |
| `valueUSD` | DECIMAL | Current market value in USD. Updated by a background job. |
| `initialInvestment`| DECIMAL | Original cost basis |
| `totalEarnings` | DECIMAL | Lifetime earnings from this asset |
| `status` | ENUM | 'Active', 'Pending', 'Matured', 'Withdrawable', 'Withdrawn' etc. |
| `maturityDate` | TIMESTAMP WITH TIME ZONE | For time-locked investments |
| `payoutDestination`| ENUM | 'wallet', 'balance' | For staking rewards |
| `details` | JSONB | Stores type-specific data (see below) |
| `createdAt` | TIMESTAMP WITH TIME ZONE | |
| `updatedAt` | TIMESTAMP WITH TIME ZONE | |

**Details for `Asset.details` (JSONB column):**
*   **For `type: 'NFT'`**: `{ "collection": "...", "imageUrl": "...", "floorPrice": 15000, "isFractional": true, "investableNFTId": "...", "sharesOwned": 50 }`
*   **For `type: 'REIT'`**: `{ "propertyId": "...", "sharesOwned": 5000, "monthlyDividend": 25.50 }`
*   **For `type: 'Stock'` (Staked)**: `{ "stakedOn": "...", "monthlyROI": 12.5, "nextPayoutDate": "..." }`
*   **For `type: 'Crypto'` (Staked)**: `{ "apr": 4.5 }`

### 2.2 `InvestmentLog`
Records the history of actions for a specific asset.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `assetId` | UUID | Foreign Key to `Asset.id` |
| `date` | TIMESTAMP WITH TIME ZONE | |
| `action` | ENUM | 'Buy', 'Reward', 'Withdrawal', 'Sell', etc. |
| `amountUSD` | DECIMAL | Value of the action in USD |
| `status` | ENUM | 'Completed', 'Pending' |
| `referenceId` | VARCHAR(255) | Link to a `Transaction` or external hash |

---

## 3. Transaction & Financial Models

### 3.1 `Transaction`
A global log of all financial movements on the platform.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `userId` | UUID | Foreign Key to `User.id` |
| `date` | TIMESTAMP WITH TIME ZONE | |
| `description`| VARCHAR(255) | e.g., 'Bank Deposit', 'Sent 0.05 BTC' |
| `amountUSD` | DECIMAL | Can be positive or negative |
| `status` | ENUM | 'Completed', 'Pending', 'Failed' |
| `type` | ENUM | 'Deposit', 'Withdrawal', 'Trade', 'P2P', 'Loan Repayment', 'ROI Payout', etc. |
| `txHash` | TEXT | Optional external blockchain transaction hash |
| `relatedAssetId`| UUID | Optional Foreign Key to `Asset.id` |

---

## 4. P2P Exchange Models

### 4.1 `P2POffer`
Stores offers created by users to buy or sell assets.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `userId` | UUID | Foreign Key to `User.id` (the creator) |
| `type` | ENUM | 'BUY', 'SELL' |
| `assetTicker` | VARCHAR(20) | |
| `fiatCurrency` | VARCHAR(10) | e.g., 'USD', 'NGN' |
| `price` | DECIMAL | Price per unit of the asset in fiat |
| `availableAmount`| DECIMAL | Total crypto amount available for this offer |
| `minOrder` | DECIMAL | Minimum fiat value for a trade |
| `maxOrder` | DECIMAL | Maximum fiat value for a trade |
| `paymentTimeLimitMinutes`| INTEGER | |
| `terms` | TEXT | Optional user-defined terms |
| `isActive` | BOOLEAN | Default: true |

### 4.2 `P2POrder`
Represents an active or completed trade between two users.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `offerId` | UUID | Foreign Key to `P2POffer.id` |
| `buyerId` | UUID | Foreign Key to `User.id` |
| `sellerId` | UUID | Foreign Key to `User.id` |
| `status` | ENUM | 'Pending Payment', 'Payment Sent', 'Completed', 'Disputed', etc. |
| `fiatAmount` | DECIMAL | |
| `cryptoAmount` | DECIMAL | |
| `createdAt` | TIMESTAMP WITH TIME ZONE | |
| `expiresAt` | TIMESTAMP WITH TIME ZONE | |
| `completedAt` | TIMESTAMP WITH TIME ZONE | Nullable |

### 4.3 `P2PChatMessage`, `Dispute`, `PaymentMethod`
These should be implemented as separate tables with foreign keys linking back to `P2POrder` or `User` as appropriate, following the structure in `types.ts`.

---

## 5. Feature-Specific Models

### 5.1 `LoanApplication`
Stores user loan applications.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `userId` | UUID | Foreign Key to `User.id` |
| `amount` | DECIMAL | Requested loan amount in USD |
| `term` | INTEGER | Loan term in days |
| `interestRate`| DECIMAL | |
| `collateralAssetId`| UUID | Foreign Key to `Asset.id` |
| `status` | ENUM | 'Pending', 'Approved', 'Repaid', etc. |
| `details` | JSONB | Stores repayment progress, due dates, etc. |

### 5.2 `ValifiCard`
Stores details of user-issued cards.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `userId` | UUID | Foreign Key to `User.id` |
| `status` | ENUM | 'Not Applied', 'Pending Approval', 'Approved' |
| `type` | ENUM | 'Virtual', 'Physical' |
| `currency` | VARCHAR(10) | |
| `theme` | VARCHAR(50) | |
| `cardNumberHash`| VARCHAR(255) | Hashed card number |
| `expiry` | TEXT | Encrypted |
| `cvvHash` | VARCHAR(255) | Hashed CVV |
| `isFrozen` | BOOLEAN | |

### 5.3 `BankAccount`
Stores linked bank accounts for fiat movements.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `userId` | UUID | Foreign Key to `User.id` |
| `countryCode` | VARCHAR(5) | |
| `nickname` | VARCHAR(255) | |
| `details` | JSONB | Encrypted account details (IBAN, Acc. No., etc.) |
| `status` | ENUM | 'Pending', 'Verified', 'Rejected' |

---

## 6. Relationships Diagram (Conceptual)

```
User (1) --<* UserSettings (1)
User (1) --<* Asset (*)
User (1) --<* Transaction (*)
User (1) --<* P2POffer (*)
User (1) --<* LoanApplication (*)
User (1) --<* ValifiCard (1)
User (1) --<* BankAccount (*)

Asset (1) --<* InvestmentLog (*)

P2POffer (1) --<* P2POrder (*)
User (buyers) (1) --<* P2POrder (*)
User (sellers) (1) --<* P2POrder (*)
```
* `(1)` denotes one, `(*)` denotes many.
* `--<` indicates a one-to-many relationship.