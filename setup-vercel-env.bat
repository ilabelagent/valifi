@echo off
cls
echo ============================================
echo    VALIFI - VERCEL ENVIRONMENT SETUP
echo ============================================
echo.

:: Check if Vercel CLI is installed
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    call npm i -g vercel
)

echo Setting production environment variables in Vercel...
echo.

:: NEON DATABASE VARIABLES
echo Setting database variables...
echo postgresql://neondb_owner:npg_5kwo8vhredaX@ep-proud-mountain-ady8h1sc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require | vercel env add DATABASE_URL production
echo postgresql://neondb_owner:npg_5kwo8vhredaX@ep-proud-mountain-ady8h1sc.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require | vercel env add DATABASE_URL_UNPOOLED production
echo ep-proud-mountain-ady8h1sc-pooler.c-2.us-east-1.aws.neon.tech | vercel env add PGHOST production
echo neondb_owner | vercel env add PGUSER production
echo neondb | vercel env add PGDATABASE production
echo npg_5kwo8vhredaX | vercel env add PGPASSWORD production
echo postgresql://neondb_owner:npg_5kwo8vhredaX@ep-proud-mountain-ady8h1sc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require | vercel env add POSTGRES_URL production
echo postgresql://neondb_owner:npg_5kwo8vhredaX@ep-proud-mountain-ady8h1sc.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require | vercel env add POSTGRES_URL_NON_POOLING production
echo postgresql://neondb_owner:npg_5kwo8vhredaX@ep-proud-mountain-ady8h1sc-pooler.c-2.us-east-1.aws.neon.tech/neondb?connect_timeout=15^&sslmode=require | vercel env add POSTGRES_PRISMA_URL production

:: NEON AUTH
echo Setting Neon auth variables...
echo 62b26637-ad02-43eb-a444-2c89b3ef5215 | vercel env add NEXT_PUBLIC_STACK_PROJECT_ID production
echo pck_y08v1c589fh0grtjdnhganb5jf18wh954k60pjpgx7hbg | vercel env add NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY production
echo ssk_c9wdb9qbz342atsm0gwy2v24d5jzwreytnj9m6zms3fw8 | vercel env add STACK_SECRET_SERVER_KEY production

:: DATABASE SETTINGS
echo Setting database configuration...
echo true | vercel env add USE_POSTGRES production
echo 20 | vercel env add DB_POOL_SIZE production

:: SECURITY - Generate random tokens
echo Generating security tokens...
set JWT_SECRET=%random%%random%%random%%random%%random%%random%%random%%random%%random%%random%%random%%random%%random%%random%%random%%random%
set JWT_REFRESH_SECRET=%random%%random%%random%%random%%random%%random%%random%%random%%random%%random%%random%%random%%random%%random%%random%%random%
set ENCRYPTION_KEY=%random%%random%%random%%random%%random%%random%%random%%random%
set SESSION_SECRET=%random%%random%%random%%random%%random%%random%%random%%random%

echo %JWT_SECRET% | vercel env add JWT_SECRET production
echo %JWT_REFRESH_SECRET% | vercel env add JWT_REFRESH_SECRET production
echo %ENCRYPTION_KEY% | vercel env add ENCRYPTION_KEY production
echo %SESSION_SECRET% | vercel env add SESSION_SECRET production

:: APPLICATION SETTINGS
echo Setting application configuration...
echo production | vercel env add NODE_ENV production
echo https://valifi.vercel.app/api | vercel env add NEXT_PUBLIC_API_URL production

:: BOT CONFIGURATION
echo Setting bot configuration...
echo 100 | vercel env add BOT_RATE_LIMIT production
echo true | vercel env add BOT_EVOLUTION_ENABLED production
echo true | vercel env add NEXT_PUBLIC_LIVE_PATCH production
echo enabled | vercel env add NEXT_PUBLIC_BOT_EVOLUTION production

:: FEATURE FLAGS
echo Setting feature flags...
echo true | vercel env add ENABLE_TRADING_BOTS production
echo true | vercel env add ENABLE_DEFI production
echo true | vercel env add ENABLE_P2P production
echo true | vercel env add ENABLE_STAKING production
echo true | vercel env add ENABLE_NFT production
echo true | vercel env add ENABLE_AI_ASSISTANT production
echo true | vercel env add ENABLE_2FA production
echo false | vercel env add ENABLE_DEMO_MODE production

echo.
echo ============================================
echo    Environment Variables Set!
echo ============================================
echo.
echo IMPORTANT NEXT STEPS:
echo.
echo 1. Add your OpenAI API key manually:
echo    vercel env add OPENAI_API_KEY production
echo.
echo 2. Run database migrations:
echo    run-neon-migrations.bat
echo.
echo 3. Deploy to production:
echo    vercel --prod
echo.
echo 4. After deployment, update the API URL:
echo    vercel env add NEXT_PUBLIC_API_URL production
echo    (with your actual Vercel URL)
echo.
pause