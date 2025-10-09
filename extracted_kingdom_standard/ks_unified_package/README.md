# Kingdom Standard Bot Prototype

**Prepared in the spirit of stewardship — use responsibly. Not financial advice.**

This repository contains a demonstration of the **Kingdom Standard** bot described in the initial specification.  It provides a collection of Python modules that simulate mempool monitoring, heuristics scoring for sandwich/back‑run risk, signed Telegram signal workflows, ethics checks with prayer integration, auto‑tithing and a simple scalper backtesting harness.

## Contents

| File | Purpose |
| --- | --- |
| `kingdom_standard.py` | Core classes for mempool transactions, heuristics scoring, ethics engine, prayer integration, auto‑tithing and a simulated mempool listener with sample run function. |
| `scalper_backtest.py` | A simple scalper backtesting harness using synthetic price data to illustrate strategy evaluation. |
| `telegram_signal.py` | Dataclasses and helper classes for signing and verifying Telegram signals using an HMAC secret.  A demo function shows a round‑trip of sign/verify. |
| `ethics_ui.py` | Command‑line workflow that takes a signed signal, verifies it, runs a dummy simulator, applies ethics checks, performs a prayer session and asks the operator for approval. |
| `.github/workflows/ci.yml` | GitHub Actions pipeline that runs the various scripts to ensure they execute without error. |
| `kingdom_standard_unified/scriptures.py` | Contains a collection of Bible verses and a helper to pick a random scripture for prayer sessions. |
| `kingdom_standard_unified/logger.py` | Persistent logger that writes structured JSON events to a file for auditing and dashboards. |
| `kingdom_standard_unified/simulation.py` | Provides an improved profit estimation function accounting for slippage and gas costs. |
| `kingdom_standard_unified/governance.py` | Stubs for multi‑signature approval workflows (N‑of‑M). |
| `kingdom_standard_unified/main.py` | Unified entrypoint offering mempool listening, signal processing, backtesting, dashboard viewing and demo modes. |

## Getting Started

These instructions assume you have Python 3.11 available.  No external dependencies are required; the code uses only the Python standard library.  To try out the various components, run the scripts directly:

```bash
# run the scalper backtest harness
python scalper_backtest.py

# run the Kingdom Standard sample (simulated mempool listener & tithing)
python kingdom_standard.py

# run the Telegram signal demo
python telegram_signal.py

# run the ethics & prayer CLI demo (interactive)
python ethics_ui.py
```

## Ethics & Prayer Workflow

The `EthicsEngine` applies simple rules to avoid repeated large trades or abnormal order sizes.  Before executing a high‑risk transaction the bot triggers a **prayer session** which displays a scripture verse and pauses briefly.  In a real deployment you should implement a 3–5 minute timer and require explicit operator approval afterwards.  The CLI in `ethics_ui.py` demonstrates this by asking the user whether they approve the trade.

## Auto‑Tithing

The `Stewardship` class in `kingdom_standard.py` automatically allocates a configurable percentage of realised profits to charitable causes.  Charities and their weightings can be configured.  A simple text receipt is generated for each tithe distribution; in practice you would create PDF receipts and include transaction hashes for on‑chain payments.

## Backtesting Harness

`scalper_backtest.py` shows how to set up a minimal backtest for a scalper strategy.  It uses a synthetic price series generated via geometric Brownian motion, applies a basic threshold‑based entry/exit rule and reports total profit and win rate.  You can plug in your own price data and strategy logic by modifying `generate_synthetic_prices` and `scalper_strategy`.

## CI/CD

A GitHub Actions workflow (`.github/workflows/ci.yml`) is provided to run the sample scripts on each push to `main`.  It sets up Python, installs dependencies (none by default) and executes the scripts.  Modify this workflow to add linting, unit tests or deployment steps as needed.

## Persistent Logging & Dashboard

All signal processing and mempool alerts are logged to a `logs.jsonl` file via the `PersistentLogger` class.  You can view the log history at any time by running:

```bash
python kingdom_standard_unified/main.py --mode dashboard
```

This will print each event with its timestamp, type and associated data, allowing operators to review past decisions, simulations and approvals.

## Enhanced Ethics & Simulation

The ethics engine now detects not only repeated high‑value trades but also high‑frequency trading (five or more trades by the same operator within one minute).  Prayer sessions choose a random verse from `scriptures.py` to encourage reflection and humility.  The profit simulation has been upgraded to factor in slippage (between -1% and +3% of trade size) and gas costs based on the provided gas price and limit.

## Governance Stub

`governance.py` introduces a `MultiSigApproval` class to model N‑of‑M approval requirements.  While this stub does not perform any cryptographic operations, it demonstrates how you might collect approvals from multiple signatories before executing trades or distributing donations.  In a production environment you should integrate with actual multi‑signature wallets and collect signed approvals from independent trustees.

## Legal & Governance Notes

This code is for demonstration only.  If you plan to deploy an automated trading bot or MEV strategy, **consult legal counsel** in your jurisdiction.  Use multi‑signature wallets and independent audits for any product that holds or moves funds.  Ensure KYC/AML compliance where required.

## Next Steps

1. Integrate a real Ethereum node’s mempool (e.g. via WebSocket) and implement latency‑sensitive event handling.
2. Replace the HMAC signature mechanism with proper ECDSA (secp256k1) signatures to ensure compatibility with Ethereum tools.
3. Connect the `MempoolListener` to an actual simulator to estimate sandwich/back‑run profitability and slippage.
4. Build a web or desktop UI for prayer approval and operator dashboards.
5. Expand auto‑tithing logic to produce PDF receipts and interact with on‑chain donation contracts.