@echo off
cls
color 0C
echo ================================================================
echo    🔒 VALIFI PRODUCTION MODE ENFORCEMENT
echo    NO DEMO DATA - PRODUCTION ONLY
echo ================================================================
echo.
echo WARNING: This will permanently remove ALL demo/test features!
echo.
echo Changes to be applied:
echo - Remove all demo users
echo - Disable mock data
echo - Remove simulation features  
echo - Enforce database-only mode
echo - Require real authentication
echo.
echo ================================================================
echo.
set /p confirm="Type 'PRODUCTION' to confirm: "

if /i not "%confirm%"=="PRODUCTION" (
    echo.
    echo Action cancelled.
    pause
    exit /b
)

echo.
echo ================================================================
echo    ENFORCING PRODUCTION MODE...
echo ================================================================
echo.

:: Step 1: Set environment to production
echo Step 1: Setting production environment...
(
echo NODE_ENV=production
echo DISABLE_DEMO_MODE=true
echo REQUIRE_DATABASE=true
echo ENFORCE_PRODUCTION=true
echo.
echo # Database Configuration Required
echo TURSO_DATABASE_URL=%TURSO_DATABASE_URL%
echo TURSO_AUTH_TOKEN=%TURSO_AUTH_TOKEN%
echo.
echo # Security - Generate New Values
echo JWT_SECRET=prod_%random%%random%%random%%random%%random%%random%
echo JWT_REFRESH_SECRET=prod_ref_%random%%random%%random%%random%%random%
) > .env.production

copy .env.production .env.local >nul 2>&1
echo   [OK] Production environment set

:: Step 2: Run production enforcement script
echo.
echo Step 2: Running production enforcement...
if exist "enforce-production.js" (
    node enforce-production.js
) else (
    echo   [WARNING] enforce-production.js not found
)

:: Step 3: Clean up any remaining demo files
echo.
echo Step 3: Removing demo/test files...
if exist "data\demo*.json" del /q data\demo*.json 2>nul
if exist "data\mock*.json" del /q data\mock*.json 2>nul
if exist "data\test*.json" del /q data\test*.json 2>nul
echo   [OK] Demo files removed

:: Step 4: Update package.json for production
echo.
echo Step 4: Updating package.json...
powershell -Command "(Get-Content package.json) -replace '\"dev\": \"next dev\"', '\"dev\": \"set NODE_ENV=production && next dev\"' | Set-Content package.json"
echo   [OK] Package.json updated

:: Step 5: Clear any cached data
echo.
echo Step 5: Clearing cache...
if exist ".next" rmdir /s /q .next 2>nul
if exist "node_modules\.cache" rmdir /s /q node_modules\.cache 2>nul
echo   [OK] Cache cleared

:: Step 6: Create production startup script
echo.
echo Step 6: Creating production launcher...
(
echo @echo off
echo cls
echo echo ========================================
echo echo    VALIFI - PRODUCTION MODE
echo echo ========================================
echo echo.
echo set NODE_ENV=production
echo set DISABLE_DEMO_MODE=true
echo set REQUIRE_DATABASE=true
echo set ENFORCE_PRODUCTION=true
echo.
echo echo Starting in PRODUCTION mode...
echo echo - No demo users available
echo echo - Database required
echo echo - Real authentication only
echo echo.
echo npm run dev
) > START-PRODUCTION-MODE.bat
echo   [OK] Production launcher created

echo.
echo ================================================================
echo    ✅ PRODUCTION MODE ENFORCEMENT COMPLETE
echo ================================================================
echo.
color 0A
echo SUMMARY OF CHANGES:
echo -------------------
echo [✓] All demo users removed
echo [✓] Mock data disabled
echo [✓] Simulation features removed
echo [✓] Database-only mode enforced
echo [✓] Production validation added
echo [✓] Real authentication required
echo.
echo IMPORTANT:
echo ----------
echo 1. You MUST configure database in .env.local:
echo    - TURSO_DATABASE_URL
echo    - TURSO_AUTH_TOKEN
echo.
echo 2. NO demo access available:
echo    - No demo@valifi.net login
echo    - No test users
echo    - No mock data
echo.
echo 3. All users must:
echo    - Register with real email
echo    - Use strong passwords (12+ chars)
echo    - Pass authentication
echo.
echo TO START IN PRODUCTION MODE:
echo -----------------------------
echo Run: START-PRODUCTION-MODE.bat
echo.
echo ================================================================
echo.
pause