@echo off
REM Valifi Bot - Render Deployment Script (Windows)
REM This script prepares and deploys the Valifi bot to Render

echo ========================================
echo     VALIFI BOT - RENDER DEPLOYMENT
echo ========================================
echo.

REM Check if render.yaml exists
if not exist render.yaml (
    echo ERROR: render.yaml not found!
    echo Please ensure render.yaml exists in the project root
    pause
    exit /b 1
)

echo [OK] render.yaml found
echo.

REM Check if package.json exists
if not exist package.json (
    echo ERROR: package.json not found!
    pause
    exit /b 1
)

echo [OK] package.json found
echo.

REM Check for .env.production
if not exist .env.production (
    echo WARNING: .env.production file not found!
    echo.
    if exist .env.template (
        echo Creating .env.production from template...
        copy .env.template .env.production
        echo [OK] Created .env.production from template
        echo Please update the values in .env.production before proceeding
        pause
        exit /b 1
    ) else (
        echo ERROR: No .env.template found. Please create .env.production manually
        pause
        exit /b 1
    )
)

echo [OK] .env.production found
echo.

REM Ask if user wants to test build locally
set /p test_build="Do you want to test the build locally first? (y/n): "
if /i "%test_build%"=="y" (
    echo.
    echo Building application locally for testing...
    echo.
    
    echo Installing dependencies...
    call npm install --force --legacy-peer-deps
    if errorlevel 1 (
        echo ERROR: npm install failed!
        pause
        exit /b 1
    )
    
    echo.
    echo Building Next.js application...
    call npm run build
    if errorlevel 1 (
        echo ERROR: Build failed!
        echo Please fix build errors before deploying
        pause
        exit /b 1
    )
    
    echo.
    echo [OK] Local build successful!
    echo.
)

REM Git operations
echo Checking Git repository...

if not exist .git (
    echo Initializing git repository...
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
) else (
    echo [OK] Git repository found
    
    REM Check for uncommitted changes
    git diff-index --quiet HEAD -- 2>nul
    if errorlevel 1 (
        echo.
        echo Uncommitted changes detected
        set /p commit_changes="Do you want to commit all changes? (y/n): "
        if /i "!commit_changes!"=="y" (
            git add .
            set /p commit_msg="Enter commit message: "
            git commit -m "!commit_msg!"
        )
    )
)

echo.
echo ========================================
echo          DEPLOYMENT OPTIONS
echo ========================================
echo.
echo 1. Deploy using Render Dashboard (Recommended)
echo 2. Deploy using Render CLI
echo 3. View deployment instructions
echo 4. Exit
echo.

set /p option="Choose option (1-4): "

if "%option%"=="1" (
    echo.
    echo ========================================
    echo    DEPLOY USING RENDER DASHBOARD
    echo ========================================
    echo.
    echo Follow these steps:
    echo.
    echo 1. Go to https://dashboard.render.com/
    echo 2. Click 'New +' then 'Blueprint'
    echo 3. Connect your GitHub/GitLab repository
    echo 4. Select the repository containing this project
    echo 5. Render will detect the render.yaml file
    echo 6. Review the configuration and click 'Apply'
    echo 7. Set the required environment variables:
    echo    - NEXT_PUBLIC_APP_URL
    echo    - NEXT_PUBLIC_API_URL
    echo    - Database credentials
    echo    - API keys (OpenAI, Stripe, etc.)
    echo.
    echo Opening Render Dashboard in your browser...
    start https://dashboard.render.com/blueprints
    echo.
    pause
    
) else if "%option%"=="2" (
    echo.
    echo ========================================
    echo      DEPLOY USING RENDER CLI
    echo ========================================
    echo.
    
    REM Check if render CLI is installed
    where render >nul 2>&1
    if errorlevel 1 (
        echo ERROR: Render CLI is not installed.
        echo.
        echo Install it using: npm install -g @render-oss/cli
        echo Or visit: https://render.com/docs/cli
        pause
        exit /b 1
    )
    
    echo Deploying using Render CLI...
    render deploy
    
    if errorlevel 1 (
        echo.
        echo ERROR: Deployment failed. Please check the error messages above.
    ) else (
        echo.
        echo [OK] Deployment initiated successfully!
    )
    pause
    
) else if "%option%"=="3" (
    echo.
    echo ========================================
    echo       DEPLOYMENT INSTRUCTIONS
    echo ========================================
    echo.
    echo OPTION A: Deploy from GitHub (Recommended)
    echo -------------------------------------------
    echo 1. Push your code to GitHub:
    echo    git remote add origin YOUR_GITHUB_REPO_URL
    echo    git push -u origin main
    echo.
    echo 2. Go to https://dashboard.render.com/
    echo 3. Click 'New +' then 'Blueprint'
    echo 4. Connect your GitHub repository
    echo 5. Render will detect render.yaml automatically
    echo 6. Configure environment variables
    echo 7. Deploy!
    echo.
    echo OPTION B: Direct Git Deploy
    echo ----------------------------
    echo 1. Create a new Web Service in Render
    echo 2. Get the Render git URL
    echo 3. Add Render as remote:
    echo    git remote add render YOUR_RENDER_GIT_URL
    echo 4. Push to Render:
    echo    git push render main
    echo.
    echo REQUIRED ENVIRONMENT VARIABLES:
    echo --------------------------------
    echo - NEXT_PUBLIC_APP_URL (your app URL)
    echo - NEXT_PUBLIC_API_URL (your API URL)
    echo - Database connection strings
    echo - API keys for services you use
    echo - SMTP credentials for email
    echo.
    echo FREE TIER LIMITATIONS:
    echo ----------------------
    echo - Apps spin down after 15 min of inactivity
    echo - Free PostgreSQL expires after 90 days
    echo - 512 MB RAM, 0.1 CPU
    echo - Consider upgrading for production use
    echo.
    pause
    
) else if "%option%"=="4" (
    echo Exiting...
    exit /b 0
    
) else (
    echo Invalid option selected
    pause
    exit /b 1
)

echo.
echo ========================================
echo      DEPLOYMENT PROCESS COMPLETE
echo ========================================
echo.
echo Next Steps:
echo 1. Monitor deployment in Render Dashboard
echo 2. Check application logs for issues
echo 3. Test your application at the provided URL
echo 4. Set up custom domain (if needed)
echo.
echo Useful Links:
echo - Dashboard: https://dashboard.render.com/
echo - Docs: https://render.com/docs
echo - Status: https://status.render.com/
echo.
pause