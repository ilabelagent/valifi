const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * DeFiBot scaffolds yield farming, staking and liquidity provision
 * across decentralized finance protocols.  The actions will be
 * expanded to integrate with DeFi APIs and smart contracts.
 */
const { readData, writeData } = require('../../lib/storage');

/**
 * DeFiBot simulates yield farming and staking in decentralized
 * finance protocols.  Users can stake tokens into predefined
 * pools to earn APR-based yields.  Stakes are tracked with
 * timestamps to compute earned interest on unstaking.
 */
class DeFiBot extends KingdomBot {
  async initialize() {
    this.logDivineAction('DeFi Bot Initialized');
    return true;
  }

  _getData() {
    const data = readData('data/defi.json');
    if (!data.pools) {
      // Define a few default pools with APR values
      data.pools = {
        pool1: { token: 'ETH', apr: 0.1 },
        pool2: { token: 'DAI', apr: 0.05 },
        pool3: { token: 'USDT', apr: 0.06 },
      };
    }
    if (!data.stakes) data.stakes = {};
    return data;
  }
  _saveData(data) {
    writeData('data/defi.json', data);
  }

  /**
   * List available DeFi pools with their APRs.
   */
  listPools() {
    const data = this._getData();
    return { success: true, pools: data.pools };
  }

  /**
   * Stake a token amount into a pool.  Records the stake with
   * timestamp for later yield calculation.  Does not handle
   * token balance verification.
   */
  stake({ userId = 'default', poolId, amount }) {
    const amt = Number(amount);
    if (!poolId || !amt || amt <= 0) {
      return { success: false, message: 'Missing or invalid stake parameters' };
    }
    const data = this._getData();
    const pool = data.pools[poolId];
    if (!pool) return { success: false, message: `Unknown pool ${poolId}` };
    const stakes = data.stakes[userId] || [];
    stakes.push({
      poolId,
      amount: amt,
      depositTs: Date.now(),
    });
    data.stakes[userId] = stakes;
    this._saveData(data);
    this.logDivineAction('DeFi Staked', { userId, poolId, amount: amt });
    return { success: true, poolId, amount: amt };
  }

  /**
   * Unstake from a pool.  Calculates yield based on APR and time
   * elapsed.  Removes or reduces the stake accordingly.
   */
  unstake({ userId = 'default', poolId, amount }) {
    const amt = Number(amount);
    if (!poolId || !amt || amt <= 0) {
      return { success: false, message: 'Missing or invalid unstake parameters' };
    }
    const data = this._getData();
    const pool = data.pools[poolId];
    if (!pool) return { success: false, message: `Unknown pool ${poolId}` };
    const stakes = data.stakes[userId] || [];
    // Find stake(s) in this pool
    let remaining = amt;
    let totalYield = 0;
    for (let i = stakes.length - 1; i >= 0 && remaining > 0; i--) {
      const s = stakes[i];
      if (s.poolId !== poolId) continue;
      const stakeAmt = s.amount;
      const now = Date.now();
      const elapsedDays = (now - s.depositTs) / (1000 * 60 * 60 * 24);
      const earned = stakeAmt * pool.apr * (elapsedDays / 365);
      // Determine how much to remove
      const remove = Math.min(stakeAmt, remaining);
      const ratio = remove / stakeAmt;
      const yieldForPortion = earned * ratio;
      totalYield += yieldForPortion;
      s.amount -= remove;
      s.depositTs = now; // reset deposit timestamp for remaining amount
      remaining -= remove;
      if (s.amount <= 0) {
        stakes.splice(i, 1);
      }
    }
    if (remaining > 0) {
      return { success: false, message: 'Not enough staked amount to unstake' };
    }
    data.stakes[userId] = stakes;
    this._saveData(data);
    this.logDivineAction('DeFi Unstaked', { userId, poolId, amount: amt, yield: totalYield });
    return { success: true, amount: amt, yield: parseFloat(totalYield.toFixed(6)) };
  }

  /**
   * Return the APR for a specific pool.
   */
  getApy({ poolId }) {
    if (!poolId) return { success: false, message: 'Missing poolId' };
    const data = this._getData();
    const pool = data.pools[poolId];
    if (!pool) return { success: false, message: `Unknown pool ${poolId}` };
    return { success: true, poolId, apr: pool.apr };
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'list_pools':
        return this.listPools(params);
      case 'stake':
        return this.stake(params);
      case 'unstake':
        return this.unstake(params);
      case 'get_apy':
        return this.getApy(params);
      default:
        return { success: false, message: `Unknown action for DeFiBot: ${action}` };
    }
  }
}

module.exports = DeFiBot;