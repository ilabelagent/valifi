import { useState, useEffect } from 'react';

/**
 * A simple Portfolio page demonstrating interaction with the PortfolioBot.
 * Users can add positions, view current holdings and trigger a rebalance.
 */
export default function PortfolioPage() {
  const [userId, setUserId] = useState('demo');
  const [asset, setAsset] = useState('AAPL');
  const [qty, setQty] = useState(1);
  const [positions, setPositions] = useState([]);
  const [message, setMessage] = useState('');

  // Load positions on mount or when userId changes
  useEffect(() => {
    fetch('/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot: 'portfolio', action: 'get_positions', userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.positions) setPositions(data.positions);
      })
      .catch(() => setMessage('Failed to load positions'));
  }, [userId]);

  async function addPosition() {
    setMessage('');
    const res = await fetch('/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot: 'portfolio', action: 'add_position', userId, asset, quantity: Number(qty) }),
    });
    const data = await res.json();
    if (data.success) {
      setPositions(data.positions);
      setAsset('');
      setQty(1);
    } else {
      setMessage(data.message || 'Error adding position');
    }
  }

  async function rebalance() {
    setMessage('');
    const res = await fetch('/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot: 'portfolio', action: 'rebalance', userId }),
    });
    const data = await res.json();
    if (data.success) {
      setPositions(data.positions);
      setMessage(`Portfolio rebalanced to ${data.equalQuantity.toFixed(2)} units per asset`);
    } else {
      setMessage(data.message || 'Rebalance failed');
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Portfolio Bot</h1>
      <p>This page demonstrates basic portfolio management.  Enter a user ID, add positions and rebalance to equal weight.</p>
      <div style={{ marginBottom: '1rem' }}>
        <label>User ID: </label>
        <input value={userId} onChange={(e) => setUserId(e.target.value)} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <input
          placeholder="Asset symbol (e.g., AAPL, BTC)"
          value={asset}
          onChange={(e) => setAsset(e.target.value.toUpperCase())}
          style={{ marginRight: '0.5rem' }}
        />
        <input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          style={{ width: '80px', marginRight: '0.5rem' }}
        />
        <button onClick={addPosition}>Add Position</button>
      </div>
      <button onClick={rebalance}>Rebalance Portfolio</button>
      {message && <p style={{ marginTop: '1rem', color: 'green' }}>{message}</p>}
      <h2 style={{ marginTop: '2rem' }}>Positions for {userId}</h2>
      {positions.length === 0 ? (
        <p>No positions yet.</p>
      ) : (
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '4px' }}>Asset</th>
              <th style={{ border: '1px solid #ccc', padding: '4px' }}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p.asset}>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{p.asset}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'right' }}>{p.quantity.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}