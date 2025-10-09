"""
Advanced simulation utilities.

This module provides functions to estimate the profitability of a
proposed trade by accounting for slippage and gas costs.  The
simulation is still simplistic but improves on the previous
random‑uniform approach by incorporating the gas price, gas limit and
expected slippage as configurable parameters.
"""

from __future__ import annotations

import random
from typing import Dict


def estimate_profit(payload: Dict[str, float], gas_price_gwei: float = 100.0, gas_limit: int = 100_000) -> float:
    """
    Estimate profit of a trade described in `payload`.

    Parameters
    ----------
    payload : dict
        Must contain at least 'amount' (position size).  Additional keys are ignored.
    gas_price_gwei : float
        Gas price in gwei for the transaction.
    gas_limit : int
        Gas limit for the transaction.

    Returns
    -------
    float
        Estimated profit after subtracting gas cost and random slippage.  This
        simulation uses a random slippage factor uniformly distributed
        between -1% and 3% of the trade amount.
    """
    amount = float(payload.get("amount", 0.0))
    # Random slippage factor: could be positive or negative
    slippage_percent = random.uniform(-0.01, 0.03)
    slippage = amount * slippage_percent
    # Gas cost: convert gwei to ETH (1e9 gwei = 1 ETH)
    gas_cost_eth = (gas_price_gwei * gas_limit) / 1e9
    # Base profit: assume 0.5% gross on amount
    base_profit = amount * 0.005
    profit = base_profit + slippage - gas_cost_eth
    return profit