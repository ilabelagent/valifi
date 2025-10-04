import { Router } from "express";
import { LAB_DATA, broadcast } from "../server.js";

export const router = Router();

// Simulated database for SQL injection demos
const FAKE_DB = {
  users: [
    { id: 1, username: "admin", email: "admin@lab.local", role: "administrator" },
    { id: 2, username: "user1", email: "user1@lab.local", role: "user" },
    { id: 3, username: "guest", email: "guest@lab.local", role: "guest" }
  ],
  products: [
    { id: 1, name: "Laptop", price: 999.99, category: "electronics" },
    { id: 2, name: "Phone", price: 599.99, category: "electronics" },
    { id: 3, name: "Book", price: 19.99, category: "books" }
  ]
};

// Vulnerable SQL injection endpoint (simulated)
router.post("/vulnerable", (req, res) => {
  const { query = "", table = "users" } = req.body || {};
  
  const incident = {
    type: "sqli_attempt",
    query: query,
    table: table,
    ip: req.ip || "127.0.0.1",
    timestamp: new Date().toISOString()
  };
  
  LAB_DATA.incidents.push(incident);
  broadcast({ type: "sqli_attempt", data: incident });
  
  // Simulate vulnerable SQL execution (educational only)
  let result;
  try {
    if (query.toLowerCase().includes("union") || query.toLowerCase().includes("select")) {
      result = {
        vulnerability: "UNION-based SQL injection detected",
        simulated_data: FAKE_DB[table] || [],
        warning: "In real scenario, this could expose entire database"
      };
    } else if (query.toLowerCase().includes("drop") || query.toLowerCase().includes("delete")) {
      result = {
        vulnerability: "Destructive SQL injection detected", 
        simulated_impact: "Database could be destroyed",
        warning: "CRITICAL: This could cause data loss in production"
      };
    } else {
      result = {
        reflected_input: query,
        note: "Basic SQL injection test - input reflected without sanitization"
      };
    }
  } catch (error) {
    result = { error: "SQL execution failed", details: error.message };
  }
  
  console.log("💉 [SQLI-ATTEMPT]", incident);
  
  res.json({
    success: true,
    simulation: "SQL Injection Test",
    result: result,
    recommendation: "Use parameterized queries and input validation"
  });
});

// Safe SQL demonstration
router.post("/safe", (req, res) => {
  const { userId = "" } = req.body || {};
  
  // Simulate parameterized query (safe approach)
  const id = parseInt(userId);
  if (isNaN(id)) {
    return res.status(400).json({ 
      error: "Invalid input", 
      message: "Input validation prevented potential injection" 
    });
  }
  
  const user = FAKE_DB.users.find(u => u.id === id);
  
  res.json({
    success: true,
    method: "Parameterized Query",
    result: user || { message: "User not found" },
    security: "Input properly validated and parameterized"
  });
});

// SQL injection training scenarios
router.get("/scenarios", (req, res) => {
  const scenarios = [
    {
      name: "Authentication Bypass",
      payload: "admin' OR '1'='1' --",
      description: "Bypasses login authentication",
      impact: "High - Full system access"
    },
    {
      name: "Union-based Data Extraction", 
      payload: "1' UNION SELECT username,password FROM users --",
      description: "Extracts data from other tables",
      impact: "Critical - Data breach"
    },
    {
      name: "Blind SQL Injection",
      payload: "1' AND (SELECT SUBSTRING(username,1,1) FROM users WHERE id=1)='a' --",
      description: "Extracts data character by character",
      impact: "High - Slow but complete data extraction"
    },
    {
      name: "Time-based Injection",
      payload: "1'; WAITFOR DELAY '00:00:05' --",
      description: "Uses time delays to confirm injection",
      impact: "Medium - Reconnaissance and data extraction"
    }
  ];
  
  res.json(scenarios);
});

// SQL injection analytics
router.get("/analytics", (req, res) => {
  const sqliIncidents = LAB_DATA.incidents.filter(i => i.type === "sqli_attempt");
  
  const analytics = {
    totalAttempts: sqliIncidents.length,
    uniquePayloads: new Set(sqliIncidents.map(i => i.query)).size,
    mostCommonTechnique: "UNION-based",
    riskLevel: "CRITICAL",
    lastAttempt: sqliIncidents[sqliIncidents.length - 1]?.timestamp || null
  };
  
  res.json(analytics);
});
