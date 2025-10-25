# Valifi Kingdom - Admin Credentials

## Default Admin Account

**Email:** `admin@valifi.com`
**Password:** `Admin@123`

**⚠️ IMPORTANT SECURITY NOTICE:**
- Change this password immediately after first login
- Never commit these credentials to version control
- This file is for local development only

## Access Admin Panel

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:5000/login`

3. Login with the credentials above

4. Once logged in, go to: `http://localhost:5000/admin`

## Admin Panel Features

The admin panel includes the following tabs:

### 1. AI Agents (NEW! 🎉)
**Conversational AI Interface** - Interact with 63+ specialized agents through a chat interface
- Auto-detect agent type from your request
- Or manually select from agent types including:
  - Blockchain, Payment, Security, Guardian Angel
  - Financial services (Stocks, Forex, Bonds, Metals)
  - Trading (DeFi, Advanced Trading)
  - Wallet operations (HD, MultiSig)
  - NFT Minting, Analytics, and more
- View execution logs and detailed results
- Real-time agent responses

**Example Commands to Try:**
- "Analyze blockchain transaction status"
- "Process payment for subscription"
- "Monitor security threats"
- "Get stock quote for AAPL"
- "Mint NFT to IPFS"
- "Analyze portfolio performance"

### 2. User Management
- View all platform users with pagination
- Promote/demote admin status
- View user details and KYC status
- Kingdom features management

### 3. Bot Training
- View all trading bots
- Start supervised/reinforcement/transfer learning sessions
- Monitor bot performance metrics
- View training data and results

### 4. Activity Logs
- Immutable audit trail
- Admin actions tracking
- Timestamp and IP logging

### 5. Charities
- Manage charitable organizations
- Update tax ID, wallet addresses
- Kingdom tithing integration

### 6. Ethereal Elements
- Mint divine NFT collectibles
- Manage rarity and supply
- Spiritual/Divine/Cosmic element types

## Agent System Architecture

The AI agent system uses **LangGraph** for multi-agent orchestration:

- **Router:** Analyzes task and determines best agent
- **63+ Specialized Agents** across 7 categories
- **Learning System:** Persistent intelligence with skill progression
- **Memory Bank:** Pattern recognition with confidence scores
- **Execution Logs:** Full trace of agent decision-making

## Creating Additional Admin Users

Run the admin creation script:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/valifi" \
npx tsx server/createAdmin.ts
```

Or promote existing users via the Admin Panel > User Management tab.

## Technical Details

- **Authentication:** JWT tokens (1-hour expiration)
- **Password Hashing:** bcrypt (10 rounds)
- **Database:** PostgreSQL with Drizzle ORM
- **Real-time Updates:** Socket.IO for agent status
- **API Base:** http://localhost:5000/api

## Support

For issues or questions, refer to:
- `/CLAUDE.md` - Complete platform documentation
- `/README.md` - Setup instructions
- Agent orchestrator: `server/agentOrchestrator.ts`
- Learning system: `server/botLearningService.ts`

---

**Last Updated:** 2025-10-25
**Platform Version:** Valifi Kingdom v1.0
