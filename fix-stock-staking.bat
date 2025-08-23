@echo off
REM Fix stock staking and deployment issues

echo =========================================
echo FIXING STOCK STAKING AND DEPLOYMENT ISSUES
echo =========================================
echo.

REM Step 1: Install dependencies
echo Step 1: Installing dependencies...
call npm install

REM Step 2: Test build
echo Step 2: Testing build locally...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Check errors above.
    exit /b 1
)

echo.
echo =========================================
echo FIXES APPLIED SUCCESSFULLY!
echo =========================================
echo.
echo Fixed issues:
echo 1. StockStakingView - Added null checks for toFixed()
echo 2. app-data.ts - Added complete stock data structure
echo 3. Created placeholder-property.svg for missing images
echo 4. Fixed TypeScript dependencies in package.json
echo.
echo Next steps:
echo 1. Commit changes: git add . ^&^& git commit -m "Fix: Stock staking errors and missing data fields"
echo 2. Push to GitHub: git push
echo 3. Verify deployment on Vercel
echo.
pause