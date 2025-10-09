"""
Core components for the Kingdom Standard bot (unified package).

This module defines data structures and engines used throughout the
system, including the mempool transaction model, heuristics scoring,
a simple HMAC‑based signature engine, ethics checks with prayer
integration, a simulated mempool listener and auto‑tithing
functionality.  The code mirrors the stand‑alone `kingdom_standard.py`
module but is packaged for reuse.
"""

from __future__ import annotations

import time
import random
import hashlib
import hmac
import logging
from dataclasses import dataclass, field
from typing import List, Dict, Callable, Optional, Tuple

# Import random scripture for prayer sessions
try:
    from .scriptures import random_scripture  # type: ignore
except Exception:
    # Fallback if relative import fails (e.g. during stand‑alone run)
    def random_scripture():
        return "Proverbs 3:5‑6: Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."


@dataclass
class MempoolTransaction:
    """Represents a simplified Ethereum mempool transaction."""

    tx_hash: str
    from_address: str
    to_address: str
    value: float
    gas_price: int
    gas: int
    token_swaps: List[str]
    liquidity: float
    path_length: int
    base_fee: int
    contra_position: bool
    timestamp: float = field(default_factory=time.time)


class HeuristicsEngine:
    """Calculates a risk score for potential sandwich/back‑run opportunities."""

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights: Dict[str, float] = weights or {
            "value": 0.2,
            "gas_price": 0.1,
            "liquidity": 0.25,
            "path_length": 0.1,
            "base_fee": 0.05,
            "contra_position": 0.3,
        }

    def score(self, tx: MempoolTransaction) -> float:
        value_norm = min(tx.value / 10.0, 1.0)
        gas_price_norm = min(tx.gas_price / 200.0, 1.0)
        liquidity_norm = min(tx.liquidity / 1_000_000.0, 1.0)
        path_norm = min(tx.path_length / 5.0, 1.0)
        base_fee_norm = min(tx.base_fee / 200.0, 1.0)
        contra_norm = 1.0 if tx.contra_position else 0.0

        score = (
            self.weights["value"] * value_norm +
            self.weights["gas_price"] * gas_price_norm +
            self.weights["liquidity"] * (1.0 - liquidity_norm) +
            self.weights["path_length"] * path_norm +
            self.weights["base_fee"] * base_fee_norm +
            self.weights["contra_position"] * contra_norm
        )
        return score


class SignatureEngine:
    """Implements a simple HMAC‑based signing and verification scheme."""

    def __init__(self, secret_key: bytes):
        self.secret_key = secret_key

    def sign(self, message: str) -> str:
        digest = hmac.new(self.secret_key, message.encode(), hashlib.sha256).hexdigest()
        return digest

    def verify(self, message: str, signature: str) -> bool:
        expected = hmac.new(self.secret_key, message.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)


class EthicsEngine:
    """Applies ethical checks to potential trades and maintains a prayer workflow."""

    def __init__(self):
        # history maps address to list of (timestamp, trade value) tuples
        self.history: Dict[str, List[Tuple[float, float]]] = {}

    def record_trade(self, tx: MempoolTransaction) -> None:
        # Record time and value to track frequency and total volume
        self.history.setdefault(tx.from_address, []).append((tx.timestamp, tx.value))

    def check(self, tx: MempoolTransaction) -> Tuple[bool, List[str]]:
        reasons: List[str] = []
        approved = True

        history = self.history.get(tx.from_address, [])
        # High volume in recent trades
        recent_values = [v for (t, v) in history[-3:]]
        if len(recent_values) >= 3 and sum(recent_values) > 30.0:
            approved = False
            reasons.append("Repeated high‑value trades flagged as potential manipulation.")

        # Abnormal order size
        if tx.value > 50.0:
            approved = False
            reasons.append("Order size unusually large relative to typical behaviour.")

        # High frequency: more than 5 trades in the last minute
        now = tx.timestamp
        recent_count = sum(1 for (t, _) in history if now - t < 60)
        if recent_count >= 5:
            approved = False
            reasons.append("High frequency trading detected (>=5 trades in last minute).")

        return approved, reasons

    def prayer_session(self) -> str:
        """Display a random scripture and simulate a short prayer pause."""
        verse = random_scripture()
        print(f"\n\n{verse}\n")
        print("Please take a moment (simulated) for silent prayer...")
        time.sleep(2)
        note = "Prayer session completed. Refocus on stewardship and integrity."
        return note


class MempoolListener:
    """Listens to mempool (simulated) and applies scoring and ethics checks."""

    def __init__(self,
                 heuristics: HeuristicsEngine,
                 ethics: EthicsEngine,
                 alert_callback: Optional[Callable[[MempoolTransaction, float], None]] = None,
                 threshold: float = 0.5):
        self.heuristics = heuristics
        self.ethics = ethics
        self.alert_callback = alert_callback or self.default_alert
        self.threshold = threshold
        self.running = False

    def default_alert(self, tx: MempoolTransaction, score: float) -> None:
        print(f"[ALERT] tx {tx.tx_hash} scored {score:.2f}")

    def generate_sample_tx(self) -> MempoolTransaction:
        tx_hash = f"0x{random.getrandbits(128):032x}"
        from_address = f"0x{random.getrandbits(160):040x}"
        to_address = f"0x{random.getrandbits(160):040x}"
        value = random.uniform(0.1, 20.0)
        gas_price = random.randint(30, 300)
        gas = random.randint(21_000, 200_000)
        token_swaps = [random.choice(["WETH", "USDC", "DAI", "UNI"])]
        liquidity = random.uniform(100_000, 1_000_000)
        path_length = random.randint(1, 4)
        base_fee = random.randint(30, 150)
        contra_position = random.choice([True, False, False])
        return MempoolTransaction(
            tx_hash, from_address, to_address, value, gas_price, gas,
            token_swaps, liquidity, path_length, base_fee, contra_position
        )

    def listen_once(self) -> None:
        tx = self.generate_sample_tx()
        score = self.heuristics.score(tx)
        if score >= self.threshold:
            approved, reasons = self.ethics.check(tx)
            if not approved:
                logging.warning(f"Ethics check failed for {tx.tx_hash}: {reasons}")
                return
            note = self.ethics.prayer_session()
            logging.info(note)
            self.alert_callback(tx, score)

    def run(self, iterations: int = 10, delay: float = 1.0) -> None:
        self.running = True
        for _ in range(iterations):
            if not self.running:
                break
            self.listen_once()
            time.sleep(delay)
        self.running = False

    def stop(self) -> None:
        self.running = False


class Stewardship:
    """Implements auto‑tithing and charity distribution."""

    def __init__(self, tithe_percent: float = 0.1):
        self.tithe_percent = tithe_percent
        self.charity_rules: List[Tuple[str, float]] = []

    def configure_charities(self, charities: List[Tuple[str, float]]) -> None:
        total = sum(w for _, w in charities)
        if abs(total - 1.0) > 1e-6:
            raise ValueError("Charity weights must sum to 1.0")
        self.charity_rules = charities

    def calculate_tithe(self, profit: float) -> float:
        return max(profit * self.tithe_percent, 0.0)

    def split_tithe(self, amount: float) -> Dict[str, float]:
        if not self.charity_rules:
            return {}
        distribution = {name: amount * weight for name, weight in self.charity_rules}
        return distribution

    def generate_receipt(self, distribution: Dict[str, float]) -> str:
        lines = ["Tithe Receipt:\n"]
        total = 0.0
        for charity, amount in distribution.items():
            lines.append(f"  Charity: {charity} — Amount: {amount:.4f}\n")
            total += amount
        lines.append(f"Total Tithe: {total:.4f}\n")
        return "".join(lines)