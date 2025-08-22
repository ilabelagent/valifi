# Valifi Web App - Complete Authentication & Features Troubleshooting Guide

## Table of Contents
1. [Project Structure](#project-structure)
2. [Authentication Flow](#authentication-flow)
3. [Common Issues & Solutions](#common-issues--solutions)
4. [Testing Guide](#testing-guide)
5. [Deployment Checklist](#deployment-checklist)

## Project Structure

```
valifi/
├── src/
│   ├── auth/                    # Authentication System
│   │   ├── components/
│   │   │   ├── SignInForm.tsx   # Sign-in UI
│   │   │   ├── SignUpForm.tsx   # Registration UI
│   │   │   └── MFAVerify.tsx    # 2FA verification
│   │   ├── services/
│   │   │   └── authService.ts   # Auth API logic
│   │   ├── hooks/
│   │   │   └── useAuth.tsx      # Auth context & hook
│   │   └── guards/
│   │       └── AuthGuard.tsx    # Route protection
│   │
│   └── features/
│       └── dashboard/
│           └── Dashboard.tsx    # Post-auth dashboard
│
├── pages/
│   ├── api/
│   │   └── auth/
│   │       ├── signin.ts        # Sign-in endpoint
│   │       ├── signup.ts        # Registration endpoint
│   │       └── refresh.ts       # Token refresh
│   ├── signin.tsx               # Sign-in page
│   ├── dashboard.tsx            # Dashboard page
│   └── _app.tsx                 # App wrapper with AuthProvider
│
└── package.json                 # Dependencies
```

## Authentication Flow

### 1. Sign In Process
```
User → SignInForm → authService.signIn() → /api/auth/signin → JWT Token → Dashboard
```

### 2. Token Management
- Access Token: 30 minutes expiry
- Refresh Token: 7 days expiry
- Auto-refresh: 5 minutes before expiry

### 3. Protected Routes
```tsx
// Any protected page uses AuthGuard
<AuthGuard requireAuth={true}>
  <YourComponent />
</AuthGuard>
```

## Common Issues & Solutions

### Issue 1: "Cannot find module" errors

**Solution:**
```bash
cd C:\Users\josh\Desktop\GodBrainAI\valifi
npm install axios bcryptjs jsonwebtoken zod @heroicons/react
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

### Issue 2: Sign-in not working

**Check these:**
1. API endpoint is running:
```bash
# Check if Next.js API is running
curl http://localhost:3000/api/auth/signin
```

2. Environment variables are set:
```bash
# Create .env.local if missing
echo "JWT_SECRET=valifi-secret-key-change-in-production" >> .env.local
echo "JWT_REFRESH_SECRET=valifi-refresh-secret-change-in-production" >> .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" >> .env.local
```

3. Verify authService URL:
```typescript
// In src/auth/services/authService.ts
baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
```

### Issue 3: Dashboard not loading after sign-in

**Debug steps:**
```javascript
// Add console logs to check auth state
console.log('Token:', localStorage.getItem('valifi_token'));
console.log('User:', localStorage.getItem('valifi_user'));
```

**Fix redirect:**
```typescript
// In SignInForm.tsx
const redirect = router.query.redirect as string || '/dashboard';
router.push(redirect);
```

### Issue 4: CORS errors

**Solution for development:**
```typescript
// In next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

### Issue 5: TypeScript errors

**Install missing types:**
```bash
npm install --save-dev @types/node @types/react @types/react-dom
```

**Fix import errors:**
```typescript
// Add to tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/auth/*": ["src/auth/*"],
      "@/features/*": ["src/features/*"]
    }
  }
}
```

## Testing Guide

### 1. Test Authentication Flow
```bash
# Start the development server
npm run dev

# Test sign-in with demo credentials
# Email: admin@valifi.com
# Password: any (demo mode)
```

### 2. Test Protected Routes
```typescript
// Visit without auth
http://localhost:3000/dashboard
// Should redirect to /signin

// Sign in first, then visit
http://localhost:3000/dashboard
// Should show dashboard
```

### 3. Test Token Refresh
```javascript
// In browser console
// Check token expiry
const token = localStorage.getItem('valifi_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expires at:', new Date(payload.exp * 1000));
```

## Deployment Checklist

### Pre-Deployment
- [ ] Change JWT secrets in production
- [ ] Set up proper database (replace mock data)
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up email service for verification
- [ ] Implement rate limiting
- [ ] Add monitoring/logging

### Environment Variables
```bash
# Production .env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<another-strong-secret>
DATABASE_URL=<your-database-url>
NEXT_PUBLIC_API_URL=https://api.valifi.com
EMAIL_SERVICE_API_KEY=<email-service-key>
```

### Security Checklist
- [ ] Password hashing with bcrypt
- [ ] HTTPS only cookies
- [ ] CSRF protection
- [ ] Rate limiting on auth endpoints
- [ ] Input validation with Zod
- [ ] SQL injection prevention
- [ ] XSS protection headers

## Quick Start Commands

```bash
# Install dependencies
cd C:\Users\josh\Desktop\GodBrainAI\valifi
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Test authentication
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@valifi.com","password":"password"}'
```

## Debug Mode

Add this to any component for debugging:
```typescript
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Auth State:', {
      user: authService.getUser(),
      token: authService.getToken(),
      isAuthenticated: authService.isAuthenticated()
    });
  }
}, []);
```

## Support & Documentation

- Authentication Issues: Check `/src/auth/services/authService.ts`
- UI Issues: Check `/src/auth/components/`
- API Issues: Check `/pages/api/auth/`
- State Issues: Check `/src/auth/hooks/useAuth.tsx`

## Next Steps

1. Implement remaining auth features:
   - Email verification
   - Password reset
   - Social login (Google, GitHub)
   - MFA setup

2. Add more features:
   - User profile management
   - Settings page
   - Notifications
   - Analytics dashboard

3. Optimize performance:
   - Code splitting
   - Lazy loading
   - Image optimization
   - API caching