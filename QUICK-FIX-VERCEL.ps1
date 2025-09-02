# IMMEDIATE FIX for Vercel NODE_ENV Issue
# Run this to fix the current deployment failure

Write-Host "🚀 IMMEDIATE VERCEL FIX" -ForegroundColor Magenta -BackgroundColor Black

# Fix the vercel.json environment variable issue
Write-Host "📝 Fixing vercel.json environment variables..." -ForegroundColor Cyan

$fixedVercelConfig = @{
    "buildCommand" = "npm run build"
    "devCommand" = "npm run dev"
    "installCommand" = "npm install --force --legacy-peer-deps"
    "framework" = "nextjs"
    "outputDirectory" = ".next"
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
            "NEXT_TELEMETRY_DISABLED" = "1"
        }
    }
    "functions" = @{
        "pages/api/**.js" = @{
            "maxDuration" = 30
            "memory" = 1024
        }
    }
}

# Convert to JSON and save
$fixedVercelConfig | ConvertTo-Json -Depth 4 | Set-Content "vercel-fixed.json"

# Backup current vercel.json
Copy-Item "vercel.json" "vercel.json.backup"

# Replace with fixed version
Copy-Item "vercel-fixed.json" "vercel.json"

Write-Host "✅ Fixed vercel.json - NODE_ENV now set to 'production'" -ForegroundColor Green
Write-Host "✅ Simplified environment variables" -ForegroundColor Green
Write-Host "✅ Backed up original to vercel.json.backup" -ForegroundColor Green

# Also create a simple .env.production for local testing
$productionEnv = @"
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-vercel-app.vercel.app
JWT_SECRET=your-jwt-secret-here-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-here-min-32-characters
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-token
"@

Set-Content ".env.production" -Value $productionEnv

Write-Host "✅ Created .env.production template" -ForegroundColor Green

Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Commit and push these changes:" -ForegroundColor White
Write-Host "   git add vercel.json .env.production" -ForegroundColor Gray
Write-Host "   git commit -m 'Fix NODE_ENV and simplify Vercel config'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. In Vercel Dashboard, set these environment variables:" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_API_URL = https://your-app-name.vercel.app" -ForegroundColor Gray
Write-Host "   JWT_SECRET = (generate 32+ character string)" -ForegroundColor Gray
Write-Host "   JWT_REFRESH_SECRET = (generate 32+ character string)" -ForegroundColor Gray
Write-Host "   TURSO_DATABASE_URL = (your Turso URL)" -ForegroundColor Gray
Write-Host "   TURSO_AUTH_TOKEN = (your Turso token)" -ForegroundColor Gray

Write-Host "`n🎯 RECOMMENDED: Switch to Render" -ForegroundColor Magenta
Write-Host "Render is better for this fintech app. Run: .\FIX-DEPLOYMENT-ISSUES.ps1 -SetupRender" -ForegroundColor White

Write-Host "`n✅ IMMEDIATE FIX COMPLETE!" -ForegroundColor Green -BackgroundColor DarkGreen
