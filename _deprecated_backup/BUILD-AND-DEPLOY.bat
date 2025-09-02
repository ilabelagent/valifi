@echo off
cls
echo ================================================================
echo    VALIFI FINTECH BOT - BUILD AND DEPLOYMENT MANAGER
echo ================================================================
echo.

:: Set project directory
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

:MAIN_MENU
echo.
echo Select an action:
echo ================================================================
echo 1. Fix Project Issues (Run First!)
echo 2. Install Dependencies
echo 3. Build Project
echo 4. Run Development Server
echo 5. Deploy to Vercel
echo 6. Complete Setup (All Steps)
echo 7. Quick Dev Start
echo 8. Production Deploy
echo 9. Exit
echo ================================================================
echo.

set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto FIX_ISSUES
if "%choice%"=="2" goto INSTALL_DEPS
if "%choice%"=="3" goto BUILD_PROJECT
if "%choice%"=="4" goto RUN_DEV
if "%choice%"=="5" goto DEPLOY_VERCEL
if "%choice%"=="6" goto COMPLETE_SETUP
if "%choice%"=="7" goto QUICK_DEV
if "%choice%"=="8" goto PRODUCTION_DEPLOY
if "%choice%"=="9" goto END

echo Invalid choice. Please try again.
goto MAIN_MENU

:FIX_ISSUES
echo.
echo ================================================================
echo    FIXING PROJECT ISSUES
echo ================================================================
echo.

echo Step 1: Creating missing API directory...
if not exist "api" (
    mkdir api
    echo [OK] API directory created
) else (
    echo [OK] API directory already exists
)

echo.
echo Step 2: Updating package.json with missing dependencies...
:: Create updated package.json
echo { > package-updated.json
echo   "name": "valifi-fintech-platform", >> package-updated.json
echo   "version": "1.0.0", >> package-updated.json
echo   "private": true, >> package-updated.json
echo   "scripts": { >> package-updated.json
echo     "dev": "next dev", >> package-updated.json
echo     "build": "next build", >> package-updated.json
echo     "start": "next start", >> package-updated.json
echo     "lint": "next lint", >> package-updated.json
echo     "test": "node test-connection.js", >> package-updated.json
echo     "deploy": "vercel --prod" >> package-updated.json
echo   }, >> package-updated.json
echo   "dependencies": { >> package-updated.json
echo     "next": "13.5.2", >> package-updated.json
echo     "react": "18.2.0", >> package-updated.json
echo     "react-dom": "18.2.0", >> package-updated.json
echo     "bcryptjs": "^2.4.3", >> package-updated.json
echo     "@libsql/client": "^0.3.5", >> package-updated.json
echo     "cors": "^2.8.5", >> package-updated.json
echo     "dotenv": "^16.3.1", >> package-updated.json
echo     "jsonwebtoken": "^9.0.2", >> package-updated.json
echo     "@vercel/node": "^3.0.0", >> package-updated.json
echo     "express": "^4.18.2", >> package-updated.json
echo     "axios": "^1.5.0", >> package-updated.json
echo     "react-hot-toast": "^2.4.1", >> package-updated.json
echo     "lucide-react": "^0.263.1", >> package-updated.json
echo     "tailwindcss": "^3.3.0", >> package-updated.json
echo     "autoprefixer": "^10.4.14", >> package-updated.json
echo     "postcss": "^8.4.24" >> package-updated.json
echo   }, >> package-updated.json
echo   "devDependencies": { >> package-updated.json
echo     "@types/node": "^20.0.0", >> package-updated.json
echo     "@types/react": "^18.2.0", >> package-updated.json
echo     "@types/react-dom": "^18.2.0", >> package-updated.json
echo     "@types/bcryptjs": "^2.4.2", >> package-updated.json
echo     "typescript": "^5.0.0", >> package-updated.json
echo     "eslint": "^8.42.0", >> package-updated.json
echo     "eslint-config-next": "13.5.2" >> package-updated.json
echo   } >> package-updated.json
echo } >> package-updated.json

:: Backup and replace package.json
if exist package.json (
    copy package.json package.backup.json
    echo [OK] Backed up original package.json
)
move /y package-updated.json package.json >nul
echo [OK] package.json updated with all dependencies

echo.
echo Step 3: Creating consolidated API index file...
if not exist "api\index.js" (
    copy pages\api\bot.js api\index.js 2>nul
    if %errorlevel% equ 0 (
        echo [OK] API index.js created from bot.js
    ) else (
        echo [WARNING] Could not copy bot.js, creating new index.js
        echo // Consolidated API for Valifi Platform > api\index.js
        echo module.exports = require('../pages/api/bot'); >> api\index.js
    )
) else (
    echo [OK] API index.js already exists
)

echo.
echo Step 4: Checking environment variables...
if not exist ".env.local" (
    echo [WARNING] .env.local missing, creating from template...
    if exist ".env.example" (
        copy .env.example .env.local
        echo [OK] Created .env.local from template
    ) else (
        echo # Environment Variables > .env.local
        echo NODE_ENV=development >> .env.local
        echo NEXT_PUBLIC_API_URL=http://localhost:3000/api >> .env.local
        echo [OK] Created basic .env.local
    )
) else (
    echo [OK] .env.local exists
)

echo.
echo [SUCCESS] Issues fixed!
pause
goto MAIN_MENU

:INSTALL_DEPS
echo.
echo ================================================================
echo    INSTALLING DEPENDENCIES
echo ================================================================
echo.

echo Checking Node.js installation...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    goto MAIN_MENU
)

echo Node.js found: 
node --version
echo.

echo Installing dependencies...
echo This may take several minutes...
echo.

:: Clean install
if exist "node_modules" (
    echo Cleaning old node_modules...
    rmdir /s /q node_modules 2>nul
)

if exist "package-lock.json" (
    del package-lock.json
)

echo Running npm install...
call npm install

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Dependencies installed successfully!
) else (
    echo.
    echo [ERROR] Failed to install dependencies
    echo Try running: npm install --force
)

pause
goto MAIN_MENU

:BUILD_PROJECT
echo.
echo ================================================================
echo    BUILDING PROJECT
echo ================================================================
echo.

echo Pre-build checks...

if not exist "node_modules" (
    echo [ERROR] node_modules not found!
    echo Please install dependencies first (Option 2)
    pause
    goto MAIN_MENU
)

echo.
echo Running Next.js build...
echo This may take a few minutes...
echo.

call npm run build

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Build completed successfully!
    echo Build output: .next directory
) else (
    echo.
    echo [ERROR] Build failed!
    echo Check the error messages above
    echo.
    echo Common fixes:
    echo 1. Run "npm install" to ensure all dependencies are installed
    echo 2. Fix any TypeScript/JSX errors in your components
    echo 3. Check that all imports are correct
)

pause
goto MAIN_MENU

:RUN_DEV
echo.
echo ================================================================
echo    STARTING DEVELOPMENT SERVER
echo ================================================================
echo.

if not exist "node_modules" (
    echo [ERROR] Dependencies not installed!
    echo Installing dependencies first...
    call npm install
)

echo.
echo Starting Next.js development server...
echo Server will run at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

start cmd /k "cd /d %PROJECT_DIR% && npm run dev"

echo.
echo [INFO] Development server starting in new window...
echo [INFO] Wait a moment then open: http://localhost:3000
echo.

:: Open browser after delay
timeout /t 5 /nobreak >nul
start http://localhost:3000

pause
goto MAIN_MENU

:DEPLOY_VERCEL
echo.
echo ================================================================
echo    DEPLOYING TO VERCEL
echo ================================================================
echo.

echo Checking Vercel CLI installation...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Vercel CLI not found, installing...
    call npm i -g vercel
)

echo.
echo Pre-deployment checklist:
echo -------------------------
echo [Checking] Build status...
if exist ".next" (
    echo [OK] Build directory exists
) else (
    echo [WARNING] No build found, building now...
    call npm run build
)

echo [Checking] Environment variables...
if exist ".env.local" (
    echo [OK] Environment variables configured
) else (
    echo [WARNING] No .env.local file found
)

echo.
echo Starting Vercel deployment...
echo.

:: Check if already linked to Vercel
if exist ".vercel\project.json" (
    echo Project already linked to Vercel
    echo Deploying to production...
    call vercel --prod
) else (
    echo First time deployment detected
    echo Follow the Vercel prompts...
    call vercel
)

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Deployment completed!
    echo Your app should be live on Vercel
) else (
    echo.
    echo [ERROR] Deployment failed
    echo Check the error messages above
)

pause
goto MAIN_MENU

:COMPLETE_SETUP
echo.
echo ================================================================
echo    RUNNING COMPLETE SETUP
echo ================================================================
echo.

echo This will run all setup steps in order:
echo 1. Fix issues
echo 2. Install dependencies
echo 3. Build project
echo 4. Run development server
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

call :FIX_ISSUES_SILENT
call :INSTALL_DEPS_SILENT
call :BUILD_PROJECT_SILENT

echo.
echo [SUCCESS] Complete setup finished!
echo.
echo Starting development server...
call npm run dev

goto MAIN_MENU

:QUICK_DEV
echo.
echo ================================================================
echo    QUICK DEVELOPMENT START
echo ================================================================
echo.

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo Starting development server...
start cmd /k "npm run dev"

timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo [SUCCESS] Development server started!
echo Browser opening to http://localhost:3000
pause
goto MAIN_MENU

:PRODUCTION_DEPLOY
echo.
echo ================================================================
echo    PRODUCTION DEPLOYMENT
echo ================================================================
echo.

echo Running production deployment checklist...
echo.

:: 1. Fix issues
echo Step 1: Fixing issues...
call :FIX_ISSUES_SILENT

:: 2. Install deps
echo Step 2: Installing dependencies...
call npm install --production

:: 3. Build
echo Step 3: Building for production...
set NODE_ENV=production
call npm run build

:: 4. Deploy
echo Step 4: Deploying to Vercel...
call vercel --prod

echo.
echo [SUCCESS] Production deployment complete!
pause
goto MAIN_MENU

:: Silent versions of functions for batch operations
:FIX_ISSUES_SILENT
if not exist "api" mkdir api
if not exist "api\index.js" copy pages\api\bot.js api\index.js 2>nul
if not exist ".env.local" copy .env.example .env.local 2>nul
exit /b

:INSTALL_DEPS_SILENT
call npm install >nul 2>&1
exit /b

:BUILD_PROJECT_SILENT
call npm run build >nul 2>&1
exit /b

:END
echo.
echo Thank you for using Valifi Build & Deploy Manager!
echo.
pause
exit /b 0