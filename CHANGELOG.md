# Changelog – Kingdom FinTech Bot (Next.js)

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

* **Trading Bot** – Simulated stock trading with price lookup, buy/sell, order history and portfolio management.
* **Onboarding Bot** – KYC simulation, risk scoring and goal management actions.
* **Portfolio Bot UI page** – Interactive page for adding positions and rebalancing.
* **Trading Bot UI page** – Interface for viewing prices, placing trades and reviewing positions.
* **Onboarding Bot UI page** – Interface for KYC, risk scoring and goals.
* **project_checklist.md** – Master checklist of platform features with completion status.
* **TODO.md** and **CHANGELOG.md** – Project management documentation.

* **Wallet Bot** – creates and manages HD wallets, persists them, and simulates transfers.
* **Scaffolded Traditional Investment Bots** – added stock, 401k, IRA, pension, mutual funds, bonds, options, forex, commodities and REIT bot classes with stubbed actions.
* **Scaffolded Crypto Ecosystem Bots** – added multichain, DeFi, NFT, bridge, AMM, lending and crypto derivatives bot classes with stubbed actions.
* **Scaffolded Wallet & Web3 Infrastructure Bots** – added HD wallet, multisig, hardware wallet, Web3, seed management, address book, transaction history, portfolio analytics and gas optimizer bot classes with stubbed actions.

* **Address Book Bot** – Implemented full CRUD for managing user contacts with persistent storage.
* **Seed Management Bot** – Added generation, storage and recovery of mnemonic seeds with persistent storage.
* **Portfolio Analytics Bot** – Computes portfolio value, asset allocations and performance metrics using TradingBot prices.
* **Gas Optimizer Bot** – Estimates gas fees and recommends optimal gas prices based on urgency.
* **401(k) Bot** – Implemented account creation, contributions, balance checks and withdrawals with JSON persistence.

### Changed

* Updated README to include Portfolio, Onboarding and Trading bots.
* Updated API registry to register new bots.
* Modified index page to link to new bot pages.

### Notes

This release continues building the modular FinTech platform by adding foundational trading and onboarding functionality.  Future releases will focus on additional bots, persistent storage, security enhancements and compliance.