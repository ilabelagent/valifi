@echo off
cls
color 0A
echo ================================================
echo      VALIFI BOT - FIXED LAUNCHER
echo      Node.js Path Corrected
echo ================================================
echo.

:: Set Node.js path explicitly
set PATH=C:\Program Files\nodejs;%PATH%

:: Change to project directory
cd /d "C:\Users\josh\Desktop\GodBrainAI\valifi"

echo [1] Testing Node.js...
"C:\Program Files\nodejs\node.exe" --version
if errorlevel 1 (
    echo    ERROR: Node.js not working!
    pause
    exit /b 1
)
echo    Node.js OK!

echo.
echo [2] Testing npm...
call "C:\Program Files\nodejs\npm.cmd" --version
if errorlevel 1 (
    echo    ERROR: npm not working!
    pause
    exit /b 1
)
echo    npm OK!

echo.
echo [3] Current directory:
echo    %CD%

echo.
echo [4] Checking project files...
if exist package.json (
    echo    package.json: FOUND
) else (
    echo    package.json: MISSING!
    pause
    exit /b 1
)

echo.
echo [5] Installing/Updating dependencies...
if not exist node_modules (
    echo    Installing packages (this may take a few minutes)...
    call "C:\Program Files\nodejs\npm.cmd" install --force --legacy-peer-deps
) else (
    echo    Dependencies already installed
)

echo.
echo [6] Starting VALIFI Bot...
echo.
echo ================================================
echo    Server starting on http://localhost:3000
echo    Press Ctrl+C to stop
echo ================================================
echo.

:: Start the development server
call "C:\Program Files\nodejs\npm.cmd" run dev