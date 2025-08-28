# VALIFI Bot Launcher - PowerShell Edition
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "     VALIFI BOT LAUNCHER - POWERSHELL" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Set Node.js paths explicitly
$env:Path = "C:\Program Files\nodejs;$env:Path"
$nodeExe = "C:\Program Files\nodejs\node.exe"
$npmCmd = "C:\Program Files\nodejs\npm.cmd"

# Change to VALIFI directory
Set-Location "C:\Users\josh\Desktop\GodBrainAI\valifi"
Write-Host "Directory: $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# Test Node.js
Write-Host "[1] Testing Node.js..." -ForegroundColor Yellow
& $nodeExe --version
Write-Host "    ✓ Node.js OK" -ForegroundColor Green

# Test npm
Write-Host "[2] Testing npm..." -ForegroundColor Yellow
& cmd /c "$npmCmd --version"
Write-Host "    ✓ npm OK" -ForegroundColor Green

# Check for dependencies
Write-Host "[3] Checking dependencies..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "    Installing dependencies..." -ForegroundColor Cyan
    & cmd /c "$npmCmd install --force --legacy-peer-deps"
} else {
    Write-Host "    ✓ Dependencies installed" -ForegroundColor Green
}

# Start the server
Write-Host ""
Write-Host "[4] Starting VALIFI Bot..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting development server on http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""
& cmd /c "$npmCmd run dev"