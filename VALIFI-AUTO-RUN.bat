@echo off
cls
color 0A
title VALIFI AI Bot - Auto Runner v5.0

echo ================================================
echo       VALIFI AI BOT - AUTOMATED RUNNER
echo              One-Click Solution
echo ================================================
echo.

cd /d "C:\Users\josh\Desktop\GodBrainAI\valifi"

echo [STATUS] Starting VALIFI Bot System...
echo.

:: Check if already running
tasklist /FI "WINDOWTITLE eq npm" 2>NUL | find /I "cmd.exe" >NUL
if not errorlevel 1 (
    echo [!] Server already running
    echo.
    echo Opening browser...
    start http://localhost:3000
    goto END
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo [1/4] Installing dependencies...
    call npm install --force --legacy-peer-deps
) else (
    echo [1/4] Dependencies OK
)

:: Create env file if missing
if not exist ".env.local" (
    echo [2/4] Creating environment...
    copy .env.example .env.local 2>NUL
) else (
    echo [2/4] Environment OK
)

:: Build if needed
if not exist ".next" (
    echo [3/4] Building application...
    call npm run build
) else (
    echo [3/4] Build OK
)

:: Start server
echo [4/4] Starting server...
start "VALIFI Server" cmd /k npm run dev

:: Wait and open
echo.
echo Waiting for server startup...
timeout /t 10 /nobreak >nul

echo Opening browser...
start http://localhost:3000
start http://localhost:3000/api/health

:END
echo.
echo ================================================
echo         VALIFI BOT IS NOW RUNNING!
echo ================================================
echo.
echo URLs:
echo   Main: http://localhost:3000
echo   API:  http://localhost:3000/api/health
echo.
echo Press any key to exit...
pause >nul