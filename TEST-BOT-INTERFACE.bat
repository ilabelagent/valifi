@echo off
echo ========================================
echo    TESTING BOT INTERFACE COMPONENTS
echo ========================================
echo.

REM First install any missing dependencies
echo Installing dependencies if needed...
call npm install styled-jsx --save --force

echo.
echo ========================================
echo    Building with Bot Components
echo ========================================
echo.

call npm run build

if errorlevel 1 (
    echo.
    echo Build failed! Checking for errors...
    echo.
    
    REM Try to fix common issues
    echo Attempting to fix issues...
    call npm install --force --legacy-peer-deps
    
    echo.
    echo Retrying build...
    call npm run build
    
    if errorlevel 1 (
        echo.
        echo ========================================
        echo    BUILD STILL FAILING
        echo ========================================
        echo Please check the error messages above
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo    BUILD SUCCESSFUL!
echo ========================================
echo.
echo Bot interface components are ready!
echo.
echo You can now:
echo 1. Visit /bot page to see the interface
echo 2. Test API at /api/bot
echo 3. Deploy to Render
echo.
echo Starting development server to test...
echo.

start http://localhost:3000/bot
call npm run dev