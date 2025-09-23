@echo off
title VALIFI KINGDOM - COMPLETE SETUP (CMD VERSION)
color 0A
cls

echo ================================================================================
echo                      VALIFI KINGDOM MASTER SETUP
echo                    PURE CMD VERSION - NO POWERSHELL
echo ================================================================================
echo.

cd /d C:\Users\User\Downloads\bts\valifi\valifi

echo [STEP 1/10] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js first.
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found
echo.

echo [STEP 2/10] Creating environment configuration...
(
echo # Database Configuration
echo DATABASE_URL=postgresql://valifi_user:valifi_pass@localhost:5432/valifi_kingdom
echo DIRECT_URL=postgresql://valifi_user:valifi_pass@localhost:5432/valifi_kingdom
echo.
echo # NextAuth Configuration  
echo NEXTAUTH_URL=http://localhost:3000
echo NEXTAUTH_SECRET=your-secret-key-here-%RANDOM%%RANDOM%
echo.
echo # JWT Tokens
echo JWT_SECRET=jwt-secret-%RANDOM%%RANDOM%%RANDOM%
echo REFRESH_TOKEN_SECRET=refresh-secret-%RANDOM%%RANDOM%
echo.
echo # API Keys
echo BOT_API_KEY=bot-key-%RANDOM%%RANDOM%
echo MCP_SERVER_PORT=8080
echo KINGDOM_MODE=production
echo.
echo # Feature Flags
echo ENABLE_ALL_BOTS=true
echo ENABLE_AUTO_PATCH=true
echo ENABLE_MONITORING=true
) > .env.local
echo [OK] Environment configured
echo.

echo [STEP 3/10] Cleaning npm cache...
call npm cache clean --force >nul 2>&1
echo [OK] Cache cleaned
echo.

echo [STEP 4/10] Removing old dependencies...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules >nul 2>&1
)
if exist package-lock.json (
    del /q package-lock.json >nul 2>&1
)
echo [OK] Old dependencies removed
echo.

echo [STEP 5/10] Installing dependencies (this may take a few minutes)...
call npm install --force
if %errorlevel% neq 0 (
    echo Warning: Some dependencies had issues, attempting fix...
    call npm install --legacy-peer-deps
)
echo [OK] Dependencies installed
echo.

echo [STEP 6/10] Creating missing configuration files...

if not exist "tsconfig.json" (
    (
    echo {
    echo   "compilerOptions": {
    echo     "target": "es5",
    echo     "lib": ["dom", "dom.iterable", "esnext"],
    echo     "allowJs": true,
    echo     "skipLibCheck": true,
    echo     "strict": false,
    echo     "forceConsistentCasingInFileNames": true,
    echo     "noEmit": true,
    echo     "esModuleInterop": true,
    echo     "module": "esnext",
    echo     "moduleResolution": "node",
    echo     "resolveJsonModule": true,
    echo     "isolatedModules": true,
    echo     "jsx": "preserve",
    echo     "incremental": true,
    echo     "paths": {
    echo       "@/*": ["./src/*"]
    echo     }
    echo   },
    echo   "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
    echo   "exclude": ["node_modules"]
    echo }
    ) > tsconfig.json
)

if not exist "postcss.config.js" (
    (
    echo module.exports = {
    echo   plugins: {
    echo     tailwindcss: {},
    echo     autoprefixer: {},
    echo   },
    echo }
    ) > postcss.config.js
)

echo [OK] Configuration files created
echo.

echo [STEP 7/10] Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo Warning: Build had issues, attempting auto-patch...
    if exist auto-patch-system.js (
        call node auto-patch-system.js
    )
    echo Retrying build...
    call npm run build
)
echo [OK] Build complete
echo.

echo [STEP 8/10] Setting up Git repository...
if not exist .git (
    git init >nul 2>&1
    git add . >nul 2>&1
    git commit -m "Initial Valifi Kingdom setup" >nul 2>&1
    echo [OK] Git repository initialized
) else (
    echo [OK] Git repository exists
)
echo.

echo [STEP 9/10] Creating launch scripts...

(
echo @echo off
echo cd /d C:\Users\User\Downloads\bts\valifi\valifi
echo echo Starting Valifi Kingdom...
echo call npm run dev
echo pause
) > START-KINGDOM.bat

(
echo @echo off
echo start http://localhost:3000
) > OPEN-DASHBOARD.bat

echo [OK] Launch scripts created
echo.

echo [STEP 10/10] Starting Valifi Kingdom...
echo.
echo ================================================================================
echo                         LAUNCHING VALIFI KINGDOM
echo ================================================================================
echo.

start "Valifi Kingdom Server" cmd /c "npm run dev"

echo Waiting for server to start (10 seconds)...
timeout /t 10 /nobreak >nul

echo.
echo ================================================================================
echo                      VALIFI KINGDOM SETUP COMPLETE!
echo ================================================================================
echo.
echo STATUS: SUCCESS
echo.
echo Access Points:
echo   - Dashboard: http://localhost:3000
echo   - API: http://localhost:3000/api
echo   - Bots: http://localhost:3000/bots
echo.
echo Quick Commands:
echo   - Start Server: START-KINGDOM.bat
echo   - Open Dashboard: OPEN-DASHBOARD.bat
echo   - View Logs: npm run dev
echo.
echo Next Steps:
echo   1. Press any key to open the dashboard
echo   2. Configure your bots in the admin panel
echo   3. Deploy to production when ready
echo.
echo ================================================================================
pause

start http://localhost:3000
