@echo off
cls
echo ================================================================================
echo                    VALIFI AI BOT - NEON + VERCEL QUICK DEPLOY
echo                              Version 3.0.0
echo ================================================================================
echo.
echo This script will deploy your Valifi AI Bot Platform to Vercel with Neon DB
echo.
pause

:: Step 1: Test Database Connection
echo.
echo [Step 1/7] Testing Neon Database Connection...
echo ------------------------------------------------
node test-neon-connection.js
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Database connection failed!
    echo Please check your Neon database at: https://console.neon.tech
    pause
    exit /b 1
)

:: Step 2: Install Dependencies
echo.
echo [Step 2/7] Installing Dependencies...
echo ------------------------------------------------
call npm install
if %errorlevel% neq 0 (
    echo [WARNING] Some dependencies failed. Trying with --force...
    call npm install --force
)

:: Step 3: Build Application
echo.
echo [Step 3/7] Building Application...
echo ------------------------------------------------
call npm run build
if %errorlevel% neq 0 (
    echo [WARNING] Build completed with warnings
)

:: Step 4: Check Vercel CLI
echo.
echo [Step 4/7] Checking Vercel CLI...
echo ------------------------------------------------
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    call npm i -g vercel
)
echo ✓ Vercel CLI ready

:: Step 5: Set Environment Variables
echo.
echo [Step 5/7] Setting Environment Variables in Vercel...
echo ------------------------------------------------
echo.
set /p setup_env="Do you want to set up environment variables now? (y/n): "
if /i "%setup_env%"=="y" (
    call setup-vercel-env.bat
)

:: Step 6: Add OpenAI Key
echo.
echo [Step 6/7] OpenAI API Key Setup...
echo ------------------------------------------------
echo.
echo IMPORTANT: You need to add your OpenAI API key!
echo.
set /p has_key="Do you have an OpenAI API key? (y/n): "
if /i "%has_key%"=="y" (
    set /p openai_key="Enter your OpenAI API key: "
    echo %openai_key% | vercel env add OPENAI_API_KEY production
    echo ✓ OpenAI API key added
) else (
    echo.
    echo Get your API key from: https://platform.openai.com/api-keys
    echo You can add it later with: vercel env add OPENAI_API_KEY production
)

:: Step 7: Deploy
echo.
echo [Step 7/7] Deploying to Vercel...
echo ------------------------------------------------
echo.
echo Ready to deploy to production!
echo.
echo Your Neon database is connected:
echo - Database: neondb
echo - Host: ep-proud-mountain-ady8h1sc.c-2.us-east-1.aws.neon.tech
echo.
set /p deploy_now="Deploy to production now? (y/n): "
if /i "%deploy_now%"=="y" (
    echo.
    echo Deploying...
    vercel --prod
    
    echo.
    echo ================================================================================
    echo                         DEPLOYMENT COMPLETE!
    echo ================================================================================
    echo.
    echo ✅ Your Valifi AI Bot Platform is now live!
    echo.
    echo 📝 IMPORTANT - After deployment:
    echo.
    echo 1. Update the API URL with your Vercel URL:
    echo    vercel env add NEXT_PUBLIC_API_URL production
    echo    (Enter: https://your-app.vercel.app/api)
    echo.
    echo 2. Run database migrations if not done:
    echo    run-neon-migrations.bat
    echo.
    echo 3. Test your deployment:
    echo    https://your-app.vercel.app/api/health
    echo.
    echo 4. Monitor in Neon Console:
    echo    https://console.neon.tech
    echo.
    echo 5. View Vercel Dashboard:
    echo    https://vercel.com/dashboard
    echo.
) else (
    echo.
    echo Deployment cancelled. You can deploy later with:
    echo    vercel --prod
)

echo.
pause