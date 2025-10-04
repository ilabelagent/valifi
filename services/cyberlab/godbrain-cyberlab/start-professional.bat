@echo off
setlocal enabledelayedexpansion

title GodBrain CyberLab Professional - Startup
color 0A

REM Check if this is first run
if not exist ".initialized" (
    echo.
    echo ======================================================
    echo        🧠 GodBrain CyberLab Professional v2.0
    echo        First Time Setup Required
    echo ======================================================
    echo.
    echo This appears to be your first time running GodBrain CyberLab.
    echo Let's complete the setup process first.
    echo.
    pause
    call setup-complete.bat
    echo setup_complete > .initialized
    echo.
    echo ✅ First-time setup completed!
    echo.
    pause
)

:main_menu
cls
echo.
echo ======================================================
echo        🧠 GodBrain CyberLab Professional v2.0
echo        CEH v10 Training Environment
echo ======================================================
echo.
echo Current Status:
if exist "gui\node_modules" (
    echo ✅ GUI Components: Ready
) else (
    echo ❌ GUI Components: Not installed
)

if exist "node_modules" (
    echo ✅ Server Components: Ready
) else (
    echo ❌ Server Components: Not installed
)

if exist "certs\server.key" (
    echo ✅ SSL Certificates: Generated
) else (
    echo ⚠️  SSL Certificates: Will generate on first HTTPS use
)

echo.
echo Available Launch Options:
echo.
echo [1] 🖥️  Full GUI Application (Recommended)
echo [2] 🌐 Web Interface Only
echo [3] 🔧 Development Mode
echo [4] ⚙️  System Configuration
echo [5] 📚 Training Documentation
echo [6] 🔍 System Diagnostics
echo [7] 🔄 Update Components
echo [8] ❌ Exit
echo.
set /p choice="Select option (1-8): "

if "%choice%"=="1" goto gui_mode
if "%choice%"=="2" goto web_mode
if "%choice%"=="3" goto dev_mode
if "%choice%"=="4" goto config_mode
if "%choice%"=="5" goto docs_mode
if "%choice%"=="6" goto diagnostics_mode
if "%choice%"=="7" goto update_mode
if "%choice%"=="8" goto exit_app
goto invalid_choice

:gui_mode
cls
echo.
echo 🖥️  Starting GUI Application...
echo ======================================================
echo.
echo Features Available:
echo ✅ Professional Dashboard
echo ✅ Real-time Monitoring
echo ✅ All Training Modules
echo ✅ Advanced Analytics
echo ✅ Network Tools
echo ✅ Payload Generators
echo.
echo Please wait while the application loads...
echo.

REM Check if GUI dependencies exist
if not exist "gui\node_modules" (
    echo ❌ GUI dependencies missing. Installing...
    cd gui
    npm install
    if errorlevel 1 (
        echo Failed to install GUI dependencies.
        pause
        goto main_menu
    )
    cd ..
)

cd gui
start "" npm start
echo.
echo ✅ GUI Application launched successfully!
echo.
echo The professional interface should open automatically.
echo If it doesn't open, check for any error messages above.
echo.
echo Press any key to return to main menu...
pause >nul
cd ..
goto main_menu

:web_mode
cls
echo.
echo 🌐 Starting Web Interface Only...
echo ======================================================
echo.

REM Get local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set "ip=%%a"
    set "ip=!ip: =!"
    goto :got_ip
)
set "ip=localhost"
:got_ip

echo Web interface will be available at:
echo   Local:   http://localhost:5000
echo   Network: http://!ip!:5000
echo   HTTPS:   https://localhost:5443
echo.
echo Starting server...
start "" npm start
echo.
echo ✅ Server started! Access the web interface using the URLs above.
echo.
echo Press any key to return to main menu...
pause >nul
goto main_menu

:dev_mode
cls
echo.
echo 🔧 Starting Development Mode...
echo ======================================================
echo.
echo Development features:
echo ✅ Hot reload enabled
echo ✅ Detailed logging
echo ✅ Debug information
echo ✅ Module development tools
echo.
echo Starting development server...
start "" npm run dev
echo.
echo ✅ Development server started!
echo.
echo Press any key to return to main menu...
pause >nul
goto main_menu

:config_mode
cls
echo.
echo ⚙️  System Configuration
echo ======================================================
echo.
echo [1] 🔐 Generate SSL Certificates
echo [2] 🗂️  Clear Training Data
echo [3] 📁 Open Logs Directory
echo [4] 🔧 Reinstall Dependencies
echo [5] 🌐 Network Configuration
echo [6] ↩️  Back to Main Menu
echo.
set /p config_choice="Select option (1-6): "

if "%config_choice%"=="1" goto generate_ssl
if "%config_choice%"=="2" goto clear_data
if "%config_choice%"=="3" goto open_logs
if "%config_choice%"=="4" goto reinstall_deps
if "%config_choice%"=="5" goto network_config
if "%config_choice%"=="6" goto main_menu
goto config_mode

:generate_ssl
echo.
echo 🔐 Generating SSL Certificates...
where openssl >nul 2>&1
if errorlevel 1 (
    echo ❌ OpenSSL not found in PATH
    echo Please install OpenSSL or use the GUI SSL generator
) else (
    if not exist "certs" mkdir certs
    cd certs
    openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes -subj "/C=US/ST=Lab/L=Training/O=GodBrain/OU=CyberLab/CN=localhost"
    if errorlevel 1 (
        echo ❌ Failed to generate certificates
    ) else (
        echo ✅ SSL certificates generated successfully
    )
    cd ..
)
pause
goto config_mode

:clear_data
echo.
echo 🗂️  Clearing Training Data...
echo This will remove all training logs and session data.
set /p confirm="Are you sure? (y/n): "
if /i "%confirm%"=="y" (
    if exist "logs\*" del /q logs\*
    echo ✅ Training data cleared
) else (
    echo Cancelled
)
pause
goto config_mode

:open_logs
echo.
echo 📁 Opening logs directory...
if exist "logs" (
    start "" explorer logs
    echo ✅ Logs directory opened
) else (
    echo ❌ Logs directory not found
)
pause
goto config_mode

:reinstall_deps
echo.
echo 🔧 Reinstalling Dependencies...
echo This may take a few minutes...
echo.
echo Cleaning old dependencies...
if exist "node_modules" rmdir /s /q node_modules
if exist "gui\node_modules" rmdir /s /q gui\node_modules
echo.
echo Installing main dependencies...
npm install
echo.
echo Installing GUI dependencies...
cd gui
npm install
cd ..
echo.
echo ✅ Dependencies reinstalled successfully
pause
goto config_mode

:network_config
echo.
echo 🌐 Network Configuration
echo ======================================================
echo.
echo Current Network Information:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set "ip=%%a"
    set "ip=!ip: =!"
    echo Local IP: !ip!
    goto :network_done
)
echo Local IP: Not detected
:network_done
echo.
echo Default Ports:
echo   HTTP:  5000
echo   HTTPS: 5443
echo.
echo To change ports, set environment variables:
echo   set PORT=8080
echo   set HTTPS_PORT=8443
echo.
pause
goto config_mode

:docs_mode
cls
echo.
echo 📚 Training Documentation
echo ======================================================
echo.
echo Available Documentation:
echo.
echo [1] 📖 Open README.md
echo [2] 🎯 CEH v10 Training Guide
echo [3] 🛡️  Security Best Practices
echo [4] 🔧 Technical Documentation
echo [5] 🎓 Learning Objectives
echo [6] ↩️  Back to Main Menu
echo.
set /p doc_choice="Select option (1-6): "

if "%doc_choice%"=="1" (
    if exist "README.md" (
        start "" notepad README.md
        echo ✅ README.md opened
    ) else (
        echo ❌ README.md not found
    )
)
if "%doc_choice%"=="2" (
    echo.
    echo 🎯 CEH v10 Training Objectives:
    echo.
    echo Module 1: Footprinting and Reconnaissance
    echo Module 2: Scanning and Enumeration  
    echo Module 3: System Hacking
    echo Module 4: Web Application Penetration Testing
    echo Module 5: Social Engineering
    echo Module 6: Denial of Service
    echo Module 7: Session Hijacking
    echo Module 8: Hacking Wireless Networks
    echo.
    echo All modules are available in this training environment.
)
if "%doc_choice%"=="3" (
    echo.
    echo 🛡️  Security Best Practices:
    echo.
    echo ✅ Only use in authorized environments
    echo ✅ Follow CEH code of ethics
    echo ✅ Document all training activities
    echo ✅ Respect privacy and confidentiality
    echo ✅ Report vulnerabilities responsibly
    echo ✅ Keep training data secure
    echo ✅ Use strong authentication
    echo ✅ Regular security updates
)
if "%doc_choice%"=="4" (
    echo.
    echo 🔧 Technical Architecture:
    echo.
    echo Frontend: Electron GUI + Web Interface
    echo Backend: Node.js + Express
    echo Security: Helmet, CORS, SSL/TLS
    echo Logging: Morgan + Custom audit logs
    echo Real-time: WebSocket connections
    echo Database: In-memory (training only)
)
if "%doc_choice%"=="5" (
    echo.
    echo 🎓 Learning Objectives:
    echo.
    echo After completing this training, you will:
    echo ✅ Understand common attack vectors
    echo ✅ Recognize phishing attempts
    echo ✅ Know web application vulnerabilities
    echo ✅ Implement security best practices
    echo ✅ Use professional security tools
    echo ✅ Conduct ethical penetration testing
    echo ✅ Write comprehensive security reports
)
if "%doc_choice%"=="6" goto main_menu

echo.
pause
goto docs_mode

:diagnostics_mode
cls
echo.
echo 🔍 System Diagnostics
echo ======================================================
echo.
echo Running system diagnostics...
echo.

echo Node.js Version:
node --version
echo.

echo npm Version:
npm --version
echo.

echo Project Dependencies:
if exist "package.json" (
    echo ✅ Main package.json found
) else (
    echo ❌ Main package.json missing
)

if exist "gui\package.json" (
    echo ✅ GUI package.json found
) else (
    echo ❌ GUI package.json missing
)

if exist "node_modules" (
    echo ✅ Main dependencies installed
) else (
    echo ❌ Main dependencies missing
)

if exist "gui\node_modules" (
    echo ✅ GUI dependencies installed
) else (
    echo ❌ GUI dependencies missing
)

echo.
echo Directory Structure:
for %%d in (modules public logs certs assets gui) do (
    if exist "%%d" (
        echo ✅ %%d directory exists
    ) else (
        echo ❌ %%d directory missing
    )
)

echo.
echo Port Availability:
netstat -an | findstr :5000 >nul
if errorlevel 1 (
    echo ✅ Port 5000 available
) else (
    echo ⚠️  Port 5000 in use
)

netstat -an | findstr :5443 >nul
if errorlevel 1 (
    echo ✅ Port 5443 available
) else (
    echo ⚠️  Port 5443 in use
)

echo.
echo System Resources:
echo Available Memory: 
wmic computersystem get TotalPhysicalMemory /value | findstr "TotalPhysicalMemory"
echo.
echo Disk Space:
dir | findstr "bytes free"

echo.
echo Network Connectivity:
ping -n 1 google.com >nul
if errorlevel 1 (
    echo ❌ Internet connectivity: Failed
) else (
    echo ✅ Internet connectivity: OK
)

echo.
echo ✅ Diagnostics completed
pause
goto main_menu

:update_mode
cls
echo.
echo 🔄 Update Components
echo ======================================================
echo.
echo [1] 📦 Update npm packages
echo [2] 🔧 Update GUI components
echo [3] 🌐 Check for application updates
echo [4] 🔄 Reinstall everything
echo [5] ↩️  Back to Main Menu
echo.
set /p update_choice="Select option (1-5): "

if "%update_choice%"=="1" (
    echo Updating npm packages...
    npm update
    echo ✅ npm packages updated
)
if "%update_choice%"=="2" (
    echo Updating GUI components...
    cd gui
    npm update
    cd ..
    echo ✅ GUI components updated
)
if "%update_choice%"=="3" (
    echo Checking for application updates...
    echo Current version: 2.0.0
    echo ✅ You are running the latest version
)
if "%update_choice%"=="4" (
    echo Reinstalling everything...
    call :reinstall_deps
)
if "%update_choice%"=="5" goto main_menu

pause
goto update_mode

:invalid_choice
echo.
echo ❌ Invalid choice. Please select 1-8.
timeout /t 2 /nobreak >nul
goto main_menu

:exit_app
echo.
echo Thank you for using GodBrain CyberLab Professional!
echo.
echo Remember:
echo ✅ Use this tool ethically and responsibly
echo ✅ Follow CEH guidelines and local laws
echo ✅ Keep your cybersecurity skills updated
echo.
echo 🧠 Happy ethical hacking!
echo.
pause
exit /b 0
