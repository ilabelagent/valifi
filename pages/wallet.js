import { useState, useEffect } from 'react';

/**
 * Wallet page demonstrating basic non‑custodial wallet operations.
 * Users can create new wallets, view their list and see balances.
 * Transfers are simulated within the same system.
 */
export default function WalletPage() {
  const [userId, setUserId] = useState('demo');
  const [wallets, setWallets] = useState([]);
  const [chain, setChain] = useState('ETH');
  const [message, setMessage] = useState('');
  const [fromWallet, setFromWallet] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    loadWallets();
  }, [userId]);

  async function loadWallets() {
    const res = await fetch('/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot: 'wallet', action: 'get_wallets', userId }),
    });
    const data = await res.json();
    if (data.success) setWallets(data.wallets);
  }

  async function createWallet() {
    setMessage('');
    const res = await fetch('/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot: 'wallet', action: 'create_wallet', userId, chain }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage(`Wallet created: ${data.wallet.address}`);
      loadWallets();
    } else {
      setMessage(data.message || 'Error creating wallet');
    }
  }

  async function send() {
    setMessage('');
    if (!fromWallet || !toAddress || amount <= 0) {
      setMessage('Enter all transfer fields');
      return;
    }
    const res = await fetch('/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot: 'wallet', action: 'send', fromWalletId: fromWallet, toAddress, amount: Number(amount) }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage('Transfer complete');
      loadWallets();
    } else {
      setMessage(data.message || 'Transfer failed');
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Wallet Bot</h1>
      <p>Create and manage non‑custodial wallets.  Transfers are simulated.</p>
      <div style={{ marginBottom: '1rem' }}>
        <label>User ID: </label>
        <input value={userId} onChange={(e) => setUserId(e.target.value)} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Chain: </label>
        <select value={chain} onChange={(e) => setChain(e.target.value)}>
          <option>ETH</option>
          <option>BTC</option>
          <option>SOL</option>
        </select>
        <button onClick={createWallet} style={{ marginLeft: '0.5rem' }}>Create Wallet</button>
      </div>
      <h2>Your Wallets</h2>
      {wallets.length === 0 ? <p>No wallets yet.</p> : (
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '4px' }}>ID</th>
              <th style={{ border: '1px solid #ccc', padding: '4px' }}>Chain</th>
              <th style={{ border: '1px solid #ccc', padding: '4px' }}>Address</th>
              <th style={{ border: '1px solid #ccc', padding: '4px' }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((w) => (
              <tr key={w.id}>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{w.id}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{w.chain}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{w.address}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'right' }}>{w.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h2 style={{ marginTop: '2rem' }}>Transfer</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>From Wallet: </label>
        <select value={fromWallet} onChange={(e) => setFromWallet(e.target.value)}>
          <option value="">Select</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.id} ({w.chain})
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>To Address: </label>
        <input value={toAddress} onChange={(e) => setToAddress(e.target.value)} style={{ width: '60%' }} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Amount: </label>
        <input type="number" min={0.0001} step={0.0001} value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button onClick={send} style={{ marginLeft: '0.5rem' }}>Send</button>
      </div>
      {message && <p style={{ color: 'green' }}>{message}</p>}
    </div>
  );
}