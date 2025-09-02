@echo off
cls
color 0A
echo ================================================
echo      VALIFI BOT - UNIVERSAL LAUNCHER
echo      Auto-Detecting Paths
echo ================================================
echo.

:: Auto-detect current directory
set CURRENT_DIR=%CD%

:: Set Node.js path (try multiple locations)
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [1] Node.js found in PATH
) else (
    echo [1] Adding Node.js to PATH...
    set PATH=C:\Program Files\nodejs;%PATH%
)

echo.
echo [2] Testing Node.js...
node --version
if %ERRORLEVEL% NEQ 0 (
    echo    ERROR: Node.js not working!
    echo    Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo    Node.js OK!

echo.
echo [3] Testing npm...
call npm --version
if %ERRORLEVEL% NEQ 0 (
    echo    ERROR: npm not working!
    pause
    exit /b 1
)
echo    npm OK!

echo.
echo [4] Current directory:
echo    %CURRENT_DIR%

echo.
echo [5] Checking project files...
if exist package.json (
    echo    package.json: FOUND
) else (
    echo    package.json: MISSING!
    echo    Creating a basic package.json...
    call npm init -y
)

echo.
echo [6] Installing/Updating dependencies...
if not exist node_modules (
    echo    Installing packages - this may take a few minutes...
    call npm install --force --legacy-peer-deps
    if %ERRORLEVEL% NEQ 0 (
        echo    Trying alternative install method...
        call npm install
    )
) else (
    echo    Dependencies already installed
    echo    Updating packages...
    call npm update
)

echo.
echo [7] Building project...
if exist "next.config.js" (
    echo    Next.js project detected
    if not exist ".next" (
        echo    Building Next.js project...
        call npm run build
    )
)

echo.
echo ================================================
echo    STARTING VALIFI BOT
echo ================================================
echo.
echo Select startup mode:
echo   1. Development mode (with hot reload)
echo   2. Production mode (optimized)
echo   3. Test mode (run tests)
echo   4. Exit
echo.
set /p mode="Enter your choice (1-4): "

if "%mode%"=="1" (
    echo.
    echo Starting in DEVELOPMENT mode...
    echo Server will start on http://localhost:3000
    echo Press Ctrl+C to stop
    echo.
    call npm run dev
) else if "%mode%"=="2" (
    echo.
    echo Starting in PRODUCTION mode...
    echo Building for production...
    call npm run build
    echo Starting production server...
    echo Server will start on http://localhost:3000
    echo Press Ctrl+C to stop
    echo.
    call npm start
) else if "%mode%"=="3" (
    echo.
    echo Running tests...
    call npm test
) else if "%mode%"=="4" (
    echo Exiting...
    exit /b 0
) else (
    echo Invalid choice!
    pause
    goto :eof
)

pause