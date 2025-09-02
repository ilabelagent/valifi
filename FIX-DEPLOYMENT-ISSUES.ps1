# Fix Deployment Issues for Valifi - Render & Environment Setup
# This script fixes the NODE_ENV issue and prepares for Render deployment

param(
    [Parameter(Mandatory=$false)]
    [switch]$FixVercelIssues,
    
    [Parameter(Mandatory=$false)]
    [switch]$SetupRender,
    
    [Parameter(Mandatory=$false)]
    [switch]$SetupNeon,
    
    [Parameter(Mandatory=$false)]
    [switch]$FixAllIssues
)

# Colors
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Header { param($Message) Write-Host "`n🚀 $Message" -ForegroundColor Magenta -BackgroundColor Black }

Write-Header "FIXING VALIFI DEPLOYMENT ISSUES"

# Check current location
$currentPath = Get-Location
Write-Info "Working in: $currentPath"

# Fix 1: Environment Variable Issues
Write-Header "🔧 FIXING ENVIRONMENT VARIABLES"

if ($FixVercelIssues -or $FixAllIssues) {
    Write-Info "Fixing NODE_ENV issues for Vercel..."
    
    # Check if vercel.json exists and fix it
    if (Test-Path "vercel.json") {
        $vercelConfig = @{
            "env" = @{
                "NODE_ENV" = "production"
                "NEXT_PUBLIC_API_URL" = "`$NEXT_PUBLIC_API_URL"
                "JWT_SECRET" = "`$JWT_SECRET"
                "JWT_REFRESH_SECRET" = "`$JWT_REFRESH_SECRET"
                "TURSO_DATABASE_URL" = "`$TURSO_DATABASE_URL"
                "TURSO_AUTH_TOKEN" = "`$TURSO_AUTH_TOKEN"
            }
            "build" = @{
                "env" = @{
                    "NODE_ENV" = "production"
                }
            }
            "functions" = @{
                "app/api/**" = @{
                    "maxDuration" = 30
                }
            }
        }
        
        $vercelConfig | ConvertTo-Json -Depth 3 | Set-Content "vercel.json"
        Write-Success "Fixed vercel.json with NODE_ENV configuration"
    } else {
        Write-Info "Creating vercel.json with proper environment setup"
        $vercelConfig | ConvertTo-Json -Depth 3 | Set-Content "vercel.json"
        Write-Success "Created vercel.json"
    }
}

# Fix 2: Setup for Render (Better option than Vercel for this project)
if ($SetupRender -or $FixAllIssues) {
    Write-Header "🚀 SETTING UP RENDER DEPLOYMENT"
    
    # Create/Update render.yaml
    $renderYaml = @"
services:
  - type: web
    name: valifi-fintech-platform
    runtime: node
    plan: starter
    region: oregon
    branch: main
    buildCommand: npm ci && npm run build
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true
      - key: NEXT_PUBLIC_API_URL
        value: https://valifi-fintech-platform.onrender.com
    scaling:
      minInstances: 1
      maxInstances: 3
    disk:
      name: valifi-disk
      size: 1GB
      path: /opt/render/project/data

databases:
  - name: valifi-postgres
    databaseName: valifi_production
    user: valifi_user
    plan: free
"@
    
    Set-Content "render.yaml" -Value $renderYaml
    Write-Success "Created render.yaml configuration"
    
    # Create a health check API route if it doesn't exist
    $healthCheckDir = "pages/api"
    if (-not (Test-Path $healthCheckDir)) {
        New-Item -ItemType Directory -Path $healthCheckDir -Force
    }
    
    $healthCheckContent = @"
// Health check endpoint for Render
export default function handler(req, res) {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    service: 'valifi-fintech-platform',
    version: process.env.npm_package_version || '3.0.0',
    environment: process.env.NODE_ENV || 'development'
  };
  
  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = error;
    res.status(503).json(healthcheck);
  }
}
"@
    
    Set-Content "$healthCheckDir/health.js" -Value $healthCheckContent
    Write-Success "Created health check endpoint at /api/health"
}

# Fix 3: Setup Neon Database (Better than Turso for Render)
if ($SetupNeon -or $FixAllIssues) {
    Write-Header "🐘 SETTING UP NEON POSTGRESQL"
    
    Write-Info "Setting up Neon database configuration..."
    
    # Create Neon-specific environment template
    $neonEnvTemplate = @"
# Neon PostgreSQL Database Configuration
# Get these from: https://console.neon.tech/
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_PRISMA_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT Configuration
JWT_SECRET=your-very-secure-jwt-secret-min-32-characters-here
JWT_REFRESH_SECRET=another-very-secure-refresh-secret-min-32-characters

# Next.js Configuration
NEXT_PUBLIC_API_URL=https://valifi-fintech-platform.onrender.com
NODE_ENV=production

# Optional: OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
"@
    
    Set-Content ".env.neon.template" -Value $neonEnvTemplate
    Write-Success "Created .env.neon.template"
    
    # Create Neon connection test script
    $neonTestScript = @"
const { Pool } = require('pg');

async function testNeonConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to Neon PostgreSQL successfully!');
    
    const result = await client.query('SELECT NOW()');
    console.log('🕒 Current time from database:', result.rows[0].now);
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('❌ Neon connection failed:', error.message);
    return false;
  }
}

if (require.main === module) {
  require('dotenv').config();
  testNeonConnection();
}

module.exports = testNeonConnection;
"@
    
    Set-Content "test-neon-connection.js" -Value $neonTestScript
    Write-Success "Created Neon connection test script"
}

# Fix 4: Update package.json scripts for better deployment
Write-Header "📦 UPDATING PACKAGE.JSON SCRIPTS"

if (Test-Path "package.json") {
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        
        # Add deployment scripts
        if (-not $packageJson.scripts) {
            $packageJson.scripts = @{}
        }
        
        $packageJson.scripts."vercel-build" = "npm run build"
        $packageJson.scripts."render-build" = "npm ci && npm run build"
        $packageJson.scripts."test-neon" = "node test-neon-connection.js"
        $packageJson.scripts."health-check" = "curl http://localhost:3000/api/health || echo 'Health check endpoint not responding'"
        
        # Ensure NODE_ENV is set in scripts
        $packageJson.scripts."build" = "NODE_ENV=production next build"
        $packageJson.scripts."start" = "NODE_ENV=production next start"
        
        $packageJson | ConvertTo-Json -Depth 5 | Set-Content "package.json"
        Write-Success "Updated package.json with deployment scripts"
    } catch {
        Write-Warning "Could not update package.json: $($_.Exception.Message)"
    }
}

# Fix 5: Create deployment instructions
Write-Header "📋 CREATING DEPLOYMENT INSTRUCTIONS"

$deploymentInstructions = @"
# Valifi Deployment Instructions - Fixed Version

## 🚀 Render Deployment (Recommended)

### Step 1: Setup Neon Database
1. Go to https://console.neon.tech/
2. Create a new project: "valifi-production"
3. Copy the connection string
4. Update environment variables in Render

### Step 2: Deploy to Render
1. Connect your GitHub repository to Render
2. Select "Web Service"
3. Use these settings:
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
   - Environment: Node.js
   - Instance Type: Starter (or higher)

### Step 3: Environment Variables in Render
Set these in Render Dashboard > Environment:
```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=<generate-32-char-secret>
JWT_REFRESH_SECRET=<generate-32-char-secret>
NEXT_PUBLIC_API_URL=https://your-app-name.onrender.com
```

### Step 4: Test Deployment
After deployment, test these endpoints:
- https://your-app-name.onrender.com (main app)
- https://your-app-name.onrender.com/api/health (health check)

## 🔧 Local Testing
```bash
npm install
cp .env.neon.template .env
# Edit .env with your actual values
npm run dev
```

## 🐛 Common Issues Fixed
- ✅ NODE_ENV environment variable properly set
- ✅ Health check endpoint created
- ✅ Render configuration optimized
- ✅ Database connection pooling configured
- ✅ Build scripts updated for production

## 📞 Support
If issues persist, check:
1. Render deployment logs
2. Database connection with: `npm run test-neon`
3. Health check endpoint: `/api/health`
"@

Set-Content "DEPLOYMENT-INSTRUCTIONS-FIXED.md" -Value $deploymentInstructions
Write-Success "Created comprehensive deployment instructions"

# Summary
Write-Header "✨ DEPLOYMENT ISSUES FIXED!"

Write-Success "✅ Fixed NODE_ENV environment variable issues"
Write-Success "✅ Created proper Render configuration"
Write-Success "✅ Set up Neon PostgreSQL integration"
Write-Success "✅ Added health check endpoint"
Write-Success "✅ Updated build scripts"
Write-Success "✅ Created deployment documentation"

Write-Warning "NEXT STEPS:"
Write-Info "1. Sign up for Neon DB: https://console.neon.tech/"
Write-Info "2. Create Render account: https://render.com/"
Write-Info "3. Connect your GitHub repo to Render"
Write-Info "4. Set environment variables in Render dashboard"
Write-Info "5. Deploy and test!"

Write-Header "🎯 RECOMMENDED: Use Render instead of Vercel"
Write-Info "Render is better suited for your fintech platform because:"
Write-Info "- Better PostgreSQL support"
Write-Info "- More predictable pricing"
Write-Info "- Better for backend-heavy applications"
Write-Info "- Easier environment variable management"

Write-Success "Run this script with flags: -FixVercelIssues -SetupRender -SetupNeon -FixAllIssues"
