@echo off
cls
color 0A
echo.
echo ==============================================================================
echo                    VALIFI KINGDOM COMPLETE AUTOMATION
echo                         ZERO-TOUCH DEPLOYMENT SYSTEM
echo ==============================================================================
echo.
echo This automation will execute the complete A-Z implementation:
echo.
echo   [Phase 1]  Environment Setup
echo   [Phase 2]  Project Cleanup
echo   [Phase 3]  Auto-Patch System
echo   [Phase 4]  Dependencies Installation
echo   [Phase 5]  Database Configuration
echo   [Phase 6]  Project Build
echo   [Phase 7]  Git Repository Setup
echo   [Phase 8]  Render Configuration
echo   [Phase 9]  Deployment to Render
echo   [Phase 10] Deployment Verification
echo.
echo ==============================================================================
echo.
echo                    ⚠️  IMPORTANT NOTES ⚠️
echo.
echo   • This will clean up your project (files backed up)
echo   • Requires Node.js 18+ and npm installed
echo   • Requires Git installed
echo   • Internet connection required
echo   • Process may take 10-15 minutes
echo.
echo ==============================================================================
echo.

set /p confirm="Do you want to proceed with COMPLETE AUTOMATION? (yes/no): "

if /i not "%confirm%"=="yes" (
    echo.
    echo Automation cancelled.
    pause
    exit
)

echo.
echo ==============================================================================
echo                         STARTING AUTOMATION
echo ==============================================================================
echo.

REM Check for Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check for npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: npm is not installed!
    echo Please install npm
    pause
    exit /b 1
)

REM Check for Git
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Git is not installed!
    echo Please install Git from https://git-scm.com
    pause
    exit /b 1
)

echo ✅ Prerequisites verified
echo.
echo Starting automation script...
echo.

REM Run the automation
node kingdom-complete-automation.js

if errorlevel 1 (
    echo.
    echo ==============================================================================
    echo                    ❌ AUTOMATION ENCOUNTERED ERRORS
    echo ==============================================================================
    echo.
    echo Check automation-error.json for details
    echo You may need to:
    echo   1. Fix any reported errors
    echo   2. Re-run this automation
    echo   3. Or continue manually with KINGDOM-LAUNCHER.bat
    echo.
) else (
    echo.
    echo ==============================================================================
    echo                    ✅ AUTOMATION COMPLETE!
    echo ==============================================================================
    echo.
    echo Your Valifi Kingdom is now fully configured and ready!
    echo.
    echo Next Steps:
    echo   1. Run: KINGDOM-LAUNCHER.bat
    echo   2. Select option 1 to launch the system
    echo   3. Access: http://localhost:3000
    echo   4. Push to GitHub: git push origin main
    echo   5. Deploy to Render via dashboard
    echo.
    echo Reports:
    echo   • automation-report.json - Full automation report
    echo   • automation.log - Detailed log file
    echo.
)

echo.
pause
