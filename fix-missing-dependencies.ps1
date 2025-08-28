# Fix Missing Dependencies for Valifi Fintech Platform

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIXING MISSING DEPENDENCIES FOR VALIFI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop any running Node processes
Write-Host "Stopping any running Next.js dev servers..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Installing missing npm packages for 2FA functionality..." -ForegroundColor Green
Write-Host ""

# Install otpauth
Write-Host "Installing otpauth..." -ForegroundColor Yellow
npm install otpauth

# Install qrcode
Write-Host "Installing qrcode..." -ForegroundColor Yellow
npm install qrcode

# Install TypeScript types
Write-Host "Installing TypeScript types..." -ForegroundColor Yellow
npm install --save-dev @types/qrcode

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DEPENDENCIES INSTALLED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "The following packages have been installed:" -ForegroundColor Cyan
Write-Host "- otpauth: For generating and validating TOTP tokens" -ForegroundColor White
Write-Host "- qrcode: For generating QR codes for authenticator apps" -ForegroundColor White
Write-Host "- @types/qrcode: TypeScript definitions for qrcode" -ForegroundColor White
Write-Host ""
Write-Host "You can now run 'npm run dev' to start the development server." -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
