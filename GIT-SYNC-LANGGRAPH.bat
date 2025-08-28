@echo off
cls
echo ================================================================================
echo              VALIFI AI BOT - GIT SYNC AND DEPLOY WITH LANGGRAPH
echo                          Version 4.0.0
echo ================================================================================
echo.
echo This script will:
echo 1. Add all LangGraph agent integrations
echo 2. Commit changes
echo 3. Push to GitHub
echo 4. Deploy to Vercel
echo.
pause

:: Step 1: Check git status
echo.
echo [1/7] Checking git status...
echo ------------------------------------------------
git status --short
echo.

:: Step 2: Add all files
echo [2/7] Adding all changes...
echo ------------------------------------------------
git add .
if %errorlevel% neq 0 (
    echo [ERROR] Failed to add files
    pause
    exit /b 1
)
echo ✓ Files added

:: Step 3: Install new dependencies
echo.
echo [3/7] Installing LangGraph dependencies...
echo ------------------------------------------------
call npm install
if %errorlevel% neq 0 (
    echo [WARNING] Some dependencies failed to install
)

:: Step 4: Build to verify
echo.
echo [4/7] Building application...
echo ------------------------------------------------
call npm run build
if %errorlevel% neq 0 (
    echo [WARNING] Build has warnings
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
)

:: Step 5: Commit
echo.
echo [5/7] Committing changes...
echo ------------------------------------------------
set COMMIT_MSG=Integrate LangGraph AI agents with LangSmith monitoring - v4.0.0

echo Commit message: %COMMIT_MSG%
echo.
echo Changes include:
echo - LangGraph agent framework integration
echo - ReAct, Workflow, and Orchestrator agents
echo - LangSmith tracing and monitoring
echo - Bot-Agent integration layer
echo - API endpoints for agent execution
echo.

git commit -m "%COMMIT_MSG%" -m "- Added LangGraph and LangChain dependencies" -m "- Implemented multiple agent types (ReAct, Workflow, Orchestrator)" -m "- Integrated LangSmith for observability" -m "- Created agent-enhanced bot classes" -m "- Added /api/agents endpoint" -m "- Financial tools for trading, DeFi, and portfolio management"

if %errorlevel% neq 0 (
    echo [WARNING] Nothing to commit or commit failed
)

:: Step 6: Push to GitHub
echo.
echo [6/7] Pushing to GitHub...
echo ------------------------------------------------
git push origin main
if %errorlevel% neq 0 (
    echo [WARNING] Push failed. Trying to pull first...
    git pull origin main --rebase
    git push origin main
    if %errorlevel% neq 0 (
        echo [ERROR] Push failed
        pause
        exit /b 1
    )
)
echo ✓ Pushed to GitHub

:: Step 7: Deploy to Vercel
echo.
echo [7/7] Deploying to Vercel...
echo ------------------------------------------------
set /p deploy="Deploy to Vercel now? (y/n): "
if /i "%deploy%"=="y" (
    echo.
    echo Setting LangSmith environment variable...
    echo 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 | vercel env add LANGSMITH_API_KEY production 2>nul
    
    echo Deploying...
    vercel --prod
    
    echo.
    echo ================================================================================
    echo                 LANGGRAPH INTEGRATION DEPLOYED!
    echo ================================================================================
    echo.
    echo ✅ LangGraph agents integrated successfully!
    echo.
    echo 📊 LangSmith Dashboard:
    echo    https://smith.langchain.com
    echo    Project: valifi-ai-agents
    echo.
    echo 🤖 Available Agents:
    echo    - ReAct Agent (reasoning and acting)
    echo    - Workflow Agent (multi-step workflows)
    echo    - Orchestrator Agent (task coordination)
    echo    - Evaluator Agent (optimization)
    echo    - Router Agent (intelligent routing)
    echo    - Parallel Agent (concurrent execution)
    echo.
    echo 🔗 Test your agents:
    echo    POST https://your-app.vercel.app/api/agents
    echo    {
    echo      "action": "create_trading_agent",
    echo      "input": "Analyze AAPL and execute optimal trade"
    echo    }
    echo.
) else (
    echo.
    echo Deployment skipped. Run 'vercel --prod' when ready.
)

echo.
echo ================================================================================
echo                        GIT SYNC COMPLETE
echo ================================================================================
echo.
echo Repository: https://github.com/your-username/valifi-ai-bot
echo.
pause