@echo off
echo.
echo =====================================
echo    Valifi - Fix Vercel Deployment
echo =====================================
echo.

echo IMPORTANT: Set these environment variables in Vercel Dashboard:
echo.
echo 1. Go to: https://vercel.com/dashboard
echo 2. Select your 'valifi' project
echo 3. Go to Settings - Environment Variables
echo 4. Add these variables:
echo.
echo    JWT_SECRET = (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo    JWT_REFRESH_SECRET = (generate another one)
echo    NEXT_PUBLIC_API_URL = https://your-app-name.vercel.app/api
echo.
echo =====================================
echo.
echo After adding variables, redeploy:
echo.

set /p continue="Have you added the environment variables? (y/n): "
if /i "%continue%"=="y" (
    echo.
    echo Pushing fixed vercel.json...
    git add vercel.json
    git commit -m "Fix: Remove secret references from vercel.json"
    git push origin main
    echo.
    echo ✅ Push complete! Vercel will redeploy automatically.
    echo.
    echo Check deployment at: https://vercel.com/dashboard
) else (
    echo.
    echo Please add the environment variables first, then run this script again.
)

pause