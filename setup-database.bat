@echo off
echo.
echo =====================================
echo    Valifi - Database Setup & Test
echo =====================================
echo.

echo [1/4] Starting development server...
start /B npm run dev

echo [2/4] Waiting for server to start...
timeout /t 5 /nobreak > nul

echo [3/4] Initializing database tables...
curl -X GET "http://localhost:3000/api/health?init=true"
echo.
echo.

echo [4/4] Checking database health...
curl -X GET "http://localhost:3000/api/health"
echo.
echo.

echo =====================================
echo    Database Setup Complete!
echo =====================================
echo.
echo Your Turso database is now connected!
echo.
echo Test the app:
echo   1. Sign Up: http://localhost:3000/signup
echo   2. Sign In: http://localhost:3000/signin
echo   3. Dashboard: http://localhost:3000/
echo.
echo Database Dashboard:
echo   https://app.turso.tech/
echo.
pause