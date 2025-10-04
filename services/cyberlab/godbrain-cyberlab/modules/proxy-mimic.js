import { Router } from "express";
export const router = Router();

// Local proxy endpoint for MITM simulation
router.post("/forward", async (req, res) => {
  const { 
    targetUrl = "http://127.0.0.1:5000/api/health", 
    modifyRequest = false,
    modifyResponse = false 
  } = req.body || {};
  
  // Only allow localhost targets for safety
  if (!targetUrl.includes("127.0.0.1") && !targetUrl.includes("localhost")) {
    return res.status(403).json({ 
      error: "Security restriction", 
      message: "Proxy only allows localhost targets" 
    });
  }
  
  try {
    let requestData = { ...req.body };
    
    if (modifyRequest) {
      requestData = {
        ...requestData,
        "_proxy_modified": true,
        "_original_timestamp": new Date().toISOString()
      };
    }
    
    // Simulate forwarding request (in real MITM, this would go to actual target)
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    }).catch(() => ({ 
      json: () => ({ 
        simulated: true, 
        message: "Simulated upstream response" 
      }) 
    }));
    
    let responseData = await response.json();
    
    if (modifyResponse) {
      responseData = {
        ...responseData,
        "_response_modified": true,
        "_injected_content": "malicious_script_here",
        "_mitm_timestamp": new Date().toISOString()
      };
    }
    
    res.json({
      success: true,
      proxy_simulation: true,
      original_request: req.body,
      modified_request: modifyRequest ? requestData : null,
      upstream_response: responseData,
      mitm_capabilities: [
        "Request modification",
        "Response injection", 
        "Content replacement",
        "Header manipulation",
        "Traffic analysis"
      ]
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: "Proxy error", 
      message: error.message 
    });
  }
});

// Upstream simulator for proxy testing
router.post("/upstream", (req, res) => {
  res.json({ 
    upstream_received: req.body, 
    note: "This represents the target server response",
    timestamp: new Date().toISOString()
  });
});

// Proxy configuration
router.get("/config", (req, res) => {
  const config = {
    proxy_type: "HTTP/HTTPS Intercepting Proxy",
    capabilities: [
      "SSL/TLS termination and re-encryption",
      "Request/response modification",
      "Traffic logging and analysis", 
      "Content injection",
      "Session hijacking",
      "Certificate spoofing"
    ],
    detection_methods: [
      "Certificate validation",
      "Certificate pinning",
      "HSTS enforcement",
      "Traffic timing analysis",
      "Unexpected response headers"
    ],
    lab_safety: "All traffic confined to localhost - no external impact"
  };
  
  res.json(config);
});
