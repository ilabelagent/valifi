#!/bin/bash

echo "🚀 VALIFI ONE-CLICK VERCEL DEPLOYMENT"
echo "===================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

# Set environment variables
echo "Setting environment variables..."

# Auto-generated security keys
vercel env add JWT_SECRET production <<< "fbde738b9e47004f615168b592aa495d6814b2e9707fb523b0b2f6a5afcc5bfb56f436ffadb0f3010431a0302cc8de7db2e202b6284a1774ca5ad6f21da4f9e0"
vercel env add JWT_REFRESH_SECRET production <<< "496a6d5b508760e0c2e16125e5ee911696c2cbd0b8346ab65c1f77c707e6bb2cd73d8ce65da2376ab5e0d61608c46e0f0195a81245502d249dc2c752307b1ca4"
vercel env add NEXTAUTH_SECRET production <<< "2a172d3b0fa953e226b96cbc9862b0bc5dd282db72397b8f18d102bc9f787693"
vercel env add ENCRYPTION_KEY production <<< "de47831e80dea8954b812d6fbb96e0b45a1cdad0b6c2a7c5897ebedcccff84ec"
vercel env add SESSION_SECRET production <<< "ef9e41de8da70837a73644015130ca139cdbda7063bb9a75fb7f5e828b5a495a"

# Other required variables
vercel env add NODE_ENV production <<< "production"
vercel env add ENABLE_DEMO_MODE production <<< "false"
vercel env add BCRYPT_ROUNDS production <<< "12"
vercel env add SESSION_TIMEOUT production <<< "3600000"
vercel env add MAX_LOGIN_ATTEMPTS production <<< "5"
vercel env add LOCKOUT_DURATION production <<< "900000"

echo ""
echo "✅ Environment variables set!"
echo ""
echo "Deploying to Vercel..."
echo ""

# Deploy to production
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Add database (Vercel Postgres) from dashboard"
echo "2. Add Redis cache (Vercel KV) from dashboard"
echo "3. Configure external services (OpenAI, Stripe, etc.)"
echo "4. Run database migrations"
echo ""
