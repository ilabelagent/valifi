import { useState, useEffect } from 'react';

/**
 * Trading page demonstrating simple stock trading via the TradingBot.  Users
 * can fetch current prices, buy or sell shares, view order history and
 * inspect their portfolio.
 */
export default function TradingPage() {
  const [userId, setUserId] = useState('demo');
  const [prices, setPrices] = useState({});
  const [symbol, setSymbol] = useState('AAPL');
  const [quantity, setQuantity] = useState(1);
  const [orders, setOrders] = useState([]);
  const [portfolio, setPortfolio] = useState({});
  const [message, setMessage] = useState('');

  // Load initial prices on mount
  useEffect(() => {
    refreshPrices();
  }, []);

  async function refreshPrices() {
    setMessage('');
    const res = await fetch('/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot: 'trading', action: 'get_prices' }),
    });
    const data = await res.json();
    if (data.success) {
      setPrices(data.prices);
      // update default symbol if not present
      const symbols = Object.keys(data.prices);
      if (!symbols.includes(symbol)) setSymbol(symbols[0] || '');
    }
  }

  async function placeOrder(side) {
    setMessage('');
    const action = side === 'BUY' ? 'buy' : 'sell';
    const res = await fetch('/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot: 'trading', action, userId, symbol, quantity: Number(quantity) }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage(`${side} order executed at $${data.order.price.toFixed(2)}`);
      loadOrders();
      loadPortfolio();
    } else {
      setMessage(data.message || 'Trade failed');
    }
  }

  async function loadOrders() {
    const res = await fetch('/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot: 'trading', action: 'get_orders', userId }),
    });
    const data = await res.json();
    if (data.success) setOrders(data.orders);
  }

  async function loadPortfolio() {
    const res = await fetch('/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot: 'trading', action: 'get_portfolio', userId }),
    });
    const data = await res.json();
    if (data.success) setPortfolio(data.portfolio);
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Trading Bot</h1>
      <p>Simulated stock trading with in‑memory prices and portfolio.</p>
      <div style={{ marginBottom: '1rem' }}>
        <label>User ID: </label>
        <input value={userId} onChange={(e) => setUserId(e.target.value)} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Symbol: </label>
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          {Object.keys(prices).map((sym) => (
            <option value={sym} key={sym}>
              {sym}
            </option>
          ))}
        </select>{' '}
        <label style={{ marginLeft: '1rem' }}>Quantity: </label>
        <input
          type="number"
          min={0.01}
          step={0.01}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <button onClick={() => placeOrder('BUY')} style={{ marginLeft: '0.5rem' }}>
          Buy
        </button>
        <button onClick={() => placeOrder('SELL')} style={{ marginLeft: '0.5rem' }}>
          Sell
        </button>
      </div>
      <button onClick={refreshPrices}>Refresh Prices</button>{' '}
      <button onClick={loadOrders}>Load Orders</button>{' '}
      <button onClick={loadPortfolio}>Load Portfolio</button>
      {message && <p style={{ marginTop: '1rem', color: 'green' }}>{message}</p>}
      <h2>Current Prices</h2>
      <table style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '4px' }}>Symbol</th>
            <th style={{ border: '1px solid #ccc', padding: '4px' }}>Price (USD)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(prices).map(([sym, price]) => (
            <tr key={sym}>
              <td style={{ border: '1px solid #ccc', padding: '4px' }}>{sym}</td>
              <td style={{ border: '1px solid #ccc', padding: '4px' }}>${price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 style={{ marginTop: '2rem' }}>Order History for {userId}</h2>
      {orders.length === 0 ? (
        <p>No orders.</p>
      ) : (
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '4px' }}>ID</th>
              <th style={{ border: '1px solid #ccc', padding: '4px' }}>Symbol</th>
              <th style={{ border: '1px solid #ccc', padding: '4px' }}>Side</th>
              <th style={{ border: '1px solid #ccc', padding: '4px' }}>Qty</th>
              <th style={{ border: '1px solid #ccc', padding: '4px' }}>Price</th>
              <th style={{ border: '1px solid #ccc', padding: '4px' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{order.id}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{order.symbol}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{order.side}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'right' }}>{order.quantity}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>${order.price.toFixed(2)}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{new Date(order.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h2 style={{ marginTop: '2rem' }}>Portfolio for {userId}</h2>
      {Object.keys(portfolio).length === 0 ? (
        <p>No holdings.</p>
      ) : (
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '4px' }}>Symbol</th>
              <th style={{ border: '1px solid #ccc', padding: '4px' }}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(portfolio).map(([sym, qty]) => (
              <tr key={sym}>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{sym}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'right' }}>{qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}