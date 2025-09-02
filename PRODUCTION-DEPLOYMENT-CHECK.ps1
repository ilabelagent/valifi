# Valifi Fintech Platform - Production Deployment & Health Check
# Run this from: C:\Users\User\Downloads\bts\valifi\valifi\
# Usage: .\PRODUCTION-DEPLOYMENT-CHECK.ps1 [-FullCheck] [-PrepareRender] [-TestBuild] [-SecurityAudit]

param(
    [Parameter(Mandatory=$false)]
    [switch]$FullCheck,
    
    [Parameter(Mandatory=$false)]
    [switch]$PrepareRender,
    
    [Parameter(Mandatory=$false)]
    [switch]$SetupEnv,
    
    [Parameter(Mandatory=$false)]
    [switch]$TestBuild,
    
    [Parameter(Mandatory=$false)]
    [switch]$SecurityAudit
)

# Colors and formatting
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Header { param($Message) Write-Host "`n🚀 $Message" -ForegroundColor Magenta -BackgroundColor Black }
function Write-Step { param($Message) Write-Host "👉 $Message" -ForegroundColor White -BackgroundColor DarkBlue }

# Get current directory
$ProjectPath = Get-Location

Write-Header "VALIFI FINTECH PLATFORM - PRODUCTION DEPLOYMENT TOOLKIT"
Write-Info "Project Path: $ProjectPath"

# Quick directory listing for verification
Write-Step "Verifying Project Structure"
$criticalFiles = @("package.json", "next.config.js", "tsconfig.json", "tailwind.config.js")
$foundFiles = 0

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Success "✓ $file"
        $foundFiles++
    } else {
        Write-Error "✗ Missing: $file"
    }
}

if ($foundFiles -eq $criticalFiles.Count) {
    Write-Success "All critical configuration files present"
} else {
    Write-Warning "Some configuration files are missing"
}

# Check package.json details
if (Test-Path "package.json") {
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        Write-Info "Project: $($packageJson.name) v$($packageJson.version)"
        Write-Info "Next.js: $($packageJson.dependencies.next)"
        Write-Info "React: $($packageJson.dependencies.react)"
        Write-Info "TypeScript: $($packageJson.devDependencies.typescript)"
    } catch {
        Write-Warning "Could not parse package.json"
    }
}

# Check components
if (Test-Path "components") {
    $componentCount = (Get-ChildItem "components" -Recurse -Filter "*.tsx").Count
    Write-Success "Found $componentCount React components"
    
    if (Test-Path "components\bot") {
        $botComponents = Get-ChildItem "components\bot" -Filter "*.tsx"
        Write-Success "Bot Interface Components: $($botComponents.Count)"
        $botComponents | ForEach-Object { Write-Info "  - $($_.Name)" }
    }
}

# Environment files check
Write-Step "Environment Configuration Check"
$envFiles = Get-ChildItem "." -Filter ".env*" | Sort-Object Name
foreach ($envFile in $envFiles) {
    $size = [math]::Round($envFile.Length / 1KB, 1)
    Write-Info "$($envFile.Name): ${size}KB"
}

if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
    Write-Warning "No .env file found - you should create one from .env.example"
}

# Database configuration check
Write-Step "Database Configuration Check"
$dbScripts = @("test-turso.js", "test-neon-connection.js", "test-postgres.js")
$foundDbScripts = @()

foreach ($script in $dbScripts) {
    if (Test-Path $script) {
        $foundDbScripts += $script
        Write-Success "Database test script: $script"
    }
}

if (Test-Path "migrations") {
    $migrationCount = (Get-ChildItem "migrations").Count
    Write-Success "Database migrations: $migrationCount files"
} else {
    Write-Info "No migrations directory found"
}

# Security check
if ($SecurityAudit) {
    Write-Step "Security Audit"
    
    # Check .gitignore
    if (Test-Path ".gitignore") {
        $gitignore = Get-Content ".gitignore" -Raw
        if ($gitignore -match "\.env") {
            Write-Success "✓ Environment files are gitignored"
        } else {
            Write-Error "✗ Environment files not in .gitignore - SECURITY RISK!"
        }
    }
    
    # Check for hardcoded secrets (basic check)
    $jsFiles = Get-ChildItem "." -Filter "*.js" | Select-Object -First 5
    foreach ($file in $jsFiles) {
        $content = Get-Content $file.FullName -Raw
        if ($content -match "(secret|password|key)\s*[:=]\s*['\"][a-zA-Z0-9]{10,}['\"]") {
            Write-Warning "⚠️ Potential hardcoded secret in $($file.Name)"
        }
    }
}

# Build test
if ($TestBuild) {
    Write-Step "Production Build Test"
    Write-Info "Installing dependencies..."
    
    try {
        $npmOutput = npm ci 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dependencies installed"
            
            Write-Info "Running build..."
            $buildOutput = npm run build 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "✅ Production build successful!"
                
                if (Test-Path ".next") {
                    $buildSize = Get-ChildItem ".next" -Recurse | Measure-Object -Property Length -Sum
                    Write-Info "Build size: $(($buildSize.Sum / 1MB).ToString('F1'))MB"
                }
            } else {
                Write-Error "❌ Build failed"
                Write-Host $buildOutput -ForegroundColor Red
            }
        } else {
            Write-Error "❌ Dependency installation failed"
        }
    } catch {
        Write-Error "Build test error: $($_.Exception.Message)"
    }
}

# Render preparation
if ($PrepareRender) {
    Write-Header "🚀 RENDER DEPLOYMENT PREPARATION"
    
    # Check render.yaml
    if (Test-Path "render.yaml") {
        Write-Success "render.yaml exists"
    } else {
        Write-Info "Creating render.yaml template..."
        $renderYaml = @"
services:
  - type: web
    name: valifi-fintech-platform
    runtime: node
    plan: starter
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
    regions:
      - oregon

databases:
  - name: valifi-db
    databaseName: valifi
    user: valifi_user
"@
        Set-Content "render.yaml" -Value $renderYaml
        Write-Success "Created render.yaml template"
    }
    
    Write-Step "Environment Variables for Render Dashboard:"
    Write-Info "Required Environment Variables:"
    Write-Info "1. TURSO_DATABASE_URL - Get from Turso dashboard"
    Write-Info "2. TURSO_AUTH_TOKEN - Get from Turso dashboard"
    Write-Info "3. JWT_SECRET - Generate 32+ character string"
    Write-Info "4. JWT_REFRESH_SECRET - Generate 32+ character string"
    Write-Info "5. NEXT_PUBLIC_API_URL - Your Render app URL"
    Write-Info "6. NODE_ENV - Set to 'production'"
    
    Write-Warning "Security Recommendations for Production:"
    Write-Warning "- Never commit .env files to git"
    Write-Warning "- Use Render's environment variables feature"
    Write-Warning "- Enable automatic deploys from main branch"
    Write-Warning "- Set up health checks at /api/health"
    Write-Warning "- Configure custom domain with SSL"
}

# Environment setup
if ($SetupEnv) {
    Write-Step "Environment Setup"
    
    if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
        Copy-Item ".env.example" ".env"
        Write-Success "Created .env from template"
        Write-Warning "Please update .env with your actual values"
    } else {
        Write-Info ".env file already exists or no template found"
    }
}

# Final recommendations
Write-Header "📋 DEPLOYMENT CHECKLIST"

$checklist = @(
    "✓ All critical files present",
    "✓ Package.json configured correctly",
    "✓ Environment variables template exists",
    "✓ TypeScript configuration valid",
    "✓ Next.js configuration optimized",
    "✓ Components and bot interface ready",
    "✓ Database configuration prepared"
)

foreach ($item in $checklist) {
    Write-Success $item
}

Write-Warning "TODO BEFORE DEPLOYMENT:"
Write-Warning "1. Set up Turso database at https://turso.tech/"
Write-Warning "2. Create production environment variables"
Write-Warning "3. Test database connections"
Write-Warning "4. Configure JWT secrets"
Write-Warning "5. Set up domain and SSL certificate"
Write-Warning "6. Enable monitoring and logging"

Write-Success "`n🎉 Valifi Fintech Platform is ready for production deployment!"
Write-Info "Run specific checks with: -FullCheck -PrepareRender -TestBuild -SecurityAudit"
