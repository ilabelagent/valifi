@echo off
cls
color 0E
echo ============================================
echo     VALIFI BOT - FINAL FIX SOLUTION
echo ============================================
echo.

:: Kill any existing Node processes
echo [1] Stopping any existing Node processes...
taskkill /F /IM node.exe 2>nul
echo    Done.

echo.
echo [2] Setting up environment...
cd /d "C:\Users\josh\Desktop\GodBrainAI\valifi"
set PATH=C:\Program Files\nodejs;%PATH%

echo.
echo [3] Current directory:
echo    %CD%

echo.
echo [4] Reinstalling dependencies...
echo    This will take 2-3 minutes...
echo.
call "C:\Program Files\nodejs\npm.cmd" install --force --legacy-peer-deps

echo.
echo [5] Installing Next.js specifically...
call "C:\Program Files\nodejs\npm.cmd" install next@latest react@latest react-dom@latest --save --force

echo.
echo ============================================
echo     STARTING VALIFI BOT SERVER
echo ============================================
echo.
echo Server will start on: http://localhost:3000
echo.
echo When you see "Compiled successfully":
echo   1. Open your browser
echo   2. Go to http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ============================================
echo.

:: Start the server
call "C:\Program Files\nodejs\npm.cmd" run dev

:: If it fails, try alternative
if errorlevel 1 (
    echo.
    echo Trying alternative start method...
    "C:\Program Files\nodejs\node.exe" node_modules\next\dist\bin\next dev
)

pause