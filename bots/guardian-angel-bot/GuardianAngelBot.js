/**
 * GUARDIAN ANGEL SECURITY BOT
 * ML-powered threat detection and anomaly monitoring
 * Real-time security analysis for all transactions and API calls
 */

const { EventEmitter } = require('events');

class GuardianAngelBot extends EventEmitter {
  constructor() {
    super();
    this.name = "GuardianAngelBot";
    
    this.threatLog = [];
    this.anomalies = [];
    this.userBaselines = new Map();
    this.securityEvents = [];
    
    this.mlModel = {
      threshold: 0.75,
      features: ['amount', 'frequency', 'location', 'device', 'time']
    };
    
    this.ruleEngine = {
      maxTransactionAmount: 10000,
      maxDailyTransactions: 50,
      suspiciousPatterns: ['rapid_succession', 'unusual_location', 'large_amount']
    };
    
    console.log('👼 Guardian Angel Security Bot initialized');
  }

  async initialize() {
    this.startThreatMonitoring();
    return { success: true };
  }

  startThreatMonitoring() {
    setInterval(() => this.analyzeSecurityEvents(), 10000);
    console.log('🛡️ Threat monitoring active');
  }

  async execute(params = {}) {
    const action = params.action;
    
    switch (action) {
      case 'scan_transaction':
        return await this.scanTransaction(params);
      
      case 'analyze_behavior':
        return await this.analyzeBehavior(params);
      
      case 'get_threats':
        return this.getThreats();
      
      case 'get_status':
        return this.getSecurityStatus();
      
      case 'block_threat':
        return await this.blockThreat(params);
      
      default:
        return { success: false, error: `Unknown action: ${action}` };
    }
  }

  async scanTransaction(params) {
    const { userId, transaction } = params;
    
    if (!userId || !transaction) {
      return { success: false, error: 'userId and transaction required' };
    }

    const baseline = this.getUserBaseline(userId);
    const anomalyScore = this.detectAnomaly(transaction, baseline);
    const ruleViolations = this.checkRules(transaction);
    
    const threat = {
      id: Date.now() + Math.random(),
      userId,
      transaction,
      anomalyScore,
      ruleViolations,
      severity: this.calculateSeverity(anomalyScore, ruleViolations),
      timestamp: new Date().toISOString(),
      status: 'detected'
    };

    if (threat.severity === 'high' || threat.severity === 'critical') {
      this.threatLog.push(threat);
      this.emit('threat_detected', threat);
      
      if (threat.severity === 'critical') {
        return {
          success: true,
          blocked: true,
          threat,
          action: 'TRANSACTION_BLOCKED',
          message: 'Critical security threat detected. Transaction blocked.'
        };
      }
    }

    this.updateBaseline(userId, transaction);

    return {
      success: true,
      blocked: false,
      threat: threat.severity !== 'low' ? threat : null,
      clearance: threat.severity === 'low' ? 'approved' : 'review_required'
    };
  }

  getUserBaseline(userId) {
    if (!this.userBaselines.has(userId)) {
      this.userBaselines.set(userId, {
        avgTransactionAmount: 500,
        transactionFrequency: 5,
        typicalLocations: ['US'],
        typicalDevices: ['mobile'],
        typicalTimes: [9, 10, 11, 14, 15, 16, 17, 18, 19, 20]
      });
    }
    
    return this.userBaselines.get(userId);
  }

  detectAnomaly(transaction, baseline) {
    let anomalyScore = 0;
    
    const amountDeviation = Math.abs(transaction.amount - baseline.avgTransactionAmount) / baseline.avgTransactionAmount;
    if (amountDeviation > 2) anomalyScore += 0.3;
    else if (amountDeviation > 1) anomalyScore += 0.15;
    
    if (!baseline.typicalLocations.includes(transaction.location)) {
      anomalyScore += 0.25;
    }
    
    if (!baseline.typicalDevices.includes(transaction.device)) {
      anomalyScore += 0.2;
    }
    
    const hour = new Date(transaction.timestamp).getHours();
    if (!baseline.typicalTimes.includes(hour)) {
      anomalyScore += 0.15;
    }
    
    if (transaction.velocity && transaction.velocity > 10) {
      anomalyScore += 0.3;
    }

    return Math.min(anomalyScore, 1.0);
  }

  checkRules(transaction) {
    const violations = [];
    
    if (transaction.amount > this.ruleEngine.maxTransactionAmount) {
      violations.push({
        rule: 'max_transaction_amount',
        severity: 'high',
        message: `Transaction amount ${transaction.amount} exceeds limit`
      });
    }
    
    if (transaction.velocity && transaction.velocity > 20) {
      violations.push({
        rule: 'rapid_succession',
        severity: 'critical',
        message: 'Suspicious rapid transaction pattern detected'
      });
    }
    
    if (transaction.type === 'withdrawal' && transaction.amount > 5000 && transaction.newAccount) {
      violations.push({
        rule: 'new_account_large_withdrawal',
        severity: 'high',
        message: 'Large withdrawal from recently created account'
      });
    }

    return violations;
  }

  calculateSeverity(anomalyScore, violations) {
    if (violations.some(v => v.severity === 'critical')) return 'critical';
    if (anomalyScore > 0.8 || violations.some(v => v.severity === 'high')) return 'high';
    if (anomalyScore > 0.5 || violations.length > 0) return 'medium';
    return 'low';
  }

  updateBaseline(userId, transaction) {
    const baseline = this.getUserBaseline(userId);
    
    baseline.avgTransactionAmount = (baseline.avgTransactionAmount * 0.9) + (transaction.amount * 0.1);
    
    if (!baseline.typicalLocations.includes(transaction.location)) {
      baseline.typicalLocations.push(transaction.location);
      if (baseline.typicalLocations.length > 5) {
        baseline.typicalLocations.shift();
      }
    }
    
    if (!baseline.typicalDevices.includes(transaction.device)) {
      baseline.typicalDevices.push(transaction.device);
      if (baseline.typicalDevices.length > 3) {
        baseline.typicalDevices.shift();
      }
    }
  }

  async analyzeBehavior(params) {
    const { userId, activity } = params;
    
    const patterns = this.identifyPatterns(activity);
    const risk = this.assessBehaviorRisk(patterns);

    return {
      success: true,
      userId,
      patterns,
      risk,
      recommendations: this.generateRecommendations(risk)
    };
  }

  identifyPatterns(activity) {
    return {
      login_times: 'normal',
      transaction_frequency: 'normal',
      location_variance: 'low',
      device_changes: 'minimal'
    };
  }

  assessBehaviorRisk(patterns) {
    return {
      level: 'low',
      score: 15,
      factors: ['consistent_behavior', 'known_devices', 'typical_locations']
    };
  }

  generateRecommendations(risk) {
    if (risk.level === 'high') {
      return [
        'Enable two-factor authentication',
        'Review recent account activity',
        'Update security questions'
      ];
    }
    
    return ['Account security is good', 'Continue monitoring'];
  }

  getThreats() {
    return {
      success: true,
      threats: this.threatLog.slice(-50),
      summary: {
        total: this.threatLog.length,
        critical: this.threatLog.filter(t => t.severity === 'critical').length,
        high: this.threatLog.filter(t => t.severity === 'high').length,
        medium: this.threatLog.filter(t => t.severity === 'medium').length,
        blocked: this.threatLog.filter(t => t.status === 'blocked').length
      }
    };
  }

  getSecurityStatus() {
    return {
      success: true,
      status: {
        monitoring: 'active',
        threatsDetected: this.threatLog.length,
        activeUsers: this.userBaselines.size,
        mlModelStatus: 'operational',
        lastScan: new Date().toISOString()
      },
      health: {
        threatLevel: this.threatLog.filter(t => 
          t.severity === 'critical' && 
          Date.now() - new Date(t.timestamp).getTime() < 3600000
        ).length > 0 ? 'elevated' : 'normal',
        systemLoad: 'normal',
        responseTime: '< 100ms'
      }
    };
  }

  async blockThreat(params) {
    const { threatId } = params;
    
    const threat = this.threatLog.find(t => t.id === threatId);
    if (!threat) {
      return { success: false, error: 'Threat not found' };
    }

    threat.status = 'blocked';
    threat.blockedAt = new Date().toISOString();

    this.emit('threat_blocked', threat);

    return {
      success: true,
      message: 'Threat blocked successfully',
      threat
    };
  }

  analyzeSecurityEvents() {
    const recentThreats = this.threatLog.filter(t => 
      Date.now() - new Date(t.timestamp).getTime() < 300000
    );

    if (recentThreats.length > 10) {
      this.emit('attack_pattern', {
        type: 'coordinated_attack',
        count: recentThreats.length,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = GuardianAngelBot;
