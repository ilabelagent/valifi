"""
Ethics & Prayer CLI for the unified package.

Provides functions to process a signed signal: verify authenticity,
simulate a transaction, apply ethics checks, perform a prayer session
and request operator approval.  This module is reused by the unified
`main.py` entrypoint.
"""

from __future__ import annotations

import json
import time
from typing import List

from .core import HeuristicsEngine, EthicsEngine, MempoolTransaction
from .telegram_signal import TelegramSignal, TelegramSignalVerifier, TelegramSignalSigner
from .simulation import estimate_profit
from .logger import PersistentLogger
from .scriptures import random_scripture


def simulate_profit(payload: dict) -> float:
    """Wrapper around estimate_profit to maintain backward compatibility."""
    return estimate_profit(payload)


def process_signal(signal_json: str, secret_key: bytes, allowlist: List[str]) -> None:
    logger = PersistentLogger()
    verifier = TelegramSignalVerifier(secret_key, allowlist)
    signal = TelegramSignal.from_json(signal_json)
    if not verifier.verify(signal):
        print("[ERROR] Signal verification failed. Rejecting message.")
        logger.log_event("signal_rejected", {"reason": "bad_signature", "signal": signal_json})
        return
    print("Signal verified from originator:", signal.originator)
    logger.log_event("signal_verified", {"originator": signal.originator, "payload": signal.payload})
    estimated_profit = simulate_profit(signal.payload)
    print(f"Estimated profit from simulation: {estimated_profit:.4f}")
    logger.log_event("simulation", {"estimated_profit": estimated_profit})
    tx = MempoolTransaction(
        tx_hash="0xsimulated",
        from_address=signal.originator,
        to_address="0xrouter",
        value=signal.payload.get("amount", 0.0),
        gas_price=100,
        gas=100_000,
        token_swaps=[signal.payload.get("token", "")],
        liquidity=500_000,
        path_length=1,
        base_fee=50,
        contra_position=False,
        timestamp=time.time(),
    )
    heuristics = HeuristicsEngine()
    score = heuristics.score(tx)
    print(f"Risk score for this transaction: {score:.2f}")
    logger.log_event("risk_score", {"score": score})
    ethics = EthicsEngine()
    approved, reasons = ethics.check(tx)
    if not approved:
        print("Ethics check failed:", reasons)
        logger.log_event("ethics_failed", {"reasons": reasons})
        return
    logger.log_event("ethics_passed", {})
    # Prayer session with random scripture
    verse = random_scripture()
    print(f"\n\n{verse}\n")
    print("Please take a moment (simulated) for silent prayer...")
    time.sleep(2)
    logger.log_event("prayer", {"scripture": verse})
    note = "Prayer session completed. Refocus on stewardship and integrity."
    print(note)
    answer = input("Do you approve execution of this trade? [y/N]: ")
    if answer.strip().lower() != 'y':
        print("Trade rejected by operator.")
        logger.log_event("trade_rejected", {})
        return
    print("Trade approved. Executing... (stub)")
    logger.log_event("trade_approved", {})


def demo_cli():
    secret = b"my-telegram-secret"
    signer = TelegramSignalSigner(secret)
    signal = TelegramSignal(originator="operator1", payload={"action": "sell", "token": "UNI", "amount": 2.5})
    signed_signal = signer.sign(signal)
    signal_json = signed_signal.to_json()
    print("Incoming signal JSON:\n", signal_json)
    process_signal(signal_json, secret_key=secret, allowlist=["operator1"])


if __name__ == '__main__':
    demo_cli()