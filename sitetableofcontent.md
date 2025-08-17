# Valifi Platform: Comprehensive Table of Contents & Feature Specification

This document provides an exhaustive overview of the Valifi platform's structure, features, and core functionalities. It serves as a definitive guide to understanding the interconnected systems that form our AI-powered financial operating system.

---

## 1.0 Core Platform & UI/UX Framework

The Valifi platform is an integrated ecosystem designed to bridge traditional and decentralized finance under a single, user-centric interface.

-   **1.1 Core Layout (`Layout.tsx`):** The foundational structure of the application.
    -   **1.1.1 Persistent Sidebar (`ArchitectureDiagram.tsx`):** The primary navigation element on desktop, providing access to all platform modules. It is collapsible to maximize screen real estate.
    -   **1.1.2 Contextual Header (`Header.tsx`):** Displays the title of the current view and provides access to the notification panel.
    -   **1.1.3 Main Content Area:** The dynamic container where all views and modules are rendered.

-   **1.2 Theming Engine:** A robust system allowing for deep user personalization.
    -   **1.2.1 Theme Options:** Supports multiple themes including Light, Dark, Midnight (AMOLED), Solarized, and Sunset, plus a 'System' option to match the user's OS preference.
    -   **1.2.2 Dynamic Application:** Theme changes are applied instantly across the entire application without a page reload by manipulating `data-theme` attributes on the root HTML element.

-   **1.3 Responsive Design:** Ensures a seamless experience across all devices.
    -   **1.3.1 Desktop View:** Utilizes a full-featured sidebar for navigation.
    -   **1.3.2 Mobile View:** The sidebar is replaced by a space-efficient **Mobile Bottom Navigation** bar for primary actions (Dashboard, Investments, etc.) and a "More" button that opens a full **Mobile Menu Sheet** with all navigation items.

-   **1.4 Internationalization (i18n):**
    -   **1.4.1 Multi-Language Support:** The platform supports numerous languages (English, Spanish, German, French, Arabic, Hebrew, Chinese, etc.), managed through the `i18next` framework.
    -   **1.4.2 RTL Support:** Automatically adjusts the layout for Right-to-Left languages like Arabic and Hebrew.
    -   **1.4.3 Dynamic Currency & Date Formatting:** Financial data and dates are formatted according to the user's selected language and locale preferences.

-   **1.5 Integrated AI Co-Pilot (`ValifiCoPilot.tsx`):**
    -   A persistent, floating action button provides access to the AI assistant from anywhere in the app.
    -   **Proactive Suggestions:** The AI analyzes the user's context (current view, portfolio state) to provide timely, actionable suggestions (e.g., "Invest your idle cash," "Reinvest matured funds").
    -   **Conversational Interface:** Users can open a chat panel to ask complex financial questions, seek guidance on platform features, or request portfolio analysis.

-   **1.6 Notification System (`NotificationPanel.tsx`):**
    -   A centralized panel for all user updates, accessible from the header.
    -   **Categorized Tabs:** Organizes information into 'Notifications' (actionable alerts), 'Activity' (transaction log), and 'News' (platform updates).
    -   **Real-Time Updates:** The notification icon in the header displays a real-time count of unread alerts.

-   **1.7 Landing Page (`LandingPage.tsx`):**
    -   The public-facing entry point for new and logged-out users.
    -   Features a comprehensive overview of the platform's value proposition, including sections on features, investment philosophy, leadership, testimonials, and careers.
    -   Includes interactive elements like a **Profit Calculator** for Spectrum Plans.
    -   Provides access to legal documents (Terms, Privacy Policy) and a job application modal.

---

## 2.0 Main Dashboard (`DashboardView.tsx`)

The central hub providing a holistic, at-a-glance view of the user's entire financial landscape.

-   **2.1 Dual Balance Summary:**
    -   **Main Balance:** Displays available cash (USD) for immediate use. Includes one-click buttons to initiate **Deposit** and **Withdraw** actions.
    -   **Investment Balance:** Aggregates the total value of all active and matured investments.
    -   **24-Hour Performance:** Shows the portfolio's absolute value change and percentage change over the last 24 hours, color-coded for gains or losses.

-   **2.2 Quick Actions:** A grid of buttons for navigating to the most common user tasks:
    -   **Add Funds:** Opens the `DepositModal`.
    -   **Invest Now:** Navigates to the `InvestmentsView`.
    -   **Swap:** Navigates to the `ExchangeView`.
    -   **Withdraw:** Opens the `WithdrawModal`.
    -   **Get Card:** Navigates to the `CardsView`.
    -   **Apply for Loan:** Navigates to the `LoansView`.

-   **2.3 Active Investments List:** A summarized list of all non-cash assets.
    -   **Details Displayed:** Shows the asset's icon, name, ticker, current value, and total earnings.
    -   **Status Indicator:** Each asset has a status chip (e.g., 'Active', 'Matured').
    -   **Actionable Items:** Matured investments feature a "Transfer" button to move funds to the Main Balance. Active investments are shown as "Locked" with a tooltip indicating the maturity date.

-   **2.4 Recent Activity:** A feed displaying the latest transactions.
    -   **Iconography:** Each transaction type (Deposit, Trade, ROI Payout, etc.) is represented by a unique icon for quick recognition.
    -   **Details:** Shows transaction description, status, and amount, color-coded for positive or negative value.

-   **2.5 Integrated Widgets:**
    -   **2.5.1 Portfolio Performance Chart:** An interactive line chart visualizing the portfolio's value over selectable time ranges (7D, 30D, All). Includes tooltips for viewing specific values on hover.
    -   **2.5.2 Top Movers:** A list of the top 5 performing crypto and stock assets over the last 24 hours, filterable by asset class.
    -   **2.5.3 Investor's Forum:** An exclusive, AI-augmented chat room for users with a portfolio value over $100,000. The AI provides market analysis and responds to user discussions.
    -   **2.5.4 World Clock & FX Ticker:** Displays the local time and market status (Open/Closed) for major financial hubs (New York, London, Tokyo, Hong Kong). Includes a scrolling ticker of real-time foreign exchange rates relative to the user's selected currency.

---

## 3.0 Investment Hub (`InvestmentsView.tsx`)

The central module for all investment activities, offering a diverse range of products.

-   **3.1 Primary Navigation Tabs:**
    -   **Overview:** A curated view of all available investment modules, allowing users to discover different products.
    -   **My Holdings:** A detailed table of all the user's current investment assets.
    -   **Activity Log:** A comprehensive and filterable log of all investment-related transactions.
    -   **Product-Specific Tabs:** Direct navigation to each investment module (Spectrum, Staking, REITs, etc.).

-   **3.2 Investment Summary:** A set of three stat cards at the top of the view displaying **Total Invested**, **Total Earned**, and **Net ROI %**.

-   **3.3 "My Holdings" Tab:**
    -   A comprehensive, sortable, and filterable table of all non-cash assets.
    -   **Columns:** Asset Name, Value, 24h Change, Portfolio Allocation %.
    -   **Interactivity:** Users can sort by any column. A search bar allows filtering by name or ticker.
    -   **Actions Dropdown:** Each asset has a menu to **View History & Logs** (opening the `InvestmentDetailModal`), **Reinvest Earnings**, or **Transfer to Main** (for matured assets).

-   **3.4 Investment Modules:**
    -   **3.4.1 Spectrum Equity Plans:** A suite of tiered investment plans. Users can click "Invest Now" on a plan card to open the `InvestModal`, where they input an amount and confirm the investment.
    -   **3.4.2 Crypto Staking:** A list of available cryptocurrencies for staking. The `StakeModal` allows users to specify the amount, duration, and payout destination. The `ManageStakeModal` is used for matured stakes.
    -   **3.4.3 Stock Staking:** A unique module for staking in global companies. The UI displays available stocks with their current price, 24h change, and a "Pool Size" popularity metric. The investment flow is handled by the `StockStakeModal`.
    -   **3.4.4 Real Estate (REITs):** A gallery of real estate properties available for fractional investment. Users can view property details and invest via the `REITInvestmentModal`.
    -   **3.4.5 NFT Investments:** A marketplace for investing in fractional shares of high-value NFTs. The investment process is handled by the `NFTInvestModal`.

---

## 4.0 Trading & Exchange Modules

-   **4.1 Instant Swap (`ExchangeView.tsx`):**
    -   A streamlined interface for instantly swapping between any two crypto or fiat assets held in the user's portfolio.
    -   Features two main components: a "From" input and a "To" input.
    -   Automatically calculates the exchange rate and received amount, factoring in a minimal fee.
    -   Includes a "Max" button to quickly input the full balance of the selected asset.

-   **4.2 P2P Smart Trading Engine (`P2PExchangeView.tsx`):**
    -   **Marketplace:** The main view where users can browse buy/sell offers. It is filterable by Asset, Fiat Currency, Payment Method, and Country.
    -   **Trade Initiation:** Users can click "Buy" or "Sell" on an offer to open the `TradeConfirmationModal` to specify the amount and initiate the trade.
    -   **Order Management (`OrderDetailsModal`):** Once a trade starts, a detailed modal appears showing order status, payment instructions, and a fully integrated **Real-Time Chat Interface** (`P2PChatInterface`).
    -   **User Actions:**
        -   **Buyer:** Can mark the order as paid ("I have paid").
        -   **Seller:** Can confirm payment receipt and release the escrowed crypto.
    -   **Security & Trust:** All trades are protected by a smart contract escrow. A **Dispute System** (`DisputeModal`) allows users to request admin intervention. **Trader Profiles** (`P2PProfileModal`) show reputation stats.
    -   **Personalization (`CreateOfferModal`, `ManagePaymentMethodsModal`):** Users can create their own offers and manage a list of their payment methods.

---

## 5.0 Wallet & Funds Management

-   **5.1 Hybrid Wallet (`WalletView.tsx`):**
    -   **Wallet Generation:** First-time users are prompted to create a secure, self-custody wallet, which generates a 12-word **Secret Phrase** for backup (`SecretPhraseModal`).
    -   **Dual-Tab Interface:**
        -   **Self-Custody:** Lists assets the user fully controls (e.g., BTC, ETH). Provides **Send** and **Receive** functionality.
        -   **Custodial:** Lists assets managed by the platform for convenience (e.g., USD cash balance).
    -   **WalletConnect & Import (`WalletConnectModal`):** Allows users to connect external wallets or import them using their seed phrase for balance tracking.

-   **5.2 Banking (`BankingView.tsx`):**
    -   **Account Linking (`LinkBankAccountModal`):** A secure form for users to submit their bank account details and a verification document (e.g., bank statement).
    -   **Account Management:** Displays a list of linked accounts with their status (Pending, Verified, Rejected). Verified accounts can be used for fiat deposits/withdrawals.

-   **5.3 Internal Transfers (`InternalTransfer.tsx`):**
    -   A simple form to send USD instantly and for free to any other Valifi user via their username or email. Includes a history tab to view past transfers.

-   **5.4 Deposit & Withdraw Modals:**
    -   **`DepositModal`:** A unified modal with tabs for 'Bank Deposit' and 'Crypto Deposit'. Provides all necessary details (bank info with reference code, or crypto address with QR code).
    -   **`WithdrawModal`:** A secure modal for withdrawals. It enforces KYC checks and allows users to withdraw to a linked bank account or an external crypto address.

---

## 6.0 Advanced Financial Products

-   **6.1 Valifi Cards (`CardsView.tsx`):**
    -   **Application (`CardApplicationModal`):** A step-by-step modal for users to apply for a Virtual or Physical card, choosing the theme and currency.
    -   **Card Management:** The main view displays a 3D representation of the user's card (`ValifiCard`). Actions include: **Freeze/Unfreeze**, **Show/Hide** card details, and **Copy** card number.

-   **6.2 Loans (`LoansView.tsx`):**
    -   **Eligibility Gate:** Access is restricted to users with KYC approval and a minimum portfolio value.
    -   **Application Form:** A multi-step form to apply for a loan, select a collateral asset, and agree to terms.
    -   **Loan Dashboard:** Tabs to view 'Active Loans', 'Repayment Schedule', and 'Loan History'. Active loans show a progress bar for repayment and an option to make the next payment.

-   **6.3 Privacy Hub (`PrivacyView.tsx`):**
    -   An advanced crypto-mixing service using zk-SNARKs.
    -   Users create a "mix" by specifying an asset, amount, destination address, and desired **Anonymity Level** (via a slider).
    -   The UI provides a unique deposit address and shows the real-time status of the mix (Awaiting Deposit, Confirming, Mixing, Completed).

---

## 7.0 User Account & Settings (`SettingsView.tsx`)

A multi-section page for comprehensive account management.

-   **7.1 Account & Security:**
    -   **Profile:** Update name, username, and profile picture.
    -   **Password Management:** Change account password.
    -   **Two-Factor Authentication (2FA):** A complete flow to enable 2FA using an authenticator app, including QR code scanning and verification.
    -   **Session Management:** View and revoke active login sessions.
-   **7.2 Preferences & Display:**
    -   **Personalization:** Change preferred display currency, language, and theme.
    -   **Privacy Mode:** A toggle to blur all sensitive balance information across the platform.
-   **7.3 Privacy & Compliance:** Manage marketing consents and data requests.

---

## 8.0 Compliance & Growth Modules

-   **8.1 KYC Verification (`KYCView.tsx`):**
    -   A step-by-step form for submitting personal information, ID documents, and a live photo.
    -   The view dynamically updates to show the current status: 'Not Started', 'Pending', 'Approved', or 'Rejected' (with a reason).

-   **8.2 Tax Center (`TaxView.tsx`):**
    -   Displays a summary of realized capital gains/losses.
    -   Allows downloading of tax documents (e.g., Form 8949, transaction history).
    -   Features an **AI Tax Assistant** that provides guidance based on the user's transaction history.

-   **8.3 Referrals (`ReferralsView.tsx`):**
    -   Provides the user's unique referral link with social sharing buttons.
    -   Displays key stats: total referrals and total earnings.
    -   Features a visual, interactive **Referral Tree** showing the user's downline.
    -   Includes a log of recent referral activities and earnings.
