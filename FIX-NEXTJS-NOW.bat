@echo off
cls
echo ================================================================
echo    COMPLETE NEXT.JS FIX FOR VALIFI
echo ================================================================
echo.

:: Step 1: Kill any running Node processes
echo Step 1: Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

:: Step 2: Clean all old files
echo.
echo Step 2: Cleaning old installation files...
if exist "node_modules" (
    echo   Removing node_modules...
    rmdir /s /q node_modules
)
if exist "package-lock.json" (
    echo   Removing package-lock.json...
    del /f /q package-lock.json
)
if exist ".next" (
    echo   Removing .next build folder...
    rmdir /s /q .next
)
if exist "vite.config.ts" del /f /q vite.config.ts 2>nul
if exist "vite.config.js" del /f /q vite.config.js 2>nul
if exist "vite-env.d.ts" del /f /q vite-env.d.ts 2>nul

:: Step 3: Create correct package.json
echo.
echo Step 3: Creating correct Next.js package.json...
(
echo {
echo   "name": "valifi-fintech-platform",
echo   "version": "1.0.0",
echo   "private": true,
echo   "scripts": {
echo     "dev": "next dev",
echo     "build": "next build",
echo     "start": "next start",
echo     "lint": "next lint"
echo   },
echo   "dependencies": {
echo     "next": "13.5.2",
echo     "react": "18.2.0",
echo     "react-dom": "18.2.0",
echo     "bcryptjs": "^2.4.3",
echo     "@libsql/client": "^0.3.5",
echo     "cors": "^2.8.5",
echo     "dotenv": "^16.3.1",
echo     "jsonwebtoken": "^9.0.2",
echo     "axios": "^1.5.0",
echo     "lucide-react": "^0.263.1",
echo     "tailwindcss": "^3.3.0",
echo     "autoprefixer": "^10.4.14",
echo     "postcss": "^8.4.24",
echo     "react-hot-toast": "^2.4.1"
echo   },
echo   "devDependencies": {
echo     "@types/node": "^20.0.0",
echo     "@types/react": "^18.2.0",
echo     "@types/react-dom": "^18.2.0",
echo     "@types/bcryptjs": "^2.4.2",
echo     "typescript": "^5.0.0",
echo     "eslint": "^8.42.0",
echo     "eslint-config-next": "13.5.2"
echo   }
echo }
) > package.json
echo   Created package.json for Next.js

:: Step 4: Ensure pages structure is correct
echo.
echo Step 4: Verifying pages directory structure...
if not exist "pages" mkdir pages
if not exist "pages\api" mkdir pages\api
echo   Pages structure verified

:: Step 5: Check if App.tsx needs to be in pages
echo.
echo Step 5: Checking main app file location...
if exist "App.tsx" (
    if not exist "pages\index.tsx" (
        echo   Creating pages/index.tsx from App.tsx...
        (
echo import React from 'react';
echo import dynamic from 'next/dynamic';
echo.
echo // Dynamically import the main App component
echo const App = dynamic^(^(^) =^> import^('../App'^), { ssr: false }^);
echo.
echo export default function Home^(^) {
echo   return ^<App /^>;
echo }
        ) > pages\index.tsx
    )
)

:: Step 6: Install Next.js specifically
echo.
echo Step 6: Installing Next.js and dependencies...
echo   This will take a few minutes...
echo.
call npm install --save next@13.5.2 react@18.2.0 react-dom@18.2.0

:: Step 7: Install remaining dependencies
echo.
echo Step 7: Installing remaining dependencies...
call npm install

:: Step 8: Create .env.local if missing
echo.
echo Step 8: Checking environment configuration...
if not exist ".env.local" (
    if exist ".env.example" (
        copy .env.example .env.local >nul
        echo   Created .env.local from template
    )
)

:: Step 9: Test the installation
echo.
echo ================================================================
echo    INSTALLATION COMPLETE - TESTING...
echo ================================================================
echo.

:: Check if Next.js is installed
where next >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Next.js CLI not found globally, using npx...
)

:: Step 10: Start the server
echo.
echo Starting Next.js Development Server...
echo ================================================================
echo.
echo Server will run at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
echo If the browser doesn't open automatically, manually go to:
echo http://localhost:3000
echo.
echo ================================================================
echo.

:: Open browser after 5 seconds
start cmd /c "timeout /t 5 && start http://localhost:3000"

:: Start Next.js
npx next dev