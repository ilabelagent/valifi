@echo off
title VALIFI KINGDOM - MASTER EXECUTION
color 0A
cls

echo ================================================================================
echo.
echo    ##     ##    ###    ##       #### ######## ####    ##    ## #### ##    ##  ######   
echo    ##     ##   ## ##   ##        ##  ##        ##     ##   ##   ##  ###   ## ##    ##  
echo    ##     ##  ##   ##  ##        ##  ##        ##     ##  ##    ##  ####  ## ##        
echo    ##     ## ##     ## ##        ##  ######    ##     #####     ##  ## ## ## ##   #### 
echo     ##   ##  ######### ##        ##  ##        ##     ##  ##    ##  ##  #### ##    ##  
echo      ## ##   ##     ## ##        ##  ##        ##     ##   ##   ##  ##   ### ##    ##  
echo       ###    ##     ## ######## #### ##       ####    ##    ## #### ##    ##  ######   
echo.
echo                           MASTER EXECUTION SYSTEM v3.0
echo                         ZERO-TOUCH COMPLETE AUTOMATION
echo.
echo ================================================================================
echo.
echo This master control will execute the COMPLETE Valifi Kingdom implementation:
echo.
echo   [√] Environment Setup          [√] Git Repository Setup
echo   [√] Project Cleanup            [√] Render Configuration  
echo   [√] Auto-Patch System          [√] Production Deployment
echo   [√] Dependencies Installation  [√] System Verification
echo   [√] Database Configuration     [√] Kingdom Launch
echo   [√] Project Build              [√] Complete Automation
echo.
echo ================================================================================
echo.
echo                              SYSTEM REQUIREMENTS
echo ================================================================================

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [X] Node.js is NOT installed!
    echo.
    echo Please install Node.js 18+ from: https://nodejs.org
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do echo [√] Node.js: %%i
)

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [X] npm is NOT installed!
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo [√] npm: %%i
)

REM Check Git (optional but recommended)
git --version >nul 2>&1
if errorlevel 1 (
    echo [!] Git: Not installed (optional for local dev)
) else (
    for /f "tokens=*" %%i in ('git --version') do echo [√] Git: %%i
)

echo.
echo ================================================================================
echo.
echo                           EXECUTION CONFIRMATION
echo ================================================================================
echo.
echo This will:
echo   • Clean up redundant files (backed up to _deprecated_backup)
echo   • Install all dependencies
echo   • Configure the complete system
echo   • Build the production application
echo   • Setup deployment configuration
echo   • Launch the Kingdom
echo.
echo Estimated time: 10-15 minutes
echo.
echo ================================================================================
echo.

choice /C YN /N /M "Do you want to proceed with COMPLETE AUTOMATION? (Y/N): "
if errorlevel 2 goto :cancel
if errorlevel 1 goto :proceed

:cancel
echo.
echo Automation cancelled by user.
pause
exit /b 0

:proceed
echo.
echo ================================================================================
echo                         STARTING MASTER EXECUTION
echo ================================================================================
echo.

REM Set environment
set NODE_ENV=development
set NODE_OPTIONS=--max-old-space-size=4096

REM Phase 1: Run Master Control
echo [PHASE 1] Executing Master Control System...
echo.

if exist "master-control.js" (
    node master-control.js
    if errorlevel 1 goto :error_handler
) else if exist "kingdom-complete-automation.js" (
    echo Master control not found, using kingdom automation...
    node kingdom-complete-automation.js
    if errorlevel 1 goto :error_handler
) else (
    echo.
    echo ERROR: No automation scripts found!
    echo Please ensure master-control.js or kingdom-complete-automation.js exists.
    pause
    exit /b 1
)

REM If we get here, automation was successful
goto :success

:error_handler
echo.
echo ================================================================================
echo                         AUTOMATION ENCOUNTERED ISSUES
echo ================================================================================
echo.
echo The automation encountered some issues but may have partially succeeded.
echo.
echo You can:
echo   1. Check automation-error.json for details
echo   2. Try running KINGDOM-LAUNCHER.bat manually
echo   3. Run individual components:
echo      - node kingdom-auto-patch.js (fix issues)
echo      - npm install (install dependencies)
echo      - npm run build (build project)
echo      - npm run dev (start development)
echo.
echo ================================================================================
echo.
choice /C YN /N /M "Would you like to try launching the Kingdom anyway? (Y/N): "
if errorlevel 2 goto :end
if errorlevel 1 goto :try_launch

:try_launch
echo.
echo Attempting to launch Kingdom...
if exist "KINGDOM-LAUNCHER.bat" (
    start "Kingdom Launcher" KINGDOM-LAUNCHER.bat
) else (
    echo Starting development server directly...
    start "Valifi Dev Server" cmd /k "npm run dev"
)
goto :end

:success
echo.
echo ================================================================================
echo                    ✓ MASTER EXECUTION COMPLETE!
echo ================================================================================
echo.
echo    ██╗  ██╗██╗███╗   ██╗ ██████╗ ██████╗  ██████╗ ███╗   ███╗
echo    ██║ ██╔╝██║████╗  ██║██╔════╝ ██╔══██╗██╔═══██╗████╗ ████║
echo    █████╔╝ ██║██╔██╗ ██║██║  ███╗██║  ██║██║   ██║██╔████╔██║
echo    ██╔═██╗ ██║██║╚██╗██║██║   ██║██║  ██║██║   ██║██║╚██╔╝██║
echo    ██║  ██╗██║██║ ╚████║╚██████╔╝██████╔╝╚██████╔╝██║ ╚═╝ ██║
echo    ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝
echo.
echo                         IS FULLY OPERATIONAL!
echo.
echo ================================================================================
echo.
echo ACCESS POINTS:
echo   • Dashboard:  http://localhost:3000
echo   • Monitoring: kingdom-dashboard.html
echo   • MCP Console: kingdom-mcp-server.js
echo.
echo DEPLOYMENT:
echo   • GitHub: git push origin main
echo   • Render: https://dashboard.render.com
echo   • Production: https://valifi-fintech-platform.onrender.com
echo.
echo MANAGEMENT:
echo   • Launcher: KINGDOM-LAUNCHER.bat
echo   • Cleanup: KINGDOM-CLEANUP.bat
echo   • Auto-patch: node kingdom-auto-patch.js
echo.
echo REPORTS:
echo   • automation-report.json
echo   • automation.log
echo   • cleanup-report.json
echo.
echo ================================================================================
echo.

REM Auto-launch option
choice /C YN /N /T 10 /D Y /M "Launch Kingdom Dashboard now? (Y/N - auto-yes in 10s): "
if errorlevel 1 (
    echo.
    echo Launching Kingdom...
    
    REM Open dashboard in browser
    start "" "http://localhost:3000"
    
    REM Open monitoring dashboard
    if exist "kingdom-dashboard.html" (
        start "" "kingdom-dashboard.html"
    )
    
    REM Start Kingdom Launcher
    if exist "KINGDOM-LAUNCHER.bat" (
        start "Kingdom Launcher" KINGDOM-LAUNCHER.bat
    )
)

:end
echo.
echo ================================================================================
echo.
echo Thank you for using Valifi Kingdom Master Execution System!
echo.
echo "Where Finance Comes Alive" ™
echo.
echo ================================================================================
echo.
pause
exit /b 0
