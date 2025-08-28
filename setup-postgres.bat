@echo off
echo.
echo ========================================
echo   Valifi AI Bot - PostgreSQL Setup
echo ========================================
echo.

:: Check if PostgreSQL is installed
where psql >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL from https://www.postgresql.org/download/windows/
    echo.
    pause
    exit /b 1
)

:: Set database configuration
set /p DB_HOST="Enter PostgreSQL host [localhost]: " || set DB_HOST=localhost
set /p DB_PORT="Enter PostgreSQL port [5432]: " || set DB_PORT=5432
set /p DB_NAME="Enter database name [valifi_db]: " || set DB_NAME=valifi_db
set /p DB_USER="Enter database user [postgres]: " || set DB_USER=postgres

echo.
echo Enter database password:
set /p DB_PASSWORD=

:: Create database connection string
set DATABASE_URL=postgresql://%DB_USER%:%DB_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_NAME%

echo.
echo [1/6] Testing PostgreSQL connection...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -c "SELECT version();" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Failed to connect to PostgreSQL
    echo Please check your credentials and try again
    pause
    exit /b 1
)
echo ✓ Connected to PostgreSQL

echo.
echo [2/6] Creating database...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;" 2>nul
if %errorlevel% equ 0 (
    echo ✓ Database created: %DB_NAME%
) else (
    echo ✓ Database already exists: %DB_NAME%
)

echo.
echo [3/6] Running initial migration...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f migrations\001_initial_schema.sql
if %errorlevel% neq 0 (
    echo [ERROR] Initial migration failed
    pause
    exit /b 1
)
echo ✓ Initial schema created

echo.
echo [4/6] Running advanced features migration...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f migrations\002_advanced_features.sql
if %errorlevel% neq 0 (
    echo [ERROR] Advanced features migration failed
    pause
    exit /b 1
)
echo ✓ Advanced features added

echo.
echo [5/6] Creating .env.local file...
(
echo # PostgreSQL Configuration
echo DATABASE_URL=%DATABASE_URL%
echo USE_POSTGRES=true
echo DB_POOL_SIZE=20
echo.
echo # JWT Configuration
echo JWT_SECRET=%random%%random%%random%%random%%random%%random%%random%%random%
echo JWT_REFRESH_SECRET=%random%%random%%random%%random%%random%%random%%random%%random%
echo.
echo # Next.js Configuration
echo NEXT_PUBLIC_API_URL=http://localhost:3000/api
echo NODE_ENV=development
echo.
echo # Bot Configuration
echo BOT_RATE_LIMIT=100
echo BOT_EVOLUTION_ENABLED=true
echo AI_MODEL=gpt-4
echo.
echo # Security
echo ENCRYPTION_KEY=%random%%random%%random%%random%%random%%random%%random%%random%
echo SESSION_SECRET=%random%%random%%random%%random%%random%%random%%random%%random%
) > .env.local

echo ✓ Environment file created

echo.
echo [6/6] Installing dependencies...
call npm install pg @types/pg
if %errorlevel% neq 0 (
    echo [WARNING] Failed to install PostgreSQL packages
)

echo.
echo ========================================
echo   PostgreSQL Setup Complete!
echo ========================================
echo.
echo Database URL: %DATABASE_URL%
echo.
echo Next steps:
echo 1. Run 'npm run dev' to start development server
echo 2. Access http://localhost:3000
echo 3. Test API at http://localhost:3000/api/health
echo.
echo To reset database, run: setup-postgres.bat reset
echo.
pause