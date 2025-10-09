"""
Telegram signal signing and verification for the unified package.

This module provides the `TelegramSignal` dataclass and helper classes
for signing and verifying signals with a shared secret key.  It uses
the `SignatureEngine` defined in `.core` for HMAC signing.  In a
production deployment you should use ECDSA for compatibility with
Ethereum wallets.
"""

from __future__ import annotations

import json
import time
from dataclasses import dataclass, asdict

from .core import SignatureEngine


@dataclass
class TelegramSignal:
    originator: str
    payload: dict
    timestamp: float = None
    signature: str = None

    def to_json(self) -> str:
        data = asdict(self)
        return json.dumps(data, sort_keys=True)

    @staticmethod
    def from_json(s: str) -> 'TelegramSignal':
        data = json.loads(s)
        return TelegramSignal(**data)


class TelegramSignalSigner:
    def __init__(self, secret_key: bytes):
        self.engine = SignatureEngine(secret_key)

    def sign(self, signal: TelegramSignal) -> TelegramSignal:
        signal.timestamp = time.time()
        tmp = {
            "originator": signal.originator,
            "payload": signal.payload,
            "timestamp": signal.timestamp,
        }
        message = json.dumps(tmp, sort_keys=True)
        signature = self.engine.sign(message)
        signal.signature = signature
        return signal


class TelegramSignalVerifier:
    def __init__(self, secret_key: bytes, allowlist: list[str]):
        self.engine = SignatureEngine(secret_key)
        self.allowlist = allowlist

    def verify(self, signal: TelegramSignal) -> bool:
        if signal.originator not in self.allowlist:
            return False
        tmp = {
            "originator": signal.originator,
            "payload": signal.payload,
            "timestamp": signal.timestamp,
        }
        message = json.dumps(tmp, sort_keys=True)
        return self.engine.verify(message, signal.signature)


def demo_signal_flow():
    secret = b"my-telegram-secret"
    signer = TelegramSignalSigner(secret)
    verifier = TelegramSignalVerifier(secret, allowlist=["operator1"])
    signal = TelegramSignal(originator="operator1", payload={"action": "buy", "token": "ETH", "amount": 1.0})
    signed_signal = signer.sign(signal)
    print("Signed Signal:", signed_signal)
    valid = verifier.verify(signed_signal)
    print("Verification result:", valid)


if __name__ == "__main__":
    demo_signal_flow()