import { Router } from "express";
import { LAB_DATA, broadcast } from "../server.js";

export const router = Router();

// Local-only traffic generator for DDoS simulation
router.post("/simulate", (req, res) => {
  const { 
    target = "127.0.0.1:5000", 
    duration = 10, 
    rps = 10, 
    method = "GET" 
  } = req.body || {};
  
  // Safety checks - only allow localhost targets
  if (!target.includes("127.0.0.1") && !target.includes("localhost")) {
    return res.status(403).json({ 
      error: "Security violation", 
      message: "DDoS simulation only allowed against localhost" 
    });
  }
  
  // Rate limiting for safety
  const safeRPS = Math.min(parseInt(rps), 50); // Max 50 RPS
  const safeDuration = Math.min(parseInt(duration), 60); // Max 60 seconds
  
  const ddosConfig = {
    target,
    duration: safeDuration,
    rps: safeRPS,
    method,
    startTime: Date.now()
  };
  
  // Log the simulation
  const incident = {
    type: "ddos_simulation",
    config: ddosConfig,
    ip: req.ip || "127.0.0.1",
    timestamp: new Date().toISOString()
  };
  
  LAB_DATA.incidents.push(incident);
  broadcast({ type: "ddos_started", data: incident });
  
  console.log("💥 [DDOS-SIM] Starting simulation:", ddosConfig);
  
  // Start the simulation
  startDDoSSimulation(ddosConfig);
  
  res.json({
    success: true,
    message: "DDoS simulation started",
    config: ddosConfig,
    warning: "This is a controlled simulation against localhost only"
  });
});

// Get DDoS metrics
router.get("/metrics", (req, res) => {
  res.json({
    current: LAB_DATA.ddosMetrics,
    history: LAB_DATA.incidents.filter(i => i.type === "ddos_simulation"),
    mitigation: [
      "Rate limiting",
      "Traffic filtering", 
      "Load balancing",
      "CDN protection",
      "DDoS protection services"
    ]
  });
});

// DDoS protection simulation
router.post("/protect", (req, res) => {
  const { 
    enableRateLimit = true, 
    enableFirewall = true, 
    enableCDN = false 
  } = req.body || {};
  
  const protection = {
    rateLimit: {
      enabled: enableRateLimit,
      limit: "100 requests per minute",
      action: "Block or delay excess requests"
    },
    firewall: {
      enabled: enableFirewall,
      rules: [
        "Block known malicious IPs",
        "Rate limit by source IP",
        "Filter suspicious patterns"
      ]
    },
    cdn: {
      enabled: enableCDN,
      features: [
        "Distributed traffic absorption",
        "Geographic filtering",
        "Bot mitigation"
      ]
    }
  };
  
  res.json({
    success: true,
    protection: protection,
    message: "DDoS protection configured",
    effectiveness: calculateProtectionEffectiveness(protection)
  });
});

// Attack pattern analysis
router.get("/patterns", (req, res) => {
  const patterns = [
    {
      name: "Volumetric Attack",
      description: "High volume of traffic to overwhelm bandwidth",
      characteristics: ["High packet rate", "Large payload size", "Multiple sources"],
      mitigation: "Traffic filtering and rate limiting"
    },
    {
      name: "Protocol Attack", 
      description: "Exploits weaknesses in network protocols",
      characteristics: ["SYN flood", "Ping of death", "Fragmented packets"],
      mitigation: "Protocol validation and firewalls"
    },
    {
      name: "Application Layer Attack",
      description: "Targets specific application vulnerabilities", 
      characteristics: ["HTTP flood", "Slowloris", "Application-specific requests"],
      mitigation: "Application firewalls and behavior analysis"
    },
    {
      name: "Amplification Attack",
      description: "Uses third-party services to amplify attack traffic",
      characteristics: ["DNS amplification", "NTP amplification", "Spoofed source IPs"],
      mitigation: "Source validation and traffic filtering"
    }
  ];
  
  res.json(patterns);
});

async function startDDoSSimulation(config) {
  const { target, duration, rps } = config;
  let requestsSent = 0;
  let requestsBlocked = 0;
  
  const startTime = Date.now();
  const endTime = startTime + (duration * 1000);
  
  const interval = setInterval(async () => {
    if (Date.now() >= endTime) {
      clearInterval(interval);
      
      const finalMetrics = {
        ...LAB_DATA.ddosMetrics,
        requestsSent,
        requestsBlocked,
        duration: Date.now() - startTime,
        completed: true
      };
      
      LAB_DATA.ddosMetrics = finalMetrics;
      broadcast({ type: "ddos_completed", data: finalMetrics });
      console.log("💥 [DDOS-SIM] Simulation completed:", finalMetrics);
      return;
    }
    
    // Simulate requests
    for (let i = 0; i < rps; i++) {
      try {
        // Simulate request (don't actually send to avoid real impact)
        requestsSent++;
        
        // Simulate some requests being blocked by protection
        if (Math.random() < 0.3) { // 30% blocked
          requestsBlocked++;
        }
      } catch (error) {
        // Ignore errors in simulation
      }
    }
    
    // Update metrics
    LAB_DATA.ddosMetrics = {
      ...LAB_DATA.ddosMetrics,
      requests: requestsSent,
      blocked: requestsBlocked,
      rps: rps,
      active: true
    };
    
    broadcast({ type: "ddos_metrics", data: LAB_DATA.ddosMetrics });
  }, 1000);
}

function calculateProtectionEffectiveness(protection) {
  let score = 0;
  
  if (protection.rateLimit.enabled) score += 30;
  if (protection.firewall.enabled) score += 40;  
  if (protection.cdn.enabled) score += 30;
  
  if (score >= 80) return "Very High";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}
