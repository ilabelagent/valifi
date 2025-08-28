@echo off
:: VALIFI Master Control - One-Click Solution
:: This is the main entry point for all VALIFI operations

color 0F
cls

echo ================================================================================
echo                      VALIFI AI BOT MASTER CONTROL
echo                         One-Click Auto-Deploy
echo                            Version 5.0.0
echo ================================================================================
echo.
echo Select an option:
echo.
echo   [1] Quick Start (Auto-Heal + Run)
echo   [2] Full Auto-Heal Only
echo   [3] Start Monitoring (Continuous)
echo   [4] Deploy to Vercel
echo   [5] Emergency Fix
echo   [6] View Logs
echo   [7] Exit
echo.
set /p choice="Enter choice (1-7): "

if "%choice%"=="1" goto QUICK_START
if "%choice%"=="2" goto AUTO_HEAL
if "%choice%"=="3" goto MONITOR
if "%choice%"=="4" goto DEPLOY
if "%choice%"=="5" goto EMERGENCY
if "%choice%"=="6" goto LOGS
if "%choice%"=="7" goto EXIT

echo Invalid choice. Please try again.
pause
cls
goto :eof

:QUICK_START
echo.
echo Starting Quick Launch...
call RUN-VALIFI-NOW.bat
goto :eof

:AUTO_HEAL
echo.
echo Running Auto-Heal System...
call VALIFI-AUTO-HEAL.bat
goto :eof

:MONITOR
echo.
echo Starting Continuous Monitor...
start "VALIFI Monitor" VALIFI-MONITOR.bat
echo Monitor started in new window.
pause
goto :eof

:DEPLOY
echo.
echo Preparing Vercel Deployment...
echo.

:: Check if build exists
if not exist ".next" (
    echo Building application first...
    call npm run build
)

echo Deploying to Vercel...
call vercel --prod

echo.
echo Deployment complete!
pause
goto :eof

:EMERGENCY
echo.
echo EMERGENCY FIX MODE
echo ==================
echo.

:: Force reinstall everything
echo [1/5] Removing node_modules...
if exist "node_modules" rmdir /s /q "node_modules"

echo [2/5] Removing build directories...
if exist ".next" rmdir /s /q ".next"
if exist ".vercel" rmdir /s /q ".vercel"

echo [3/5] Clearing all caches...
call npm cache clean --force >nul 2>&1

echo [4/5] Reinstalling dependencies...
call npm install --force --legacy-peer-deps

echo [5/5] Running auto-heal...
call VALIFI-AUTO-HEAL.bat

echo.
echo Emergency fix complete!
pause
goto :eof

:LOGS
echo.
echo Opening logs directory...
if exist "logs" (
    explorer "logs"
) else (
    echo No logs found. Run auto-heal first.
)
pause
goto :eof

:EXIT
echo.
echo Goodbye!
timeout /t 2 /nobreak >nul
exit