# Valifi Bot - Render Deployment Guide

## 🚀 Quick Start

This guide will help you deploy the Valifi fintech platform bot to Render instead of Vercel.

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub/GitLab Account**: For automatic deployments
3. **Database**: PostgreSQL (Render provides free tier) or external database
4. **Node.js**: Version 18.0.0 or higher

## 🔧 Deployment Methods

### Method 1: Blueprint Deployment (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Render deployment"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` automatically
   - Review configuration and click "Apply"

3. **Configure Environment Variables** in Render Dashboard

### Method 2: Manual Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: valifi-bot
   - **Runtime**: Node
   - **Build Command**: `npm install --force --legacy-peer-deps && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or higher for production)

### Method 3: Windows Quick Deploy

Run the deployment script:
```batch
DEPLOY-TO-RENDER.bat
```

## 🔐 Required Environment Variables

### Core Configuration
- `NODE_ENV`: production
- `NEXT_PUBLIC_APP_URL`: Your Render app URL (e.g., https://valifi-bot.onrender.com)
- `NEXT_PUBLIC_API_URL`: API endpoint URL

### Security Keys (Auto-generated or manual)
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `NEXTAUTH_SECRET`
- `ENCRYPTION_KEY`
- `SESSION_SECRET`

### Database Configuration

#### Option A: Render PostgreSQL (Free Tier)
- Automatically configured when you add a PostgreSQL database to your service
- Connection string available as `DATABASE_URL`

#### Option B: External Database
- `POSTGRES_URL`: Your PostgreSQL connection string
- `POSTGRES_USER`: Database username
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_HOST`: Database host
- `POSTGRES_DATABASE`: Database name

#### Option C: Turso Database
- `TURSO_DATABASE_URL`: Your Turso database URL
- `TURSO_AUTH_TOKEN`: Turso authentication token

### Optional Services

#### AI Services
- `OPENAI_API_KEY`: For AI assistant features
- `ANTHROPIC_API_KEY`: For Claude AI integration

#### Email Service
- `SMTP_HOST`: SMTP server host
- `SMTP_PORT`: SMTP port (usually 587 or 465)
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password
- `EMAIL_FROM`: Sender email address

#### Payment Gateway
- `STRIPE_PUBLIC_KEY`: Stripe publishable key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret

#### Market Data APIs
- `ALPHA_VANTAGE_API_KEY`: For stock market data
- `COINMARKETCAP_API_KEY`: For cryptocurrency data

## 📁 Project Structure

```
valifi/
├── render.yaml          # Render configuration
├── package.json         # Node.js dependencies
├── next.config.js       # Next.js configuration
├── .env.production      # Production environment variables
├── pages/              # Next.js pages
│   └── api/           # API routes
│       └── bot.js     # Main bot endpoint
├── bots/              # Individual bot modules
├── lib/               # Shared libraries
├── components/        # React components
└── public/           # Static assets
```

## 🚨 Important Notes

### Free Tier Limitations
- **Auto-sleep**: Services spin down after 15 minutes of inactivity
- **Cold starts**: First request after sleep takes 30-60 seconds
- **PostgreSQL**: Free database expires after 90 days
- **Resources**: 512 MB RAM, 0.1 CPU

### Production Recommendations
1. **Upgrade to Starter Plan** ($7/month) for:
   - No auto-sleep
   - Better performance
   - Custom domains with SSL

2. **Use External Database** for production:
   - Neon.tech
   - Supabase
   - PlanetScale
   - Your own PostgreSQL server

3. **Set Up Monitoring**:
   - Health checks: `/api/health-check`
   - Error tracking with Sentry
   - Uptime monitoring

## 🔄 Continuous Deployment

### Automatic Deploys
1. Enable in Render Dashboard → Settings → Auto-Deploy
2. Every push to main branch triggers deployment

### Manual Deploys
1. Render Dashboard → Manual Deploy
2. Or use Render CLI: `render deploy`

## 🐛 Troubleshooting

### Build Failures
```bash
# Test build locally
npm install --force --legacy-peer-deps
npm run build
```

### Database Connection Issues
- Check `DATABASE_URL` format: `postgresql://user:pass@host:port/dbname`
- Ensure database is accessible from Render's servers
- Add SSL mode if required: `?sslmode=require`

### Environment Variable Issues
- Double-check all required variables are set
- Use Render's secret files for sensitive data
- Restart service after changing environment variables

### Performance Issues
- Enable caching headers
- Optimize Next.js build
- Consider upgrading from free tier
- Use CDN for static assets

## 📊 Monitoring

### Logs
Access logs in Render Dashboard → Your Service → Logs

### Metrics
- CPU usage
- Memory usage
- Response times
- Request count

### Health Checks
Render automatically monitors `/api/health-check`

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Render Dashboard](https://dashboard.render.com/)
- [Render Status Page](https://status.render.com/)
- [Render Community](https://community.render.com/)
- [Next.js on Render Guide](https://render.com/docs/deploy-nextjs)

## 📞 Support

- Render Support: support@render.com
- Community Forum: community.render.com
- GitHub Issues: Your repository's issues page

## ✅ Deployment Checklist

- [ ] Create Render account
- [ ] Push code to GitHub
- [ ] Create `render.yaml` configuration
- [ ] Set up database (Render PostgreSQL or external)
- [ ] Configure all required environment variables
- [ ] Deploy using Blueprint or Web Service
- [ ] Test application at Render URL
- [ ] Set up custom domain (optional)
- [ ] Configure auto-deploy (optional)
- [ ] Set up monitoring and alerts (recommended)

## 🎉 Success!

Once deployed, your Valifi bot will be available at:
```
https://[your-app-name].onrender.com
```

Replace `[your-app-name]` with the name you chose during deployment.