#!/usr/bin/env node
const fs = require('fs');
const path = '.replit';

try {
  const content = fs.readFileSync(path, 'utf8');
  const updated = content.replace(/localPort = 3001/g, 'localPort = 5000');
  
  if (content !== updated) {
    fs.writeFileSync(path, updated, { mode: 0o644 });
    console.log('✅ Auto-configured .replit: port 3001 → 5000');
  }
} catch (err) {
  console.log('ℹ️  Cannot auto-configure .replit:', err.message);
}
