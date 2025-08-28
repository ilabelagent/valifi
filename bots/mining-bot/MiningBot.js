const KingdomBot = require('../../lib/core/KingdomBot');
const { readData, writeData } = require('../../lib/storage');

/**
 * MiningBot manages mining and staking infrastructure.  It allows
 * users to create validator nodes, rent cloud hash power, link
 * hardware devices, manage pools, check hardware stats, switch
 * mining targets, create contracts and schedule maintenance.
 */
class MiningBot extends KingdomBot {
  async initialize() {
    this.logDivineAction('Mining Bot Initialized');
    return true;
  }
  _getData() {
    const data = readData('data/mining.json');
    data.validators = data.validators || {};
    data.rentals = data.rentals || [];
    data.hardwareLinks = data.hardwareLinks || {};
    data.pools = data.pools || {};
    data.contracts = data.contracts || [];
    data.maintenance = data.maintenance || [];
    return data;
  }
  _saveData(data) {
    writeData('data/mining.json', data);
  }

  /**
   * Create a validator node for proof‑of‑stake.  Records stake
   * amount and chain.  Returns validator details.
   */
  createValidator({ userId = 'default', chain, stake }) {
    if (!chain || !stake) return { success: false, message: 'chain and stake required' };
    const data = this._getData();
    const id = `validator_${Date.now()}`;
    data.validators[id] = { id, userId, chain, stake: Number(stake), status: 'active', createdAt: new Date().toISOString() };
    this._saveData(data);
    this.logDivineAction('Validator Created', { id });
    return { success: true, validator: data.validators[id] };
  }

  /**
   * Rent cloud mining hash power.  Records the rental terms.
   */
  rentHashpower({ userId = 'default', hashRate, price, durationDays }) {
    if (!hashRate || !price || !durationDays) return { success: false, message: 'hashRate, price and durationDays required' };
    const data = this._getData();
    const rental = { id: `rental_${Date.now()}`, userId, hashRate: Number(hashRate), price: Number(price), durationDays: Number(durationDays), start: new Date().toISOString() };
    data.rentals.push(rental);
    this._saveData(data);
    return { success: true, rental };
  }

  /**
   * Link a mining hardware device to a user.  Stores device specs.
   */
  linkHardware({ userId = 'default', deviceId, specs }) {
    if (!deviceId || !specs) return { success: false, message: 'deviceId and specs required' };
    const data = this._getData();
    const devices = data.hardwareLinks[userId] || {};
    devices[deviceId] = { specs, linkedAt: new Date().toISOString() };
    data.hardwareLinks[userId] = devices;
    this._saveData(data);
    return { success: true, device: devices[deviceId] };
  }

  /**
   * Manage mining pools.  Users can create, join or leave pools.
   */
  managePool({ userId = 'default', poolId, action }) {
    const data = this._getData();
    if (!poolId || !action) return { success: false, message: 'poolId and action required' };
    const pool = data.pools[poolId] || { members: [] };
    switch (action) {
      case 'create':
        if (data.pools[poolId]) return { success: false, message: 'Pool already exists' };
        data.pools[poolId] = { members: [userId] };
        break;
      case 'join':
        if (!pool.members.includes(userId)) pool.members.push(userId);
        data.pools[poolId] = pool;
        break;
      case 'leave':
        pool.members = pool.members.filter((m) => m !== userId);
        data.pools[poolId] = pool;
        break;
      default:
        return { success: false, message: 'Unknown pool action' };
    }
    this._saveData(data);
    return { success: true, pool: data.pools[poolId] };
  }

  /**
   * Return hardware statistics for a device.  Generates random
   * metrics such as temperature and hash rate.
   */
  hardwareStats({ userId = 'default', deviceId }) {
    if (!deviceId) return { success: false, message: 'deviceId required' };
    const data = this._getData();
    const devices = data.hardwareLinks[userId] || {};
    if (!devices[deviceId]) return { success: false, message: 'Device not linked' };
    const stats = {
      temperature: Number((50 + Math.random() * 30).toFixed(1)),
      hashRate: Number((Math.random() * 100).toFixed(2)),
      uptimeHours: Math.floor(Math.random() * 720),
    };
    return { success: true, stats };
  }

  /**
   * Switch a hardware device to mine a different coin.  Updates
   * device configuration in storage.
   */
  switchMining({ userId = 'default', deviceId, newCoin }) {
    if (!deviceId || !newCoin) return { success: false, message: 'deviceId and newCoin required' };
    const data = this._getData();
    const devices = data.hardwareLinks[userId] || {};
    const device = devices[deviceId];
    if (!device) return { success: false, message: 'Device not linked' };
    device.miningCoin = newCoin;
    data.hardwareLinks[userId] = devices;
    this._saveData(data);
    return { success: true, device };
  }

  /**
   * Create a mining contract for a user specifying hash power and
   * duration.  Returns contract details.
   */
  createContract({ userId = 'default', hashRate, durationDays, ratePerDay }) {
    if (!hashRate || !durationDays || !ratePerDay) return { success: false, message: 'hashRate, durationDays and ratePerDay required' };
    const data = this._getData();
    const contract = { id: `contract_${Date.now()}`, userId, hashRate: Number(hashRate), durationDays: Number(durationDays), ratePerDay: Number(ratePerDay), createdAt: new Date().toISOString() };
    data.contracts.push(contract);
    this._saveData(data);
    return { success: true, contract };
  }

  /**
   * Schedule maintenance for a hardware device.  Adds entry to
   * maintenance list.
   */
  scheduleMaintenance({ userId = 'default', deviceId, description, scheduledAt }) {
    if (!deviceId || !description || !scheduledAt) return { success: false, message: 'deviceId, description and scheduledAt required' };
    const data = this._getData();
    data.maintenance.push({ userId, deviceId, description, scheduledAt, id: `maint_${Date.now()}` });
    this._saveData(data);
    return { success: true };
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'create_validator':
        return this.createValidator(params);
      case 'rent_hashpower':
        return this.rentHashpower(params);
      case 'link_hardware':
        return this.linkHardware(params);
      case 'manage_pool':
        return this.managePool(params);
      case 'hardware_stats':
        return this.hardwareStats(params);
      case 'switch_mining':
        return this.switchMining(params);
      case 'create_contract':
        return this.createContract(params);
      case 'schedule_maintenance':
        return this.scheduleMaintenance(params);
      default:
        return { success: false, message: `Unknown action for MiningBot: ${action}` };
    }
  }
}

module.exports = MiningBot;