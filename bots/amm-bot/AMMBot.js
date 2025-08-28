const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * AMMBot scaffolds automated market maker functionality for
 * decentralized exchanges.  It will support swapping, adding and
 * removing liquidity.  Currently all actions are placeholders.
 */
const { readData, writeData } = require('../../lib/storage');

/**
 * AMMBot implements a simplified constant product automated market
 * maker (x*y=k) similar to Uniswap v2.  It supports listing pairs,
 * performing token swaps, and adding or removing liquidity.  User
 * holdings and LP positions are tracked persistently on disk.
 */
class AMMBot extends KingdomBot {
  async initialize() {
    this.logDivineAction('AMM Bot Initialized');
    return true;
  }

  _getData() {
    const data = readData('data/amm.json');
    if (!data.pairs) {
      // Initialize with a couple of default pools if not present
      data.pairs = {
        'ETH-DAI': { reserveA: 1000, reserveB: 1000000, totalLiquidity: 1000 },
        'BTC-USDT': { reserveA: 100, reserveB: 5000000, totalLiquidity: 100 },
      };
    }
    if (!data.liquidity) data.liquidity = {};
    if (!data.holdings) data.holdings = {};
    return data;
  }
  _saveData(data) {
    writeData('data/amm.json', data);
  }

  /**
   * List all available AMM pairs with their current spot price
   * (quote of tokenB per tokenA) and reserves.  Prices are
   * computed as reserveB/reserveA.
   */
  listPairs() {
    const data = this._getData();
    const result = {};
    Object.keys(data.pairs).forEach((p) => {
      const info = data.pairs[p];
      const [a, b] = p.split('-');
      const price = info.reserveA ? info.reserveB / info.reserveA : 0;
      result[p] = {
        tokenA: a,
        tokenB: b,
        reserveA: info.reserveA,
        reserveB: info.reserveB,
        price: parseFloat(price.toFixed(6)),
        totalLiquidity: info.totalLiquidity,
      };
    });
    return { success: true, pairs: result };
  }

  /**
   * Perform a token swap on a pair.  Uses the constant product
   * formula and charges a 0.3% fee.  Updates reserves and user
   * holdings accordingly.  Requires that the user has sufficient
   * holdings of the input token.
   */
  swap({ userId = 'default', pair, from, amount }) {
    const amt = Number(amount);
    if (!pair || !from || !amt || amt <= 0) {
      return { success: false, message: 'Missing or invalid swap parameters' };
    }
    const p = pair.toUpperCase();
    const data = this._getData();
    const pool = data.pairs[p];
    if (!pool) return { success: false, message: `Unknown pair ${pair}` };
    const [tokenA, tokenB] = p.split('-');
    let reserveIn, reserveOut, newReserveIn, newReserveOut, output, feeRate;
    feeRate = 0.003; // 0.3% fee
    if (from.toUpperCase() === tokenA) {
      reserveIn = pool.reserveA;
      reserveOut = pool.reserveB;
      // Check user holdings
      const hold = data.holdings[userId] || {};
      const bal = hold[tokenA] || 0;
      if (bal < amt) return { success: false, message: `Insufficient ${tokenA} balance` };
      const amountInWithFee = amt * (1 - feeRate);
      const k = reserveIn * reserveOut;
      newReserveIn = reserveIn + amt;
      newReserveOut = k / newReserveIn;
      output = reserveOut - newReserveOut;
      // Update reserves
      pool.reserveA = newReserveIn;
      pool.reserveB = newReserveOut;
      // Update user holdings
      hold[tokenA] = bal - amt;
      hold[tokenB] = (hold[tokenB] || 0) + output;
      data.holdings[userId] = hold;
    } else if (from.toUpperCase() === tokenB) {
      reserveIn = pool.reserveB;
      reserveOut = pool.reserveA;
      const hold = data.holdings[userId] || {};
      const bal = hold[tokenB] || 0;
      if (bal < amt) return { success: false, message: `Insufficient ${tokenB} balance` };
      const amountInWithFee = amt * (1 - feeRate);
      const k = reserveIn * reserveOut;
      newReserveIn = reserveIn + amt;
      newReserveOut = k / newReserveIn;
      output = reserveOut - newReserveOut;
      // Update reserves
      pool.reserveB = newReserveIn;
      pool.reserveA = newReserveOut;
      // Update user holdings
      hold[tokenB] = bal - amt;
      hold[tokenA] = (hold[tokenA] || 0) + output;
      data.holdings[userId] = hold;
    } else {
      return { success: false, message: `Token ${from} is not part of pair ${pair}` };
    }
    this._saveData(data);
    this.logDivineAction('AMM Swap', { userId, pair: p, from, amount: amt, output });
    return { success: true, pair: p, from: from.toUpperCase(), amount: amt, received: parseFloat(output.toFixed(6)) };
  }

  /**
   * Add liquidity to a pair.  The user must supply both tokens in
   * proportion to the existing reserves.  LP tokens are minted and
   * assigned to the user based on the contribution relative to
   * existing total liquidity.
   */
  addLiquidity({ userId = 'default', pair, amountA, amountB }) {
    const amtA = Number(amountA);
    const amtB = Number(amountB);
    const p = pair.toUpperCase();
    if (!pair || !amtA || !amtB || amtA <= 0 || amtB <= 0) {
      return { success: false, message: 'Missing or invalid liquidity parameters' };
    }
    const data = this._getData();
    const pool = data.pairs[p];
    if (!pool) return { success: false, message: `Unknown pair ${pair}` };
    const [tokenA, tokenB] = p.split('-');
    const hold = data.holdings[userId] || {};
    if ((hold[tokenA] || 0) < amtA || (hold[tokenB] || 0) < amtB) {
      return { success: false, message: 'Insufficient token balance to add liquidity' };
    }
    // Determine how many LP tokens to mint based on ratio
    const minted = (amtA / pool.reserveA) * pool.totalLiquidity;
    pool.reserveA += amtA;
    pool.reserveB += amtB;
    pool.totalLiquidity += minted;
    // Update user token holdings
    hold[tokenA] = (hold[tokenA] || 0) - amtA;
    hold[tokenB] = (hold[tokenB] || 0) - amtB;
    data.holdings[userId] = hold;
    // Update liquidity positions
    const lp = data.liquidity[userId] || {};
    lp[p] = (lp[p] || 0) + minted;
    data.liquidity[userId] = lp;
    this._saveData(data);
    this.logDivineAction('Added Liquidity', { userId, pair: p, amountA: amtA, amountB: amtB, minted });
    return { success: true, minted: parseFloat(minted.toFixed(6)), totalLiquidity: pool.totalLiquidity };
  }

  /**
   * Remove liquidity from a pair.  Calculates the proportion of
   * reserves to withdraw based on the LP tokens burned.  Updates
   * user holdings and pool reserves accordingly.
   */
  removeLiquidity({ userId = 'default', pair, lpTokens }) {
    const tokens = Number(lpTokens);
    if (!pair || !tokens || tokens <= 0) {
      return { success: false, message: 'Missing or invalid LP token amount' };
    }
    const p = pair.toUpperCase();
    const data = this._getData();
    const pool = data.pairs[p];
    if (!pool) return { success: false, message: `Unknown pair ${pair}` };
    const userLp = (data.liquidity[userId] || {})[p] || 0;
    if (userLp < tokens) return { success: false, message: 'Not enough LP tokens to remove' };
    const share = tokens / pool.totalLiquidity;
    const amountA = pool.reserveA * share;
    const amountB = pool.reserveB * share;
    // Update pool
    pool.reserveA -= amountA;
    pool.reserveB -= amountB;
    pool.totalLiquidity -= tokens;
    // Update user lp position
    const lp = data.liquidity[userId];
    lp[p] -= tokens;
    data.liquidity[userId] = lp;
    // Update user holdings
    const hold = data.holdings[userId] || {};
    const [tokenA, tokenB] = p.split('-');
    hold[tokenA] = (hold[tokenA] || 0) + amountA;
    hold[tokenB] = (hold[tokenB] || 0) + amountB;
    data.holdings[userId] = hold;
    this._saveData(data);
    this.logDivineAction('Removed Liquidity', { userId, pair: p, lpTokens: tokens });
    return {
      success: true,
      withdrawn: {
        [tokenA]: parseFloat(amountA.toFixed(6)),
        [tokenB]: parseFloat(amountB.toFixed(6)),
      },
      remainingLp: lp[p] || 0,
    };
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'list_pairs':
        return this.listPairs();
      case 'swap':
        return this.swap(params);
      case 'add_liquidity':
        return this.addLiquidity(params);
      case 'remove_liquidity':
        return this.removeLiquidity(params);
      default:
        return { success: false, message: `Unknown action for AMMBot: ${action}` };
    }
  }
}

module.exports = AMMBot;