@echo off
echo.
echo =====================================
echo    CRITICAL FIX - Add Database Files
echo =====================================
echo.

echo Checking Git status...
git status lib/db.ts

echo.
echo [1/4] Force adding lib directory and database files...
git add -f lib/db.ts
git add -f pages/api/health.ts
git add -f pages/api/auth/login.ts
git add -f pages/api/auth/signup.ts

echo.
echo [2/4] Checking what will be committed...
git status --short

echo.
echo [3/4] Committing database integration files...
git commit -m "CRITICAL: Add database connection file lib/db.ts"

echo.
echo [4/4] Pushing to GitHub...
git push origin main

echo.
echo =====================================
echo    Files should now be on GitHub!
echo =====================================
echo.
echo Vercel will automatically rebuild.
echo.
echo To verify files are on GitHub:
echo   https://github.com/ilabelagent/valifi/tree/main/lib
echo.
echo Check deployment at:
echo   https://vercel.com/dashboard
echo.
pause