@echo off
echo.
echo =====================================
echo    Valifi - Fix Build Errors
echo =====================================
echo.

echo [1/3] Fixed Heroicons imports (v1 to v2 syntax)
echo [2/3] Removed deprecated swcMinify from next.config.js
echo [3/3] Committing and pushing fixes...
echo.

git add -A
git commit -m "Fix: Update Heroicons imports to v2 syntax and remove deprecated swcMinify"
git push origin main

echo.
echo =====================================
echo    FIXES PUSHED!
echo =====================================
echo.
echo ✅ Heroicons imports updated to v2 syntax
echo ✅ Deprecated swcMinify option removed
echo.
echo Vercel will automatically redeploy with these fixes.
echo.
echo Check deployment at: https://vercel.com/dashboard
echo.
pause