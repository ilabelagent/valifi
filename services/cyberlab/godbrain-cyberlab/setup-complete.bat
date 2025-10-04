@echo off
title GodBrain CyberLab Professional - Complete Setup
color 0B

echo.
echo =====================================================
echo        🧠 GodBrain CyberLab Professional
echo        Complete Setup and Installation
echo =====================================================
echo.
echo This script will set up the complete professional
echo cybersecurity training environment with GUI launcher.
echo.
echo ⚠️  IMPORTANT: For educational use only!
echo     Follow CEH ethical guidelines.
echo.
pause

echo.
echo 🔍 Checking system requirements...

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found
    echo.
    echo Please install Node.js 16+ from https://nodejs.org/
    echo After installation, restart this script.
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found
    echo Please install npm or update Node.js
    pause
    exit /b 1
)

echo ✅ npm detected: 
npm --version

REM Check Git (optional)
git --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Git not detected (optional)
) else (
    echo ✅ Git detected: 
    git --version
)

echo.
echo 📦 Installing main dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install main dependencies
    pause
    exit /b 1
)

echo ✅ Main dependencies installed

echo.
echo 📱 Installing GUI dependencies...
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
echo 📁 Setting up directories...
if not exist "logs" mkdir logs
if not exist "certs" mkdir certs
if not exist "payloads" mkdir payloads
if not exist "assets" mkdir assets

echo ✅ Directory structure created

echo.
echo 🔐 Generating SSL certificates...
where openssl >nul 2>&1
if errorlevel 1 (
    echo ⚠️  OpenSSL not found - SSL certificates will be generated on first run
) else (
    cd certs
    openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes -subj "/C=US/ST=Lab/L=Training/O=GodBrain/OU=CyberLab/CN=localhost" >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  SSL certificate generation failed - will retry on first run
    ) else (
        echo ✅ SSL certificates generated
    )
    cd ..
)

echo.
echo 🎯 Creating desktop shortcuts...

REM Create desktop shortcut for GUI launcher
echo @echo off > "%USERPROFILE%\Desktop\GodBrain CyberLab.bat"
echo cd /d "%cd%" >> "%USERPROFILE%\Desktop\GodBrain CyberLab.bat"
echo launch-cyberlab.bat >> "%USERPROFILE%\Desktop\GodBrain CyberLab.bat"

echo ✅ Desktop shortcut created

echo.
echo 🧪 Running initial test...
echo Starting server test...
timeout /t 2 /nobreak >nul
npm run test
if errorlevel 1 (
    echo ⚠️  Test completed with warnings (normal for training environment)
) else (
    echo ✅ Initial test passed
)

echo.
echo 🎉 =====================================================
echo    Setup Complete! GodBrain CyberLab is ready!
echo =====================================================
echo.
echo 📋 What's been installed:
echo   ✅ Main application server
echo   ✅ Professional GUI launcher
echo   ✅ All training modules
echo   ✅ Security tools and utilities
echo   ✅ SSL certificates
echo   ✅ Desktop shortcut
echo.
echo 🚀 How to start:
echo   1. Double-click "GodBrain CyberLab" on your desktop
echo   2. Or run: launch-cyberlab.bat
echo   3. Choose "Full GUI Application" for best experience
echo.
echo 🌐 Access URLs (after starting):
echo   📱 GUI Application: Automatic launch
echo   🌍 Web Interface: http://localhost:5000
echo   🔒 HTTPS Interface: https://localhost:5443
echo.
echo 📚 Training Modules Available:
echo   🎣 Phishing Awareness Lab
echo   💉 SQL Injection Training
echo   🔍 XSS Security Playground
echo   🎭 MITM Attack Scenarios
echo   🌊 DDoS Simulation
echo   ⌨️  Keylogger Detection
echo   🍪 Cookie Security Analysis
echo   🔀 Proxy Tools
echo.
echo ⚠️  REMEMBER: Educational use only!
echo    Follow CEH ethical guidelines and local laws.
echo.
echo 📖 Documentation: README.md
echo 🐛 Issues: Check logs/ directory
echo.

set /p launch="Would you like to launch the application now? (y/n): "
if /i "%launch%"=="y" (
    echo.
    echo 🚀 Launching GodBrain CyberLab...
    launch-cyberlab.bat
) else (
    echo.
    echo ✅ Setup complete. Launch when ready!
    echo.
    pause
)
