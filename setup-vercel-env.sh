#!/bin/bash
# ============================================
# VERCEL ENVIRONMENT SETUP SCRIPT
# ============================================
# This script sets all environment variables in Vercel
# Run: ./setup-vercel-env.sh

echo "============================================"
echo "   VALIFI - VERCEL ENVIRONMENT SETUP"
echo "============================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

echo "Setting production environment variables in Vercel..."
echo ""

# NEON DATABASE VARIABLES
vercel env add DATABASE_URL production < <(echo "postgresql://neondb_owner:npg_5kwo8vhredaX@ep-proud-mountain-ady8h1sc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require")
vercel env add DATABASE_URL_UNPOOLED production < <(echo "postgresql://neondb_owner:npg_5kwo8vhredaX@ep-proud-mountain-ady8h1sc.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require")
vercel env add PGHOST production < <(echo "ep-proud-mountain-ady8h1sc-pooler.c-2.us-east-1.aws.neon.tech")
vercel env add PGUSER production < <(echo "neondb_owner")
vercel env add PGDATABASE production < <(echo "neondb")
vercel env add PGPASSWORD production < <(echo "npg_5kwo8vhredaX")
vercel env add POSTGRES_URL production < <(echo "postgresql://neondb_owner:npg_5kwo8vhredaX@ep-proud-mountain-ady8h1sc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require")
vercel env add POSTGRES_URL_NON_POOLING production < <(echo "postgresql://neondb_owner:npg_5kwo8vhredaX@ep-proud-mountain-ady8h1sc.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require")
vercel env add POSTGRES_PRISMA_URL production < <(echo "postgresql://neondb_owner:npg_5kwo8vhredaX@ep-proud-mountain-ady8h1sc-pooler.c-2.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require")

# NEON AUTH
vercel env add NEXT_PUBLIC_STACK_PROJECT_ID production < <(echo "62b26637-ad02-43eb-a444-2c89b3ef5215")
vercel env add NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY production < <(echo "pck_y08v1c589fh0grtjdnhganb5jf18wh954k60pjpgx7hbg")
vercel env add STACK_SECRET_SERVER_KEY production < <(echo "ssk_c9wdb9qbz342atsm0gwy2v24d5jzwreytnj9m6zms3fw8")

# DATABASE SETTINGS
vercel env add USE_POSTGRES production < <(echo "true")
vercel env add DB_POOL_SIZE production < <(echo "20")

# SECURITY (Generate new ones for production!)
JWT_SECRET=$(openssl rand -hex 64 2>/dev/null || echo "a7f8d9e2b4c6a1e5f9d8b7c4a2e1f5d9b8c7a4e2f1d5a9b8c7e4a2f1d5e9b8c7a4e2f1d5a9b8c7e4a2f1d5e9b8c7a4e2f1d5a9b8c7e4a2f1d5e9b8c7")
JWT_REFRESH_SECRET=$(openssl rand -hex 64 2>/dev/null || echo "b8e9f1a2c5d7e8f1a3c6d9e2f5a8b1c4d7e1f4a7b1d4e7f1a4b7d1e4f7a1b4d7e1f4a7b1d4e7f1a4b7d1e4f7a1b4d7e1f4a7b1d4e7f1a4b7d1e4f7")
ENCRYPTION_KEY=$(openssl rand -hex 32 2>/dev/null || echo "f5a8b2c6d9e3f6a9c3d6e9f3a6b9c3d6e9f3a6b9c3d6e9f3a6b9c3d6e9f3a6")
SESSION_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "e4a7b1d5e8f2a5b8c2e5f8a2b5c8e2f5a8b2e5f8a2b5c8e2f5a8b2e5f8a2b5")

vercel env add JWT_SECRET production < <(echo "$JWT_SECRET")
vercel env add JWT_REFRESH_SECRET production < <(echo "$JWT_REFRESH_SECRET")
vercel env add ENCRYPTION_KEY production < <(echo "$ENCRYPTION_KEY")
vercel env add SESSION_SECRET production < <(echo "$SESSION_SECRET")

# APPLICATION SETTINGS
vercel env add NODE_ENV production < <(echo "production")
vercel env add NEXT_PUBLIC_API_URL production < <(echo "https://valifi.vercel.app/api")

# BOT CONFIGURATION
vercel env add BOT_RATE_LIMIT production < <(echo "100")
vercel env add BOT_EVOLUTION_ENABLED production < <(echo "true")
vercel env add NEXT_PUBLIC_LIVE_PATCH production < <(echo "true")
vercel env add NEXT_PUBLIC_BOT_EVOLUTION production < <(echo "enabled")

# FEATURE FLAGS
vercel env add ENABLE_TRADING_BOTS production < <(echo "true")
vercel env add ENABLE_DEFI production < <(echo "true")
vercel env add ENABLE_P2P production < <(echo "true")
vercel env add ENABLE_STAKING production < <(echo "true")
vercel env add ENABLE_NFT production < <(echo "true")
vercel env add ENABLE_AI_ASSISTANT production < <(echo "true")
vercel env add ENABLE_2FA production < <(echo "true")
vercel env add ENABLE_DEMO_MODE production < <(echo "false")

echo ""
echo "✅ Environment variables set successfully!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Add your OpenAI API key:"
echo "   vercel env add OPENAI_API_KEY production"
echo ""
echo "2. Update NEXT_PUBLIC_API_URL after deployment:"
echo "   vercel env add NEXT_PUBLIC_API_URL production"
echo ""
echo "3. Deploy to production:"
echo "   vercel --prod"
echo ""
echo "============================================"