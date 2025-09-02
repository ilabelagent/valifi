@echo off
setlocal enabledelayedexpansion
cls
color 0A

echo ==============================================================================
echo                         VALIFI PLATFORM LAUNCHER
echo                            Universal Edition
echo ==============================================================================
echo.

:: Get current directory
set WORKING_DIR=%CD%
echo Working Directory: %WORKING_DIR%
echo.

:: Step 1: Check Node.js
echo [STEP 1] Checking Node.js installation...
where node >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo    SUCCESS: Node.js !NODE_VERSION! found
) else (
    echo    ERROR: Node.js not found
    echo.
    echo    Please install Node.js from: https://nodejs.org
    echo    After installation, restart this launcher.
    echo.
    pause
    exit /b 1
)

:: Step 2: Check npm
echo.
echo [STEP 2] Checking npm installation...
where npm >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo    SUCCESS: npm !NPM_VERSION! found
) else (
    echo    ERROR: npm not found
    echo.
    pause
    exit /b 1
)

:: Step 3: Check project files
echo.
echo [STEP 3] Checking project structure...
if exist "package.json" (
    echo    SUCCESS: package.json found
) else (
    echo    WARNING: package.json not found
    echo    Creating default package.json...
    echo {"name":"valifi-platform","version":"1.0.0","scripts":{"dev":"next dev","build":"next build","start":"next start"}} > package.json
    echo    SUCCESS: Created package.json
)

:: Step 4: Check and install dependencies
echo.
echo [STEP 4] Checking dependencies...
if exist "node_modules" (
    echo    SUCCESS: Dependencies found
    echo.
    set /p UPDATE="Update dependencies? (y/n): "
    if /i "!UPDATE!"=="y" (
        echo    Updating dependencies...
        call npm update
    )
) else (
    echo    WARNING: Dependencies not installed
    echo    Installing dependencies (this may take several minutes)...
    echo.
    
    :: Try different install methods
    call npm install --force --legacy-peer-deps
    if !errorlevel! neq 0 (
        echo    Trying alternative install method...
        call npm install
    )
    
    if exist "node_modules" (
        echo    SUCCESS: Dependencies installed
    ) else (
        echo    ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

:: Step 5: Check for .env file
echo.
echo [STEP 5] Checking environment configuration...
if exist ".env.local" (
    echo    SUCCESS: .env.local found
) else if exist ".env" (
    echo    SUCCESS: .env found
) else (
    echo    WARNING: No environment file found
    echo    Creating .env.local with defaults...
    (
        echo NODE_ENV=development
        echo PORT=3000
        echo NEXT_PUBLIC_API_URL=http://localhost:3000/api
    ) > .env.local
    echo    SUCCESS: Created .env.local
)

:: Step 6: Launch options
echo.
echo ==============================================================================
echo                            LAUNCH OPTIONS
echo ==============================================================================
echo.
echo 1. Development Server (with hot reload)
echo 2. Production Server (optimized)
echo 3. Build Project Only
echo 4. Clean Install (remove node_modules and reinstall)
echo 5. Check Project Status
echo 6. Exit
echo.
set /p CHOICE="Select an option (1-6): "

if "!CHOICE!"=="1" (
    echo.
    echo ==============================================================================
    echo                       STARTING DEVELOPMENT SERVER
    echo ==============================================================================
    echo.
    echo Server Address: http://localhost:3000
    echo Admin Panel: http://localhost:3000/admin
    echo API Endpoint: http://localhost:3000/api
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    call npm run dev
    
) else if "!CHOICE!"=="2" (
    echo.
    echo Building for production...
    call npm run build
    echo.
    echo ==============================================================================
    echo                       STARTING PRODUCTION SERVER
    echo ==============================================================================
    echo.
    echo Server Address: http://localhost:3000
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    call npm start
    
) else if "!CHOICE!"=="3" (
    echo.
    echo Building project...
    call npm run build
    echo.
    echo BUILD COMPLETE!
    
) else if "!CHOICE!"=="4" (
    echo.
    echo Cleaning project...
    if exist "node_modules" rmdir /s /q node_modules
    if exist ".next" rmdir /s /q .next
    if exist "package-lock.json" del package-lock.json
    echo.
    echo Reinstalling dependencies...
    call npm install --force --legacy-peer-deps
    echo.
    echo CLEAN INSTALL COMPLETE!
    
) else if "!CHOICE!"=="5" (
    echo.
    echo ==============================================================================
    echo                          PROJECT STATUS
    echo ==============================================================================
    echo.
    echo Directory: %WORKING_DIR%
    echo Node Version: !NODE_VERSION!
    echo NPM Version: !NPM_VERSION!
    echo.
    
    if exist "package.json" (
        echo Package.json: FOUND
        for /f "tokens=2 delims=:," %%a in ('type package.json ^| findstr "\"name\""') do (
            set PROJECT_NAME=%%a
            set PROJECT_NAME=!PROJECT_NAME:"=!
            set PROJECT_NAME=!PROJECT_NAME: =!
        )
        for /f "tokens=2 delims=:," %%a in ('type package.json ^| findstr "\"version\""') do (
            set PROJECT_VERSION=%%a
            set PROJECT_VERSION=!PROJECT_VERSION:"=!
            set PROJECT_VERSION=!PROJECT_VERSION: =!
        )
        echo Project: !PROJECT_NAME! v!PROJECT_VERSION!
    )
    
    if exist "node_modules" (
        echo Dependencies: INSTALLED
    ) else (
        echo Dependencies: NOT INSTALLED
    )
    
    if exist ".next" (
        echo Build: EXISTS
    ) else (
        echo Build: NOT FOUND
    )
    
    if exist ".env.local" (
        echo Environment: .env.local
    ) else if exist ".env" (
        echo Environment: .env
    ) else (
        echo Environment: NOT CONFIGURED
    )
    
    echo.
    
) else if "!CHOICE!"=="6" (
    echo.
    echo Goodbye!
    exit /b 0
    
) else (
    echo.
    echo Invalid option. Please try again.
    timeout /t 2 >nul
    %0
)

echo.
echo ==============================================================================
echo.
pause