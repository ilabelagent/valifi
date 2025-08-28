
# VERCEL DEPLOYMENT INSTRUCTIONS

## Automated Deployment Steps

### 1. Install Vercel CLI (if not installed)
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Vercel
```bash
vercel --prod
```

### 4. Set Environment Variables

The following environment variables have been auto-generated with secure values:

#### Security Keys (Already Generated - Copy these to Vercel Dashboard)
- JWT_SECRET: fbde738b9e47004f615168b592aa495d6814b2e9707fb523b0b2f6a5afcc5bfb56f436ffadb0f3010431a0302cc8de7db2e202b6284a1774ca5ad6f21da4f9e0
- JWT_REFRESH_SECRET: 496a6d5b508760e0c2e16125e5ee911696c2cbd0b8346ab65c1f77c707e6bb2cd73d8ce65da2376ab5e0d61608c46e0f0195a81245502d249dc2c752307b1ca4
- NEXTAUTH_SECRET: 2a172d3b0fa953e226b96cbc9862b0bc5dd282db72397b8f18d102bc9f787693
- ENCRYPTION_KEY: de47831e80dea8954b812d6fbb96e0b45a1cdad0b6c2a7c5897ebedcccff84ec
- SESSION_SECRET: ef9e41de8da70837a73644015130ca139cdbda7063bb9a75fb7f5e828b5a495a

#### Required Services (You need to add these)

1. **Database** - Choose one:
   - Vercel Postgres (Recommended): Add from Vercel dashboard
   - Turso: Add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
   - External PostgreSQL: Add DATABASE_URL

2. **Redis Cache** (Optional but recommended):
   - Vercel KV: Add from Vercel dashboard
   - External Redis: Add REDIS_URL

3. **AI Service** (Required for bot features):
   - OpenAI: Add OPENAI_API_KEY
   - Anthropic: Add ANTHROPIC_API_KEY

4. **Email Service** (Required):
   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

5. **Payment Gateway** (Required for payments):
   - Stripe: Add STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY

### 5. Quick Setup via Vercel CLI

Run this command to set all generated environment variables:

```bash
# Set all security keys at once
vercel env add JWT_SECRET production < <(echo "fbde738b9e47004f615168b592aa495d6814b2e9707fb523b0b2f6a5afcc5bfb56f436ffadb0f3010431a0302cc8de7db2e202b6284a1774ca5ad6f21da4f9e0")
vercel env add JWT_REFRESH_SECRET production < <(echo "496a6d5b508760e0c2e16125e5ee911696c2cbd0b8346ab65c1f77c707e6bb2cd73d8ce65da2376ab5e0d61608c46e0f0195a81245502d249dc2c752307b1ca4")
vercel env add NEXTAUTH_SECRET production < <(echo "2a172d3b0fa953e226b96cbc9862b0bc5dd282db72397b8f18d102bc9f787693")
vercel env add ENCRYPTION_KEY production < <(echo "de47831e80dea8954b812d6fbb96e0b45a1cdad0b6c2a7c5897ebedcccff84ec")
vercel env add SESSION_SECRET production < <(echo "ef9e41de8da70837a73644015130ca139cdbda7063bb9a75fb7f5e828b5a495a")

# Set other required variables
vercel env add NODE_ENV production < <(echo "production")
vercel env add ENABLE_DEMO_MODE production < <(echo "false")
vercel env add BCRYPT_ROUNDS production < <(echo "12")
```

### 6. Add Vercel Integrations

From your Vercel Dashboard, add these integrations:

1. **Vercel Postgres** - For database
2. **Vercel KV** - For Redis cache
3. **Sentry** - For error monitoring
4. **Analytics** - For usage tracking

### 7. Post-Deployment Setup

After deployment, run these commands:

```bash
# Run database migrations
vercel env pull .env.local
npm run migrate:prod

# Create admin user
npm run create:admin
```

## Manual Vercel Dashboard Setup

If you prefer using the Vercel Dashboard:

1. Go to https://vercel.com/dashboard
2. Import your Git repository
3. Choose "Next.js" as framework
4. Set environment variables in Settings > Environment Variables
5. Deploy

## Important Notes

- All security keys have been auto-generated and saved in .env.production
- Database connection will be automatically configured if you use Vercel Postgres
- The build command has been optimized for Vercel's environment
- Post-install scripts will automatically fix common deployment issues

## Troubleshooting

If deployment fails:

1. Check build logs in Vercel dashboard
2. Ensure Node.js version is 18+
3. Try adding --force to install command in vercel.json
4. Clear Vercel cache: vercel --prod --force

## Support

For issues, check:
- Build logs: https://vercel.com/[your-username]/[project]/deployments
- Function logs: https://vercel.com/[your-username]/[project]/functions
