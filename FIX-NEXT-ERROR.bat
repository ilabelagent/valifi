@echo off
cls
color 0A
title VALIFI Bot - Installing and Launching

echo ================================================
echo      VALIFI BOT - FIX NEXT.JS ERROR
echo ================================================
echo.

cd /d "C:\Users\josh\Desktop\GodBrainAI\valifi"

echo Current directory:
cd
echo.

echo [1] Setting Node.js path...
set PATH=C:\Program Files\nodejs;%PATH%

echo.
echo [2] Testing Node.js...
"C:\Program Files\nodejs\node.exe" --version
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org
    pause
    exit
)

echo.
echo [3] Testing npm...
call "C:\Program Files\nodejs\npm.cmd" --version

echo.
echo [4] Installing dependencies (including Next.js)...
echo This will take 2-3 minutes, please wait...
echo.

:: Force install all dependencies including Next.js
call "C:\Program Files\nodejs\npm.cmd" install --force --legacy-peer-deps

echo.
echo [5] Installing Next.js specifically...
call "C:\Program Files\nodejs\npm.cmd" install next@latest react@latest react-dom@latest --save

echo.
echo [6] Verifying installation...
if exist "node_modules\.bin\next.cmd" (
    echo    Next.js installed successfully!
) else (
    echo    Warning: Next.js may not be properly installed
)

echo.
echo [7] Creating .env.local if needed...
if not exist ".env.local" (
    echo NODE_ENV=development > .env.local
    echo NEXT_PUBLIC_API_URL=http://localhost:3000 >> .env.local
)

echo.
echo ================================================
echo      STARTING VALIFI BOT
echo ================================================
echo.

:: Kill any existing process on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /F /PID %%a 2>nul
)

echo Starting development server...
echo URL: http://localhost:3000
echo.
echo Press Ctrl+C to stop
echo.

:: Start the server using npm run dev
call "C:\Program Files\nodejs\npm.cmd" run dev