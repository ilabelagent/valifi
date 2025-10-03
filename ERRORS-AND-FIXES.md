# Valifi Platform - Errors and Fixes Documentation

## Date: October 3, 2025

This document tracks all errors encountered during the Replit migration and their solutions, providing a reference for future troubleshooting.

---

## ✅ FIXED ISSUES

### 1. **Sign-In Error: "Failed to load app data"**

**Error Message:**
```
Failed to load app data: SyntaxError: "<!DOCTYPE "... is not valid JSON"
```

**Root Cause:**
- Frontend calls `/api/app-data` after successful login
- Endpoint existed in `pages/api/app-data.ts` (Next.js API route) but was missing from `simple-server.js`
- Server returned HTML (index.html) instead of JSON, causing JSON parsing error

**Solution Applied:**
Added complete `/api/app-data` endpoint to `simple-server.js` (lines 180-336) that:
1. Verifies JWT token from Authorization header
2. Fetches user profile from PostgreSQL
3. Loads user's wallets and calculates portfolio value
4. Retrieves transaction history
5. Returns properly formatted JSON response

**Files Modified:**
- `simple-server.js` - Added `/api/app-data` endpoint

**Testing Results:**
```bash
✅ POST /api/auth/register - Creates user with default USD wallet
✅ POST /api/auth/login - Returns JWT token
✅ GET /api/app-data - Returns user profile, wallets, transactions
✅ Complete auth flow working: Register → Login → Load Data → Dashboard
```

---

### 2. **Deployment Error: Next.js Build Failure**

**Error Message:**
```
Error: Invalid next.config.js: swcMinify is deprecated
```

**Root Cause:**
- `swcMinify: true` option deprecated in Next.js 15
- Configuration file had outdated options

**Solution Applied:**
Removed deprecated `swcMinify` option from `next.config.js`

**Files Modified:**
- `next.config.js` - Removed line 4: `swcMinify: true,`

---

### 3. **TypeScript Build Error: Backup Directory**

**Error Message:**
```
TypeScript error in backup/index.tsx: Cannot find module...
```

**Root Cause:**
- TypeScript compiler trying to process backup files
- Backup directory contained old/incomplete code causing compilation errors

**Solution Applied:**
1. Added `backup/` to tsconfig.json exclude list
2. Updated .gitignore to exclude backup files

**Files Modified:**
- `tsconfig.json` - Added to exclude: `"backup", "backup/**/*", "dist", ".next"`
- `.gitignore` - Added backup directory patterns

---

### 4. **Deployment Port Configuration Error**

**Error Message:**
```
Server starting on wrong port (3000 instead of 5000)
```

**Root Cause:**
- Deployment configuration running `next start` without PORT environment variable
- Replit requires port 5000 for external access

**Solution Applied:**
Updated deployment configuration using `deploy_config_tool`:
- Build: `npm run build`
- Run: `PORT=5000 npm start`
- Deployment type: `autoscale`

**Files Modified:**
- `.replit` - Deployment configuration updated automatically

---

### 5. **TypeScript Errors in services/api.ts**

**Error Message:**
```
Conversion of type '{ id, offerId, amount, status, createdAt }' to type 'P2POrder' may be a mistake
Property 'isFrozen' is missing in type CardDetails
```

**Root Cause:**
- Mock implementations using incomplete type casts
- Missing required properties in returned objects

**Solution Applied:**
1. Added `as unknown as P2POrder` for intermediate casting
2. Added missing `isFrozen: false` property to CardDetails

**Files Modified:**
- `services/api.ts` - Lines 101-108, 125-132

---

### 6. **Database Connection Issues**

**Status:** ✅ Resolved (during initial migration)

**Solution:**
- Migrated to Replit Secrets for `DATABASE_URL` and `JWT_SECRET`
- Removed hardcoded credentials
- Updated all server files to use `process.env` exclusively

**Files Modified:**
- `simple-server.js` - Lines 19-30 (environment variable validation)
- `bun-server.ts` - Uses Replit Secrets
- `production-server.ts` - Uses Replit Secrets

---

## 🔍 COMMON ERRORS & QUICK FIXES

### Missing API Endpoint
**Symptom:** Frontend gets HTML instead of JSON
**Fix:** Check if endpoint exists in `simple-server.js` (not just Next.js API routes)
**Location:** Add endpoints between lines 96-338 in `simple-server.js`

### Port Configuration
**Symptom:** Application not accessible externally
**Fix:** Ensure PORT=5000 in all server startup commands
**Files:** Check `package.json` scripts and deployment configuration

### Database Connection
**Symptom:** "Database connection failed" errors
**Fix:** 
1. Verify Replit Secrets are set (DATABASE_URL, JWT_SECRET)
2. Check server logs for connection details
3. Ensure PostgreSQL database is running

### TypeScript Build Errors
**Symptom:** Build fails with type errors
**Fix:**
1. Check `tsconfig.json` excludes backup/test directories
2. Run `npx tsc --noEmit` to check for type errors
3. Add `as unknown as Type` for complex type casts

---

## 🚨 POTENTIAL FUTURE ISSUES

### 1. **Next.js vs Vite Confusion**
**Warning:** Project uses **Vite** for development, not Next.js (despite next.config.js existing)
**Solution:** Always use `npm run full-stack` for development (starts Vite + Node backend)

### 2. **Database Migration Conflicts**
**Warning:** Schema changes may conflict with existing data
**Solution:** 
- Always backup database before migrations
- Use `npm run db:push --force` to sync schema safely
- Never manually alter primary key types

### 3. **Environment Variables in Deployment**
**Warning:** Environment variables must be set in deployment secrets
**Solution:**
- Set in Replit Secrets (syncs automatically to deployment)
- Never hardcode credentials in code

### 4. **API Endpoint Routing**
**Warning:** Must add endpoints to both Next.js API routes AND simple-server.js
**Solution:**
- Development: Add to `simple-server.js`
- Production (Next.js): Add to `pages/api/`
- Keep both in sync

### 5. **CORS Issues**
**Warning:** Vite proxy may not forward all headers correctly
**Solution:**
- Add CORS headers explicitly in backend responses
- Configure Vite proxy in `vite.config.ts`

---

## 📊 TESTING CHECKLIST

Before deploying or marking work complete:

- [ ] All API endpoints return JSON (not HTML)
- [ ] Authentication flow works: Register → Login → Dashboard
- [ ] Database connection successful (check `/api/health`)
- [ ] No TypeScript compilation errors (`npx tsc --noEmit`)
- [ ] Server runs on port 5000 (check deployment config)
- [ ] Environment variables set in Replit Secrets
- [ ] No hardcoded credentials in code
- [ ] Backup files excluded from build
- [ ] Git changes committed with descriptive messages

---

## 🔧 DEBUGGING COMMANDS

```bash
# Check server health
curl http://localhost:3001/api/health

# Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Verify app-data endpoint
curl -X GET http://localhost:3001/api/app-data \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Check TypeScript errors
npx tsc --noEmit

# Check running processes
ps aux | grep node

# View database tables
psql $DATABASE_URL -c "\dt"
```

---

## 📝 MAINTENANCE LOG

| Date | Issue | Solution | Files Modified |
|------|-------|----------|----------------|
| Oct 3, 2025 | Sign-in failure | Added /api/app-data endpoint | simple-server.js |
| Oct 3, 2025 | Build error | Removed swcMinify | next.config.js |
| Oct 3, 2025 | TypeScript errors | Excluded backup directory | tsconfig.json, .gitignore |
| Oct 3, 2025 | Port configuration | Updated deployment config | .replit |
| Oct 3, 2025 | Type casting errors | Fixed mock implementations | services/api.ts |

---

## 💡 LESSONS LEARNED

1. **Always check both development and production servers** - Next.js API routes don't work in Vite dev mode
2. **Keep dependencies updated** - Deprecated options cause build failures
3. **Exclude non-production code from builds** - Backup directories should be in .gitignore and tsconfig exclude
4. **Use environment variables for all secrets** - Never hardcode credentials
5. **Test the complete user flow** - Registration, login, and data loading must all work together
6. **Document as you go** - Future debugging is much easier with good documentation

---

*Last Updated: October 3, 2025*
*Maintained by: Valifi Development Team*
