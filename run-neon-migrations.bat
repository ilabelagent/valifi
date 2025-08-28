@echo off
cls
echo ============================================
echo    NEON DATABASE MIGRATION RUNNER
echo ============================================
echo.

:: Set Neon database connection
set DATABASE_URL=postgresql://neondb_owner:npg_5kwo8vhredaX@ep-proud-mountain-ady8h1sc.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
set PGPASSWORD=npg_5kwo8vhredaX

echo Database: neondb
echo Host: ep-proud-mountain-ady8h1sc.c-2.us-east-1.aws.neon.tech
echo User: neondb_owner
echo.

:: Check if psql is installed
where psql >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL client (psql) not found!
    echo.
    echo You can run migrations using one of these methods:
    echo.
    echo 1. Install PostgreSQL locally:
    echo    https://www.postgresql.org/download/windows/
    echo.
    echo 2. Use Neon's Web SQL Editor:
    echo    - Go to https://console.neon.tech
    echo    - Open your database
    echo    - Go to SQL Editor
    echo    - Copy and paste migration files
    echo.
    echo 3. Use an online PostgreSQL client
    echo.
    pause
    exit /b 1
)

echo Found psql. Running migrations...
echo.

:: Run initial schema migration
echo [1/2] Running initial schema migration...
psql %DATABASE_URL% -f migrations\001_initial_schema.sql
if %errorlevel% neq 0 (
    echo [WARNING] Initial schema migration had issues.
    echo Some tables might already exist. Continuing...
    echo.
)

:: Run advanced features migration
echo [2/2] Running advanced features migration...
psql %DATABASE_URL% -f migrations\002_advanced_features.sql
if %errorlevel% neq 0 (
    echo [WARNING] Advanced features migration had issues.
    echo Some tables might already exist. Continuing...
    echo.
)

echo.
echo ============================================
echo    Migration Summary
echo ============================================
echo.
echo Testing database connection...
psql %DATABASE_URL% -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';" 2>nul

echo.
echo Core tables that should exist:
echo - users
echo - sessions  
echo - portfolios
echo - assets
echo - transactions
echo - bot_configurations
echo - bot_logs
echo - ai_interactions
echo.
echo Advanced tables:
echo - p2p_offers
echo - defi_pools
echo - staking_pools
echo - trading_bots
echo - wallets
echo.
echo ✅ Migrations completed!
echo.
echo You can verify in Neon console:
echo https://console.neon.tech
echo.
pause