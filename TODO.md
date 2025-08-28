# TODO – Kingdom FinTech Bot (Next.js)

This document outlines outstanding work and future enhancements for the modular bot architecture.

## Platform Features

* Implement remaining bots: payments/cards, compliance, tax, research, algo, signals, education, metals & collectibles, mining/staking, liquidity/MM, enterprise, security, community & social, revops.  (Most traditional, crypto and wallet bots are now scaffolded.)
* Flesh out scaffolds for asset classes (bonds, options, real estate, mutual funds, forex, commodities, etc.) with real logic and data integration.
* Implement DeFi interactions and multi‑chain wallet operations.
* Integrate third‑party APIs for real market prices and quotes.
* Provide persistent data storage (e.g. Postgres via Prisma) instead of in‑memory stores.
* Provide unit and integration tests for each bot and the API gateway.
* Add authentication/authorization using JWT or OAuth2 and enforce RBAC across bots.
* Implement rate limiting and input sanitization middleware in `/api/bot`.
* Create admin dashboard UI for managing users, bots, feature flags and monitoring system health.
* Add Observability: structured logging, metrics and OpenTelemetry traces.

## Privacy & Compliance

* Expand the lawful Privacy Hub with zero‑knowledge attestation generation and view‑key management.
* Integrate with KYC/AML providers for real verification flows.
* Add regulatory reporting and tax calculations.

## UI & UX Enhancements

* Refactor pages into a consistent design system using Tailwind or a UI component library.
* Implement client‑side state management (e.g. React context or Redux) for cross‑page data.
* Add navigation and layout components instead of linking from the index page.
* Provide mobile‑friendly and responsive layouts.

## Deployment & Infrastructure

* Containerize services and deploy to Vercel or Kubernetes with environment configuration.
* Add CI/CD pipeline with automated tests and linting.
* Integrate external storage for logs and secrets (KMS/Vault).

As this project evolves, please update this file to reflect new tasks and priorities.