@echo off
cls
color 0E
echo ================================================================
echo    VALIFI PRODUCTION LAUNCHER - NO DEMO DATA
echo ================================================================
echo.
echo This will set up Valifi in PRODUCTION mode with:
echo.
echo [+] NO demo accounts or test data
echo [+] Real PostgreSQL database
echo [+] Production authentication system
echo [+] Secure user registration
echo [+] Full audit logging
echo [+] Production security headers
echo.
echo ================================================================
echo.

REM Check prerequisites
echo Checking prerequisites...
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Docker is not installed or not running.
    echo.
    echo Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe" 2>nul
    echo Waiting for Docker to start (30 seconds)...
    timeout /t 30 /nobreak >nul
)

echo.
echo ================================================================
echo    SELECT SETUP MODE
echo ================================================================
echo.
echo [1] FULL PRODUCTION SETUP (Recommended)
echo     - Complete clean installation
echo     - Database setup with Docker
echo     - Remove all demo data
echo     - Create admin account
echo.
echo [2] QUICK PRODUCTION SETUP
echo     - Skip database setup
echo     - Use existing database
echo     - Remove demo data only
echo.
echo [3] VERIFY INSTALLATION
echo     - Check all components
echo     - Verify no demo data
echo     - Generate report
echo.
echo [4] CREATE ADMIN USER
echo     - Add administrative account
echo     - Requires database running
echo.
echo [5] START PRODUCTION SERVER
echo     - Launch production server
echo     - Port 3000
echo.
echo [6] VIEW DATABASE (PgAdmin)
echo     - Open database management
echo     - Port 5050
echo.
echo [7] CLEAN ALL DATA
echo     - Remove ALL user data
echo     - Reset to fresh state
echo.
echo [8] EXIT
echo.
echo ================================================================
echo.

set /p choice="Select option (1-8): "

if "%choice%"=="1" goto full_setup
if "%choice%"=="2" goto quick_setup
if "%choice%"=="3" goto verify
if "%choice%"=="4" goto create_admin
if "%choice%"=="5" goto start_server
if "%choice%"=="6" goto view_database
if "%choice%"=="7" goto clean_all
if "%choice%"=="8" goto exit

echo Invalid choice. Please select 1-8.
timeout /t 2 >nul
goto :eof

:full_setup
echo.
echo ================================================================
echo    FULL PRODUCTION SETUP
echo ================================================================
echo.
echo This will:
echo - Install all dependencies
echo - Set up PostgreSQL database
echo - Remove all demo data
echo - Build production application
echo - Create admin account (optional)
echo.
pause

powershell -ExecutionPolicy Bypass -File "PRODUCTION-ORCHESTRATOR.ps1" -CreateAdmin -Verify

echo.
echo ================================================================
echo    SETUP COMPLETE!
echo ================================================================
echo.
echo Database: PostgreSQL on localhost:5432
echo Admin UI: http://localhost:5050
echo App URL: http://localhost:3000
echo.
echo To start the server, run: START-PRODUCTION.bat
echo.
pause
goto :eof

:quick_setup
echo.
echo ================================================================
echo    QUICK PRODUCTION SETUP
echo ================================================================
echo.
powershell -ExecutionPolicy Bypass -File "PRODUCTION-ORCHESTRATOR.ps1" -SkipDatabase -SkipDependencies

echo.
echo Setup complete! Run START-PRODUCTION.bat to launch.
pause
goto :eof

:verify
echo.
echo ================================================================
echo    VERIFYING PRODUCTION INSTALLATION
echo ================================================================
echo.

powershell -ExecutionPolicy Bypass -File "PRODUCTION-ORCHESTRATOR.ps1" -Verify

echo.
echo Verification complete! Check VERIFICATION_REPORT.txt for details.
pause
goto :eof

:create_admin
echo.
echo ================================================================
echo    CREATE ADMIN USER
echo ================================================================
echo.
echo This will create an administrative user account.
echo Make sure the database is running first!
echo.

powershell -ExecutionPolicy Bypass -File "PRODUCTION-ORCHESTRATOR.ps1" -CreateAdmin

echo.
echo Admin user creation complete!
pause
goto :eof

:start_server
echo.
echo ================================================================
echo    STARTING PRODUCTION SERVER
echo ================================================================
echo.
echo Launching Valifi in PRODUCTION mode...
echo.
echo Security features enabled:
echo - No demo accounts
echo - JWT authentication required
echo - Database-only operations
echo - Production security headers
echo.

set NODE_ENV=production
set ENABLE_DEMO_MODE=false

npm run start

pause
goto :eof

:view_database
echo.
echo ================================================================
echo    OPENING DATABASE MANAGEMENT
echo ================================================================
echo.
echo Opening PgAdmin in browser...
echo.
echo Login credentials:
echo Email: admin@valifi.local
echo Password: admin_2024
echo.
start http://localhost:5050

echo.
echo If PgAdmin doesn't open, make sure Docker is running.
pause
goto :eof

:clean_all
echo.
echo ================================================================
echo    WARNING: CLEAN ALL DATA
echo ================================================================
echo.
echo This will DELETE ALL DATA including:
echo - All user accounts
echo - All portfolios
echo - All transactions
echo - All settings
echo.
echo THIS ACTION CANNOT BE UNDONE!
echo.
set /p confirm="Type 'DELETE ALL' to confirm: "

if not "%confirm%"=="DELETE ALL" (
    echo.
    echo Operation cancelled.
    pause
    goto :eof
)

echo.
echo Cleaning all data...

REM Run cleanup SQL
powershell -Command "docker exec valifi_postgres_prod psql -U valifi_prod -d valifi_production -c 'TRUNCATE TABLE users CASCADE;'"

echo.
echo All data has been removed.
pause
goto :eof

:exit
echo.
echo Goodbye!
exit /b 0
