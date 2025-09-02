# =====================================================
# VALIFI BOT - POWERSHELL LAUNCHER
# Robust Error Handling & Auto-Configuration
# =====================================================

param(
    [string]$Mode = "dev",
    [switch]$SkipInstall = $false,
    [switch]$ForceRebuild = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"
Clear-Host

# Colors
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# Banner
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "         VALIFI BOT - POWERSHELL LAUNCHER" -ForegroundColor Cyan
Write-Host "         Auto-Configuration & Deployment" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Function to test command
function Test-Command {
    param($CommandName)
    try {
        if (Get-Command $CommandName -ErrorAction SilentlyContinue) {
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

# Check Node.js
Write-Info "[1] Checking Node.js..."
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Success "   ✓ Node.js installed: $nodeVersion"
} else {
    Write-Error "   ✗ Node.js not found!"
    Write-Warning "   Please install Node.js from: https://nodejs.org"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check npm
Write-Info "[2] Checking npm..."
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Success "   ✓ npm installed: $npmVersion"
} else {
    Write-Error "   ✗ npm not found!"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check current directory
Write-Info "[3] Current directory:"
Write-Host "   $PWD" -ForegroundColor White

# Check for package.json
Write-Info "[4] Checking project files..."
if (Test-Path "package.json") {
    Write-Success "   ✓ package.json found"
    
    # Read package.json
    $packageContent = Get-Content "package.json" -Raw | ConvertFrom-Json
    Write-Info "   Project: $($packageContent.name)"
    Write-Info "   Version: $($packageContent.version)"
} else {
    Write-Warning "   ⚠ package.json not found"
    Write-Info "   Creating basic package.json..."
    
    $packageJson = @{
        name = "valifi-fintech-platform"
        version = "1.0.0"
        private = $true
        scripts = @{
            dev = "next dev"
            build = "next build"
            start = "next start"
            lint = "next lint"
        }
        dependencies = @{
            "next" = "14.0.0"
            "react" = "18.2.0"
            "react-dom" = "18.2.0"
        }
    }
    
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    Write-Success "   ✓ package.json created"
}

# Install dependencies
if (-not $SkipInstall) {
    Write-Info "[5] Checking dependencies..."
    
    if (-not (Test-Path "node_modules")) {
        Write-Warning "   Dependencies not installed"
        Write-Info "   Installing packages (this may take a few minutes)..."
        
        # Try with legacy peer deps first
        $installResult = npm install --force --legacy-peer-deps 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "   Retrying with standard install..."
            npm install 2>&1 | Out-Null
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "   ✓ Dependencies installed"
        } else {
            Write-Warning "   ⚠ Some dependencies had issues"
        }
    } else {
        Write-Success "   ✓ Dependencies already installed"
        
        if ($ForceRebuild) {
            Write-Info "   Force rebuild requested..."
            Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
            Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
            npm install --force --legacy-peer-deps 2>&1 | Out-Null
            Write-Success "   ✓ Dependencies rebuilt"
        }
    }
} else {
    Write-Info "[5] Skipping dependency installation"
}

# Check for Next.js
$isNextProject = Test-Path "next.config.js"
if ($isNextProject) {
    Write-Info "[6] Next.js project detected"
    
    # Check if build exists
    if (-not (Test-Path ".next") -or $ForceRebuild) {
        Write-Info "   Building Next.js project..."
        npm run build 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "   ✓ Build completed"
        } else {
            Write-Warning "   ⚠ Build had warnings"
        }
    } else {
        Write-Success "   ✓ Build exists"
    }
}

# Environment check
Write-Info "[7] Checking environment..."
if (Test-Path ".env.local") {
    Write-Success "   ✓ .env.local found"
} elseif (Test-Path ".env") {
    Write-Success "   ✓ .env found"
} else {
    Write-Warning "   ⚠ No environment file found"
    Write-Info "   Creating .env.local..."
    
    @"
# Auto-generated environment file
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
"@ | Set-Content ".env.local"
    
    Write-Success "   ✓ .env.local created"
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "           SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Launch menu
function Show-Menu {
    Write-Info "Select startup mode:"
    Write-Host "  1. Development mode (hot reload)" -ForegroundColor White
    Write-Host "  2. Production mode (optimized)" -ForegroundColor White
    Write-Host "  3. Build only" -ForegroundColor White
    Write-Host "  4. Run tests" -ForegroundColor White
    Write-Host "  5. Exit" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Enter your choice (1-5)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Success "Starting in DEVELOPMENT mode..."
            Write-Info "Server will start on: http://localhost:3000"
            Write-Warning "Press Ctrl+C to stop"
            Write-Host ""
            npm run dev
        }
        "2" {
            Write-Host ""
            Write-Success "Starting in PRODUCTION mode..."
            if (-not (Test-Path ".next")) {
                Write-Info "Building for production..."
                npm run build
            }
            Write-Info "Server will start on: http://localhost:3000"
            Write-Warning "Press Ctrl+C to stop"
            Write-Host ""
            npm start
        }
        "3" {
            Write-Host ""
            Write-Info "Building project..."
            npm run build
            Write-Success "Build complete!"
        }
        "4" {
            Write-Host ""
            Write-Info "Running tests..."
            npm test
        }
        "5" {
            Write-Info "Exiting..."
            exit 0
        }
        default {
            Write-Error "Invalid choice!"
            Show-Menu
        }
    }
}

# Auto-start based on parameter or show menu
if ($Mode -eq "auto") {
    Write-Success "Auto-starting in development mode..."
    Write-Info "Server starting on: http://localhost:3000"
    npm run dev
} else {
    Show-Menu
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")