# 🚀 Valifi Fintech Platform - Quick Start Guide

## Prerequisites

Before you begin, ensure you have:

- ✅ **AWS Account** with Administrator access
- ✅ **AWS CLI** installed and configured (`aws configure`)
- ✅ **Node.js** 18+ installed
- ✅ **PostgreSQL client** (psql) installed (optional but recommended)
- ✅ **Git** for version control

## 🎯 Quick Setup (5 Steps)

### Step 1: Run the Automated Setup

Choose your operating system:

#### Windows (Recommended):
```bash
# Navigate to your project directory
cd C:\Users\josh\Desktop\GodBrainAI\valifi

# Run the setup script
setup-aws-rds.bat
```

#### Linux/Mac:
```bash
# Navigate to your project directory
cd /path/to/valifi

# Make script executable
chmod +x setup-aws-rds.sh

# Run the setup script
./setup-aws-rds.sh
```

**Select Option 1: "Complete Setup"** - This will:
- ✅ Create AWS RDS PostgreSQL instance
- ✅ Generate environment configuration
- ✅ Install dependencies
- ✅ Run database migrations
- ✅ Setup crypto payment processing

### Step 2: Update API Keys (Important!)

Edit `.env.local` and add your real API keys:

```env
# Required for trading (get from Alpaca)
ALPACA_API_KEY=your-actual-alpaca-key
ALPACA_API_SECRET=your-actual-alpaca-secret

# Required for payments (get from Stripe)
STRIPE_SECRET_KEY=sk_test_your-stripe-test-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-test-key

# Required for bank integration (get from Plaid)
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-sandbox-secret
```

### Step 3: Start the Application

```bash
npm run dev
```

### Step 4: Test the Platform

Open your browser and go to: **http://localhost:3000**

### Step 5: Create Your First Account

1. Click **"Sign Up"**
2. Fill in your details
3. Click **"Create Account"**
4. Test the login functionality

---

## 🔧 Manual Setup (If Automated Script Fails)

### 1. AWS RDS Setup

```bash
# Create RDS instance
aws rds create-db-instance \
    --db-instance-identifier valifi-fintech-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username valifi_user \
    --master-user-password YourSecurePassword123 \
    --allocated-storage 20 \
    --db-name valifi_fintech \
    --publicly-accessible
```

### 2. Environment Configuration

Create `.env.local`:

```env
# Copy from .env.production.template and update values
# Essential settings:
NODE_ENV=development
AWS_RDS_HOST=your-rds-endpoint.amazonaws.com
AWS_RDS_DATABASE=valifi_fintech
AWS_RDS_USERNAME=valifi_user
AWS_RDS_PASSWORD=YourSecurePassword123
```

### 3. Install & Migrate

```bash
# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

---

## 🧪 Testing All Features

### 1. User Authentication
- ✅ **Sign Up**: Create a new account
- ✅ **Sign In**: Login with credentials
- ✅ **Dashboard**: Access main dashboard

### 2. Wallet Management
- ✅ **Create Wallet**: Test ArmorWallet integration
- ✅ **View Balance**: Check wallet balances
- ✅ **Transactions**: Test crypto payments

### 3. Trading Features
- ✅ **Market Data**: Real-time price feeds (Alpaca)
- ✅ **Place Orders**: Test trading functionality
- ✅ **Positions**: View trading positions

### 4. Payment Processing
- ✅ **Deposits**: Test payment gateways
- ✅ **Withdrawals**: Test withdrawal process
- ✅ **Payment Methods**: Add/remove payment methods

### 5. Compliance
- ✅ **KYC Verification**: Identity verification flow
- ✅ **AML Checks**: Anti-money laundering screening

---

## 📋 Test Checklist

After setup, verify these work:

- [ ] **Application starts**: `npm run dev` works
- [ ] **Database connected**: No connection errors
- [ ] **Sign up works**: Create new account
- [ ] **Sign in works**: Login with account
- [ ] **Dashboard loads**: Main interface accessible
- [ ] **API endpoints respond**: Check `/api/health-check`

---

## 🎮 Demo Data & Testing

### Test User Accounts

The system includes test accounts you can use:

```
Email: demo@valifi.com
Password: Demo123456

Email: trader@valifi.com
Password: Trader123456
```

### Mock Payment Testing

For Stripe testing, use these test card numbers:

```
Visa: 4242424242424242
Mastercard: 5555555555554444
Amex: 378282246310005
Declined: 4000000000000002
```

### Crypto Testing

The system includes a mock crypto service that simulates:
- Payment address generation
- Transaction confirmations (10-second delay)
- Balance updates

---

## 🎯 Key Features to Test

### 1. **Wallet Creation**
```bash
# Should create crypto wallet automatically on signup
POST /api/wallets/create
{
  "walletType": "crypto",
  "currency": "BTC"
}
```

### 2. **Market Data**
```bash
# Get real-time quotes
GET /api/market/quote/AAPL
```

### 3. **Trading**
```bash
# Place a test order
POST /api/trading/orders
{
  "symbol": "AAPL",
  "side": "buy",
  "quantity": 1,
  "type": "market"
}
```

### 4. **Payments**
```bash
# Process payment
POST /api/payments/deposit
{
  "amount": 100,
  "currency": "USD",
  "paymentMethodId": "pm_test_123"
}
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. **Database Connection Failed**
```bash
# Check RDS instance status
aws rds describe-db-instances --db-instance-identifier valifi-fintech-db

# Test connection manually
psql -h your-endpoint.rds.amazonaws.com -U valifi_user -d valifi_fintech
```

#### 2. **API Keys Invalid**
- Verify Alpaca keys are for the correct environment (paper/live)
- Check Stripe keys match your account
- Ensure Plaid is in sandbox mode for testing

#### 3. **Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

#### 4. **Migration Errors**
```bash
# Check migration files exist
ls migrations/

# Run migrations manually
psql $DATABASE_URL -f migrations/001-production-schema.sql
psql $DATABASE_URL -f migrations/002-fintech-schema.sql
```

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ **No errors** in the console when starting
2. ✅ **Green checkmarks** in integration tests
3. ✅ **User can sign up** and receive confirmation
4. ✅ **Dashboard loads** with user data
5. ✅ **Market data appears** in real-time
6. ✅ **Wallet creation succeeds** automatically
7. ✅ **Test payments process** without errors

---

## 🚨 Important Security Notes

### For Testing:
- Use **paper trading** mode (ALPACA_PAPER_TRADING=true)
- Use **Stripe test keys** (sk_test_...)
- Use **Plaid sandbox** (PLAID_ENV=sandbox)
- Set **MOCK_PAYMENT_GATEWAYS=true**

### For Production:
- Switch to **live trading** (ALPACA_PAPER_TRADING=false)
- Use **Stripe live keys** (sk_live_...)
- Use **Plaid production** (PLAID_ENV=production)
- Set **MOCK_PAYMENT_GATEWAYS=false**
- Enable **KYC verification** (REQUIRE_KYC_FOR_TRADING=true)

---

## 📞 Getting Help

If you encounter issues:

1. **Check logs**: Look at console output for errors
2. **Run tests**: `npm run test:integration`
3. **Check AWS**: Verify RDS instance is running
4. **Verify environment**: Ensure all required vars are set
5. **Database connection**: Test with `psql` directly

---

## 🎊 What's Next?

After successful setup:

1. **Customize UI**: Update branding and styling
2. **Add features**: Implement additional trading strategies
3. **Production deploy**: Follow deployment guide
4. **Compliance setup**: Configure real KYC/AML providers
5. **Monitor**: Set up logging and monitoring

---

**🎉 Congratulations! Your Valifi Fintech Platform is now ready for testing!**

Visit **http://localhost:3000** to start exploring your new fintech platform with:
- ✨ Real-time market data
- 💰 Crypto wallet management
- 📈 Trading capabilities
- 💳 Payment processing
- 🔒 KYC/AML compliance
- 🏦 Banking integration