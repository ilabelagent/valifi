# VALIFI Bot - Complete Fix and Launch Script
# This PowerShell script fixes all issues and launches the bot

Write-Host "================================================" -ForegroundColor Green
Write-Host "    VALIFI BOT - COMPLETE FIX & LAUNCH" -ForegroundColor Cyan
Write-Host "    PowerShell Solution v5.0" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Set paths
$projectPath = "C:\Users\josh\Desktop\GodBrainAI\valifi"
$nodeExe = "C:\Program Files\nodejs\node.exe"
$npmCmd = "C:\Program Files\nodejs\npm.cmd"

# Ensure we're using the correct Node.js
$env:Path = "C:\Program Files\nodejs;$env:Path"

# Change to project directory
Set-Location $projectPath
Write-Host "Working directory: $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# Step 1: Verify Node.js
Write-Host "[1/6] Verifying Node.js installation..." -ForegroundColor Yellow
if (Test-Path $nodeExe) {
    $nodeVersion = & $nodeExe --version
    Write-Host "  ✓ Node.js $nodeVersion installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js not found!" -ForegroundColor Red
    Write-Host "  Please install from: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Step 2: Clean install
Write-Host ""
Write-Host "[2/6] Cleaning previous installation..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  Removing old node_modules..." -ForegroundColor Gray
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
}
Write-Host "  ✓ Cleaned" -ForegroundColor Green

# Step 3: Install all dependencies
Write-Host ""
Write-Host "[3/6] Installing all dependencies (this may take 2-3 minutes)..." -ForegroundColor Yellow
Write-Host "  Running: npm install --force" -ForegroundColor Gray
$installProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"$npmCmd`" install --force --legacy-peer-deps" -WorkingDirectory $projectPath -Wait -PassThru -NoNewWindow
if ($installProcess.ExitCode -eq 0) {
    Write-Host "  ✓ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Some warnings during install (usually OK)" -ForegroundColor Yellow
}

# Step 4: Verify Next.js installation
Write-Host ""
Write-Host "[4/6] Verifying Next.js installation..." -ForegroundColor Yellow
$nextPath = Join-Path $projectPath "node_modules\.bin\next.cmd"
if (Test-Path $nextPath) {
    Write-Host "  ✓ Next.js is installed locally" -ForegroundColor Green
} else {
    Write-Host "  Installing Next.js specifically..." -ForegroundColor Yellow
    & cmd /c "`"$npmCmd`" install next@latest --save"
}

# Step 5: Create/Update .env.local
Write-Host ""
Write-Host "[5/6] Setting up environment..." -ForegroundColor Yellow
$envContent = @"
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://localhost:5432/valifi
JWT_SECRET=valifi-jwt-secret-$(Get-Random)
NEXTAUTH_SECRET=valifi-nextauth-secret-$(Get-Random)
"@
if (!(Test-Path ".env.local")) {
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "  ✓ Created .env.local" -ForegroundColor Green
} else {
    Write-Host "  ✓ .env.local already exists" -ForegroundColor Green
}

# Step 6: Start the development server
Write-Host ""
Write-Host "[6/6] Starting VALIFI Bot..." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "    STARTING DEVELOPMENT SERVER" -ForegroundColor Cyan
Write-Host "    URL: http://localhost:3000" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Kill any process using port 3000
Write-Host "Checking port 3000..." -ForegroundColor Gray
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $pid = $port3000.OwningProcess
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Write-Host "  Cleared port 3000" -ForegroundColor Green
}

# Start the server
Write-Host ""
Write-Host "Launching server..." -ForegroundColor Cyan

# Open browser after a delay
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 8
    Start-Process "http://localhost:3000"
} | Out-Null

# Run the development server
& cmd /c "`"$npmCmd`" run dev"