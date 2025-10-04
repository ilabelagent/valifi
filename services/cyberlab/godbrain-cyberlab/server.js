import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { WebSocketServer } from "ws";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

// Import all simulation modules
import { router as phishing } from "./modules/phishing-demo.js";
import { router as sqli } from "./modules/sqli-demo.js";
import { router as cookies } from "./modules/cookies-demo.js";
import { router as keylogger } from "./modules/keylogger-demo.js";
import { router as proxy } from "./modules/proxy-mimic.js";
import { router as xss } from "./modules/xss-demo.js";
import { router as ddos } from "./modules/ddos-simulation.js";
import { router as mitm } from "./modules/mitm-simulation.js";
import { router as payloads } from "./modules/payload-generator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Security headers with relaxed CSP for lab environment
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// CORS - Allow only localhost for security
app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  const host = req.headers.host || "";
  
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1") || !origin) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    return next();
  }
  return res.status(403).json({ error: "Forbidden: Local lab only" });
});

// Static files
app.use("/", express.static(path.join(__dirname, "public")));

// In-memory storage for lab data
const LAB_DATA = {
  incidents: [],
  keystrokes: [],
  tapLog: [],
  ddosMetrics: { requests: 0, blocked: 0, startTime: Date.now() },
  sessions: new Map(),
  payloads: []
};

// WebSocket for real-time updates
const wss = new WebSocketServer({ server });
wss.on("connection", (ws) => {
  console.log("🔗 WebSocket client connected");
  ws.on("close", () => console.log("🔌 WebSocket client disconnected"));
});

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

// Traffic monitoring middleware
app.use((req, res, next) => {
  if (req.path.startsWith("/sim/")) {
    const entry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      ip: req.ip || "127.0.0.1",
      userAgent: req.headers["user-agent"] || "Unknown",
      body: req.method === "POST" ? req.body : null
    };
    LAB_DATA.tapLog.push(entry);
    if (LAB_DATA.tapLog.length > 1000) LAB_DATA.tapLog.shift();
    
    // Broadcast to WebSocket clients
    broadcast({ type: "traffic", data: entry });
  }
  next();
});

// Mount simulation modules
app.use("/sim/phish", phishing);
app.use("/sim/sqli", sqli);
app.use("/sim/cookies", cookies);
app.use("/sim/keys", keylogger);
app.use("/sim/proxy", proxy);
app.use("/sim/xss", xss);
app.use("/sim/ddos", ddos);
app.use("/sim/mitm", mitm);
app.use("/sim/payloads", payloads);

// API endpoints for lab management
app.post("/api/log", (req, res) => {
  const entry = { 
    ...req.body, 
    timestamp: new Date().toISOString(),
    id: Date.now() + Math.random()
  };
  LAB_DATA.incidents.push(entry);
  if (LAB_DATA.incidents.length > 500) LAB_DATA.incidents.shift();
  
  broadcast({ type: "incident", data: entry });
  console.log("📘 [LAB-LOG]", entry);
  res.json({ ok: true, id: entry.id });
});

app.get("/api/incidents", (req, res) => {
  res.json(LAB_DATA.incidents);
});

app.get("/api/tap", (req, res) => {
  res.json(LAB_DATA.tapLog);
});

app.get("/api/stats", (req, res) => {
  res.json({
    incidents: LAB_DATA.incidents.length,
    keystrokes: LAB_DATA.keystrokes.length,
    traffic: LAB_DATA.tapLog.length,
    uptime: Date.now() - LAB_DATA.ddosMetrics.startTime,
    ddos: LAB_DATA.ddosMetrics,
    sessions: LAB_DATA.sessions.size
  });
});

app.delete("/api/clear", (req, res) => {
  LAB_DATA.incidents = [];
  LAB_DATA.keystrokes = [];
  LAB_DATA.tapLog = [];
  LAB_DATA.ddosMetrics = { requests: 0, blocked: 0, startTime: Date.now() };
  LAB_DATA.sessions.clear();
  broadcast({ type: "clear" });
  res.json({ ok: true, message: "Lab data cleared" });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "online", 
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    modules: ["phishing", "sqli", "xss", "cookies", "keylogger", "proxy", "ddos", "mitm", "payloads"]
  });
});

// Export LAB_DATA for modules to use
export { LAB_DATA, broadcast };

const PORT = process.env.PORT || 5000;
server.listen(PORT, "127.0.0.1", () => {
  console.log(`
🧠 ===============================================
   GodBrain Cybersecurity Lab v1.0.0
   ===============================================
   🌐 Local URL: http://127.0.0.1:${PORT}
   🔒 Security: Localhost only
   📡 WebSocket: Enabled for real-time updates
   🛡️  Modules: All simulation modules loaded
   ===============================================
   
   🚀 Lab is ready for ethical hacking training!
   📚 CEH v14 compatible simulations available
   ⚠️  For educational purposes only
   ===============================================
`);
});
