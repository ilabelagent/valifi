/**
 * Simple local server for Valifi
 */

import { serve } from 'bun';

const PORT = parseInt(process.env.PORT || '3001');

console.log('Starting Valifi server...');

// Simple API handlers
const routes = {
  '/': () => new Response('Welcome to Valifi Fintech Platform 🚀'),

  '/api/health': () => Response.json({
    status: 'healthy',
    runtime: 'Bun ' + Bun.version,
    timestamp: new Date().toISOString(),
    server: 'Valifi Local Dev'
  }),

  '/api/info': () => Response.json({
    name: 'Valifi Fintech Platform',
    version: '3.0.0',
    features: [
      'Banking Services',
      'Trading Bots',
      'Crypto Wallets',
      'Investment Management',
      'KYC/AML Compliance'
    ]
  })
};

// Start server
const server = serve({
  port: PORT,

  fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Check for route handler
    const handler = routes[path];
    if (handler) {
      return handler();
    }

    // Default 404
    return new Response('Not Found', { status: 404 });
  },

  error(error) {
    console.error('Server error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});

console.log(`
✅ Valifi server is running!

🌐 Access Points:
   Main:   http://localhost:${PORT}
   Health: http://localhost:${PORT}/api/health
   Info:   http://localhost:${PORT}/api/info

Press Ctrl+C to stop
`);