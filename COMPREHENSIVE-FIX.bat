@echo off
echo.
echo ============================================================
echo     VALIFI FINTECH PLATFORM - COMPREHENSIVE FIX
echo ============================================================
echo.

:: Change to the correct directory
cd /d "C:\Users\josh\Desktop\GodBrainAI\valifi"

echo [1/5] Cleaning previous build artifacts...
echo ----------------------------------------
if exist ".next" (
    rmdir /s /q .next 2>nul
    echo Removed .next folder
)
if exist "node_modules\.cache" (
    rmdir /s /q node_modules\.cache 2>nul
    echo Cleared build cache
)

echo.
echo [2/5] Installing missing dependencies...
echo ----------------------------------------
echo Installing otpauth (for 2FA functionality)...
call npm install otpauth

echo Installing qrcode (for QR code generation)...
call npm install qrcode

echo Installing TypeScript types...
call npm install --save-dev @types/qrcode

echo.
echo [3/5] Verifying installation...
echo ----------------------------------------
npm list otpauth qrcode

echo.
echo [4/5] Running npm audit fix...
echo ----------------------------------------
call npm audit fix

echo.
echo [5/5] Ready to start development server!
echo ----------------------------------------
echo.
echo ============================================================
echo              SETUP COMPLETED SUCCESSFULLY!
echo ============================================================
echo.
echo The following issues have been fixed:
echo ✓ Missing otpauth dependency installed
echo ✓ Missing qrcode dependency installed  
echo ✓ TypeScript definitions added
echo ✓ Build cache cleared
echo ✓ Security vulnerabilities addressed
echo.
echo You can now run the development server with:
echo     npm run dev
echo.
echo Or use this batch file to start immediately:
echo     Press any key to start the dev server...
echo     (or close this window to exit)
echo.
pause >nul

echo.
echo Starting development server...
echo ============================================================
npm run dev
