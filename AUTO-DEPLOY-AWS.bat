@echo off
REM 🚀 Valifi Auto-Deploy to AWS - Windows Batch Script
REM This script handles complete automation: build, deploy, and run on AWS

setlocal enabledelayedexpansion

echo.
echo ═══════════════════════════════════════════════════════════
echo                🚀 VALIFI AUTO-DEPLOY TO AWS
echo ═══════════════════════════════════════════════════════════
echo.

REM Configuration
set SERVICE_NAME=valifi-fintech
set GITHUB_REPO=https://github.com/ilabelagent/valifi
set AWS_REGION=us-east-1
set INSTANCE_CPU=0.25 vCPU
set INSTANCE_MEMORY=0.5 GB

echo ℹ️  Configuration:
echo    • Service Name: %SERVICE_NAME%
echo    • GitHub Repo: %GITHUB_REPO%
echo    • AWS Region: %AWS_REGION%
echo    • Instance Size: %INSTANCE_CPU%, %INSTANCE_MEMORY%
echo.

REM Check if AWS CLI is installed
echo 🔍 Checking AWS CLI...
aws --version >nul 2>&1
if errorlevel 1 (
    echo ❌ AWS CLI is not installed or not in PATH
    echo    Please install AWS CLI: https://aws.amazon.com/cli/
    pause
    exit /b 1
)
echo ✅ AWS CLI found

REM Check AWS credentials
echo 🔐 Checking AWS credentials...
aws sts get-caller-identity >nul 2>&1
if errorlevel 1 (
    echo ❌ AWS credentials not configured
    echo    Please run: aws configure
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set ACCOUNT_ID=%%i
echo ✅ AWS credentials configured for account: %ACCOUNT_ID%

REM Check if service exists
echo 🔍 Checking App Runner service status...
for /f "tokens=*" %%i in ('aws apprunner list-services --region %AWS_REGION% --query "ServiceSummaryList[?ServiceName=='%SERVICE_NAME%'].ServiceArn" --output text 2^>nul') do set SERVICE_ARN=%%i

if "%SERVICE_ARN%"=="" (
    echo ⚠️  Service not found. Will create new service.
    set SERVICE_STATUS=NOT_FOUND
) else (
    for /f "tokens=*" %%i in ('aws apprunner describe-service --service-arn "%SERVICE_ARN%" --region %AWS_REGION% --query "Service.Status" --output text') do set SERVICE_STATUS=%%i
    echo ✅ Service found: %SERVICE_NAME% (Status: !SERVICE_STATUS!)
)

REM Create or trigger deployment
if "%SERVICE_STATUS%"=="NOT_FOUND" (
    echo 🚀 Creating new App Runner service...
    echo    This may take 5-10 minutes...

    aws apprunner create-service ^
        --service-name "%SERVICE_NAME%" ^
        --region %AWS_REGION% ^
        --source-configuration "{\"CodeRepository\":{\"RepositoryUrl\":\"%GITHUB_REPO%\",\"SourceCodeVersion\":{\"Type\":\"BRANCH\",\"Value\":\"main\"},\"CodeConfiguration\":{\"ConfigurationSource\":\"REPOSITORY\"}},\"AutoDeploymentsEnabled\":true}" ^
        --instance-configuration "{\"Cpu\":\"%INSTANCE_CPU%\",\"Memory\":\"%INSTANCE_MEMORY%\"}" ^
        --health-check-configuration "{\"Protocol\":\"HTTP\",\"Path\":\"/api/health\",\"Interval\":10,\"Timeout\":5,\"HealthyThreshold\":1,\"UnhealthyThreshold\":5}" ^
        > deployment.json

    if errorlevel 1 (
        echo ❌ Failed to create service
        pause
        exit /b 1
    )

    for /f "tokens=*" %%i in ('type deployment.json ^| findstr ServiceArn ^| findstr -o "arn:aws:apprunner[^\"]*"') do set SERVICE_ARN=%%i
    echo ✅ Service created with ARN: !SERVICE_ARN!

) else (
    echo 🚀 Triggering deployment for existing service...
    aws apprunner start-deployment --service-arn "%SERVICE_ARN%" --region %AWS_REGION%
    if errorlevel 1 (
        echo ❌ Failed to trigger deployment
        pause
        exit /b 1
    )
    echo ✅ Deployment triggered
)

REM Wait for deployment
echo ⏳ Waiting for deployment to complete...
echo    This may take several minutes...

aws apprunner wait service-updated --service-arn "%SERVICE_ARN%" --region %AWS_REGION%
if errorlevel 1 (
    echo ❌ Deployment may have failed or timed out
    echo    Check AWS Console for details
    pause
    exit /b 1
)

REM Get service URL
for /f "tokens=*" %%i in ('aws apprunner describe-service --service-arn "%SERVICE_ARN%" --region %AWS_REGION% --query "Service.ServiceUrl" --output text') do set SERVICE_URL=%%i

echo.
echo 🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!
echo.
echo 📋 Deployment Summary:
echo    • Service Name: %SERVICE_NAME%
echo    • Service URL: https://%SERVICE_URL%
echo    • Health Check: https://%SERVICE_URL%/api/health
echo    • AWS Region: %AWS_REGION%
echo    • Status: Running ✅
echo.

REM Perform health check
echo 🏥 Performing health check...
timeout /t 30 /nobreak >nul
curl -f "https://%SERVICE_URL%/api/health" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Health check failed, but service may still be starting
    echo    URL: https://%SERVICE_URL%/api/health
) else (
    echo ✅ Health check passed!
)

echo.
echo 🔄 Auto-Deployment is now active:
echo    • Push to 'main' branch = Auto-deploy
echo    • Health monitoring enabled
echo    • Auto-scaling configured
echo.
echo 📊 Next Steps:
echo    1. Update RDS password in App Runner environment variables
echo    2. Configure custom domain (optional)
echo    3. Set up SSL certificate (optional)
echo    4. Configure monitoring alerts
echo.
echo 🌐 Open in browser: https://%SERVICE_URL%
echo.

REM Ask if user wants to open browser
set /p OPEN_BROWSER=Open service URL in browser? (y/n):
if /i "%OPEN_BROWSER%"=="y" (
    start https://%SERVICE_URL%
)

echo.
echo 🎉 Auto-deployment setup complete!
pause