@echo off
REM VALIFI KINGDOM ORCHESTRATION SCRIPT

echo ╔════════════════════════════════════════════════════════╗
echo ║         VALIFI KINGDOM ORCHESTRATION SYSTEM           ║
echo ╚════════════════════════════════════════════════════════╝

if "%1"=="start" goto start_kingdom
if "%1"=="deploy" goto deploy_production
goto usage

:start_kingdom
echo.
echo 🏰 Starting Valifi Kingdom...
echo.
echo   Starting MCP server...
start /B node kingdom-mcp-server.js
echo   MCP server started
echo.
echo   Starting Next.js application...
start /B npm run dev
echo   Next.js started
echo.
echo ✅ Kingdom is now running!
echo   Dashboard: http://localhost:3000
echo   Monitor: Open kingdom-dashboard.html
pause
goto end

:deploy_production
echo.
echo 🚀 Deploying to production...
call npm run build
git add -A
git commit -m "Kingdom deployment %date% %time%"
git push origin main
echo ✅ Deployed to production!
pause
goto end

:usage
echo Usage: kingdom-orchestrate.bat {start^|deploy}

:end
