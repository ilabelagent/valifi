#!/bin/bash
# Valifi - Quick Deploy to Vercel via Git

echo "🚀 Deploying Valifi to Vercel..."
echo "================================"

# Add all changes
echo "📦 Adding all changes..."
git add .

# Commit with timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
COMMIT_MSG="Deploy Valifi auth system - $TIMESTAMP"

echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG"

# Push to main branch
echo "🔄 Pushing to GitHub..."
git push origin main

echo "================================"
echo "✅ Push complete!"
echo "🌐 Vercel will auto-deploy from GitHub"
echo "📊 Check deployment at: https://vercel.com/dashboard"
echo ""
echo "🔗 Your app will be available at:"
echo "   https://valifi.vercel.app"
echo ""
echo "📝 Next steps:"
echo "   1. Check Vercel dashboard for build status"
echo "   2. Set environment variables in Vercel"
echo "   3. Test authentication at /signin"