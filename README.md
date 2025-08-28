# Kingdom FinTech Bot – Node/Next.js Modular Architecture

This project adapts the **Kingdom FinTech Dev Bot** design to a
Node.js/Next.js environment suitable for deployment on Vercel.  It
implements a modular bot framework in JavaScript where each feature
domain (banking, trading, crypto, etc.) is encapsulated within its
own class.  A unified API endpoint (`/api/bot`) routes requests to
the appropriate bot and action.

## Key Concepts

* **Autonomous Bots:** Each module implements its own logic and
  interface, extending a common `KingdomBot` base class.
* **Core Services:** The `KingdomCore` provides a stubbed AI engine,
  in‑memory database and logger.  In production these would be
  replaced with real implementations.
* **AI‑Driven:** The `AIEngine` class returns fabricated AI responses to
  emulate risk assessments and underwriting.  Hook in your own AI
  providers here.
* **Dynamic Routing:** A single API route (`/api/bot`) accepts JSON
  requests specifying which bot to use and which action to perform.
* **Extensible:** Additional bots can be added by creating a new class
  under the `bots/` directory and registering it in the API handler.

## Usage

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Then send a POST request to `/api/bot` with a JSON body:

```json
{
  "bot": "banking",
  "action": "create_account",
  "name": "Alice",
  "email": "alice@example.com"
}
```

The response will contain the result of the invoked bot action.

## Implemented Bots

* **Banking Bot** (`banking`):
  * `create_account` – Open a new account with optional AI risk check
  * `process_transaction` – Deposit or withdraw funds
  * `apply_loan` – Simple loan underwriting and repayment schedule
  * `get_balance` – Retrieve account balance

Additional demonstration bots are included:

* **Coin Mixer Bot** (`coin_mixer`):
  * `get_pools` – View the status of each currency mixing pool
  * `start_mix` – Begin a new mixing session (returns a session ID)
  * `get_status` – Check the status of an existing mix session

* **Metals Bot** (`metals`):
  * `get_prices` – Retrieve spot prices for gold, silver, platinum, palladium and artifacts
  * `buy_metal` – Purchase a quantity of a metal for a user
  * `sell_metal` – Sell a quantity of a metal
  * `get_portfolio` – View the user’s metal holdings

* **Mail Bot** (`mail`):
  * `send_mail` – Send an email to another user (in‑memory)
  * `get_messages` – List messages for a user
  * `notify` – Send a generic notification

* **Translation Bot** (`translation`):
  * `translate` – Translate a phrase into a supported language (English, Spanish, French, German or Chinese)
  * `languages` – List supported languages

* **Portfolio Bot** (`portfolio`):
  * `get_positions` – Return the current holdings for a user
  * `add_position` – Add or increase a position
  * `rebalance` – Naively rebalance a user’s positions to equal weight

* **Onboarding Bot** (`onboarding`):
  * `start_kyc` – Simulate a KYC check
  * `get_risk_score` – Generate a random risk score using the AI stub
  * `set_goals` – Save an array of user investment goals
  * `get_goals` – Retrieve the stored goals

* **Trading Bot** (`trading`):
  * `get_price` – Fetch the current price for a symbol
  * `get_prices` – List all available symbols and prices
  * `buy` – Execute a buy order and update the portfolio
  * `sell` – Execute a sell order if sufficient shares exist
  * `get_orders` – View a user’s order history
  * `get_portfolio` – View the user’s holdings

* **Wallet Bot** (`wallet`):
  * `create_wallet` – Generate a new non‑custodial wallet on a given chain
  * `get_wallets` – List all wallets associated with a user
  * `get_balance` – Retrieve the balance of a specific wallet
  * `send` – Simulate a transfer from one wallet to another

* **401(k) Bot** (`401k`):
  * `create_account` – Open a new 401(k) plan for a user
  * `add_contribution` – Add a contribution amount to a 401(k) account
  * `get_balance` – Check the current balance of a 401(k) account
  * `withdraw` – Withdraw funds from a 401(k) account

* **Address Book Bot** (`address_book`):
  * `add_contact` – Add a contact (name, address, chain) to a user's address book
  * `remove_contact` – Remove a contact by ID
  * `list_contacts` – List all contacts for a user

* **Seed Management Bot** (`seed_management`):
  * `generate_seed` – Generate a pseudo‑random mnemonic seed phrase
  * `store_seed` – Persist a seed for a user (optionally linked to a wallet)
  * `recover_seed` – Retrieve a previously stored seed by ID

* **Portfolio Analytics Bot** (`portfolio_analytics`):
  * `get_overview` – Calculate the total value and weights of a user's portfolio using current simulated prices
  * `get_performance` – Return performance metrics compared to the previous valuation

* **Gas Optimizer Bot** (`gas_optimizer`):
  * `estimate_fees` – Estimate gas fees for a given chain and gas limit
  * `optimize_transaction` – Recommend an optimized gas price based on urgency and provide estimated fees

Other bots (trading, crypto, investment, casino, tax, insurance,
admin) remain placeholders for future implementation.  They can
follow the same pattern as these examples.

## Extending the Framework

1. Create a new directory under `bots/` named after your bot (e.g.
   `crypto-bot`).
2. Define a class that extends `KingdomBot` and implements the
   required methods (`initialize`, `execute`, etc.).
3. Add an entry to the `BOT_REGISTRY` in `pages/api/bot.js` mapping
   your bot’s identifier to your new class.
4. Implement any additional manager classes needed for your bot’s
   domain logic.

This modular design ensures that each bot remains self‑contained while
seamlessly integrating into the unified Kingdom ecosystem.