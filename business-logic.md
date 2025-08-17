# Valifi Platform: Business Logic & Core Processes

This document outlines the essential business logic, rules, and processes that the backend must implement. It complements the API and Data Model specifications.

## Table of Contents
1.  [User & Account Logic](#1-user--account-logic)
2.  [Investment Logic](#2-investment-logic)
3.  [P2P Exchange Logic](#3-p2p-exchange-logic)
4.  [Loan Logic](#4-loan-logic)
5.  [Calculations & Data Aggregation](#5-calculations--data-aggregation)

---

## 1. User & Account Logic

### 1.1 New User Onboarding
-   **Registration:** When a user registers, create a `User` record with `kycStatus: 'Not Started'`. A `UserSettings` record should also be created with default values.
-   **Initial Portfolio:** A new user must start with a zero balance. The only initial `Asset` should be a `Cash` asset with `ticker: 'USD'`, `balance: 0`, and `valueUSD: 0`. **No other mock assets should be created.**

### 1.2 KYC Process
-   **Submission:** When a user submits KYC documents, their `User.kycStatus` should be set to `'Pending'`.
-   **Admin Review:** An admin-only endpoint must exist to review submissions. The admin can set the status to `'Approved'` or `'Rejected'`. If rejected, a `rejectionReason` must be provided.
-   **Gating:** Several features must be gated by `kycStatus === 'Approved'`:
    -   Making a withdrawal (`/funds/withdraw-request`).
    -   Initiating a P2P trade (`/p2p/orders`).
    -   Applying for a loan (`/loans/apply`).
    -   Applying for a Valifi Card (`/cards/apply`).

---

## 2. Investment Logic

### 2.1 Spectrum Equity Plan Investment
-   When a user invests (`POST /investments/spectrum-plan`):
    1.  Verify the user has sufficient balance in their `Cash` asset.
    2.  Debit the investment `amount` from the user's `Cash` asset.
    3.  Create a new `Asset` record.
        -   `type`: 'Stock' or 'Crypto' depending on the plan's underlying assets (this can be defined in a config file on the backend).
        -   `name`: e.g., "CoreStart Plan"
        -   `initialInvestment` and `valueUSD`: Set to the invested `amount`.
        -   `status`: 'Active'.
        -   `maturityDate`: Calculate based on the plan's duration (e.g., `now() + 90 days`).
    4.  Create an `InvestmentLog` entry with `action: 'Buy'`.

### 2.2 Staking (Crypto & Stock)
-   The logic is similar to Spectrum Plans, but a new `Asset` is created with a `type` of 'Crypto' or 'Stock' and a `name` like "Ethereum Staking" or "Apple Inc. Stake".
-   The `details` JSONB field on the `Asset` table must be populated with staking-specific information (APR, monthly ROI, next payout date).
-   **Payouts:** A scheduled job (cron job) must run periodically (e.g., daily) to calculate and distribute staking rewards.
    -   For each active staked asset, calculate the earnings based on its APR/ROI.
    -   Increment the `Asset.totalEarnings` and `Asset.valueUSD`.
    -   Create a new `InvestmentLog` with `action: 'Reward'`.
    -   Create a `Transaction` record with `type: 'ROI Payout'`.

### 2.3 Matured Investments
-   A scheduled job should check for investments where `maturityDate` has passed and `status` is still 'Active'. It should update their `status` to `'Matured'`.
-   When a user transfers a matured asset (`POST /investments/{id}/transfer-maturity`):
    1.  Verify the `Asset.status` is 'Matured'.
    2.  Credit the `Asset.valueUSD` to the user's `Cash` asset.
    3.  Delete the matured `Asset` record or change its status to `'Withdrawn'`.
    4.  Create a `Transaction` with `type: 'Maturity'`.

---

## 3. P2P Exchange Logic

### 3.1 Creating an Offer (`POST /p2p/offers`)
-   **Sell Offer:** If a user creates a 'SELL' offer, the backend must verify they have sufficient `balance` for the `assetTicker` they are selling.
-   **Escrow:** The `availableAmount` of the crypto for the sell offer must be moved from the user's `Asset.balance` to `Asset.balanceInEscrow`. This ensures the funds are locked and available for trade.

### 3.2 Starting a Trade (`POST /p2p/orders`)
-   When a buyer accepts a seller's offer:
    1.  Verify the offer is still active and has sufficient `availableAmount`.
    2.  Decrement the `P2POffer.availableAmount`.
    3.  Create the `P2POrder` record with `status: 'Pending Payment'` and calculate the `expiresAt` timestamp.

### 3.3 The Trade Lifecycle
1.  **Buyer Pays:** Buyer calls `POST /p2p/orders/{id}/confirm-payment`. The backend updates the `P2POrder.status` to `'Payment Sent'`. A notification is sent to the seller.
2.  **Seller Releases:** Seller calls `POST /p2p/orders/{id}/release-escrow`.
    -   The backend verifies the caller is the seller.
    -   The crypto amount is debited from the seller's `Asset.balanceInEscrow`.
    -   The crypto amount is credited to the buyer's corresponding `Asset.balance`. If the buyer doesn't have an `Asset` for that ticker, one should be created.
    -   The `P2POrder.status` is updated to `'Completed'`. Notifications are sent to both parties.
3.  **Expiration:** A scheduled job must check for orders where `expiresAt` has passed and `status` is still `'Pending Payment'`. These orders should be marked as `'Auto-Cancelled'`, and the escrowed funds for the original offer should be released back to the seller's main balance.

### 3.4 Dispute Resolution
-   When a dispute is raised, the `P2POrder.status` changes to `'Disputed'`.
-   This should trigger an alert in an admin dashboard. An admin must manually review the chat, evidence, and resolve the dispute.
-   The admin will have an endpoint to force-resolve the trade, either by releasing the crypto to the buyer or returning it to the seller.

---

## 4. Loan Logic

### 4.1 Loan Application (`POST /loans/apply`)
-   **Eligibility Check:** The backend must verify:
    1.  `User.kycStatus === 'Approved'`.
    2.  The user has active investments.
    3.  The total portfolio value meets the minimum threshold (e.g., $100,000).
    4.  The requested `amount` does not exceed the maximum allowed percentage of their portfolio (e.g., 50%).
-   **Collateral:** The `collateralAssetId` must be verified to belong to the user and be an 'Active' investment. The asset's status could be updated to 'Collateralized'.
-   **Contact File:** If the user provides a contacts file, it must be stored securely and associated with the loan application, accessible only to admins in case of default.

### 4.2 Loan Approval
-   An admin endpoint is required to review and approve/reject loan applications.
-   **On Approval:**
    1.  The `LoanApplication.status` is set to `'Active'`.
    2.  The loan `amount` is credited to the user's `Cash` asset.
    3.  A `Transaction` of `type: 'Deposit'` is created.
    4.  The repayment schedule (start date, due dates) is calculated and stored.

### 4.3 Repayments
-   When a repayment is made, the `amount` is debited from the user's `Cash` asset.
-   The `LoanApplication.details.repaymentProgress` is updated.
-   If the loan is fully repaid, the `status` is changed to `'Repaid'` and the collateral asset's status is returned to `'Active'`.
-   A scheduled job should check for overdue payments and change the `status` to `'Late'`.

---

## 5. Calculations & Data Aggregation

### 5.1 Portfolio Value
-   The `Portfolio.totalValueUSD` should be a calculated sum of `valueUSD` for all of a user's assets. This should be re-calculated whenever an asset's value changes.
-   For crypto and stock assets, a background job should periodically fetch the latest market prices from a reliable API (e.g., CoinGecko, Finnhub) and update the `Asset.valueUSD` for all users holding that asset. `valueUSD = marketPrice * balance`.
-   `Portfolio.change24hValue` and `change24hPercent` must be calculated by comparing the current total value to the total value from 24 hours ago (this may require storing historical portfolio snapshots).

### 5.2 Asset Allocation
-   The `Asset.allocation` percentage is `(Asset.valueUSD / Portfolio.totalValueUSD) * 100`. This needs to be recalculated whenever asset values or the total portfolio value changes.