# Valifi - Vercel Deployment Fix Guide

## 🚨 Current Issue
Your deployment failed because environment variables are not set in Vercel.

## ✅ Quick Fix Steps

### 1. Set Environment Variables in Vercel

Go to your Vercel Dashboard:
1. Visit: https://vercel.com/dashboard
2. Click on your **valifi** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```env
JWT_SECRET=<generate-using-command-below>
JWT_REFRESH_SECRET=<generate-using-command-below>
NEXT_PUBLIC_API_URL=https://valifi.vercel.app/api
```

### 2. Generate Secure Secrets

Run this command twice to generate two different secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Example output:
```
7f3a8b2c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a
```

### 3. Add Variables in Vercel UI

In the Vercel Environment Variables page:

| Key | Value | Environments |
|-----|-------|--------------|
| `JWT_SECRET` | `[your-first-generated-secret]` | ☑ Production ☑ Preview ☑ Development |
| `JWT_REFRESH_SECRET` | `[your-second-generated-secret]` | ☑ Production ☑ Preview ☑ Development |
| `NEXT_PUBLIC_API_URL` | `https://valifi.vercel.app/api` | ☑ Production ☑ Preview ☑ Development |

### 4. Push Fixed Config

The `vercel.json` has been updated to remove the secret references. Push it:

```bash
git add vercel.json
git commit -m "Fix: Remove secret references from vercel.json"
git push origin main
```

Or run:
```bash
C:\Users\josh\Desktop\GodBrainAI\valifi\fix-vercel-deploy.bat
```

### 5. Trigger Redeploy

After setting environment variables:
1. Go to your Vercel project dashboard
2. Click on the failed deployment
3. Click **Redeploy** → **Redeploy with existing Build Cache**

## 📋 Checklist

- [ ] Generated two secure secrets (32+ characters each)
- [ ] Added JWT_SECRET to Vercel
- [ ] Added JWT_REFRESH_SECRET to Vercel  
- [ ] Added NEXT_PUBLIC_API_URL to Vercel
- [ ] Pushed updated vercel.json
- [ ] Triggered redeploy

## 🎯 Expected Result

After completing these steps:
- Deployment should succeed
- Your app will be live at: https://valifi.vercel.app
- Authentication will work with the JWT secrets

## 🔍 Verify Deployment

Once deployed, test:
1. Visit: https://valifi.vercel.app
2. Go to sign-in page
3. Try demo credentials:
   - Email: `demo@valifi.net`
   - Password: `demo123`

## ⚠️ Important Notes

1. **Never commit secrets to Git** - Always use environment variables
2. **Use strong secrets** - At least 32 characters, randomly generated
3. **Keep secrets secure** - Don't share them publicly
4. **Different secrets for different environments** - Use different values for production vs development

## 🆘 If Still Failing

If deployment still fails after adding environment variables:

1. Check the build logs in Vercel for specific errors
2. Ensure all variables are spelled correctly
3. Make sure you selected all environments (Production, Preview, Development)
4. Try clearing build cache: **Redeploy** → **Redeploy without Build Cache**

---

**Your deployment should work after adding the environment variables!** 🚀