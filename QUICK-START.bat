@echo off
:: QUICK START - Valifi FinTech Bot
:: This script quickly starts the development environment

cls
echo ========================================
echo    VALIFI QUICK START
echo ========================================
echo.

:: Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

:: Start the development server
echo Starting development server...
echo.
echo Server URL: http://localhost:3000
echo.

:: Open in browser after 5 seconds
start cmd /c "timeout /t 5 && start http://localhost:3000"

:: Run the dev server
npm run dev