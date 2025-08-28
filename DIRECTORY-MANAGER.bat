@echo off
cls
echo ===============================================
echo    VALIFI PROJECT DIRECTORY MANAGER
echo ===============================================
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: Set the project directory
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

:MENU
echo.
echo Select an option:
echo ===============================================
echo 1. Generate Full Project Report
echo 2. View Directory Tree
echo 3. Show Project Statistics
echo 4. Analyze Bot Modules
echo 5. Open HTML Explorer
echo 6. Generate Directory JSON
echo 7. Clean Backup Files
echo 8. Check Project Health
echo 9. Exit
echo ===============================================
echo.

set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto FULL_REPORT
if "%choice%"=="2" goto TREE_VIEW
if "%choice%"=="3" goto STATISTICS
if "%choice%"=="4" goto BOT_ANALYSIS
if "%choice%"=="5" goto HTML_EXPLORER
if "%choice%"=="6" goto JSON_EXPORT
if "%choice%"=="7" goto CLEAN_BACKUP
if "%choice%"=="8" goto HEALTH_CHECK
if "%choice%"=="9" goto END

echo Invalid choice. Please try again.
goto MENU

:FULL_REPORT
echo.
echo ===============================================
echo    GENERATING FULL PROJECT REPORT
echo ===============================================
echo.

:: Run the directory listing tool
node list-directory.js all > project-report.txt 2>&1

if %errorlevel% equ 0 (
    echo [SUCCESS] Report generated: project-report.txt
    echo.
    echo Report Contents:
    echo ---------------
    type project-report.txt | more
) else (
    echo [ERROR] Failed to generate report
)

pause
goto MENU

:TREE_VIEW
echo.
echo ===============================================
echo    DIRECTORY TREE VIEW
echo ===============================================
echo.

node list-directory.js tree

pause
goto MENU

:STATISTICS
echo.
echo ===============================================
echo    PROJECT STATISTICS
echo ===============================================
echo.

node list-directory.js stats

pause
goto MENU

:BOT_ANALYSIS
echo.
echo ===============================================
echo    BOT MODULES ANALYSIS
echo ===============================================
echo.

node list-directory.js modules

echo.
echo Checking individual bot directories...
echo.

for /d %%d in (bots\*) do (
    if exist "%%d\*.js" (
        echo Found: %%d
        dir /b "%%d\*.js" 2>nul | findstr /i "Bot.js$" >nul
        if %errorlevel% equ 0 (
            echo   [OK] Main bot file found
        ) else (
            echo   [WARNING] No main bot file found
        )
    )
)

pause
goto MENU

:HTML_EXPLORER
echo.
echo ===============================================
echo    OPENING HTML DIRECTORY EXPLORER
echo ===============================================
echo.

if exist "directory-explorer.html" (
    echo Opening in default browser...
    start "" "directory-explorer.html"
    echo [SUCCESS] Explorer opened
) else (
    echo [ERROR] directory-explorer.html not found
    echo Please ensure the file exists in the project directory
)

pause
goto MENU

:JSON_EXPORT
echo.
echo ===============================================
echo    GENERATING DIRECTORY JSON
echo ===============================================
echo.

:: Create a Node.js script to generate JSON
echo const fs = require('fs'); > generate-json.js
echo const path = require('path'); >> generate-json.js
echo. >> generate-json.js
echo function getDirectoryStructure(dirPath, level = 0) { >> generate-json.js
echo     const items = []; >> generate-json.js
echo     const files = fs.readdirSync(dirPath); >> generate-json.js
echo     files.forEach(file =^> { >> generate-json.js
echo         const filePath = path.join(dirPath, file); >> generate-json.js
echo         const stats = fs.statSync(filePath); >> generate-json.js
echo         const item = { >> generate-json.js
echo             name: file, >> generate-json.js
echo             path: filePath, >> generate-json.js
echo             type: stats.isDirectory() ? 'directory' : 'file', >> generate-json.js
echo             size: stats.size >> generate-json.js
echo         }; >> generate-json.js
echo         if (stats.isDirectory() ^&^& level ^< 2 ^&^& !file.includes('node_modules') ^&^& !file.includes('.git')) { >> generate-json.js
echo             item.children = getDirectoryStructure(filePath, level + 1); >> generate-json.js
echo         } >> generate-json.js
echo         items.push(item); >> generate-json.js
echo     }); >> generate-json.js
echo     return items; >> generate-json.js
echo } >> generate-json.js
echo. >> generate-json.js
echo const structure = getDirectoryStructure('.'); >> generate-json.js
echo fs.writeFileSync('directory-structure.json', JSON.stringify(structure, null, 2)); >> generate-json.js
echo console.log('Directory structure exported to directory-structure.json'); >> generate-json.js

node generate-json.js

if %errorlevel% equ 0 (
    echo [SUCCESS] JSON file created: directory-structure.json
    del generate-json.js
) else (
    echo [ERROR] Failed to generate JSON
)

pause
goto MENU

:CLEAN_BACKUP
echo.
echo ===============================================
echo    CLEANING BACKUP FILES
echo ===============================================
echo.

echo Warning: This will remove backup directories and files.
set /p confirm="Are you sure? (Y/N): "

if /i "%confirm%"=="Y" (
    echo.
    echo Cleaning backup directories...
    
    if exist backup (
        echo Removing backup directory...
        rmdir /s /q backup 2>nul
        echo [OK] backup directory removed
    )
    
    echo Removing .bak files...
    del /s /q *.bak 2>nul
    
    echo Removing .old files...
    del /s /q *.old 2>nul
    
    echo Removing temporary files...
    del /s /q *.tmp 2>nul
    del /s /q ~*.* 2>nul
    
    echo.
    echo [SUCCESS] Cleanup completed
) else (
    echo Cleanup cancelled
)

pause
goto MENU

:HEALTH_CHECK
echo.
echo ===============================================
echo    PROJECT HEALTH CHECK
echo ===============================================
echo.

echo Checking critical files...
echo.

:: Check package.json
if exist package.json (
    echo [OK] package.json found
) else (
    echo [ERROR] package.json missing
)

:: Check node_modules
if exist node_modules (
    echo [OK] node_modules directory found
) else (
    echo [WARNING] node_modules not found - run npm install
)

:: Check environment files
if exist .env.local (
    echo [OK] .env.local found
) else (
    echo [WARNING] .env.local missing
)

:: Check vercel.json
if exist vercel.json (
    echo [OK] vercel.json found
) else (
    echo [WARNING] vercel.json missing
)

:: Check Next.js config
if exist next.config.js (
    echo [OK] next.config.js found
) else (
    echo [ERROR] next.config.js missing
)

:: Check bots directory
if exist bots (
    echo [OK] bots directory found
    dir /b bots | find /c /v "" > temp.txt
    set /p bot_count=<temp.txt
    del temp.txt
    echo     Found %bot_count% bot modules
) else (
    echo [ERROR] bots directory missing
)

:: Check components directory
if exist components (
    echo [OK] components directory found
    dir /b components\*.tsx | find /c /v "" > temp.txt
    set /p comp_count=<temp.txt
    del temp.txt
    echo     Found %comp_count% components
) else (
    echo [ERROR] components directory missing
)

:: Check pages/api directory
if exist pages\api (
    echo [OK] pages/api directory found
) else (
    echo [WARNING] pages/api directory missing
)

:: Check for TypeScript errors
echo.
echo Checking TypeScript configuration...
if exist tsconfig.json (
    echo [OK] tsconfig.json found
    
    :: Try to run TypeScript check if tsc is available
    where tsc >nul 2>&1
    if %errorlevel% equ 0 (
        echo Running TypeScript check...
        npx tsc --noEmit 2>ts-errors.txt
        if %errorlevel% equ 0 (
            echo [OK] No TypeScript errors found
            del ts-errors.txt 2>nul
        ) else (
            echo [WARNING] TypeScript errors detected
            echo See ts-errors.txt for details
        )
    ) else (
        echo [INFO] TypeScript compiler not found, skipping type check
    )
) else (
    echo [WARNING] tsconfig.json missing
)

echo.
echo ===============================================
echo Health check complete!
echo ===============================================

pause
goto MENU

:END
echo.
echo Thank you for using Valifi Directory Manager!
echo.
pause
exit /b 0