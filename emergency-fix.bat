@echo off
echo.
echo =====================================
echo    EMERGENCY FIX - Inline Database
echo =====================================
echo.

echo [1/3] Updated API files to include database connection inline...
echo       - login.ts now has database client built-in
echo       - signup.ts now has database client built-in
echo       - health.ts now has database client built-in
echo.

echo [2/3] Committing emergency fix...
git add pages/api/auth/login.ts
git add pages/api/auth/signup.ts
git add pages/api/health.ts
git commit -m "EMERGENCY FIX: Inline database connection in API routes"

echo.
echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo =====================================
echo    EMERGENCY FIX DEPLOYED!
echo =====================================
echo.
echo The API routes now have the database connection
echo built directly into them, so they don't need lib/db.ts
echo.
echo Vercel will automatically rebuild.
echo.
echo IMPORTANT: Make sure these environment variables
echo are set in Vercel Dashboard:
echo.
echo   - TURSO_DATABASE_URL
echo   - TURSO_AUTH_TOKEN
echo   - JWT_SECRET
echo   - JWT_REFRESH_SECRET
echo.
pause