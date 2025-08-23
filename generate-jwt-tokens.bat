@echo off
REM Valifi - Quick JWT Token Generator for Windows
REM This generates secure JWT tokens and saves them to a file

echo ===================================
echo VALIFI JWT TOKEN GENERATOR
echo ===================================
echo.

REM Generate random tokens using PowerShell
echo Generating secure JWT tokens...

REM Generate JWT_SECRET (64 characters)
for /f "delims=" %%a in ('powershell -Command "[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString())).Replace('/', '').Replace('+', '').Replace('=', '').Substring(0, 64)"') do set JWT_SECRET=%%a

REM Generate JWT_REFRESH_SECRET (64 characters)
for /f "delims=" %%a in ('powershell -Command "[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString())).Replace('/', '').Replace('+', '').Replace('=', '').Substring(0, 64)"') do set JWT_REFRESH_SECRET=%%a

REM Generate API_KEY (48 characters)
for /f "delims=" %%a in ('powershell -Command "[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString())).Replace('/', '').Replace('+', '').Replace('=', '').Substring(0, 48)"') do set API_KEY=%%a

echo.
echo Successfully generated secure tokens!
echo ===================================
echo.

REM Check if .env.local exists
if exist .env.local (
    echo WARNING: .env.local already exists!
    echo.
    choice /C YN /M "Do you want to update it with new JWT tokens"
    if errorlevel 2 goto :ShowTokens
)

REM Create or update .env.local
echo Creating .env.local file...
(
echo # Turso Database Configuration
echo TURSO_DATABASE_URL=libsql://your-database-name.turso.io
echo TURSO_AUTH_TOKEN=your-turso-auth-token
echo.
echo # JWT Configuration ^(Auto-generated secure tokens^)
echo JWT_SECRET=%JWT_SECRET%
echo JWT_REFRESH_SECRET=%JWT_REFRESH_SECRET%
echo.
echo # API Configuration
echo API_KEY=%API_KEY%
echo.
echo # Next.js Configuration
echo NEXT_PUBLIC_API_URL=http://localhost:3000/api
echo.
echo # Google OAuth ^(Optional^)
echo # GOOGLE_CLIENT_ID=your-google-client-id
echo # GOOGLE_CLIENT_SECRET=your-google-client-secret
echo.
echo # GitHub OAuth ^(Optional^)
echo # GITHUB_CLIENT_ID=your-github-client-id
echo # GITHUB_CLIENT_SECRET=your-github-client-secret
echo.
echo # Environment
echo NODE_ENV=development
echo.
echo # Generated on: %date% %time%
echo # Security Note: Never commit this file to version control!
) > .env.local

echo File created: .env.local
echo.

:ShowTokens
REM Also save to a separate file for Vercel
echo Creating jwt-tokens.txt for Vercel setup...
(
echo ===================================
echo GENERATED JWT TOKENS FOR VERCEL
echo ===================================
echo.
echo Copy these values to your Vercel Environment Variables:
echo https://vercel.com/dashboard/[your-project]/settings/environment-variables
echo.
echo JWT_SECRET:
echo %JWT_SECRET%
echo.
echo JWT_REFRESH_SECRET:
echo %JWT_REFRESH_SECRET%
echo.
echo API_KEY:
echo %API_KEY%
echo.
echo ===================================
echo VERCEL CLI COMMANDS:
echo ===================================
echo.
echo Run these commands in your terminal:
echo.
echo vercel env add JWT_SECRET production
echo ^(Paste: %JWT_SECRET%^)
echo.
echo vercel env add JWT_REFRESH_SECRET production
echo ^(Paste: %JWT_REFRESH_SECRET%^)
echo.
echo vercel env add API_KEY production
echo ^(Paste: %API_KEY%^)
echo.
echo ===================================
echo Generated on: %date% %time%
) > jwt-tokens.txt

echo.
echo ===================================
echo SETUP COMPLETE!
echo ===================================
echo.
echo Files created:
echo - .env.local (with generated tokens)
echo - jwt-tokens.txt (for Vercel setup)
echo.
echo Your secure tokens:
echo -------------------
echo JWT_SECRET: %JWT_SECRET:~0,20%...
echo JWT_REFRESH_SECRET: %JWT_REFRESH_SECRET:~0,20%...
echo API_KEY: %API_KEY:~0,20%...
echo.
echo IMPORTANT: Update these in .env.local:
echo - TURSO_DATABASE_URL
echo - TURSO_AUTH_TOKEN
echo.
echo Next steps:
echo 1. Update Turso credentials in .env.local
echo 2. Run: npm run dev (to test locally)
echo 3. Open jwt-tokens.txt and copy tokens to Vercel
echo 4. Deploy: vercel --prod
echo.
pause