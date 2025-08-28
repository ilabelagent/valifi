# Trading Bot

The **TradingBot** provides a minimal stock trading simulation for the Kingdom FinTech platform.  It is
implemented as a class extending `KingdomBot` and is registered in the unified API under the
identifier `trading`.

## Actions

| Action          | Parameters                                  | Description                                              |
|-----------------|----------------------------------------------|----------------------------------------------------------|
| `get_price`     | `symbol`                                     | Returns the simulated current price for the given stock  |
| `get_prices`    | –                                            | Returns all available symbols and their current prices    |
| `buy`           | `userId`, `symbol`, `quantity`                | Executes a buy order and updates the user’s portfolio    |
| `sell`          | `userId`, `symbol`, `quantity`                | Executes a sell order if the user has enough shares      |
| `get_orders`    | `userId`                                     | Returns a list of orders (buys/sells) for the user       |
| `get_portfolio` | `userId`                                     | Returns the user’s current holdings by symbol            |

## Example Request

```json
{
  "bot": "trading",
  "action": "buy",
  "userId": "demo",
  "symbol": "AAPL",
  "quantity": 2
}
```

## Notes

* Prices are simulated with small random fluctuations on every request to approximate market behavior.  They are not connected to real market data.
* Orders and positions are stored in memory; in a production setting these would persist to a database and integrate with brokerage APIs.
* The bot performs minimal validation.  Additional checks (e.g. available cash, order limits) should be added when connecting to real systems.