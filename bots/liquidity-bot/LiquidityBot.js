const KingdomBot = require('../../lib/core/KingdomBot');
const { readData, writeData } = require('../../lib/storage');

/**
 * LiquidityBot manages decentralized finance activities like
 * creating liquidity pools, staking, yield farming, providing
 * and removing liquidity, role assignment in exchanges, referral
 * tracking, revenue distribution and hardware sales.  All data
 * persists to a JSON file for simplicity.
 */
class LiquidityBot extends KingdomBot {
  async initialize() {
    this.logDivineAction('Liquidity Bot Initialized');
    return true;
  }
  _getData() {
    const data = readData('data/liquidity.json');
    data.pools = data.pools || {};
    data.liquidity = data.liquidity || {};
    data.stakes = data.stakes || {};
    data.farms = data.farms || {};
    data.roles = data.roles || {};
    data.referrals = data.referrals || [];
    data.revenues = data.revenues || {};
    data.hardwareSales = data.hardwareSales || [];
    return data;
  }
  _saveData(data) {
    writeData('data/liquidity.json', data);
  }

  /**
   * Create a liquidity pool for a pair of assets.  Reserves
   * start at zero.  Anyone can then provide liquidity to the pool.
   */
  createPool({ poolId, assetA, assetB }) {
    if (!poolId || !assetA || !assetB) return { success: false, message: 'poolId, assetA and assetB required' };
    const data = this._getData();
    if (data.pools[poolId]) return { success: false, message: 'Pool already exists' };
    data.pools[poolId] = { assetA, assetB, reserveA: 0, reserveB: 0 };
    this._saveData(data);
    this.logDivineAction('Pool Created', { poolId, assetA, assetB });
    return { success: true, pool: data.pools[poolId] };
  }

  /**
   * Provide liquidity to a pool.  Adds reserves and records the
   * provider's share.  Shares are proportional to liquidity added.
   */
  provideLiquidity({ userId = 'default', poolId, amountA, amountB }) {
    const a = Number(amountA);
    const b = Number(amountB);
    if (!poolId || !a || !b) return { success: false, message: 'poolId, amountA and amountB required' };
    const data = this._getData();
    const pool = data.pools[poolId];
    if (!pool) return { success: false, message: 'Pool not found' };
    pool.reserveA += a;
    pool.reserveB += b;
    data.pools[poolId] = pool;
    const userLiquidity = data.liquidity[userId] || {};
    userLiquidity[poolId] = (userLiquidity[poolId] || 0) + Math.sqrt(a * b);
    data.liquidity[userId] = userLiquidity;
    this._saveData(data);
    this.logDivineAction('Liquidity Provided', { userId, poolId, amountA: a, amountB: b });
    return { success: true, pool, shares: userLiquidity[poolId] };
  }

  /**
   * Remove liquidity from a pool.  Calculates the proportion of
   * reserves to return based on the user's share and reduces
   * their share accordingly.
   */
  removeLiquidity({ userId = 'default', poolId, shares }) {
    const s = Number(shares);
    if (!poolId || !s || s <= 0) return { success: false, message: 'poolId and shares required' };
    const data = this._getData();
    const pool = data.pools[poolId];
    if (!pool) return { success: false, message: 'Pool not found' };
    const userLiquidity = data.liquidity[userId] || {};
    const userShares = userLiquidity[poolId] || 0;
    if (userShares < s) return { success: false, message: 'Insufficient shares' };
    // Calculate amount to return based on share fraction
    const totalShares = Object.values(data.liquidity).reduce((sum, u) => sum + (u[poolId] || 0), 0);
    const fraction = s / totalShares;
    const amountA = pool.reserveA * fraction;
    const amountB = pool.reserveB * fraction;
    pool.reserveA -= amountA;
    pool.reserveB -= amountB;
    userLiquidity[poolId] -= s;
    data.liquidity[userId] = userLiquidity;
    this._saveData(data);
    this.logDivineAction('Liquidity Removed', { userId, poolId, shares: s });
    return { success: true, amountA: Number(amountA.toFixed(6)), amountB: Number(amountB.toFixed(6)) };
  }

  /**
   * Stake tokens into a staking pool.  Records the amount staked.
   */
  stake({ userId = 'default', asset, amount }) {
    const amt = Number(amount);
    if (!asset || !amt) return { success: false, message: 'asset and amount required' };
    const data = this._getData();
    const stakes = data.stakes[userId] || {};
    stakes[asset] = (stakes[asset] || 0) + amt;
    data.stakes[userId] = stakes;
    this._saveData(data);
    this.logDivineAction('Staked', { userId, asset, amount: amt });
    return { success: true, stake: stakes[asset] };
  }

  /**
   * Participate in yield farming.  Tracks deposits in farms.
   */
  yieldFarm({ userId = 'default', farmId, amount }) {
    const amt = Number(amount);
    if (!farmId || !amt) return { success: false, message: 'farmId and amount required' };
    const data = this._getData();
    const farms = data.farms[userId] || {};
    farms[farmId] = (farms[farmId] || 0) + amt;
    data.farms[userId] = farms;
    this._saveData(data);
    this.logDivineAction('Yield Farming', { userId, farmId, amount: amt });
    return { success: true, position: farms[farmId] };
  }

  /**
   * Assign a role to a user within the exchange ecosystem.  Roles
   * could include market maker, referral partner, etc.
   */
  assignRole({ userId, role }) {
    if (!userId || !role) return { success: false, message: 'userId and role required' };
    const data = this._getData();
    data.roles[userId] = role;
    this._saveData(data);
    this.logDivineAction('Role Assigned', { userId, role });
    return { success: true };
  }

  /**
   * Record a referral.  Adds the pair to a list for later
   * commission calculations.
   */
  recordReferral({ referrer, referee }) {
    if (!referrer || !referee) return { success: false, message: 'referrer and referee required' };
    const data = this._getData();
    data.referrals.push({ referrer, referee, timestamp: new Date().toISOString() });
    this._saveData(data);
    return { success: true };
  }

  /**
   * Distribute revenue to liquidity providers of a pool.  Amount
   * will be split proportionally to shares held.  Revenue is
   * accumulated in the revenues object.
   */
  distributeRevenue({ poolId, amount }) {
    const amt = Number(amount);
    if (!poolId || !amt) return { success: false, message: 'poolId and amount required' };
    const data = this._getData();
    const totalShares = Object.values(data.liquidity).reduce((sum, u) => sum + (u[poolId] || 0), 0);
    if (totalShares === 0) return { success: false, message: 'No liquidity providers for pool' };
    const revenues = data.revenues[poolId] || {};
    // allocate revenue
    Object.keys(data.liquidity).forEach((uid) => {
      const shares = data.liquidity[uid][poolId] || 0;
      if (shares > 0) {
        const userShare = (amt * shares) / totalShares;
        revenues[uid] = (revenues[uid] || 0) + userShare;
      }
    });
    data.revenues[poolId] = revenues;
    this._saveData(data);
    this.logDivineAction('Revenue Distributed', { poolId, amount: amt });
    return { success: true, distributions: revenues };
  }

  /**
   * Sell mining hardware or host hardware services.  Records
   * sales for referral or revenue tracking.
   */
  sellHardware({ userId, hardware, price }) {
    if (!userId || !hardware || !price) return { success: false, message: 'userId, hardware and price required' };
    const data = this._getData();
    data.hardwareSales.push({ userId, hardware, price: Number(price), timestamp: new Date().toISOString() });
    this._saveData(data);
    return { success: true };
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'create_pool':
        return this.createPool(params);
      case 'provide_liquidity':
        return this.provideLiquidity(params);
      case 'remove_liquidity':
        return this.removeLiquidity(params);
      case 'stake':
        return this.stake(params);
      case 'yield_farm':
        return this.yieldFarm(params);
      case 'assign_role':
        return this.assignRole(params);
      case 'record_referral':
        return this.recordReferral(params);
      case 'distribute_revenue':
        return this.distributeRevenue(params);
      case 'sell_hardware':
        return this.sellHardware(params);
      default:
        return { success: false, message: `Unknown action for LiquidityBot: ${action}` };
    }
  }
}

module.exports = LiquidityBot;