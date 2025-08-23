# Valifi - Turso Database Setup Guide

## 🚀 Quick Setup

### 1. Create a Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Sign up/Login to Turso
turso auth login

# Create a new database
turso db create valifi-db

# Get database URL
turso db show valifi-db --url

# Create auth token
turso db tokens create valifi-db
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Turso Database Configuration
TURSO_DATABASE_URL=libsql://valifi-db-[your-username].turso.io
TURSO_AUTH_TOKEN=eyJ...your-token-here

# JWT Configuration
JWT_SECRET=your-very-secure-jwt-secret-min-32-characters
JWT_REFRESH_SECRET=another-very-secure-secret-min-32-characters

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Initialize Database

Once configured, initialize the database tables:

```bash
# Start the development server
npm run dev

# In another terminal, initialize the database
curl http://localhost:3000/api/health?init=true
```

## 📋 Verify Database Connection

### Check Database Health

```bash
# Check if database is connected
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Database is connected and operational",
  "stats": {
    "users": 0,
    "activeSessions": 0,
    "portfolios": 0
  },
  "database": {
    "url": "Configured",
    "authToken": "Configured"
  }
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check your `TURSO_DATABASE_URL` is correct
   - Verify `TURSO_AUTH_TOKEN` is valid
   - Ensure your database is active

2. **Tables not created**
   - Run initialization: `curl http://localhost:3000/api/health?init=true`
   - Check console for error messages

3. **Authentication not working**
   - Ensure JWT_SECRET is set
   - Check database tables are created
   - Verify bcryptjs is installed

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Portfolios Table
```sql
CREATE TABLE portfolios (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  total_value_usd REAL DEFAULT 0,
  cash_balance REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🎯 Test the Complete Flow

1. **Create a new account:**
   - Go to `/signup`
   - Fill in the form
   - Submit

2. **Verify in database:**
   ```bash
   turso db shell valifi-db
   SELECT * FROM users;
   ```

3. **Sign in:**
   - Go to `/signin`
   - Use your credentials
   - Should redirect to dashboard

## 🚀 Deploy to Production (Vercel)

Add these environment variables in Vercel:

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `NEXT_PUBLIC_API_URL` (set to your production URL)

## 📝 Important Notes

- **Never commit `.env.local` to git**
- **Use strong secrets in production**
- **Enable SSL for production database**
- **Regularly backup your database**
- **Monitor database performance**

## 🔐 Security Best Practices

1. **Use environment variables** - Never hardcode credentials
2. **Strong JWT secrets** - At least 32 characters, randomly generated
3. **HTTPS in production** - Always use SSL/TLS
4. **Rate limiting** - Implement on auth endpoints
5. **Input validation** - Already implemented with Zod

## ✅ Checklist

- [ ] Turso CLI installed
- [ ] Database created
- [ ] Environment variables configured
- [ ] Database initialized
- [ ] Health check passing
- [ ] Sign up working
- [ ] Sign in working
- [ ] Sessions stored in database

Your Turso database is now fully integrated! 🎉