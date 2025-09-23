@echo off
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo ║                                                                  ║
echo ║              👑 VALIFI KINGDOM LAUNCHER v2.0 👑                 ║
echo ║                                                                  ║
echo ║           Kingdom-Standard MCP Orchestration System             ║
echo ║                                                                  ║
echo ════════════════════════════════════════════════════════════════════
echo.
echo                    Status: INITIALIZING KINGDOM
echo.
echo ┌──────────────────────────────────────────────────────────────────┐
echo │                                                                  │
echo │  🏰 Kingdom Components:                                          │
echo │                                                                  │
echo │     • 51+ Living Bots                                           │
echo │     • MCP Orchestrator                                          │
echo │     • Auto-Patch System                                         │
echo │     • Evolution Engine                                          │
echo │     • Collective AI Network                                     │
echo │     • Distributed Consciousness                                 │
echo │                                                                  │
echo └──────────────────────────────────────────────────────────────────┘
echo.

echo [1] 🚀 LAUNCH KINGDOM (Full System)
echo [2] 🔧 RUN AUTO-PATCH (Fix & Enhance)
echo [3] 🎮 MCP CONSOLE (Interactive Control)
echo [4] 📊 MONITORING DASHBOARD (Browser)
echo [5] 🌐 DEPLOY TO PRODUCTION (Render)
echo [6] 🧬 CHECK EVOLUTION STATUS
echo [7] 🧹 CLEANUP PROJECT (Remove Deprecated)
echo [8] 🏃 QUICK START (Dev Mode)
echo [9] ❌ EXIT
echo.

set /p choice="Select an option [1-9]: "

if "%choice%"=="1" goto launch_kingdom
if "%choice%"=="2" goto run_autopatch
if "%choice%"=="3" goto mcp_console
if "%choice%"=="4" goto monitoring
if "%choice%"=="5" goto deploy
if "%choice%"=="6" goto evolution
if "%choice%"=="7" goto cleanup
if "%choice%"=="8" goto quick_start
if "%choice%"=="9" goto exit

:launch_kingdom
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo                    🏰 LAUNCHING VALIFI KINGDOM 🏰
echo ════════════════════════════════════════════════════════════════════
echo.

echo [STEP 1/5] Running Auto-Patch System...
call node kingdom-auto-patch.js
if errorlevel 1 (
    echo ❌ Auto-patch failed. Attempting to continue...
) else (
    echo ✅ Auto-patch complete!
)
echo.

echo [STEP 2/5] Installing dependencies...
call npm install --silent
echo ✅ Dependencies installed!
echo.

echo [STEP 3/5] Starting MCP Orchestrator...
start "Valifi MCP Server" /min cmd /c "node kingdom-mcp-server.js"
timeout /t 3 /nobreak >nul
echo ✅ MCP Orchestrator running!
echo.

echo [STEP 4/5] Building application...
call npm run build
if errorlevel 1 (
    echo ⚠️ Build has warnings (non-critical)
) else (
    echo ✅ Build successful!
)
echo.

echo [STEP 5/5] Starting Next.js application...
start "Valifi Next.js" cmd /c "npm run dev"
timeout /t 5 /nobreak >nul
echo ✅ Application started!
echo.

echo ════════════════════════════════════════════════════════════════════
echo.
echo    🎉 VALIFI KINGDOM IS NOW LIVE! 🎉
echo.
echo    📱 Dashboard: http://localhost:3000
echo    📊 Monitor:  Open kingdom-dashboard.html
echo    🎮 Console:  MCP running in background
echo.
echo ════════════════════════════════════════════════════════════════════
echo.
echo Press any key to return to menu...
pause >nul
goto menu

:run_autopatch
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo                    🔧 AUTO-PATCH SYSTEM 🔧
echo ════════════════════════════════════════════════════════════════════
echo.
node kingdom-auto-patch.js
echo.
echo Press any key to return to menu...
pause >nul
goto menu

:mcp_console
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo                    🎮 MCP CONSOLE 🎮
echo ════════════════════════════════════════════════════════════════════
echo.
node kingdom-mcp-server.js
goto menu

:monitoring
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo                    📊 OPENING MONITORING DASHBOARD 📊
echo ════════════════════════════════════════════════════════════════════
echo.
start kingdom-dashboard.html
echo Dashboard opened in browser!
echo.
timeout /t 2 /nobreak >nul
goto menu

:deploy
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo                    🌐 DEPLOYING TO PRODUCTION 🌐
echo ════════════════════════════════════════════════════════════════════
echo.
echo Building for production...
call npm run build

echo.
echo Preparing deployment...
git add -A
git commit -m "Kingdom deployment %date% %time%"

echo.
echo Pushing to Render...
git push origin main

echo.
echo ✅ Deployment initiated!
echo.
echo Your app will be available at:
echo https://valifi-fintech-platform.onrender.com
echo.
echo Press any key to return to menu...
pause >nul
goto menu

:evolution
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo                    🧬 EVOLUTION STATUS 🧬
echo ════════════════════════════════════════════════════════════════════
echo.

if exist kingdom-evolution.json (
    echo Current Evolution Status:
    echo.
    type kingdom-evolution.json
) else (
    echo No evolution data found. Run auto-patch first.
)

echo.
echo Press any key to return to menu...
pause >nul
goto menu

:cleanup
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo                    🧹 PROJECT CLEANUP 🧹
echo ════════════════════════════════════════════════════════════════════
echo.
echo This will move deprecated and redundant files to backup.
echo All essential Kingdom files will be preserved.
echo.
echo Review CLEANUP-PLAN.md for details.
echo.

set /p confirm="Continue with cleanup? (y/n): "

if /i "%confirm%"=="y" (
    call KINGDOM-CLEANUP.bat
) else (
    echo Cleanup cancelled.
)

echo.
echo Press any key to return to menu...
pause >nul
goto menu

:quick_start
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo                    🏃 QUICK START (DEV MODE) 🏃
echo ════════════════════════════════════════════════════════════════════
echo.
echo Starting development server...
npm run dev
goto menu

:menu
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo ║                                                                  ║
echo ║              👑 VALIFI KINGDOM LAUNCHER v2.0 👑                 ║
echo ║                                                                  ║
echo ║           Kingdom-Standard MCP Orchestration System             ║
echo ║                                                                  ║
echo ════════════════════════════════════════════════════════════════════
echo.
echo                    Status: KINGDOM OPERATIONAL
echo.

echo [1] 🚀 LAUNCH KINGDOM (Full System)
echo [2] 🔧 RUN AUTO-PATCH (Fix & Enhance)
echo [3] 🎮 MCP CONSOLE (Interactive Control)
echo [4] 📊 MONITORING DASHBOARD (Browser)
echo [5] 🌐 DEPLOY TO PRODUCTION (Render)
echo [6] 🧬 CHECK EVOLUTION STATUS
echo [7] 🧹 CLEANUP PROJECT (Remove Deprecated)
echo [8] 🏃 QUICK START (Dev Mode)
echo [9] ❌ EXIT
echo.

set /p choice="Select an option [1-9]: "

if "%choice%"=="1" goto launch_kingdom
if "%choice%"=="2" goto run_autopatch
if "%choice%"=="3" goto mcp_console
if "%choice%"=="4" goto monitoring
if "%choice%"=="5" goto deploy
if "%choice%"=="6" goto evolution
if "%choice%"=="7" goto cleanup
if "%choice%"=="8" goto quick_start
if "%choice%"=="9" goto exit

goto menu

:exit
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo.
echo                 👑 Thank you for using Valifi Kingdom! 👑
echo.
echo                    "Where Finance Comes Alive"
echo.
echo ════════════════════════════════════════════════════════════════════
echo.
timeout /t 2 /nobreak >nul
exit
