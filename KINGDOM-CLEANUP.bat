@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║              VALIFI KINGDOM CLEANUP UTILITY                       ║
echo ║         Smart Cleanup of Deprecated and Redundant Files           ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo This utility will:
echo   • Move deprecated files to a backup folder
echo   • Keep all essential Kingdom MCP files
echo   • Preserve all 51+ bot files
echo   • Clean up redundant scripts and documentation
echo   • Organize your project structure
echo.
echo ══════════════════════════════════════════════════════════════════════
echo.
echo                     ⚠️  IMPORTANT NOTICE ⚠️
echo.
echo   Files will be MOVED to _deprecated_backup folder, not deleted.
echo   You can restore any file later if needed.
echo.
echo ══════════════════════════════════════════════════════════════════════
echo.

:menu
echo [1] 🧹 RUN CLEANUP (Move deprecated files to backup)
echo [2] 📋 LIST BACKUP (Show files in backup folder)
echo [3] 🔄 RESTORE FILE (Restore a specific file from backup)
echo [4] ❌ EXIT
echo.

set /p choice="Select an option [1-4]: "

if "%choice%"=="1" goto cleanup
if "%choice%"=="2" goto list
if "%choice%"=="3" goto restore
if "%choice%"=="4" goto exit

:cleanup
cls
echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                      RUNNING CLEANUP                              ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo Starting cleanup process...
echo.

node kingdom-cleanup.js

echo.
echo ══════════════════════════════════════════════════════════════════════
echo.
echo ✅ Cleanup complete!
echo.
echo   • Deprecated files have been moved to: _deprecated_backup\
echo   • Your project is now clean and organized
echo   • All essential Kingdom files preserved
echo   • All 51+ bot files intact
echo.
echo 📝 Review cleanup-report.json for details
echo.
echo Press any key to return to menu...
pause >nul
cls
goto menu

:list
cls
echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                    FILES IN BACKUP FOLDER                         ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

node kingdom-cleanup.js list

echo.
echo Press any key to return to menu...
pause >nul
cls
goto menu

:restore
cls
echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                      RESTORE FILE                                 ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo Enter the filename to restore (or 'list' to see available files):
echo.

set /p filename="Filename: "

if "%filename%"=="list" (
    node kingdom-cleanup.js list
) else (
    node kingdom-cleanup.js restore %filename%
)

echo.
echo Press any key to return to menu...
pause >nul
cls
goto menu

:exit
cls
echo.
echo ══════════════════════════════════════════════════════════════════════
echo.
echo     👑 Valifi Kingdom Cleanup Complete! 👑
echo.
echo     Your project is now clean and organized.
echo.
echo ══════════════════════════════════════════════════════════════════════
echo.
timeout /t 2 /nobreak >nul
exit
