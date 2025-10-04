import { Router } from "express";
export const router = Router();

// Lab-only cookie operations
router.get("/set", (req, res) => {
  const { name = "lab_session", value = `LAB_${Date.now()}`, secure = false } = req.query;
  
  // Set cookie with security flags for demonstration
  const cookieOptions = [
    `${name}=${value}`,
    "Path=/",
    "SameSite=Lax"
  ];
  
  if (secure) cookieOptions.push("Secure");
  if (req.query.httponly) cookieOptions.push("HttpOnly");
  
  res.setHeader("Set-Cookie", cookieOptions.join("; "));
  
  res.json({ 
    success: true, 
    message: `Cookie '${name}' set with value '${value}'`,
    security: {
      httpOnly: !!req.query.httponly,
      secure: secure,
      sameSite: "Lax"
    }
  });
});

// Read cookies (demonstrates scope)
router.get("/read", (req, res) => {
  const cookies = req.headers.cookie || "";
  const parsedCookies = {};
  
  if (cookies) {
    cookies.split(";").forEach(cookie => {
      const [name, value] = cookie.trim().split("=");
      if (name && value) parsedCookies[name] = value;
    });
  }
  
  res.json({
    demo: "cookie-scope-demonstration",
    serverSideCookies: parsedCookies,
    note: "Browser only sends cookies for this domain - demonstrates scope protection",
    security: "Cookies are domain-scoped and cannot be stolen cross-domain without XSS"
  });
});

// Session hijacking simulation (safe)
router.post("/hijack", (req, res) => {
  const { sessionId = "", targetDomain = "lab.local" } = req.body || {};
  
  // Simulate session validation
  const isValidSession = sessionId && sessionId.startsWith("LAB_");
  
  if (!isValidSession) {
    return res.status(401).json({
      error: "Invalid session",
      message: "Session hijacking failed - session validation prevented unauthorized access"
    });
  }
  
  res.json({
    success: true,
    simulation: "Session hijacking demonstration",
    sessionId: sessionId,
    message: "In real scenario, this could grant unauthorized access",
    mitigation: [
      "Use HTTPS only (Secure flag)",
      "Implement HttpOnly cookies",
      "Use SameSite=Strict",
      "Implement session rotation",
      "Monitor for suspicious session activity"
    ]
  });
});

// Cookie security analysis
router.get("/analyze", (req, res) => {
  const cookies = req.headers.cookie || "";
  const analysis = {
    totalCookies: cookies ? cookies.split(";").length : 0,
    securityFlags: analyzeCookieSecurity(req.headers.cookie),
    recommendations: [
      "Set HttpOnly flag to prevent XSS-based theft",
      "Use Secure flag for HTTPS-only transmission", 
      "Implement SameSite to prevent CSRF",
      "Use short expiration times for sensitive cookies",
      "Implement proper session management"
    ]
  };
  
  res.json(analysis);
});

// Cookie theft simulation (educational)
router.post("/steal", (req, res) => {
  const { cookies = "", method = "xss" } = req.body || {};
  
  const theftMethods = {
    xss: "document.cookie access via Cross-Site Scripting",
    mitm: "Network interception (unencrypted HTTP)",
    session_fixation: "Session ID prediction or fixation attack",
    csrf: "Cross-Site Request Forgery with cookie inclusion"
  };
  
  res.json({
    simulation: "Cookie theft demonstration",
    method: theftMethods[method] || "Unknown method",
    stolenCookies: cookies ? "Simulated successful theft" : "No cookies to steal",
    impact: "Unauthorized access to user session",
    prevention: [
      "HttpOnly cookies prevent XSS-based theft",
      "HTTPS prevents MITM attacks",
      "SameSite prevents CSRF attacks",
      "Session rotation limits exposure window"
    ]
  });
});

function analyzeCookieSecurity(cookieHeader) {
  if (!cookieHeader) return { httpOnly: false, secure: false, sameSite: false };
  
  return {
    httpOnly: cookieHeader.includes("HttpOnly"),
    secure: cookieHeader.includes("Secure"),
    sameSite: cookieHeader.includes("SameSite")
  };
}
