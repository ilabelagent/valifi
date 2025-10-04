@echo off
title GodBrain CyberLab Professional Launcher
color 0A

echo.
echo ===============================================
echo     🧠 GodBrain CyberLab Professional
echo     CEH v10 Training Environment
echo ===============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found
    echo Please run this script from the godbrain-cyberlab directory
    echo.
    pause
    exit /b 1
)

echo ✅ Project directory verified
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
    echo.
)

REM Check if GUI dependencies are installed
if not exist "gui\node_modules" (
    echo 📦 Installing GUI dependencies...
    cd gui
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install GUI dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo ✅ GUI dependencies installed
    echo.
)

echo 🚀 Starting GodBrain CyberLab...
echo.
echo Choose your startup mode:
echo [1] Full GUI Application (Recommended)
echo [2] Server Only (CLI)
echo [3] Development Mode
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo 🖥️ Starting GUI Application...
    cd gui
    npm start
) else if "%choice%"=="2" (
    echo 🖥️ Starting Server Only...
    npm start
) else if "%choice%"=="3" (
    echo 🔧 Starting Development Mode...
    npm run dev
) else (
    echo ❌ Invalid choice. Starting GUI by default...
    cd gui
    npm start
)

pause
