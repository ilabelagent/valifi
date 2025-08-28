import { useState } from 'react';

/**
 * Onboarding page demonstrating KYC simulation, risk scoring and goal
 * management.  All data is stored in memory on the server.
 */
export default function OnboardingPage() {
  const [userId, setUserId] = useState('demo');
  const [kycStatus, setKycStatus] = useState(null);
  const [risk, setRisk] = useState(null);
  const [goalsInput, setGoalsInput] = useState('');
  const [goals, setGoals] = useState([]);
  const [message, setMessage] = useState('');

  async function startKYC() {
    setMessage('');
    const res = await fetch('/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot: 'onboarding', action: 'start_kyc', userId }),
    });
    const data = await res.json();
    if (data.success) {
      setKycStatus(data.kycStatus);
      setMessage(`KYC status: ${data.kycStatus}`);
    } else {
      setMessage(data.message || 'KYC failed');
    }
  }

  async function getRisk() {
    setMessage('');
    const res = await fetch('/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot: 'onboarding', action: 'get_risk_score', userId }),
    });
    const data = await res.json();
    if (data.success) {
      setRisk(data.riskScore);
      setMessage(`Risk score: ${data.riskScore}`);
    } else {
      setMessage(data.message || 'Unable to get risk score');
    }
  }

  async function saveGoals() {
    setMessage('');
    const list = goalsInput
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);
    const res = await fetch('/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot: 'onboarding', action: 'set_goals', userId, goals: list }),
    });
    const data = await res.json();
    if (data.success) {
      setGoals(data.goals);
      setGoalsInput('');
      setMessage('Goals saved.');
    } else {
      setMessage(data.message || 'Error saving goals');
    }
  }

  async function fetchGoals() {
    setMessage('');
    const res = await fetch('/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot: 'onboarding', action: 'get_goals', userId }),
    });
    const data = await res.json();
    if (data.success) {
      setGoals(data.goals);
      setMessage('Goals loaded.');
    } else {
      setMessage(data.message || 'Unable to fetch goals');
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Onboarding Bot</h1>
      <p>This page simulates KYC, risk scoring and goal setting.</p>
      <div style={{ marginBottom: '1rem' }}>
        <label>User ID: </label>
        <input value={userId} onChange={(e) => setUserId(e.target.value)} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={startKYC}>Start KYC</button>{' '}
        <button onClick={getRisk}>Get Risk Score</button>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Set Goals (comma separated): </label>
        <input
          value={goalsInput}
          onChange={(e) => setGoalsInput(e.target.value)}
          style={{ width: '60%' }}
        />{' '}
        <button onClick={saveGoals}>Save Goals</button>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={fetchGoals}>Load Goals</button>
      </div>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {kycStatus && (
        <p>
          <strong>KYC Status:</strong> {kycStatus}
        </p>
      )}
      {risk !== null && (
        <p>
          <strong>Risk Score:</strong> {risk}
        </p>
      )}
      <h2>Goals for {userId}</h2>
      {goals.length === 0 ? <p>No goals set.</p> : (
        <ul>
          {goals.map((goal, idx) => (
            <li key={idx}>{goal}</li>
          ))}
        </ul>
      )}
    </div>
  );
}