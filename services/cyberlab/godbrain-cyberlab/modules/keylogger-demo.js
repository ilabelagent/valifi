import { Router } from "express";
import { LAB_DATA, broadcast } from "../server.js";

export const router = Router();

// Keylogger simulation - only captures keystrokes with explicit consent
router.post("/capture", (req, res) => {
  const { key = "", metadata = {}, consent = false } = req.body || {};
  
  if (!consent) {
    return res.status(403).json({ 
      error: "Consent required", 
      message: "Keylogging requires explicit user consent in training environment" 
    });
  }
  
  const keystroke = {
    key: String(key).slice(0, 16), // Limit key length for safety
    timestamp: new Date().toISOString(),
    metadata: {
      alt: !!metadata.alt,
      ctrl: !!metadata.ctrl,
      shift: !!metadata.shift,
      meta: !!metadata.meta
    },
    ip: req.ip || "127.0.0.1"
  };
  
  LAB_DATA.keystrokes.push(keystroke);
  if (LAB_DATA.keystrokes.length > 1000) LAB_DATA.keystrokes.shift();
  
  broadcast({ type: "keystroke", data: keystroke });
  
  res.json({ success: true, captured: true });
});

// Get captured keystrokes
router.get("/keystrokes", (req, res) => {
  const { limit = 100 } = req.query;
  const recent = LAB_DATA.keystrokes.slice(-parseInt(limit));
  
  res.json({
    keystrokes: recent,
    total: LAB_DATA.keystrokes.length,
    note: "This is a controlled simulation with user consent"
  });
});

// Keylogger analytics and reconstruction
router.get("/reconstruct", (req, res) => {
  const keystrokes = LAB_DATA.keystrokes;
  let reconstructed = "";
  
  keystrokes.forEach(k => {
    if (k.key === "Backspace") {
      reconstructed = reconstructed.slice(0, -1);
    } else if (k.key === "Enter") {
      reconstructed += "\n";
    } else if (k.key === " " || k.key === "Space") {
      reconstructed += " ";
    } else if (k.key.length === 1) {
      reconstructed += k.metadata.shift ? k.key.toUpperCase() : k.key.toLowerCase();
    }
  });
  
  const analysis = {
    totalKeystrokes: keystrokes.length,
    reconstructedText: reconstructed.slice(0, 500), // Limit for safety
    commonKeys: getKeyFrequency(keystrokes),
    sessionDuration: keystrokes.length > 0 ? 
      new Date(keystrokes[keystrokes.length - 1].timestamp) - new Date(keystrokes[0].timestamp) : 0,
    typingPattern: analyzeTypingPattern(keystrokes)
  };
  
  res.json(analysis);
});

// Defense recommendations
router.get("/defense", (req, res) => {
  const defenses = [
    {
      technique: "Hardware Security Modules",
      description: "Use HSMs for sensitive operations",
      effectiveness: "High"
    },
    {
      technique: "Virtual Keyboards",
      description: "On-screen keyboards for sensitive input",
      effectiveness: "Medium"
    },
    {
      technique: "Keystroke Encryption",
      description: "Encrypt keystrokes at hardware level",
      effectiveness: "High"
    },
    {
      technique: "Anti-Keylogger Software",
      description: "Detect and block keylogging attempts",
      effectiveness: "Medium"
    },
    {
      technique: "Biometric Authentication",
      description: "Replace password typing with biometrics",
      effectiveness: "Very High"
    }
  ];
  
  res.json(defenses);
});

// Clear keystroke data
router.delete("/clear", (req, res) => {
  LAB_DATA.keystrokes = [];
  broadcast({ type: "keystrokes_cleared" });
  res.json({ success: true, message: "Keystroke data cleared" });
});

function getKeyFrequency(keystrokes) {
  const frequency = {};
  keystrokes.forEach(k => {
    frequency[k.key] = (frequency[k.key] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([key, count]) => ({ key, count }));
}

function analyzeTypingPattern(keystrokes) {
  if (keystrokes.length < 2) return null;
  
  const intervals = [];
  for (let i = 1; i < keystrokes.length; i++) {
    const interval = new Date(keystrokes[i].timestamp) - new Date(keystrokes[i-1].timestamp);
    intervals.push(interval);
  }
  
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const wpm = Math.round(60000 / (avgInterval * 5)); // Rough WPM calculation
  
  return {
    averageInterval: Math.round(avgInterval),
    estimatedWPM: wpm,
    consistency: calculateConsistency(intervals)
  };
}

function calculateConsistency(intervals) {
  if (intervals.length === 0) return 0;
  
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
  const standardDeviation = Math.sqrt(variance);
  
  return Math.max(0, 100 - (standardDeviation / mean * 100));
}
