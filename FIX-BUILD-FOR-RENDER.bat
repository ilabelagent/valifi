@echo off
echo ========================================
echo    FIXING BUILD ERRORS FOR RENDER
echo ========================================
echo.

REM Install missing dependencies
echo Installing missing dependencies...
echo.

echo [1/2] Installing @heroicons/react...
call npm install @heroicons/react@latest --save --force

echo.
echo [2/2] Installing additional dependencies if needed...
call npm install --force --legacy-peer-deps

echo.
echo Dependencies installed!
echo.

REM Create missing directories
echo Creating missing directories...
if not exist "lib\agents" mkdir lib\agents
if not exist "lib\core" mkdir lib\core
if not exist "lib\db" mkdir lib\db

echo.
echo ========================================
echo    Creating Missing Module Files
echo ========================================
echo.

pause