@echo off
REM Manual Deployment Fix Commands for Valifi
REM Run these commands one by one in PowerShell

echo 🚀 FIXING VALIFI DEPLOYMENT ISSUES MANUALLY
echo.

echo 📝 Creating render.yaml configuration...
(
echo services:
echo   - type: web
echo     name: valifi-fintech-platform
echo     runtime: node
echo     plan: starter
echo     region: oregon
echo     branch: main
echo     buildCommand: npm ci ^&^& npm run build
echo     startCommand: npm start
echo     healthCheckPath: /api/health
echo     envVars:
echo       - key: NODE_ENV
echo         value: production
echo       - key: JWT_SECRET
echo         generateValue: true
echo       - key: JWT_REFRESH_SECRET
echo         generateValue: true
echo       - key: NEXT_PUBLIC_API_URL
echo         value: https://valifi-fintech-platform.onrender.com
echo     scaling:
echo       minInstances: 1
echo       maxInstances: 3
echo.
echo databases:
echo   - name: valifi-postgres
echo     databaseName: valifi_production
echo     user: valifi_user
echo     plan: free
) > render.yaml

echo ✅ Created render.yaml

echo.
echo 📝 Creating health check endpoint...
if not exist "pages\api" mkdir pages\api

(
echo // Health check endpoint for Render
echo export default function handler(req, res^) {
echo   const healthcheck = {
echo     uptime: process.uptime(^),
echo     message: 'OK',
echo     timestamp: Date.now(^),
echo     service: 'valifi-fintech-platform',
echo     version: process.env.npm_package_version ^|^| '3.0.0',
echo     environment: process.env.NODE_ENV ^|^| 'development'
echo   };
echo   
echo   try {
echo     res.status(200^).json(healthcheck^);
echo   } catch (error^) {
echo     healthcheck.message = error;
echo     res.status(503^).json(healthcheck^);
echo   }
echo }
) > pages\api\health.js

echo ✅ Created health check endpoint

echo.
echo 📝 Creating Neon database template...
(
echo # Neon PostgreSQL Database Configuration
echo # Get these from: https://console.neon.tech/
echo DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
echo POSTGRES_PRISMA_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require^&pgbouncer=true^&connect_timeout=15
echo POSTGRES_URL_NON_POOLING=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
echo.
echo # JWT Configuration
echo JWT_SECRET=your-very-secure-jwt-secret-min-32-characters-here
echo JWT_REFRESH_SECRET=another-very-secure-refresh-secret-min-32-characters
echo.
echo # Next.js Configuration
echo NEXT_PUBLIC_API_URL=https://valifi-fintech-platform.onrender.com
echo NODE_ENV=production
echo.
echo # Optional: OAuth Configuration
echo GOOGLE_CLIENT_ID=your-google-client-id
echo GOOGLE_CLIENT_SECRET=your-google-client-secret
echo GITHUB_CLIENT_ID=your-github-client-id
echo GITHUB_CLIENT_SECRET=your-github-client-secret
) > .env.neon.template

echo ✅ Created Neon environment template

echo.
echo 📝 Creating Neon connection test script...
(
echo const { Pool } = require('pg'^);
echo.
echo async function testNeonConnection(^) {
echo   const pool = new Pool({
echo     connectionString: process.env.DATABASE_URL,
echo     ssl: {
echo       rejectUnauthorized: false
echo     },
echo     max: 20,
echo     idleTimeoutMillis: 30000,
echo     connectionTimeoutMillis: 2000,
echo   }^);
echo.
echo   try {
echo     const client = await pool.connect(^);
echo     console.log('✅ Connected to Neon PostgreSQL successfully!'^);
echo     
echo     const result = await client.query('SELECT NOW(^)'^);
echo     console.log('🕒 Current time from database:', result.rows[0].now^);
echo     
echo     client.release(^);
echo     await pool.end(^);
echo     
echo     return true;
echo   } catch (error^) {
echo     console.error('❌ Neon connection failed:', error.message^);
echo     return false;
echo   }
echo }
echo.
echo if (require.main === module^) {
echo   require('dotenv'^).config(^);
echo   testNeonConnection(^);
echo }
echo.
echo module.exports = testNeonConnection;
) > test-neon-connection.js

echo ✅ Created Neon test script

echo.
echo 📝 Creating fixed vercel.json...
(
echo {
echo   "buildCommand": "npm run build",
echo   "devCommand": "npm run dev", 
echo   "installCommand": "npm install --force --legacy-peer-deps",
echo   "framework": "nextjs",
echo   "outputDirectory": ".next",
echo   "env": {
echo     "NODE_ENV": "production",
echo     "NEXT_PUBLIC_API_URL": "$NEXT_PUBLIC_API_URL",
echo     "JWT_SECRET": "$JWT_SECRET",
echo     "JWT_REFRESH_SECRET": "$JWT_REFRESH_SECRET",
echo     "DATABASE_URL": "$DATABASE_URL"
echo   },
echo   "build": {
echo     "env": {
echo       "NODE_ENV": "production",
echo       "NEXT_TELEMETRY_DISABLED": "1"
echo     }
echo   },
echo   "functions": {
echo     "pages/api/**.js": {
echo       "maxDuration": 30,
echo       "memory": 1024
echo     }
echo   }
echo }
) > vercel-fixed.json

copy vercel.json vercel.json.backup >nul 2>nul
copy vercel-fixed.json vercel.json >nul

echo ✅ Fixed vercel.json configuration

echo.
echo 📋 DEPLOYMENT FILES CREATED:
echo ✅ render.yaml - Render deployment configuration
echo ✅ pages/api/health.js - Health check endpoint
echo ✅ .env.neon.template - Database environment template
echo ✅ test-neon-connection.js - Database connection tester
echo ✅ vercel-fixed.json - Fixed Vercel configuration

echo.
echo 🎯 NEXT STEPS:
echo 1. Sign up for Neon DB: https://console.neon.tech/
echo 2. Sign up for Render: https://render.com/
echo 3. Connect your GitHub repo to Render
echo 4. Set environment variables in Render dashboard
echo 5. Deploy!

echo.
echo ✅ MANUAL SETUP COMPLETE!
pause
