@echo off
cls
echo ================================================
echo      VALIFI BOT - DIAGNOSTIC TEST
echo ================================================
echo.

cd /d "C:\Users\josh\Desktop\GodBrainAI\valifi"

echo [1] Testing Node.js...
node --version 2>nul
if errorlevel 1 (
    echo    ERROR: Node.js not found!
    echo    Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo [2] Testing npm...
call npm --version 2>nul
if errorlevel 1 (
    echo    ERROR: npm not found!
    pause
    exit /b 1
)

echo.
echo [3] Current directory:
cd

echo.
echo [4] Files present:
if exist package.json (echo    - package.json: FOUND) else (echo    - package.json: MISSING)
if exist node_modules (echo    - node_modules: FOUND) else (echo    - node_modules: MISSING)
if exist .next (echo    - .next folder: FOUND) else (echo    - .next folder: MISSING)

echo.
echo [5] Starting development server...
echo.
echo Running: npm run dev
echo.
call npm run dev

pause