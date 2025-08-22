@echo off
REM Valifi - Quick Deploy to Vercel via Git

echo.
echo =====================================
echo    Valifi - Deploy to Vercel
echo =====================================
echo.

REM Add all changes
echo [1/4] Adding all changes...
git add .
if %errorlevel% neq 0 (
    echo Error: Failed to add files
    pause
    exit /b 1
)

REM Commit with timestamp
echo [2/4] Creating commit...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set COMMIT_MSG=Deploy Valifi auth system - %datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%
git commit -m "%COMMIT_MSG%"
if %errorlevel% neq 0 (
    echo Warning: Nothing to commit or commit failed
)

REM Push to main branch
echo [3/4] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo Error: Push failed. Trying force push...
    set /p confirm="Force push? (y/n): "
    if /i "%confirm%"=="y" (
        git push -f origin main
    ) else (
        echo Push cancelled.
        pause
        exit /b 1
    )
)

echo [4/4] Deployment initiated!
echo.
echo =====================================
echo    DEPLOYMENT SUCCESSFUL!
echo =====================================
echo.
echo Vercel will auto-deploy from GitHub
echo.
echo Check deployment at:
echo   https://vercel.com/dashboard
echo.
echo Your app will be available at:
echo   https://valifi.vercel.app
echo.
echo IMPORTANT - Set these in Vercel Dashboard:
echo   - JWT_SECRET
echo   - JWT_REFRESH_SECRET  
echo   - NEXT_PUBLIC_API_URL
echo.
pause