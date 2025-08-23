@echo off
echo.
echo =====================================
echo    Valifi - Fix Deployment
echo =====================================
echo.

echo [1/3] Adding missing files to Git...
git add lib/db.ts
git add .env.example
git add TURSO-SETUP.md
git add DEPLOYMENT-READY.md
git add pages/api/auth/login.ts
git add pages/api/auth/signup.ts
git add pages/api/health.ts
git add src/auth/components/SignInForm.tsx
git add src/auth/components/SignUpForm.tsx
git add pages/signin.tsx
git add pages/signup.tsx

echo.
echo [2/3] Committing changes...
git commit -m "Add Turso database integration files"

echo.
echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo =====================================
echo    FIX DEPLOYED!
echo =====================================
echo.
echo Vercel will automatically rebuild.
echo Check deployment at: https://vercel.com/dashboard
echo.
pause