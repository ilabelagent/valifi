@echo off
cls
echo ============================================
echo      VALIFI BOT - SIMPLE LAUNCHER
echo ============================================
echo.

:: Test if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 goto :NodeNotFound

:: Test if npm is installed
npm --version >nul 2>&1
if errorlevel 1 goto :NpmNotFound

:: Check if package.json exists
if not exist package.json goto :NoPackageJson

:: Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

:: Start the application
echo.
echo Starting VALIFI Bot...
echo Server will run on http://localhost:3000
echo Press Ctrl+C to stop
echo.
call npm run dev
goto :End

:NodeNotFound
echo ERROR: Node.js is not installed!
echo Please install Node.js from https://nodejs.org
pause
goto :End

:NpmNotFound
echo ERROR: npm is not installed!
echo Please reinstall Node.js from https://nodejs.org
pause
goto :End

:NoPackageJson
echo ERROR: package.json not found!
echo This doesn't appear to be a Node.js project directory.
echo Please navigate to the correct directory.
pause
goto :End

:End