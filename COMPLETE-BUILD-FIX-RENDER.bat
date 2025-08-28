@echo off
echo ========================================
echo    COMPLETE BUILD FIX FOR RENDER
echo ========================================
echo.

REM Backup current env.production
echo Backing up current .env.production...
if exist .env.production (
    copy .env.production .env.production.backup
)

REM Use fixed env file
echo Using fixed environment file...
copy .env.production.fixed .env.production

REM Install missing npm packages
echo.
echo Installing missing dependencies...
call npm install @heroicons/react@latest --save --force
call npm install pg --save --force
call npm install --force --legacy-peer-deps

echo.
echo Dependencies installed!

REM Test the build
echo.
echo ========================================
echo    Testing Build
echo ========================================
echo.

call npm run build

if errorlevel 1 (
    echo.
    echo Build still has errors. Let's try additional fixes...
    echo.
    
    REM Try removing node_modules and reinstalling
    echo Cleaning node_modules and reinstalling...
    rmdir /s /q node_modules 2>nul
    del package-lock.json 2>nul
    
    echo.
    echo Reinstalling all dependencies fresh...
    call npm install --force --legacy-peer-deps
    
    echo.
    echo Retrying build...
    call npm run build
    
    if errorlevel 1 (
        echo.
        echo ========================================
        echo    BUILD FAILED - MANUAL FIX NEEDED
        echo ========================================
        echo.
        echo Please check the error messages above.
        echo Common fixes:
        echo 1. Check for TypeScript errors
        echo 2. Ensure all imports are correct
        echo 3. Verify all required files exist
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo    BUILD SUCCESSFUL!
echo ========================================
echo.
echo Your application is ready for Render deployment!
echo.
echo Next steps:
echo 1. Commit your changes to Git
echo 2. Push to GitHub
echo 3. Deploy to Render using the dashboard
echo.
pause