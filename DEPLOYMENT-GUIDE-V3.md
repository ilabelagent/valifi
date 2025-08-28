# VALIFI AI BOT PLATFORM - COMPLETE DEPLOYMENT GUIDE
Version 3.0.0 | PostgreSQL Edition | Production Ready

## 🚀 Quick Start

```bash
# Windows
setup-postgres.bat

# Linux/Mac
chmod +x setup-postgres.sh
./setup-postgres.sh
```

---

## 📋 System Requirements

### Minimum Requirements
- **Node.js**: 18.0.0 or higher
- **PostgreSQL**: 14.0 or higher  
- **Redis**: 6.0 or higher (optional but recommended)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB free space
- **CPU**: 2 cores minimum, 4 cores recommended

### Recommended Stack
- **OS**: Ubuntu 22.04 LTS / Windows Server 2022
- **Node.js**: 20.x LTS
- **PostgreSQL**: 15.x
- **Redis**: 7.x
- **Nginx**: Latest stable
- **PM2**: Latest for process management

---

## 🔧 Installation Steps

### Step 1: Clone and Setup Repository

```bash
# Clone repository
git clone https://github.com/your-org/valifi-ai-bot.git
cd valifi-ai-bot

# Install dependencies
npm install

# Copy environment template
cp .env.template .env.local
```

### Step 2: PostgreSQL Setup

#### Windows:
```bash
# Download PostgreSQL from https://www.postgresql.org/download/windows/
# Run installer and note credentials

# Run setup script
setup-postgres.bat
```

#### Linux/Mac:
```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql

# Create database and user
sudo -u postgres psql
CREATE USER valifi_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE valifi_db OWNER valifi_user;
GRANT ALL PRIVILEGES ON DATABASE valifi_db TO valifi_user;
\q

# Run migrations
psql -U valifi_user -d valifi_db -f migrations/001_initial_schema.sql
psql -U valifi_user -d valifi_db -f migrations/002_advanced_features.sql
```

### Step 3: Redis Setup (Optional but Recommended)

```bash
# Windows - Download from https://github.com/microsoftarchive/redis/releases

# Linux
sudo apt-get install redis-server
sudo systemctl start redis

# Test connection
redis-cli ping
```

### Step 4: Environment Configuration

Edit `.env.local` with your values:

```env
# Database
USE_POSTGRES=true
DATABASE_URL=postgresql://valifi_user:password@localhost:5432/valifi_db

# Security (generate these!)
JWT_SECRET=$(openssl rand -hex 64)
JWT_REFRESH_SECRET=$(openssl rand -hex 64)
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Redis (if installed)
REDIS_URL=redis://localhost:6379

# AI Configuration
OPENAI_API_KEY=your_openai_key

# Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

### Step 5: Build and Test

```bash
# Build the application
npm run build

# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed

# Start development server
npm run dev

# Or start production server
npm start
```

---

## 🌐 Production Deployment

### Option 1: Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Option 2: Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t valifi-bot .
docker run -p 3000:3000 --env-file .env.production valifi-bot
```

### Option 3: VPS/Cloud Server

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "valifi-bot" -- start

# Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/valifi
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000/api;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Option 4: Kubernetes Deployment

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: valifi-bot
spec:
  replicas: 3
  selector:
    matchLabels:
      app: valifi-bot
  template:
    metadata:
      labels:
        app: valifi-bot
    spec:
      containers:
      - name: valifi-bot
        image: your-registry/valifi-bot:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: valifi-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: valifi-secrets
              key: jwt-secret
---
apiVersion: v1
kind: Service
metadata:
  name: valifi-bot-service
spec:
  selector:
    app: valifi-bot
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

---

## 🔒 Security Hardening

### 1. SSL/TLS Setup

```bash
# Using Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 2. Database Security

```sql
-- Create read-only user for analytics
CREATE USER valifi_reader WITH PASSWORD 'secure_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO valifi_reader;

-- Enable SSL for PostgreSQL
# Edit postgresql.conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
```

### 3. Environment Variables Security

```bash
# Use secrets management
# AWS Secrets Manager
aws secretsmanager create-secret --name valifi-prod --secret-string file://.env.production

# HashiCorp Vault
vault kv put secret/valifi @.env.production

# Kubernetes Secrets
kubectl create secret generic valifi-secrets --from-env-file=.env.production
```

### 4. Rate Limiting

```javascript
// Already configured in the application
// Adjust in .env file:
API_RATE_LIMIT=100  # requests per minute
BOT_RATE_LIMIT=50   # bot requests per minute
```

### 5. Security Headers

```javascript
// next.config.js additions
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
};
```

---

## 📊 Monitoring & Maintenance

### 1. Health Checks

```bash
# API Health
curl https://your-domain.com/api/health

# Database Health
psql -U valifi_user -d valifi_db -c "SELECT COUNT(*) FROM users;"

# Redis Health
redis-cli ping
```

### 2. Monitoring Setup

```bash
# Install monitoring stack
docker-compose -f monitoring/docker-compose.yml up -d

# Access dashboards
# Grafana: http://localhost:3000
# Prometheus: http://localhost:9090
```

### 3. Backup Strategy

```bash
# Database backup script
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U valifi_user valifi_db > backup_$TIMESTAMP.sql
aws s3 cp backup_$TIMESTAMP.sql s3://your-backup-bucket/

# Automated backups with cron
0 2 * * * /home/user/backup.sh
```

### 4. Log Management

```javascript
// Winston logger configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

---

## 🚦 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 https://your-domain.com/api/health

# Using K6
k6 run tests/load-test.js
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string
psql postgresql://user:pass@localhost:5432/valifi_db

# Check firewall
sudo ufw allow 5432/tcp
```

#### 2. Redis Connection Failed
```bash
# Check Redis is running
redis-cli ping

# Check Redis config
redis-cli CONFIG GET bind
redis-cli CONFIG GET protected-mode
```

#### 3. Build Errors
```bash
# Clear cache
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### 4. Memory Issues
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Check memory usage
pm2 monit
```

---

## 📈 Performance Optimization

### 1. Database Optimization
```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_transactions_user_created 
ON transactions(user_id, created_at DESC);

-- Analyze tables
ANALYZE users;
ANALYZE transactions;
ANALYZE assets;

-- Vacuum database
VACUUM ANALYZE;
```

### 2. Caching Strategy
```javascript
// Redis caching implementation
const cache = {
  get: async (key) => {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },
  set: async (key, value, ttl = 3600) => {
    await redis.setex(key, ttl, JSON.stringify(value));
  },
};
```

### 3. CDN Setup
```bash
# Cloudflare setup
# 1. Add domain to Cloudflare
# 2. Update DNS records
# 3. Enable caching rules
# 4. Configure page rules for /api/* (bypass cache)
```

---

## 🎯 Production Checklist

- [ ] All environment variables set
- [ ] Database migrations completed
- [ ] SSL certificates installed
- [ ] Backup system configured
- [ ] Monitoring dashboards setup
- [ ] Error tracking (Sentry) configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Admin user created
- [ ] KYC/AML configured (if required)
- [ ] Payment gateways tested
- [ ] Email service configured
- [ ] WebSocket connections tested
- [ ] Bot configurations verified
- [ ] AI API keys valid
- [ ] Compliance requirements met

---

## 📞 Support & Resources

### Documentation
- API Docs: `/api/docs`
- Bot Guide: `/docs/bots`
- Admin Guide: `/docs/admin`

### Community
- Discord: [Join Server](https://discord.gg/valifi)
- GitHub: [Issues](https://github.com/valifi/issues)
- Email: support@valifi.com

### Monitoring URLs
- Health Check: `/api/health`
- Metrics: `/api/metrics`
- Status Page: `/status`

---

## 🎉 Launch Commands

### Development
```bash
npm run dev
```

### Staging
```bash
NODE_ENV=staging npm run build && npm start
```

### Production
```bash
NODE_ENV=production npm run build
pm2 start ecosystem.config.js --env production
```

---

**Version:** 3.0.0  
**Last Updated:** January 21, 2025  
**Status:** PRODUCTION READY ✅

---

© 2025 Valifi AI Bot Platform. All rights reserved.