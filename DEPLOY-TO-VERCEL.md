# Valifi Web App - Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Step 1: Prepare for Deployment

1. **Ensure all dependencies are in package.json:**
```bash
cd C:\Users\josh\Desktop\GodBrainAI\valifi
npm install --save axios bcryptjs jsonwebtoken zod
npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/node
```

2. **Update package.json scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Step 2: Git Commands

```bash
# Navigate to valifi directory
cd C:\Users\josh\Desktop\GodBrainAI\valifi

# Initialize git if not already done
git init

# Add all files
git add .

# Commit with message
git commit -m "Complete authentication system implementation for Valifi web app"

# Add remote origin (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/valifi.git

# Push to main branch
git push -u origin main
```

### Step 3: Vercel Setup

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables in Vercel Dashboard:**
   
   Go to Project Settings → Environment Variables and add:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `JWT_SECRET` | Generate a strong secret key | Production |
   | `JWT_REFRESH_SECRET` | Generate another strong secret | Production |
   | `NEXT_PUBLIC_API_URL` | https://your-app.vercel.app/api | Production |
   | `DATABASE_URL` | Your database connection string | Production |

   **Generate secure secrets:**
   ```bash
   # Generate random secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy

### Step 4: Post-Deployment Setup

1. **Update API URL:**
   After deployment, update the `NEXT_PUBLIC_API_URL` to your actual Vercel URL:
   ```
   https://valifi.vercel.app/api
   ```

2. **Test the deployment:**
   ```bash
   # Test sign-in endpoint
   curl -X POST https://valifi.vercel.app/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@valifi.com","password":"password"}'
   ```

## 📋 Pre-Push Checklist

- [x] All TypeScript errors resolved
- [x] Environment variables configured
- [x] `.gitignore` updated
- [x] `vercel.json` configured
- [x] Dependencies in `package.json`
- [ ] Remove console.logs from production code
- [ ] Update API URLs for production
- [ ] Test build locally: `npm run build`

## 🔧 Common Deployment Issues

### Issue: Build fails on Vercel

**Solution:**
```bash
# Test build locally first
npm run build

# Fix any TypeScript errors
npm run type-check
```

### Issue: API routes not working

**Solution:**
Check Vercel Functions logs and ensure:
- Environment variables are set
- API routes are in `/pages/api/`
- CORS headers are configured

### Issue: Authentication not persisting

**Solution:**
- Check localStorage in production
- Verify JWT secrets match
- Check cookie settings for HTTPS

## 🔐 Security for Production

1. **Update `.env.local` (DO NOT COMMIT):**
```env
JWT_SECRET=your-very-long-random-string-here
JWT_REFRESH_SECRET=another-very-long-random-string
DATABASE_URL=your-production-database-url
NEXT_PUBLIC_API_URL=https://valifi.vercel.app/api
```

2. **Update authentication service:**
```typescript
// In src/auth/services/authService.ts
// Change cookie settings for production
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};
```

## 📝 Git Commands Summary

```bash
# One-liner to add, commit, and push
git add . && git commit -m "Update Valifi auth system" && git push

# Force push if needed (careful!)
git push -f origin main

# Check status
git status

# View commit history
git log --oneline

# Pull latest changes
git pull origin main
```

## 🔄 Continuous Deployment

Once connected, every push to `main` branch will:
1. Trigger Vercel build
2. Run Next.js build process
3. Deploy to production
4. Update your live site

## 📊 Monitor Deployment

- **Vercel Dashboard:** Check build logs
- **Functions Tab:** Monitor API performance
- **Analytics:** Track usage and errors
- **Domains:** Configure custom domain

## 🚨 Emergency Rollback

If something goes wrong:
```bash
# Revert last commit
git revert HEAD
git push

# Or in Vercel Dashboard:
# Go to Deployments → Select previous deployment → Promote to Production
```

## 📞 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)

---

**Ready to deploy!** Run the git commands above and your Valifi app will be live on Vercel! 🎉