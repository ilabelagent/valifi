"""
Scalper backtesting harness for the unified package.

This module mirrors the stand‑alone `scalper_backtest.py` script.  It
generates a synthetic price series, applies a simple threshold‑based
scalper strategy and returns performance metrics.  You can import the
functions in other modules or run the backtest directly via
`run_backtest()`.
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass, field


@dataclass
class Trade:
    entry_time: pd.Timestamp
    exit_time: pd.Timestamp
    entry_price: float
    exit_price: float
    direction: str  # 'long' or 'short'
    profit: float


@dataclass
class BacktestResult:
    trades: list = field(default_factory=list)
    pnl: float = 0.0
    win_rate: float = 0.0

    @property
    def total_trades(self) -> int:
        return len(self.trades)

    def summary(self) -> str:
        lines = [f"Total PnL: {self.pnl:.2f}",
                 f"Total trades: {self.total_trades}",
                 f"Win rate: {self.win_rate * 100:.1f}%"]
        return "\n".join(lines)


def generate_synthetic_prices(n: int = 240, seed: int = 42) -> pd.Series:
    rng = np.random.default_rng(seed)
    dt = 1 / 240
    mu = 0.0002
    sigma = 0.01
    log_returns = (mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * rng.standard_normal(n)
    price = 100 * np.exp(np.cumsum(log_returns))
    start = pd.Timestamp("2025-01-01 09:30")
    index = pd.date_range(start, periods=n, freq="min")
    return pd.Series(price, index=index)


def scalper_strategy(prices: pd.Series, threshold: float = 0.1) -> BacktestResult:
    trades = []
    last_trade_price = None
    position = None
    entry_time = None
    entry_price = None

    for time, price in prices.items():
        if last_trade_price is None:
            last_trade_price = price
            continue

        if position is None:
            if price <= last_trade_price - threshold:
                position = 'long'
                entry_time = time
                entry_price = price
            elif price >= last_trade_price + threshold:
                position = 'short'
                entry_time = time
                entry_price = price
            last_trade_price = price
            continue

        if position == 'long':
            if price >= entry_price + threshold:
                profit = price - entry_price
                trades.append(Trade(entry_time, time, entry_price, price, position, profit))
                position = None
                last_trade_price = price
        elif position == 'short':
            if price <= entry_price - threshold:
                profit = entry_price - price
                trades.append(Trade(entry_time, time, entry_price, price, position, profit))
                position = None
                last_trade_price = price

    pnl = sum(t.profit for t in trades)
    win_trades = sum(1 for t in trades if t.profit > 0)
    win_rate = win_trades / len(trades) if trades else 0.0
    return BacktestResult(trades=trades, pnl=pnl, win_rate=win_rate)


def run_backtest():
    prices = generate_synthetic_prices(n=480)
    result = scalper_strategy(prices, threshold=0.05)
    print(result.summary())


if __name__ == '__main__':
    run_backtest()