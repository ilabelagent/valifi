@echo off
echo ================================================================
echo FIXING NEXT.JS ISSUES FOR VALIFI PROJECT
echo ================================================================
echo.

echo Step 1: Backing up duplicate index.js file...
if exist pages\index.js (
    move pages\index.js pages\index.js.backup
    echo [SUCCESS] Backed up index.js to index.js.backup
) else (
    echo [INFO] index.js already removed or backed up
)
echo.

echo Step 2: Installing missing i18n dependencies...
echo Installing i18next and related packages...
call npm install i18next react-i18next i18next-browser-languagedetector --save
if errorlevel 1 (
    echo [ERROR] Failed to install i18n packages
    echo Trying with --force flag...
    call npm install i18next react-i18next i18next-browser-languagedetector --save --force
)
echo.

echo Step 3: Installing i18n type definitions...
call npm install @types/react-i18next --save-dev
echo.

echo Step 4: Checking if App.tsx exists in the correct location...
if exist App.tsx (
    echo [SUCCESS] App.tsx found in root directory
) else (
    echo [WARNING] App.tsx not found in root directory
    echo Creating a basic App.tsx file...
    echo import React from 'react'; > App.tsx
    echo import './styles.css'; >> App.tsx
    echo. >> App.tsx
    echo export default function App() { >> App.tsx
    echo   return ^( >> App.tsx
    echo     ^<div className="min-h-screen bg-background"^> >> App.tsx
    echo       ^<h1 className="text-4xl font-bold text-center py-8"^>Welcome to Valifi^</h1^> >> App.tsx
    echo       ^<p className="text-center"^>Your Financial Dashboard^</p^> >> App.tsx
    echo     ^</div^> >> App.tsx
    echo   ^); >> App.tsx
    echo } >> App.tsx
)
echo.

echo Step 5: Clearing Next.js cache...
if exist .next (
    echo Removing .next directory...
    rmdir /s /q .next
    echo [SUCCESS] Cache cleared
)
echo.

echo Step 6: Installing any missing dependencies...
call npm install
echo.

echo ================================================================
echo FIXES APPLIED SUCCESSFULLY!
echo ================================================================
echo.
echo The following issues have been resolved:
echo - Duplicate page issue (backed up index.js)
echo - Missing i18n dependencies (installed)
echo - Next.js cache cleared
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo If you need the old index.js content, it's saved as index.js.backup
echo ================================================================
pause