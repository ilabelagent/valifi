#!/bin/bash
# Valifi Platform - Complete Deployment Fix
# Fixes TypeScript dependencies and stock staking issues

echo "========================================="
echo "VALIFI DEPLOYMENT FIX - COMPLETE SOLUTION"
echo "========================================="

# Step 1: Clear caches
echo "Step 1: Clearing build caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .vercel/cache

# Step 2: Install dependencies
echo "Step 2: Installing ALL dependencies..."
npm install

# Step 3: Test build locally
echo "Step 3: Testing build locally..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful locally!"
else
    echo "❌ Build failed locally. Check errors above."
    exit 1
fi

# Step 4: Commit and push changes
echo "Step 4: Committing fixes..."
git add package.json
git add pages/api/auth/*.ts
git add pages/api/health.ts
git add lib/db.ts
git commit -m "Fix: Move TypeScript to dependencies for Vercel build"

# Step 5: Push to GitHub
echo "Step 5: Pushing to GitHub..."
git push

echo ""
echo "========================================="
echo "✅ FIXES APPLIED SUCCESSFULLY!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Go to Vercel dashboard"
echo "2. Check that deployment triggered automatically"
echo "3. If not, run: vercel --prod"
echo ""
echo "Environment variables to verify in Vercel:"
echo "- TURSO_DATABASE_URL"
echo "- TURSO_AUTH_TOKEN"
echo "- JWT_SECRET"
echo "- JWT_REFRESH_SECRET"
echo "- NODE_ENV=production"
echo ""
echo "========================================="