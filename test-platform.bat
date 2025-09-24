@echo off
title Valifi Platform Test Runner

echo ============================================
echo    VALIFI FINTECH PLATFORM TEST RUNNER
echo ============================================
echo.

REM Check if application is running
echo [INFO] Testing platform functionality...
echo.

REM Test 1: Check if server is running
echo [TEST 1] Checking if server is running on port 3000...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo [FAIL] ❌ Server is not running on port 3000
    echo [INFO] Please start the server with: npm run dev
    pause
    exit /b 1
) else (
    echo [PASS] ✅ Server is running on port 3000
)

REM Test 2: Check API health
echo.
echo [TEST 2] Checking API health...
curl -s http://localhost:3000/api/health-check >nul 2>&1
if errorlevel 1 (
    echo [FAIL] ❌ API health check failed
) else (
    echo [PASS] ✅ API health check passed
)

REM Test 3: Check database connection
echo.
echo [TEST 3] Checking database connection...
if exist .rds-config (
    for /f "tokens=1,2 delims==" %%a in (.rds-config) do set %%a=%%b

    echo Testing connection to %DB_ENDPOINT%...
    set PGPASSWORD=%DB_PASSWORD%
    psql -h %DB_ENDPOINT% -p %DB_PORT% -U %DB_USERNAME% -d %DB_NAME% -c "SELECT 1;" >nul 2>&1
    if errorlevel 1 (
        echo [FAIL] ❌ Database connection failed
    ) else (
        echo [PASS] ✅ Database connection successful
    )
) else (
    echo [SKIP] ⚠️ No database config found (.rds-config missing)
)

REM Test 4: Check environment variables
echo.
echo [TEST 4] Checking environment configuration...
if exist .env.local (
    echo [PASS] ✅ Environment file exists (.env.local)

    REM Check for key environment variables
    findstr /C:"AWS_RDS_HOST" .env.local >nul 2>&1
    if errorlevel 1 (
        echo [FAIL] ❌ AWS_RDS_HOST not configured
    ) else (
        echo [PASS] ✅ AWS_RDS_HOST configured
    )

    findstr /C:"JWT_SECRET" .env.local >nul 2>&1
    if errorlevel 1 (
        echo [FAIL] ❌ JWT_SECRET not configured
    ) else (
        echo [PASS] ✅ JWT_SECRET configured
    )
) else (
    echo [FAIL] ❌ Environment file missing (.env.local)
    echo [INFO] Run setup-aws-rds.bat to create configuration
)

REM Test 5: Check if dependencies are installed
echo.
echo [TEST 5] Checking Node.js dependencies...
if exist node_modules (
    echo [PASS] ✅ Dependencies installed (node_modules exists)
) else (
    echo [FAIL] ❌ Dependencies not installed
    echo [INFO] Run: npm install
)

REM Test 6: Check migration files
echo.
echo [TEST 6] Checking database migration files...
if exist migrations\001-production-schema.sql (
    echo [PASS] ✅ Production schema migration exists
) else (
    echo [FAIL] ❌ Production schema migration missing
)

if exist migrations\002-fintech-schema.sql (
    echo [PASS] ✅ Fintech schema migration exists
) else (
    echo [FAIL] ❌ Fintech schema migration missing
)

echo.
echo ============================================
echo               TEST SUMMARY
echo ============================================

REM Manual test instructions
echo.
echo 📋 MANUAL TESTS TO PERFORM:
echo.
echo 1. Open browser to: http://localhost:3000
echo 2. Click "Sign Up" and create a test account
echo 3. Login with your new account
echo 4. Check if dashboard loads properly
echo 5. Test wallet creation (should happen automatically)
echo 6. Test market data display
echo 7. Test payment processing (if configured)
echo 8. Sign out and sign back in
echo.

echo 🚀 QUICK TEST ACCOUNTS:
echo    Email: test@valifi.com
echo    Password: Test123456
echo.

echo ⚠️  IMPORTANT NOTES:
echo    - Ensure API keys are configured in .env.local
echo    - Use paper trading mode for testing
echo    - Test with small amounts only
echo.

echo 🎯 NEXT STEPS:
echo    1. If all tests pass, the platform is ready!
echo    2. If tests fail, check the error messages above
echo    3. Run setup-aws-rds.bat if setup is incomplete
echo    4. Visit http://localhost:3000 to start testing
echo.

pause