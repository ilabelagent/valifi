@echo off
echo.
echo ===============================================
echo    🧠 GodBrain Cybersecurity Lab Launcher
echo ===============================================
echo.
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.
echo Installing dependencies...
if not exist node_modules (
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo ✅ Dependencies ready
echo.
echo Starting GodBrain Cybersecurity Lab...
echo.
echo 🌐 Lab will be available at: http://127.0.0.1:5000
echo 🔒 Localhost only - Safe for training
echo 📚 CEH v14 compatible simulations
echo ⚠️  Educational use only
echo.
echo Press Ctrl+C to stop the lab
echo.

npm start
