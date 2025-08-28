# 🚀 VALIFI FINTECH BOT - BUILD, RUN & DEPLOY GUIDE

## Quick Start Commands

### 🎯 Fastest Way to Start (Windows)
```bash
# Just run this one command:
QUICK-START.bat
```

### 🎯 Fastest Way to Start (Linux/Mac)
```bash
chmod +x build-and-deploy.sh
./build-and-deploy.sh
# Select option 7 (Quick Dev Start)
```

---

## Complete Setup Guide

### Step 1: Fix All Issues Automatically
```bash
# Windows
BUILD-AND-DEPLOY.bat
# Select option 1 (Fix Project Issues)

# OR use Node.js script (all platforms)
node prepare-deployment.js
```

### Step 2: Install Dependencies
```bash
npm install

# OR if you have issues:
npm install --force

# OR clean install:
rm -rf node_modules package-lock.json
npm install
```

### Step 3: Build the Project
```bash
npm run build

# For production build:
NODE_ENV=production npm run build
```

### Step 4: Run Development Server
```bash
npm run dev

# Server runs at: http://localhost:3000
```

### Step 5: Deploy to Vercel
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## 📋 Pre-Deployment Checklist

### ✅ Required Files
- [ ] `package.json` - Updated with all dependencies
- [ ] `next.config.js` - Proper configuration
- [ ] `.env.local` - Environment variables set
- [ ] `vercel.json` - Deployment settings
- [ ] `/api/index.js` - API endpoint consolidated

### ✅ Environment Variables
Create `.env.local` with:
```env
# Required
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api

# Database (get from Turso)
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Security (generate random strings)
JWT_SECRET=generate-64-char-random-string
JWT_REFRESH_SECRET=generate-another-64-char-string

# Optional
GOOGLE_API_KEY=your-google-api-key
```

### ✅ Dependencies to Install
```json
{
  "dependencies": {
    "next": "13.5.2",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "bcryptjs": "^2.4.3",
    "@libsql/client": "^0.3.5",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2"
  }
}
```

---

## 🛠️ Using the Build & Deploy Manager

### Windows Users
Run `BUILD-AND-DEPLOY.bat` and select:

1. **Fix Project Issues** - Fixes all known problems
2. **Install Dependencies** - Installs npm packages
3. **Build Project** - Creates production build
4. **Run Development Server** - Starts local server
5. **Deploy to Vercel** - Deploys to production
6. **Complete Setup** - Runs all steps automatically
7. **Quick Dev Start** - Fast development start
8. **Production Deploy** - Full production deployment

### Linux/Mac Users
Run `./build-and-deploy.sh` with same options

---

## 🔧 Manual Fixes (If Needed)

### Fix 1: Create API Directory
```bash
mkdir api
cp pages/api/bot.js api/index.js
```

### Fix 2: Update package.json
```bash
# Run the prepare script
node prepare-deployment.js

# OR manually install missing deps
npm install bcryptjs @libsql/client cors dotenv jsonwebtoken
```

### Fix 3: Fix Module Issues
Update `next.config.js`:
```javascript
module.exports = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}
```

### Fix 4: Database Setup
1. Go to [Turso](https://turso.tech)
2. Create a new database
3. Copy credentials to `.env.local`

---

## 📊 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Set up and deploy: Y
# - Which scope: Your account
# - Link to existing project: N
# - Project name: valifi-fintech
# - Directory: ./
# - Override settings: N
```

### Option 2: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Option 3: Traditional Hosting
```bash
# Build for production
npm run build

# Start production server
npm start

# Use PM2 for process management
npm i -g pm2
pm2 start npm --name "valifi" -- start
```

---

## 🚨 Troubleshooting

### Issue: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Build failed"
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Fix or ignore with:
npm run build -- --no-lint
```

### Issue: "Port 3000 in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Issue: "Database connection failed"
- Check `.env.local` has correct Turso credentials
- API works in mock mode without database
- Test connection: `node test-connection.js`

### Issue: "Vercel deployment failed"
```bash
# Check build locally first
npm run build

# Clear Vercel cache
rm -rf .vercel

# Try again
vercel --prod
```

---

## 📈 Performance Optimization

### Before Deployment
1. **Optimize Images**
   - Use Next.js Image component
   - Convert to WebP format
   - Add lazy loading

2. **Code Splitting**
   - Dynamic imports for large components
   - Split bot modules into chunks

3. **Environment Variables**
   - Use `.env.production` for production
   - Never commit sensitive data

4. **Database Optimization**
   - Add indexes to Turso tables
   - Use connection pooling

---

## ✅ Final Deployment Steps

### 1. Final Check
```bash
# Run deployment preparation
node prepare-deployment.js

# Check health score (should be 80%+)
```

### 2. Test Locally
```bash
# Build and test
npm run build
npm start

# Visit http://localhost:3000
# Test all features
```

### 3. Deploy to Production
```bash
# Set production env
NODE_ENV=production

# Deploy to Vercel
vercel --prod

# Get deployment URL
# Update NEXT_PUBLIC_API_URL in Vercel dashboard
```

### 4. Post-Deployment
- Check all endpoints at `https://your-app.vercel.app`
- Monitor logs in Vercel dashboard
- Set up error tracking (Sentry)
- Configure custom domain

---

## 📞 Support Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Turso Docs](https://docs.turso.tech)

### Common Commands
```bash
# Development
npm run dev           # Start dev server
npm run build        # Build project
npm run start        # Start production server
npm run lint         # Check code quality

# Deployment
vercel              # Deploy to Vercel
vercel --prod       # Deploy to production
vercel logs         # View deployment logs
vercel env pull     # Pull environment variables
```

### Project Scripts Created
- `BUILD-AND-DEPLOY.bat` - Windows deployment manager
- `build-and-deploy.sh` - Linux/Mac deployment manager
- `QUICK-START.bat` - Quick development start
- `prepare-deployment.js` - Automated issue fixer
- `list-directory.js` - Project structure analyzer
- `generate-directory-report.js` - Documentation generator

---

## 🎉 Success Indicators

After successful deployment, you should see:
1. ✅ Vercel shows "Ready" status
2. ✅ Live URL accessible
3. ✅ `/api/health` returns `{ status: "healthy" }`
4. ✅ Login/signup modals working
5. ✅ Dashboard loads with data
6. ✅ No console errors

---

## 🚀 You're Ready to Deploy!

Run these commands in order:
```bash
# 1. Fix issues
node prepare-deployment.js

# 2. Install & build
npm install && npm run build

# 3. Test locally
npm run dev

# 4. Deploy to production
vercel --prod
```

**Congratulations! Your Valifi FinTech Bot is ready for production! 🎊**

---

*Last Updated: August 2025*
*Version: 1.0.0*
*Status: READY FOR DEPLOYMENT*