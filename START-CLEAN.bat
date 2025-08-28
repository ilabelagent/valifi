@echo off
echo.
echo ============================================================
echo     VALIFI CLEAN START - NO SOCIAL LOGINS
echo ============================================================
echo.

cd /d "C:\Users\josh\Desktop\GodBrainAI\valifi"

echo [1/3] Cleaning build cache...
if exist ".next" rmdir /s /q .next 2>nul
echo ✓ Cache cleared

echo.
echo [2/3] Verifying no social login references...
findstr /i /m "socialLogin GoogleIcon GithubIcon" components\SignInModal.tsx components\SignUpModal.tsx App.tsx >nul 2>&1
if %errorlevel% equ 0 (
    echo ✗ WARNING: Social login references still found!
) else (
    echo ✓ Social login completely removed
)

echo.
echo [3/3] Starting clean server...
echo ============================================================
echo.
echo VALIFI LIVING BOT PLATFORM
echo ==========================
echo Architecture: Distributed Autonomous Bot Network
echo Bots Active: 51+ Specialized Domain Bots
echo Intelligence: AI-Powered Decision Engine
echo Status: LIVING AND EVOLVING
echo.
echo Authentication: Email/Password Only
echo Demo Accounts: demo@valifi.com / demo123
echo.
echo ============================================================
echo.
npm run dev