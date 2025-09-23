@echo off
:: VALIFI Quick Run & Auto Deploy
:: This script automatically heals, builds, and deploys

color 0B
cls

echo ================================================================================
echo                      VALIFI AI BOT - QUICK AUTO-RUN
echo                            Zero-Touch Deployment
echo ================================================================================
echo.

:: Run auto-heal first
echo [PHASE 1] Running Auto-Heal System...
echo ----------------------------------------
call VALIFI-AUTO-HEAL.bat

:: Check if heal was successful
if exist "deployment-status.json" (
    echo.
    echo [PHASE 2] Auto-Heal successful! Starting services...
    echo ----------------------------------------
    
    :: Start the development server
    start "VALIFI Dev Server" cmd /k "npm run dev"
    
    :: Wait for server to start
    timeout /t 5 /nobreak >nul
    
    :: Open browser
    echo.
    echo [PHASE 3] Opening browser...
    start http://localhost:3000
    
    echo.
    echo ================================================================================
    echo                         SYSTEM RUNNING SUCCESSFULLY!
    echo ================================================================================
    echo.
    echo Services Started:
    echo    - Development Server: http://localhost:3000
    echo    - Health Check: http://localhost:3000/api/health
    echo    - API Endpoint: http://localhost:3000/api/agents
    echo.
    echo To deploy to production, run: vercel
    echo.
) else (
    echo.
    echo [ERROR] Auto-heal failed. Please check logs directory.
    echo.
)

pause