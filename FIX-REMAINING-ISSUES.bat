@echo off
cls
echo ================================================================
echo    FIXING REMAINING NEXT.JS ISSUES
echo ================================================================
echo.

:: Fix 1: Remove duplicate index file
echo Step 1: Removing duplicate index.js file...
if exist "pages\index.js" (
    del /f /q pages\index.js
    echo   [OK] Removed duplicate index.js
) else (
    echo   [OK] No duplicate found
)

:: Fix 2: Install missing i18next dependencies
echo.
echo Step 2: Installing missing i18n dependencies...
call npm install --save i18next react-i18next i18next-browser-languagedetector

:: Fix 3: Install other missing UI dependencies
echo.
echo Step 3: Installing missing UI dependencies...
call npm install --save react-hot-toast lucide-react @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot class-variance-authority clsx tailwind-merge

:: Fix 4: Create missing public directory files
echo.
echo Step 4: Creating public directory assets...
if not exist "public" mkdir public
if not exist "public\favicon.ico" (
    echo Creating default favicon...
    echo. > public\favicon.ico
)

:: Fix 5: Fix any TypeScript issues
echo.
echo Step 5: Updating TypeScript configuration...
(
echo {
echo   "compilerOptions": {
echo     "target": "es5",
echo     "lib": ["dom", "dom.iterable", "esnext"],
echo     "allowJs": true,
echo     "skipLibCheck": true,
echo     "strict": false,
echo     "noEmit": true,
echo     "esModuleInterop": true,
echo     "module": "esnext",
echo     "moduleResolution": "bundler",
echo     "resolveJsonModule": true,
echo     "isolatedModules": true,
echo     "jsx": "preserve",
echo     "incremental": true,
echo     "baseUrl": ".",
echo     "paths": {
echo       "@/*": ["./*"]
echo     }
echo   },
echo   "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
echo   "exclude": ["node_modules"]
echo }
) > tsconfig.json

echo.
echo ================================================================
echo    FIXES APPLIED - RESTARTING SERVER
echo ================================================================
echo.

:: Kill existing Next.js process
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

:: Restart Next.js
echo Starting Next.js with fixes applied...
echo.
echo Server URL: http://localhost:3000
echo.

:: Open browser
start cmd /c "timeout /t 3 && start http://localhost:3000"

:: Run Next.js
npx next dev