# Valifi - Complete Deployment Guide with Turso Database

## ✅ Your Database is Ready!

You have successfully created:
- **Database**: `database-rose-yacht`
- **URL**: `libsql://database-rose-yacht-vercel-icfg-hpuwabhqvob9btjcpaebhxip.aws-us-east-1.turso.io`
- **Location**: AWS US East 1

## 🚀 Local Development Setup

### 1. Test Database Connection
```bash
# Run the test script
node test-turso.js
```

### 2. Start Development Server
```bash
# Or use the setup script
setup-database.bat
```

### 3. Test Authentication
- Sign Up: http://localhost:3000/signup
- Sign In: http://localhost:3000/signin
- Health Check: http://localhost:3000/api/health

## 🌐 Deploy to Vercel

### Step 1: Add Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

| Variable | Value |
|----------|-------|
| `TURSO_DATABASE_URL` | `libsql://database-rose-yacht-vercel-icfg-hpuwabhqvob9btjcpaebhxip.aws-us-east-1.turso.io` |
| `TURSO_AUTH_TOKEN` | `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTU5MjUxMjYsImlkIjoiYTI5OGI0YzktOWI0Zi00NDYwLTkyZWItN2EwNTExOWJiM2MwIiwicmlkIjoiNTMxYjlmZWYtYWQ5OC00MWQ5LWFkMTQtMDhjZjg4NDNhYzlmIn0.y5z6YNDy-VIblAJcWNWrHdC5qqaVbfBpyhUeL_QrrKfAzosRl8FYl5R_SKNIQQfUMqn0eL-aqfTXHLv8hpuSDw` |
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_API_URL` | `https://valifi.vercel.app/api` |

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Connect Turso database"
git push origin main
```

### Step 3: Verify Deployment
After deployment, check:
- https://valifi.vercel.app/api/health
- Sign up with a new account
- Check Turso dashboard for new entries

## 📊 Monitor Your Database

### Turso Dashboard
- View at: https://app.turso.tech/
- Database: `database-rose-yacht`
- Check rows, writes, storage usage

### Using Turso CLI
```bash
# Connect to database shell
turso db shell database-rose-yacht

# Query users
SELECT * FROM users;

# Check sessions
SELECT * FROM sessions WHERE expires_at > datetime('now');

# View portfolios
SELECT * FROM portfolios;
```

## 🔒 Security Notes

### For Production:
1. **Generate New JWT Secrets**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Restrict Database Access**:
   - Consider creating read-only tokens for certain operations
   - Use environment-specific tokens

3. **Enable Rate Limiting**:
   - Add rate limiting to auth endpoints
   - Implement CAPTCHA for sign-up

## ✨ Features Now Available

With Turso connected, your app now has:
- ✅ User registration with secure password hashing
- ✅ JWT-based authentication
- ✅ Session management in database
- ✅ User portfolios
- ✅ Transaction history
- ✅ Persistent data storage
- ✅ Real-time data sync

## 🎯 Quick Test

1. **Create Account**:
   - Go to /signup
   - Register with your email
   - Check Turso dashboard for new user

2. **Sign In**:
   - Use your credentials
   - Token stored in localStorage
   - Session created in database

3. **Verify in Turso**:
   ```sql
   -- In Turso shell
   SELECT * FROM users;
   SELECT * FROM sessions;
   SELECT * FROM portfolios;
   ```

## 🆘 Troubleshooting

### Connection Issues:
- Verify `.env.local` has correct values
- Check if token hasn't expired
- Ensure database is active in Turso dashboard

### Build Issues on Vercel:
- Ensure all environment variables are set
- Check build logs for specific errors
- Verify @libsql/client is in dependencies

### Authentication Not Working:
- Check JWT_SECRET is set
- Verify database tables exist
- Check browser console for errors

## 🎉 Success!

Your Valifi app is now connected to Turso database with:
- 3 databases available (valifi-db, database-orange-river, database-rose-yacht)
- Secure authentication system
- Persistent data storage
- Ready for production deployment

The database connection is configured and ready to use! 🚀