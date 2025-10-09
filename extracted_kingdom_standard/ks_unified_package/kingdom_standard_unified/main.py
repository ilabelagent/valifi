"""
Command‑line interface for the unified Kingdom Standard application.

This module provides a single entrypoint to run the core components
interactively or via command‑line arguments.  Available modes:

* `mempool` – runs the simulated mempool listener with heuristics,
  ethics checks, prayer sessions and auto‑tithing.  Alerts print to
  stdout and include tithe receipts.
* `signal` – processes a single signed signal JSON string provided
  via argument or reads from stdin.  The workflow verifies the
  signature, simulates profit, applies ethics and prayer, and asks
  for approval.
* `backtest` – executes the scalper backtesting harness and prints
  aggregated metrics.
* `demo` – runs a demonstration combining mempool simulation and a
  sample signed signal flow.
"""

from __future__ import annotations

import argparse
import json
import sys

from .core import (
    HeuristicsEngine,
    EthicsEngine,
    MempoolListener,
    Stewardship,
    MempoolTransaction,
)
from .telegram_signal import (
    TelegramSignal,
    TelegramSignalSigner,
    TelegramSignalVerifier,
)
from .ethics_cli import process_signal
from .backtest import run_backtest
from .logger import PersistentLogger


def run_mempool_listener(iterations: int = 5) -> None:
    heuristics = HeuristicsEngine()
    ethics = EthicsEngine()
    stewardship = Stewardship()
    stewardship.configure_charities([
        ("MissionHome", 0.5),
        ("LocalChurch", 0.3),
        ("ReliefFund", 0.2),
    ])

    def alert_handler(tx: MempoolTransaction, score: float):
        print(f"\n=== ALERT ===\nTransaction {tx.tx_hash} scored {score:.2f}")
        print(f"From: {tx.from_address} Value: {tx.value:.4f} Tokens: {tx.token_swaps}")
        profit = 5.0
        tithe = stewardship.calculate_tithe(profit)
        split = stewardship.split_tithe(tithe)
        receipt = stewardship.generate_receipt(split)
        print(receipt)
        ethics.record_trade(tx)

    listener = MempoolListener(heuristics, ethics, alert_callback=alert_handler, threshold=0.6)
    listener.run(iterations=iterations, delay=1.0)


def run_signal_flow(signal_json: str, secret: bytes, allowlist: list[str]) -> None:
    process_signal(signal_json, secret_key=secret, allowlist=allowlist)


def run_demo():
    print("Running mempool listener demo…")
    run_mempool_listener(iterations=3)
    print("\nRunning Telegram signal demo…")
    secret = b"my-telegram-secret"
    signer = TelegramSignalSigner(secret)
    signal = TelegramSignal(originator="operator1", payload={"action": "buy", "token": "USDC", "amount": 1.2})
    signed = signer.sign(signal)
    print("Generated signed signal:")
    print(signed.to_json())
    run_signal_flow(signed.to_json(), secret, allowlist=["operator1"])


def main(argv: list[str] = None) -> None:
    parser = argparse.ArgumentParser(description="Kingdom Standard unified application")
    parser.add_argument(
        "--mode",
        choices=["mempool", "signal", "backtest", "demo", "dashboard"],
        default="demo",
        help="Which subsystem to run",
    )
    parser.add_argument(
        "--signal-json",
        help="JSON string representing a signed Telegram signal (required for --mode signal)",
    )
    args = parser.parse_args(argv)

    if args.mode == "mempool":
        run_mempool_listener()
    elif args.mode == "backtest":
        run_backtest()
    elif args.mode == "signal":
        if not args.signal_json:
            print("Error: --signal-json must be provided when --mode signal", file=sys.stderr)
            sys.exit(1)
        secret = b"my-telegram-secret"
        run_signal_flow(args.signal_json, secret=secret, allowlist=["operator1"])
    elif args.mode == "demo":
        run_demo()
    elif args.mode == "dashboard":
        logger = PersistentLogger()
        events = logger.get_events()
        if not events:
            print("No events logged yet.")
            return
        for entry in events:
            ts = entry.get("timestamp")
            etype = entry.get("type")
            data = entry.get("data")
            from datetime import datetime
            tstr = datetime.fromtimestamp(ts).isoformat()
            print(f"{tstr} [{etype}] {data}")
        return


if __name__ == "__main__":
    main()