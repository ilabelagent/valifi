import http from "http";

// Local-only DDoS simulation script
const TARGET_HOST = "127.0.0.1";
const TARGET_PORT = 5000;
const TARGET_PATH = "/sim/ddos/target";

// Safety limits
const MAX_RPS = 50;  // Maximum 50 requests per second
const MAX_DURATION = 60; // Maximum 60 seconds
const MAX_THREADS = 10;  // Maximum 10 concurrent threads

class LocalDDoSSimulator {
  constructor(config = {}) {
    this.host = TARGET_HOST;
    this.port = TARGET_PORT;
    this.path = config.path || TARGET_PATH;
    this.rps = Math.min(config.rps || 10, MAX_RPS);
    this.duration = Math.min(config.duration || 10, MAX_DURATION);
    this.threads = Math.min(config.threads || 1, MAX_THREADS);
    
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      startTime: null,
      endTime: null,
      avgResponseTime: 0
    };
    
    this.isRunning = false;
    this.intervals = [];
  }

  async start() {
    if (this.isRunning) {
      console.log("⚠️  Simulation already running");
      return;
    }

    console.log(`
🚀 Starting Local DDoS Simulation
================================
Target: ${this.host}:${this.port}${this.path}
RPS: ${this.rps} (per thread)
Threads: ${this.threads}
Duration: ${this.duration}s
Total Expected Requests: ${this.rps * this.threads * this.duration}
================================
    `);

    this.isRunning = true;
    this.stats.startTime = Date.now();

    // Start multiple threads
    for (let i = 0; i < this.threads; i++) {
      this.startThread(i);
    }

    // Stop after duration
    setTimeout(() => {
      this.stop();
    }, this.duration * 1000);
  }

  startThread(threadId) {
    const interval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }

      // Send burst of requests
      for (let i = 0; i < this.rps; i++) {
        this.sendRequest(threadId, i);
      }
    }, 1000);

    this.intervals.push(interval);
  }

  async sendRequest(threadId, requestId) {
    const startTime = Date.now();
    
    const payload = JSON.stringify({
      thread_id: threadId,
      request_id: requestId,
      timestamp: new Date().toISOString(),
      simulation: true
    });

    const options = {
      hostname: this.host,
      port: this.port,
      path: this.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': `DDoS-Simulator-Thread-${threadId}`,
        'X-Simulation': 'true'
      }
    };

    const req = http.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      this.stats.totalRequests++;
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        this.stats.successfulRequests++;
      } else {
        this.stats.failedRequests++;
      }
      
      this.updateAvgResponseTime(responseTime);
      res.resume(); // Consume response data
    });

    req.on('error', (err) => {
      this.stats.totalRequests++;
      this.stats.failedRequests++;
    });

    req.write(payload);
    req.end();
  }

  updateAvgResponseTime(responseTime) {
    if (this.stats.avgResponseTime === 0) {
      this.stats.avgResponseTime = responseTime;
    } else {
      this.stats.avgResponseTime = 
        (this.stats.avgResponseTime + responseTime) / 2;
    }
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    this.stats.endTime = Date.now();
    
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    
    this.printResults();
  }

  printResults() {
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;
    const actualRPS = this.stats.totalRequests / duration;
    
    console.log(`
📊 DDoS Simulation Results
==========================
Duration: ${duration.toFixed(2)}s
Total Requests: ${this.stats.totalRequests}
Successful: ${this.stats.successfulRequests}
Failed: ${this.stats.failedRequests}
Success Rate: ${((this.stats.successfulRequests / this.stats.totalRequests) * 100).toFixed(2)}%
Actual RPS: ${actualRPS.toFixed(2)}
Avg Response Time: ${this.stats.avgResponseTime.toFixed(2)}ms
==========================

⚠️  This simulation only targets localhost
🎯 For educational purposes only
🛡️  Always test defenses against such attacks
    `);
  }

  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      actualRPS: this.stats.startTime ? 
        this.stats.totalRequests / ((Date.now() - this.stats.startTime) / 1000) : 0
    };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const config = {};
  
  args.forEach(arg => {
    const [key, value] = arg.split('=');
    if (key && value) {
      config[key.replace('--', '')] = isNaN(value) ? value : parseInt(value);
    }
  });
  
  console.log("🧠 GodBrain DDoS Simulator");
  console.log("Usage: node loadgen-local.js --rps=10 --duration=30 --threads=3");
  console.log("Config:", config);
  
  const simulator = new LocalDDoSSimulator(config);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping simulation...');
    simulator.stop();
    process.exit(0);
  });
  
  simulator.start();
}

export { LocalDDoSSimulator };
