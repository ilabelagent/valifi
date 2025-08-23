@echo off
echo.
echo =====================================
echo    Valifi - Update Dependencies
echo =====================================
echo.

echo [1/4] Removing node_modules and lock file...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo [2/4] Clearing npm cache...
npm cache clean --force

echo [3/4] Installing updated dependencies...
npm install

echo [4/4] Checking for vulnerabilities...
npm audit

echo.
echo =====================================
echo    UPDATE COMPLETE!
echo =====================================
echo.
echo Next.js has been updated to version 15.1.3
echo React has been updated to version 19.0.0
echo.
echo IMPORTANT NOTES:
echo - Review any breaking changes in Next.js 15
echo - Test all features after update
echo - Run 'npm run dev' to start development
echo.
pause