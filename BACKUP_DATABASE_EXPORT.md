# Database Export & Migration Guide

## Current Database Structure

**Database Type:** PostgreSQL (Neon Serverless)
**ORM:** Drizzle
**Schema Location:** `shared/schema.ts` (3,128 lines)
**Connection:** `server/db.ts`

## Export Options

### Option 1: Export Full Database Schema + Data

```bash
# Install pg_dump if not available
# Export schema and data
pg_dump $DATABASE_URL > valifi_kingdom_backup_$(date +%Y%m%d).sql

# Export schema only
pg_dump --schema-only $DATABASE_URL > valifi_kingdom_schema.sql

# Export data only
pg_dump --data-only $DATABASE_URL > valifi_kingdom_data.sql
```

### Option 2: Export Using Drizzle Kit

```bash
# Generate migration files from current schema
npm run drizzle-kit generate

# This creates migrations in ./migrations folder
# These SQL files can be used to recreate the database
```

### Option 3: Export to JSON (via custom script)

Create `export-db-data.ts`:

```typescript
import { db } from "./server/db";
import { users, wallets, transactions, tradingBots } from "@shared/schema";
import fs from "fs";

async function exportAllData() {
  const data = {
    users: await db.select().from(users),
    wallets: await db.select().from(wallets),
    transactions: await db.select().from(transactions),
    tradingBots: await db.select().from(tradingBots),
    // Add more tables as needed
  };

  fs.writeFileSync(
    `database_export_${Date.now()}.json`,
    JSON.stringify(data, null, 2)
  );

  console.log("Export complete!");
}

exportAllData();
```

## Migration to New Database

### Step 1: Setup New Database

1. **Create new Neon/PostgreSQL database**
2. **Update DATABASE_URL** in environment variables
3. **Run migrations:**

```bash
npm run db:push
```

### Step 2: Import Data

**From SQL dump:**
```bash
psql $NEW_DATABASE_URL < valifi_kingdom_backup.sql
```

**From Drizzle migrations:**
```bash
# Migrations in ./migrations folder will auto-apply
npm run db:push
```

## File Structure for Code Migration

### Essential Files for Database:

```
📁 Your Project
├── 📄 shared/schema.ts          ← MAIN SCHEMA (50+ tables)
├── 📄 server/db.ts              ← Database connection
├── 📄 server/storage.ts         ← Database query layer
├── 📄 drizzle.config.ts         ← Drizzle configuration
├── 📄 server/replitAuth.ts      ← Auth (depends on sessions table)
├── 📁 migrations/               ← Auto-generated SQL migrations
└── 📄 package.json              ← Dependencies
```

### Copy These Files to New Environment:

1. **Database Core:**
   - `shared/schema.ts` (3,128 lines - ALL table definitions)
   - `server/db.ts`
   - `server/storage.ts`
   - `drizzle.config.ts`

2. **Dependencies (from package.json):**
   ```json
   {
     "@neondatabase/serverless": "latest",
     "drizzle-orm": "latest",
     "drizzle-kit": "latest",
     "pg": "latest"
   }
   ```

3. **Environment Variables:**
   ```
   DATABASE_URL=postgresql://user:pass@host/db
   SESSION_SECRET=your-secret
   ```

## Current Issue: SSL Certificate Error

**Problem:** Neon WebSocket connections failing in Replit environment

**Fix Applied:** Modified `server/db.ts` to accept self-signed certificates

**Status:** Needs server restart to take effect

## Backup Commands (Run Now)

```bash
# Quick schema backup
cp shared/schema.ts schema_backup_$(date +%Y%m%d).ts

# Export database URL for reference
echo $DATABASE_URL > db_connection_backup.txt

# List all tables
npm run drizzle-kit introspect
```

## Tables You Have (50+)

### Core (10):
- sessions, users, adminUsers, agents, agent_logs

### Trading (15):
- tradingBots, bot_learning_sessions, bot_training_data, bot_skills
- trades, portfolios, financialAccounts, payments

### Blockchain (10):
- wallets, transactions, nfts, tokens, smart_contracts
- wallet_connect_sessions

### P2P (6):
- p2pOffers, p2pOrders, p2pPaymentMethods, p2pChatMessages
- p2pDisputes, p2pReviews

### Celebrity Platform (6):
- celebrityProfiles, celebrityFollows, celebrityStakes
- celebrityBets, celebrityPredictions, celebrityContent

### Kingdom Features (5):
- spectrumInvestmentPlans, etherealElements, etherealOwnership
- prayerSessions, scriptures

### Community (8):
- forumServers, forumChannels, forumThreads, forumReplies
- forumMembers, chat_sessions, chat_messages

**TOTAL: 50+ tables with complex relationships**

## Next Steps

1. **Fix current SSL issue** to restore functionality
2. **Run backup commands** above to save current state
3. **Test authentication flow** after fix
4. **Plan migration** if moving to new database/environment
