@echo off
cls
echo ========================================
echo   VALIFI ONE-CLICK VERCEL DEPLOYMENT
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if errorlevel 1 (
    echo Installing Vercel CLI...
    call npm i -g vercel
)

echo.
echo Setting environment variables...
echo.

REM Deploy to production
echo Deploying to Vercel...
echo.
call vercel --prod

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Add database (Vercel Postgres) from dashboard
echo 2. Add Redis cache (Vercel KV) from dashboard  
echo 3. Configure external services
echo 4. Run database migrations
echo.
pause
