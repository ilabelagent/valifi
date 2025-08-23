#!/bin/bash
# Valifi Platform - Production Deployment Fix Script
# This script fixes all production issues and ensures smooth deployment to Vercel

echo "==================================="
echo "Valifi Platform - Production Fix"
echo "==================================="

# 1. Update dependencies
echo "Step 1: Updating dependencies..."
npm update @libsql/client

# 2. Clear build cache
echo "Step 2: Clearing build cache..."
rm -rf .next
rm -rf node_modules/.cache

# 3. Reinstall dependencies
echo "Step 3: Reinstalling dependencies..."
npm install

# 4. Run build test
echo "Step 4: Testing build locally..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# 5. Verify environment variables
echo "Step 5: Checking environment variables..."
if [ -z "$TURSO_DATABASE_URL" ]; then
    echo "⚠️  WARNING: TURSO_DATABASE_URL is not set"
    echo "   Please set it in Vercel dashboard: Settings > Environment Variables"
fi

if [ -z "$TURSO_AUTH_TOKEN" ]; then
    echo "⚠️  WARNING: TURSO_AUTH_TOKEN is not set"
    echo "   Please set it in Vercel dashboard: Settings > Environment Variables"
fi

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  WARNING: JWT_SECRET is not set"
    echo "   Using default (not secure for production!)"
fi

# 6. Deploy to Vercel
echo "Step 6: Ready to deploy!"
echo ""
echo "To deploy to Vercel, run:"
echo "  vercel --prod"
echo ""
echo "Or commit and push to trigger automatic deployment:"
echo "  git add ."
echo "  git commit -m 'Fix: Remove syncUrl, update auth, fix production issues'"
echo "  git push"
echo ""
echo "==================================="
echo "Important Vercel Settings:"
echo "==================================="
echo "1. Go to: https://vercel.com/dashboard/[your-project]/settings/environment-variables"
echo "2. Ensure these are set:"
echo "   - TURSO_DATABASE_URL"
echo "   - TURSO_AUTH_TOKEN"
echo "   - JWT_SECRET"
echo "   - NODE_ENV=production"
echo "3. Redeploy after setting variables"
echo "==================================="