import { Router } from "express";
import { LAB_DATA, broadcast } from "../server.js";

export const router = Router();

// MITM proxy simulation (localhost only)
router.post("/intercept", (req, res) => {
  const { originalRequest = {}, modify = false } = req.body || {};
  
  const intercepted = {
    timestamp: new Date().toISOString(),
    originalRequest: originalRequest,
    intercepted: true,
    modified: modify
  };
  
  if (modify) {
    // Simulate request modification
    intercepted.modifiedRequest = {
      ...originalRequest,
      headers: {
        ...originalRequest.headers,
        "X-MITM-Modified": "true",
        "X-Original-Content": Buffer.from(JSON.stringify(originalRequest.body || {})).toString('base64')
      },
      body: {
        ...originalRequest.body,
        "_mitm_injection": "malicious_payload"
      }
    };
  }
  
  const incident = {
    type: "mitm_interception",
    data: intercepted,
    ip: req.ip || "127.0.0.1",
    timestamp: new Date().toISOString()
  };
  
  LAB_DATA.incidents.push(incident);
  broadcast({ type: "mitm_interception", data: incident });
  
  console.log("🔄 [MITM] Request intercepted:", intercepted);
  
  res.json({
    success: true,
    intercepted: intercepted,
    warning: "In real scenario, this could modify sensitive data in transit"
  });
});

// SSL/TLS bypass simulation
router.post("/ssl-bypass", (req, res) => {
  const { 
    certificate = "fake_cert.pem", 
    targetDomain = "lab.local" 
  } = req.body || {};
  
  const bypass = {
    technique: "SSL Certificate Spoofing",
    fakeCertificate: certificate,
    targetDomain: targetDomain,
    success: true,
    method: "Certificate Authority compromise simulation"
  };
  
  const incident = {
    type: "ssl_bypass",
    data: bypass,
    ip: req.ip || "127.0.0.1", 
    timestamp: new Date().toISOString()
  };
  
  LAB_DATA.incidents.push(incident);
  broadcast({ type: "ssl_bypass", data: incident });
  
  res.json({
    success: true,
    bypass: bypass,
    defenses: [
      "Certificate pinning",
      "HSTS (HTTP Strict Transport Security)",
      "Certificate transparency monitoring",
      "OCSP stapling verification"
    ]
  });
});

// Traffic analysis simulation
router.post("/analyze", (req, res) => {
  const recentTraffic = LAB_DATA.tapLog.slice(-100);
  
  const analysis = {
    totalRequests: recentTraffic.length,
    methodDistribution: analyzeRequestMethods(recentTraffic),
    pathFrequency: analyzePathFrequency(recentTraffic),
    suspiciousPatterns: detectSuspiciousPatterns(recentTraffic),
    dataExfiltration: checkForDataExfiltration(recentTraffic),
    recommendations: [
      "Use HTTPS for all communications",
      "Implement certificate pinning",
      "Monitor for unusual traffic patterns",
      "Use VPN for sensitive communications"
    ]
  };
  
  res.json({
    success: true,
    analysis: analysis,
    note: "Traffic analysis reveals communication patterns and potential vulnerabilities"
  });
});

// Packet injection simulation  
router.post("/inject", (req, res) => {
  const { 
    targetConnection = "127.0.0.1:5000",
    payload = "", 
    injectionType = "response" 
  } = req.body || {};
  
  const injection = {
    target: targetConnection,
    payload: payload,
    type: injectionType,
    timestamp: new Date().toISOString(),
    success: true,
    method: "TCP sequence prediction"
  };
  
  const incident = {
    type: "packet_injection",
    data: injection,
    ip: req.ip || "127.0.0.1",
    timestamp: new Date().toISOString()
  };
  
  LAB_DATA.incidents.push(incident);
  broadcast({ type: "packet_injection", data: incident });
  
  res.json({
    success: true,
    injection: injection,
    impact: "Could modify application behavior or steal data",
    mitigation: [
      "Use authenticated encryption",
      "Implement sequence number randomization", 
      "Monitor for duplicate or out-of-order packets",
      "Use secure protocols (TLS/SSL)"
    ]
  });
});

// Network reconnaissance  
router.get("/reconnaissance", (req, res) => {
  const techniques = [
    {
      name: "ARP Spoofing",
      description: "Poison ARP tables to redirect traffic",
      detection: "Monitor ARP table changes",
      prevention: "Static ARP entries, ARP inspection"
    },
    {
      name: "DNS Spoofing", 
      description: "Provide false DNS responses",
      detection: "DNS monitoring, DNSSEC validation",
      prevention: "Use secure DNS (DoH/DoT), DNSSEC"
    },
    {
      name: "DHCP Spoofing",
      description: "Provide malicious network configuration",
      detection: "Monitor DHCP servers",
      prevention: "DHCP snooping, authorized DHCP servers only"
    },
    {
      name: "Wi-Fi Pineapple",
      description: "Rogue access point for traffic interception", 
      detection: "Monitor for unexpected SSIDs",
      prevention: "WPA3, certificate-based authentication"
    }
  ];
  
  res.json(techniques);
});

// MITM defense testing
router.post("/defense-test", (req, res) => {
  const { 
    enableHSTS = false,
    enableCertPinning = false,
    enableCAValidation = true 
  } = req.body || {};
  
  const defenseEffectiveness = {
    HSTS: {
      enabled: enableHSTS,
      protection: enableHSTS ? "High" : "None",
      description: "Prevents downgrade attacks"
    },
    certificatePinning: {
      enabled: enableCertPinning,
      protection: enableCertPinning ? "Very High" : "None", 
      description: "Prevents certificate substitution"
    },
    caValidation: {
      enabled: enableCAValidation,
      protection: enableCAValidation ? "Medium" : "None",
      description: "Validates certificate authority chain"
    }
  };
  
  const overallProtection = calculateMITMProtection(defenseEffectiveness);
  
  res.json({
    success: true,
    defenses: defenseEffectiveness,
    overallProtection: overallProtection,
    recommendation: overallProtection < 70 ? 
      "Enable additional protections" : 
      "Good protection level maintained"
  });
});

function analyzeRequestMethods(traffic) {
  const methods = {};
  traffic.forEach(req => {
    methods[req.method] = (methods[req.method] || 0) + 1;
  });
  return methods;
}

function analyzePathFrequency(traffic) {
  const paths = {};
  traffic.forEach(req => {
    paths[req.path] = (paths[req.path] || 0) + 1;
  });
  
  return Object.entries(paths)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));
}

function detectSuspiciousPatterns(traffic) {
  const patterns = [];
  
  // Check for rapid requests from same IP
  const ipCounts = {};
  traffic.forEach(req => {
    ipCounts[req.ip] = (ipCounts[req.ip] || 0) + 1;
  });
  
  Object.entries(ipCounts).forEach(([ip, count]) => {
    if (count > 20) {
      patterns.push({
        type: "High frequency requests",
        ip: ip,
        count: count,
        severity: "Medium"
      });
    }
  });
  
  return patterns;
}

function checkForDataExfiltration(traffic) {
  return traffic.filter(req => 
    req.method === "POST" && 
    req.body && 
    Object.keys(req.body).length > 0
  ).length;
}

function calculateMITMProtection(defenses) {
  let score = 0;
  
  if (defenses.HSTS.enabled) score += 30;
  if (defenses.certificatePinning.enabled) score += 50;
  if (defenses.caValidation.enabled) score += 20;
  
  return score;
}
