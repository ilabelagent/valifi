"""
kingdom_standard_unified
========================

This package bundles the Kingdom Standard bot components into a
single, standalone library that can run autonomously.  It includes
classes for mempool transaction monitoring, heuristics scoring,
ethics and prayer workflows, auto‑tithing, Telegram signal signing and
verification, and a scalper backtesting harness.  A command‑line
entrypoint is provided in `main.py`.

All code here uses only the Python standard library to remain easy to
deploy in offline or air‑gapped environments.
"""

# Re‑export key classes for convenience
from .core import (
    MempoolTransaction,
    HeuristicsEngine,
    EthicsEngine,
    Stewardship,
    MempoolListener,
)
from .telegram_signal import (
    TelegramSignal,
    TelegramSignalSigner,
    TelegramSignalVerifier,
)
from .backtest import (
    Trade,
    BacktestResult,
    generate_synthetic_prices,
    scalper_strategy,
    run_backtest,
)