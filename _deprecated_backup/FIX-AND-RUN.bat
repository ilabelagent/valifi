@echo off
cls
color 0C
echo ========================================================
echo           VALIFI BOT - FIX AND RUN
echo         Automatic Node.js Detection & Launch
echo ========================================================
echo.

cd /d "C:\Users\josh\Desktop\GodBrainAI\valifi"

echo [STEP 1] Detecting Node.js installation...
echo.

:: Try different Node.js locations
set NODE_FOUND=0

:: Check PATH first
where node >nul 2>&1
if %errorlevel% equ 0 (
    set NODE_FOUND=1
    echo    [OK] Node.js found in PATH
    node --version
    goto :NODE_OK
)

:: Check Program Files
if exist "C:\Program Files\nodejs\node.exe" (
    set NODE_FOUND=1
    set PATH=%PATH%;C:\Program Files\nodejs
    echo    [OK] Node.js found in Program Files
    "C:\Program Files\nodejs\node.exe" --version
    goto :NODE_OK
)

:: Check Program Files x86
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set NODE_FOUND=1
    set PATH=%PATH%;C:\Program Files (x86)\nodejs
    echo    [OK] Node.js found in Program Files (x86)
    goto :NODE_OK
)

:: Check common user installation paths
if exist "%USERPROFILE%\AppData\Roaming\npm\node.exe" (
    set NODE_FOUND=1
    set PATH=%PATH%;%USERPROFILE%\AppData\Roaming\npm
    echo    [OK] Node.js found in user directory
    goto :NODE_OK
)

:NODE_OK
if %NODE_FOUND% equ 0 (
    color 0C
    echo.
    echo ========================================================
    echo                  ERROR: Node.js NOT FOUND!
    echo ========================================================
    echo.
    echo Please install Node.js to run VALIFI Bot:
    echo.
    echo 1. Open your browser
    echo 2. Go to: https://nodejs.org
    echo 3. Download and install Node.js LTS version
    echo 4. After installation, run this script again
    echo.
    echo ========================================================
    pause
    start https://nodejs.org
    exit /b 1
)

echo.
echo [STEP 2] Checking npm...
call npm --version >nul 2>&1
if errorlevel 1 (
    echo    [!] npm not working properly
) else (
    echo    [OK] npm is ready
)

echo.
echo [STEP 3] Installing dependencies...
if not exist "node_modules" (
    echo    Installing packages (this may take a few minutes)...
    call npm install --force --legacy-peer-deps
) else (
    echo    [OK] Dependencies already installed
)

echo.
echo [STEP 4] Setting up environment...
if not exist ".env.local" (
    if exist ".env.example" (
        copy .env.example .env.local
        echo    [OK] Environment file created
    ) else (
        echo NODE_ENV=development > .env.local
        echo NEXT_PUBLIC_API_URL=http://localhost:3000 >> .env.local
        echo    [OK] Basic environment created
    )
) else (
    echo    [OK] Environment already configured
)

echo.
echo [STEP 5] Starting VALIFI Bot...
echo.
color 0A
echo ========================================================
echo              STARTING DEVELOPMENT SERVER
echo ========================================================
echo.

:: Try to kill any existing process on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Starting server on http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
call npm run dev