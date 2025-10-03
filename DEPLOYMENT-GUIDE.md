# Valifi Platform - Deployment Guide

## Complete Guide to Deploying on Replit

---

## 🚀 DEPLOYMENT OPTIONS

Based on Replit's official documentation, there are 4 deployment types available:

### 1. **Autoscale Deployments** ⭐ RECOMMENDED

**Best For:** Valifi platform with variable traffic

**Features:**
- Automatically scales based on traffic
- Scales down to zero when idle (cost-effective)
- Perfect for web apps, APIs, and microservices
- Handles traffic spikes automatically

**Pricing:**
- Pay only for compute units and requests used
- No cost when application is idle

**Configuration:**
```toml
[deployment]
deploymentTarget = "autoscale"
run = ["sh", "-c", "PORT=5000 npm start"]
build = ["npm", "run", "build"]
```

**✅ Currently Configured:** This is what Valifi uses

---

### 2. **Reserved VM Deployments**

**Best For:** Always-on services, WebSocket servers, background jobs

**Features:**
- Dedicated computing resources
- Always running (24/7)
- Predictable costs
- No cold starts

**Pricing:**
- Fixed monthly cost based on VM size
- Suitable for chat bots, real-time services

**When to Use:**
- If you need WebSocket connections
- If you have background trading bots running 24/7
- If cold starts are unacceptable

---

### 3. **Scheduled Deployments**

**Best For:** Cron jobs, periodic tasks, automated reports

**Features:**
- Runs at specified times
- No persistent infrastructure
- Cost-effective for periodic tasks

**Use Cases:**
- Daily market data updates
- Weekly portfolio reports
- Monthly billing calculations
- Database backups

---

### 4. **Static Deployments**

**Not Applicable** - Valifi requires backend processing

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before deploying to production, ensure all these steps are completed:

### 1. **Environment Configuration**

```bash
# Required Secrets (Set in Replit Secrets pane)
✅ DATABASE_URL - PostgreSQL connection string
✅ JWT_SECRET - Secret key for JWT tokens
```

**How to Set Secrets:**
1. Open your Replit workspace
2. Click "Tools" → "Secrets"
3. Add each secret with its value
4. Secrets automatically sync to deployment

### 2. **Database Setup**

```bash
# Ensure PostgreSQL database exists
✅ Database created in Replit
✅ Migrations completed (8 tables)
✅ Test data populated (optional)
```

**Verify Database:**
```bash
curl http://localhost:3001/api/health
# Should return: { success: true, database: 'connected' }
```

### 3. **Code Quality**

```bash
# No build errors
npm run build

# No TypeScript errors
npx tsc --noEmit

# No security vulnerabilities (optional)
npm audit
```

### 4. **API Endpoint Testing**

```bash
# Test all critical endpoints
✅ POST /api/auth/register - User registration
✅ POST /api/auth/login - User login
✅ GET /api/app-data - Load user data
✅ GET /api/health - Health check
```

### 5. **Configuration Files**

```bash
# Verify these files are correct
✅ .replit - Deployment configuration
✅ package.json - Scripts and dependencies
✅ simple-server.js - Production server
✅ vite.config.ts - Build configuration
```

---

## 🎯 DEPLOYMENT STEPS

### Step 1: Review Configuration

**Current Deployment Config:**
```toml
[deployment]
deploymentTarget = "autoscale"
run = ["sh", "-c", "PORT=5000 npm start"]
build = ["npm", "run", "build"]
```

**What This Does:**
1. **Build Phase:** Runs `npm run build` → Compiles Vite frontend to `/dist`
2. **Run Phase:** Starts `simple-server.js` on port 5000
3. **Serves:** Static files from `/dist` + API endpoints at `/api/*`

### Step 2: Security Scan (Optional)

Replit provides pre-deployment security scanning:

```bash
# Access Security Scanner
Tools → Security Scanner

# Reviews:
- Exposed secrets
- Vulnerable dependencies
- Security best practices
```

### Step 3: Deploy to Production

**Via Replit UI:**
1. Click "Deploy" button (top right)
2. Choose "Autoscale Deployment"
3. Review configuration
4. Click "Deploy"

**Monitor Deployment:**
- View real-time logs
- Check build progress
- Verify successful startup

### Step 4: Post-Deployment Verification

```bash
# Test deployed endpoints
curl https://your-repl-name.repl.co/api/health

# Test authentication
curl -X POST https://your-repl-name.repl.co/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test app data loading
curl https://your-repl-name.repl.co/api/app-data \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 5: Custom Domain (Optional)

**Add Your Own Domain:**
1. Go to Deployment settings
2. Click "Custom Domains"
3. Add your domain (e.g., app.valifi.com)
4. Update DNS records as instructed
5. Replit handles SSL certificates automatically

---

## 🔍 MONITORING & MAINTENANCE

### Real-Time Monitoring

**Via Replit Dashboard:**
- View request logs
- Monitor response times
- Track error rates
- Check resource usage

**Key Metrics to Watch:**
- Request count per hour
- Average response time
- Error rate (should be <1%)
- Database connection pool usage

### Cost Management

**Autoscale Billing:**
- **Compute Units:** Pay per millisecond of execution
- **Requests:** Pay per incoming request
- **Outbound Data:** Pay per GB transferred

**Cost Optimization Tips:**
1. Enable aggressive caching for static assets
2. Optimize database queries (use indexes)
3. Implement connection pooling
4. Monitor and set usage alerts
5. Scale down during low-traffic periods

### Logging

**Access Logs:**
```bash
# Via Replit Dashboard
Deployments → Your App → Logs

# View real-time logs
- Startup logs
- Request/response logs
- Error logs
- Database queries (if enabled)
```

---

## ⚠️ COMMON DEPLOYMENT ISSUES

### Issue 1: Build Fails

**Symptoms:**
- Deployment stuck at "Building..."
- Build logs show TypeScript errors

**Solutions:**
1. Run `npm run build` locally first
2. Check `tsconfig.json` excludes backup directories
3. Verify all imports are correct
4. Remove deprecated dependencies

### Issue 2: App Won't Start

**Symptoms:**
- Deployment shows "Unhealthy"
- Server not responding

**Solutions:**
1. Check PORT is set to 5000
2. Verify secrets are set (DATABASE_URL, JWT_SECRET)
3. Check database connection
4. Review startup logs for errors

### Issue 3: Database Connection Fails

**Symptoms:**
- `/api/health` returns "unhealthy"
- Database queries timeout

**Solutions:**
1. Verify DATABASE_URL secret is correct
2. Check database is running
3. Increase connection pool size
4. Check SSL configuration

### Issue 4: API Returns HTML Instead of JSON

**Symptoms:**
- Frontend shows JSON parsing errors
- API endpoints return HTML

**Solutions:**
1. Verify endpoint exists in `simple-server.js`
2. Check routing configuration
3. Ensure catch-all route is last
4. Review CORS configuration

### Issue 5: Slow Performance

**Symptoms:**
- High response times
- Frequent timeouts

**Solutions:**
1. Add database indexes
2. Implement caching (Redis)
3. Optimize queries (use EXPLAIN)
4. Enable connection pooling
5. Consider Reserved VM deployment

---

## 🔐 SECURITY BEST PRACTICES

### 1. **Secrets Management**

```bash
✅ Use Replit Secrets for all credentials
❌ Never hardcode API keys or passwords
✅ Rotate secrets regularly
✅ Use environment-specific secrets
```

### 2. **Database Security**

```bash
✅ Enable SSL connections
✅ Use parameterized queries (prevent SQL injection)
✅ Implement connection pooling
✅ Set connection timeouts
✅ Regular backups
```

### 3. **API Security**

```bash
✅ Implement rate limiting
✅ Validate all inputs
✅ Use HTTPS only
✅ Enable CORS properly
✅ JWT token expiration (7 days)
```

### 4. **Authentication**

```bash
✅ bcrypt password hashing (cost=12)
✅ JWT tokens with expiration
✅ Secure session management
✅ Email verification (optional)
✅ 2FA support (future)
```

---

## 🔄 DEPLOYMENT WORKFLOW

### Development → Staging → Production

**Recommended Workflow:**

```bash
# 1. Development (Local Replit Workspace)
npm run full-stack
# Test all features

# 2. Commit Changes
git add .
git commit -m "Feature: description"
git push origin main

# 3. Deploy to Production
Click "Deploy" in Replit UI

# 4. Verify Production
curl https://your-app.repl.co/api/health

# 5. Monitor Logs
Watch for errors in deployment logs
```

---

## 📊 PERFORMANCE OPTIMIZATION

### 1. **Database Optimization**

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
```

### 2. **Connection Pooling**

```javascript
// Already configured in simple-server.js
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 20,                    // Maximum connections
    idleTimeoutMillis: 30000,   // Close idle connections
    connectionTimeoutMillis: 5000 // Connection timeout
});
```

### 3. **Caching Strategy**

```javascript
// Add to simple-server.js
app.use(express.static('dist', {
    maxAge: '1d',          // Cache static files for 1 day
    etag: true,            // Enable ETags
    lastModified: true     // Enable Last-Modified headers
}));
```

### 4. **Compression**

```javascript
// Add to simple-server.js
const compression = require('compression');
app.use(compression());
```

---

## 📱 MONITORING & ALERTS

### Set Up Monitoring

**Recommended Tools:**
1. **Replit Dashboard** - Built-in monitoring
2. **Uptime Monitoring** - External service (e.g., UptimeRobot)
3. **Error Tracking** - Sentry integration (optional)
4. **Log Aggregation** - Datadog or LogRocket (optional)

### Alert Configuration

**Critical Alerts:**
- ❌ Application down
- ❌ Database connection lost
- ❌ High error rate (>5%)
- ❌ Slow response times (>2s)

**Warning Alerts:**
- ⚠️ High CPU usage (>80%)
- ⚠️ High memory usage (>90%)
- ⚠️ Unusual traffic patterns

---

## 🎉 SUCCESS CRITERIA

Your deployment is successful when:

- ✅ Health endpoint returns healthy status
- ✅ User registration works
- ✅ User login works
- ✅ Dashboard loads user data
- ✅ All API endpoints return JSON
- ✅ No console errors in browser
- ✅ Response times < 500ms
- ✅ Database connections stable
- ✅ SSL certificate active
- ✅ Custom domain configured (if applicable)

---

## 📞 SUPPORT & RESOURCES

**Replit Documentation:**
- Deployment Guide: https://docs.replit.com/cloud-services/deployments
- Database Guide: https://docs.replit.com/cloud-services/postgresql
- Secrets Management: https://docs.replit.com/replit-workspace/workspace-features/secrets

**Valifi Resources:**
- Error Reference: `ERRORS-AND-FIXES.md`
- Architecture: `replit.md`
- API Documentation: `COMPLETE-DIRECTORY-DOCUMENTATION.md`

---

*Last Updated: October 3, 2025*
*Next Review: Monthly*
