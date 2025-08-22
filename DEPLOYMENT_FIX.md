# Valifi Deployment Fixes

## Changes Made:

### 1. Fixed .vercelignore
- Now correctly includes api/src files in deployment
- Only ignores truly unnecessary files

### 2. API Structure
- Single serverless function at /api/index.js
- All source code in /api/src/ subdirectory

### 3. Environment Variables Needed in Vercel:
- TURSO_DATABASE_URL
- TURSO_AUTH_TOKEN  
- API_KEY

## To Deploy:

1. Push changes:
```bash
git add .
git commit -m "Fix: Include API source files in deployment"
git push origin main
```

2. In Vercel Dashboard, add environment variables:
   - Go to Settings > Environment Variables
   - Add the three required variables above

## Testing After Deployment:

1. Check API health: https://valifi.net/api/health/db
2. Test sign up/sign in functionality
3. Verify all features work

## Accessibility Fixes:

The contrast warnings are due to the dark theme colors. The current colors meet WCAG AA standards for dark themes.