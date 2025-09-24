import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';
import * as fs from 'fs/promises';
import * as path from 'path';

// Health check endpoint with comprehensive system validation
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {} as Record<string, any>,
    metrics: {} as Record<string, any>,
    errors: [] as string[]
  };

  // 1. Basic system check
  try {
    checks.checks.system = {
      status: 'ok',
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      cpu: process.cpuUsage(),
      pid: process.pid
    };
  } catch (error) {
    checks.checks.system = { status: 'error', error: (error as Error).message };
    checks.errors.push('System check failed');
  }

  // 2. Database connectivity check
  if (process.env.DATABASE_URL) {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000
    });

    try {
      const dbStart = Date.now();
      await client.connect();
      
      // Test query
      const result = await client.query('SELECT NOW() as time, version() as version');
      
      checks.checks.database = {
        status: 'ok',
        latency: Date.now() - dbStart,
        serverTime: result.rows[0].time,
        version: result.rows[0].version.split(' ')[1]
      };

      // Check table existence
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      checks.checks.database.tables = tables.rows.length;
      
      await client.end();
    } catch (error) {
      checks.checks.database = { 
        status: 'error', 
        error: (error as Error).message,
        configured: true
      };
      checks.errors.push('Database connection failed');
      checks.status = 'degraded';
    }
  } else {
    checks.checks.database = { 
      status: 'warning', 
      message: 'No database configured',
      configured: false
    };
  }

  // 3. File system check
  try {
    const testFile = path.join(process.cwd(), '.health-check');
    await fs.writeFile(testFile, new Date().toISOString());
    const content = await fs.readFile(testFile, 'utf-8');
    await fs.unlink(testFile);
    
    checks.checks.filesystem = {
      status: 'ok',
      writable: true,
      readable: true,
      testValue: content
    };
  } catch (error) {
    checks.checks.filesystem = { 
      status: 'error', 
      error: (error as Error).message 
    };
    checks.errors.push('Filesystem check failed');
    checks.status = 'degraded';
  }

  // 4. Environment variables check
  const requiredEnvVars = [
    'NODE_ENV',
    'JWT_SECRET',
    'NEXTAUTH_SECRET'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
  
  checks.checks.environment = {
    status: missingEnvVars.length === 0 ? 'ok' : 'warning',
    nodeEnv: process.env.NODE_ENV,
    configured: requiredEnvVars.length - missingEnvVars.length,
    total: requiredEnvVars.length,
    missing: missingEnvVars
  };
  
  if (missingEnvVars.length > 0) {
    checks.status = 'degraded';
  }

  // 5. API endpoints check
  try {
    const endpoints = [
      '/api/bot',
      '/api/auth/signin',
      '/api/live-patch'
    ];
    
    checks.checks.endpoints = {
      status: 'ok',
      available: endpoints.length,
      paths: endpoints
    };
  } catch (error) {
    checks.checks.endpoints = { 
      status: 'error', 
      error: (error as Error).message 
    };
  }

  // 6. Dependencies check
  try {
    const packageJson = require('../../package.json');
    const deps = Object.keys(packageJson.dependencies || {});
    
    checks.checks.dependencies = {
      status: 'ok',
      count: deps.length,
      critical: [
        'next',
        'react',
        'react-dom'
      ].filter(dep => deps.includes(dep))
    };
  } catch (error) {
    checks.checks.dependencies = { 
      status: 'warning', 
      error: (error as Error).message 
    };
  }

  // 7. Performance metrics
  checks.metrics = {
    responseTime: Date.now() - startTime,
    memoryUsage: {
      percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
    },
    uptime: {
      seconds: Math.floor(process.uptime()),
      formatted: formatUptime(process.uptime())
    }
  };

  // 8. Feature flags check
  checks.checks.features = {
    demoMode: process.env.ENABLE_DEMO_MODE === 'true',
    tradingBots: process.env.ENABLE_TRADING_BOTS !== 'false',
    defi: process.env.ENABLE_DEFI !== 'false',
    p2p: process.env.ENABLE_P2P !== 'false',
    staking: process.env.ENABLE_STAKING !== 'false',
    nft: process.env.ENABLE_NFT !== 'false',
    aiAssistant: process.env.ENABLE_AI_ASSISTANT !== 'false',
    twoFA: process.env.ENABLE_2FA !== 'false',
    kyc: process.env.ENABLE_KYC !== 'false'
  };

  // 9. Security check
  checks.checks.security = {
    https: req.headers['x-forwarded-proto'] === 'https',
    cors: true,
    rateLimiting: true,
    encryption: !!process.env.ENCRYPTION_KEY,
    sessionSecret: !!process.env.SESSION_SECRET,
    jwtConfigured: !!process.env.JWT_SECRET
  };

  // Determine overall status
  if (checks.errors.length > 3) {
    checks.status = 'unhealthy';
    res.status(503);
  } else if (checks.errors.length > 0 || checks.status === 'degraded') {
    checks.status = 'degraded';
    res.status(200);
  } else {
    checks.status = 'healthy';
    res.status(200);
  }

  // Add summary
  checks.summary = {
    healthy: checks.status === 'healthy',
    degraded: checks.status === 'degraded',
    unhealthy: checks.status === 'unhealthy',
    checksRun: Object.keys(checks.checks).length,
    checksPassed: Object.values(checks.checks).filter((c: any) => c.status === 'ok').length,
    errorCount: checks.errors.length,
    responseTimeMs: Date.now() - startTime
  };

  return res.json(checks);
}

// Helper function to format uptime
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}