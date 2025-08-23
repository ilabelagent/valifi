@echo off
REM Valifi Platform - Complete Deployment Fix (Windows)
REM Fixes TypeScript dependencies and stock staking issues

echo =========================================
echo VALIFI DEPLOYMENT FIX - COMPLETE SOLUTION
echo =========================================
echo.

REM Step 1: Clear caches
echo Step 1: Clearing build caches...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .vercel\cache rmdir /s /q .vercel\cache

REM Step 2: Install dependencies
echo Step 2: Installing ALL dependencies...
call npm install

REM Step 3: Test build locally
echo Step 3: Testing build locally...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo Build successful locally!
) else (
    echo Build failed locally. Check errors above.
    exit /b 1
)

REM Step 4: Commit and push changes
echo Step 4: Committing fixes...
git add package.json
git add pages/api/auth/*.ts
git add pages/api/health.ts
git add lib/db.ts
git commit -m "Fix: Move TypeScript to dependencies for Vercel build"

REM Step 5: Push to GitHub
echo Step 5: Pushing to GitHub...
git push

echo.
echo =========================================
echo FIXES APPLIED SUCCESSFULLY!
echo =========================================
echo.
echo Next steps:
echo 1. Go to Vercel dashboard
echo 2. Check that deployment triggered automatically
echo 3. If not, run: vercel --prod
echo.
echo Environment variables to verify in Vercel:
echo - TURSO_DATABASE_URL
echo - TURSO_AUTH_TOKEN
echo - JWT_SECRET
echo - JWT_REFRESH_SECRET
echo - NODE_ENV=production
echo.
echo =========================================
pause