#!/bin/bash

# =============================================================================
# VALIFI FINTECH PLATFORM - AWS RDS SETUP SCRIPT
# =============================================================================
# This script will help you set up AWS RDS PostgreSQL and configure your
# local environment for testing the Valifi fintech platform.

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first: https://aws.amazon.com/cli/"
    fi

    # Check if AWS credentials are configured
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS credentials not configured. Run 'aws configure' first."
    fi

    log "AWS CLI is properly configured"
}

# Check if PostgreSQL client is installed
check_psql() {
    if ! command -v psql &> /dev/null; then
        warn "PostgreSQL client (psql) is not installed."
        info "Installing PostgreSQL client..."

        # Install based on OS
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get update && sudo apt-get install -y postgresql-client
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install postgresql
        elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
            error "Please install PostgreSQL client manually on Windows"
        fi
    fi

    log "PostgreSQL client is available"
}

# Generate random password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Create AWS RDS PostgreSQL instance
create_rds_instance() {
    log "Creating AWS RDS PostgreSQL instance..."

    # Configuration
    DB_INSTANCE_IDENTIFIER="valifi-fintech-db"
    DB_NAME="valifi_fintech"
    DB_USERNAME="valifi_user"
    DB_PASSWORD=$(generate_password)
    DB_INSTANCE_CLASS="db.t3.micro"  # Free tier eligible
    VPC_SECURITY_GROUP_ID=""

    # Get default VPC
    DEFAULT_VPC=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query 'Vpcs[0].VpcId' --output text 2>/dev/null || echo "")

    if [ "$DEFAULT_VPC" == "None" ] || [ -z "$DEFAULT_VPC" ]; then
        warn "No default VPC found. Creating one..."
        aws ec2 create-default-vpc || error "Failed to create default VPC"
        DEFAULT_VPC=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query 'Vpcs[0].VpcId' --output text)
    fi

    log "Using VPC: $DEFAULT_VPC"

    # Create security group for RDS
    log "Creating security group for RDS..."
    SECURITY_GROUP_ID=$(aws ec2 create-security-group \
        --group-name valifi-rds-sg \
        --description "Security group for Valifi RDS PostgreSQL" \
        --vpc-id $DEFAULT_VPC \
        --query 'GroupId' \
        --output text 2>/dev/null || echo "")

    if [ -z "$SECURITY_GROUP_ID" ]; then
        # Security group might already exist, try to get it
        SECURITY_GROUP_ID=$(aws ec2 describe-security-groups \
            --filters "Name=group-name,Values=valifi-rds-sg" "Name=vpc-id,Values=$DEFAULT_VPC" \
            --query 'SecurityGroups[0].GroupId' \
            --output text 2>/dev/null || echo "")
    fi

    if [ -z "$SECURITY_GROUP_ID" ] || [ "$SECURITY_GROUP_ID" == "None" ]; then
        error "Failed to create or find security group"
    fi

    log "Security Group ID: $SECURITY_GROUP_ID"

    # Add inbound rule for PostgreSQL (port 5432)
    MY_IP=$(curl -s https://checkip.amazonaws.com)
    log "Adding inbound rule for your IP: $MY_IP"

    aws ec2 authorize-security-group-ingress \
        --group-id $SECURITY_GROUP_ID \
        --protocol tcp \
        --port 5432 \
        --cidr ${MY_IP}/32 2>/dev/null || warn "Security group rule might already exist"

    # Create DB subnet group
    log "Creating DB subnet group..."
    SUBNETS=$(aws ec2 describe-subnets \
        --filters "Name=vpc-id,Values=$DEFAULT_VPC" \
        --query 'Subnets[].SubnetId' \
        --output text)

    SUBNET_ARRAY=($SUBNETS)
    if [ ${#SUBNET_ARRAY[@]} -lt 2 ]; then
        error "Need at least 2 subnets in different AZs for RDS"
    fi

    aws rds create-db-subnet-group \
        --db-subnet-group-name valifi-subnet-group \
        --db-subnet-group-description "Subnet group for Valifi RDS" \
        --subnet-ids $SUBNETS 2>/dev/null || warn "DB subnet group might already exist"

    # Check if RDS instance already exists
    EXISTING_INSTANCE=$(aws rds describe-db-instances \
        --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
        --query 'DBInstances[0].DBInstanceStatus' \
        --output text 2>/dev/null || echo "")

    if [ -n "$EXISTING_INSTANCE" ] && [ "$EXISTING_INSTANCE" != "None" ]; then
        log "RDS instance $DB_INSTANCE_IDENTIFIER already exists with status: $EXISTING_INSTANCE"

        if [ "$EXISTING_INSTANCE" == "available" ]; then
            log "RDS instance is ready!"
            get_rds_endpoint
            return 0
        else
            log "Waiting for existing RDS instance to be available..."
            wait_for_rds_available
            return 0
        fi
    fi

    # Create RDS instance
    log "Creating RDS PostgreSQL instance (this may take 10-15 minutes)..."

    aws rds create-db-instance \
        --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
        --db-instance-class $DB_INSTANCE_CLASS \
        --engine postgres \
        --engine-version 15.4 \
        --master-username $DB_USERNAME \
        --master-user-password $DB_PASSWORD \
        --allocated-storage 20 \
        --storage-type gp2 \
        --db-name $DB_NAME \
        --vpc-security-group-ids $SECURITY_GROUP_ID \
        --db-subnet-group-name valifi-subnet-group \
        --backup-retention-period 7 \
        --storage-encrypted \
        --deletion-protection \
        --enable-performance-insights \
        --publicly-accessible

    log "RDS instance creation initiated. Waiting for it to be available..."

    # Save credentials for later use
    echo "DB_INSTANCE_IDENTIFIER=$DB_INSTANCE_IDENTIFIER" > .rds-config
    echo "DB_NAME=$DB_NAME" >> .rds-config
    echo "DB_USERNAME=$DB_USERNAME" >> .rds-config
    echo "DB_PASSWORD=$DB_PASSWORD" >> .rds-config
    echo "SECURITY_GROUP_ID=$SECURITY_GROUP_ID" >> .rds-config

    wait_for_rds_available
}

# Wait for RDS instance to be available
wait_for_rds_available() {
    log "Waiting for RDS instance to be available..."

    # Load config if exists
    if [ -f .rds-config ]; then
        source .rds-config
    fi

    aws rds wait db-instance-available --db-instance-identifier ${DB_INSTANCE_IDENTIFIER:-valifi-fintech-db}

    log "RDS instance is now available!"
    get_rds_endpoint
}

# Get RDS endpoint
get_rds_endpoint() {
    # Load config if exists
    if [ -f .rds-config ]; then
        source .rds-config
    fi

    DB_ENDPOINT=$(aws rds describe-db-instances \
        --db-instance-identifier ${DB_INSTANCE_IDENTIFIER:-valifi-fintech-db} \
        --query 'DBInstances[0].Endpoint.Address' \
        --output text)

    DB_PORT=$(aws rds describe-db-instances \
        --db-instance-identifier ${DB_INSTANCE_IDENTIFIER:-valifi-fintech-db} \
        --query 'DBInstances[0].Endpoint.Port' \
        --output text)

    log "RDS Endpoint: $DB_ENDPOINT:$DB_PORT"

    # Save endpoint to config
    echo "DB_ENDPOINT=$DB_ENDPOINT" >> .rds-config
    echo "DB_PORT=$DB_PORT" >> .rds-config
}

# Create local environment file
create_env_file() {
    log "Creating local environment configuration..."

    # Load RDS config
    if [ -f .rds-config ]; then
        source .rds-config
    else
        error "RDS configuration not found. Please run RDS setup first."
    fi

    # Generate JWT secrets
    JWT_SECRET=$(openssl rand -base64 64)
    JWT_REFRESH_SECRET=$(openssl rand -base64 64)
    ENCRYPTION_KEY=$(openssl rand -hex 32)

    cat > .env.local << EOF
# =============================================================================
# VALIFI FINTECH PLATFORM - LOCAL DEVELOPMENT ENVIRONMENT
# =============================================================================
# Generated on $(date)

# Basic Application Settings
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# AWS RDS PostgreSQL Database
AWS_RDS_HOST=$DB_ENDPOINT
AWS_RDS_PORT=$DB_PORT
AWS_RDS_DATABASE=$DB_NAME
AWS_RDS_USERNAME=$DB_USERNAME
AWS_RDS_PASSWORD=$DB_PASSWORD
AWS_RDS_SSL=true
AWS_RDS_MAX_CONNECTIONS=10
AWS_RDS_CONNECTION_TIMEOUT=30000
AWS_REGION=us-east-1

# Legacy database URL for migrations
DATABASE_URL=postgresql://$DB_USERNAME:$DB_PASSWORD@$DB_ENDPOINT:$DB_PORT/$DB_NAME?sslmode=require

# Security
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY

# ArmorWallet Integration (Development/Mock)
ARMOR_WALLET_API_URL=https://api.armorwallet.com/v1
ARMOR_WALLET_API_KEY=dev-key-replace-with-real
ARMOR_WALLET_API_SECRET=dev-secret-replace-with-real
ARMOR_WALLET_ENCRYPTION_KEY=$ENCRYPTION_KEY

# Alpaca Trading & Market Data (Paper Trading)
ALPACA_API_KEY=your-alpaca-api-key
ALPACA_API_SECRET=your-alpaca-api-secret
ALPACA_PAPER_TRADING=true
ALPACA_BASE_URL=https://paper-api.alpaca.markets/v2
ALPACA_DATA_URL=https://data.alpaca.markets/v2

# Interactive Brokers (Local Gateway)
IB_GATEWAY_HOST=localhost
IB_GATEWAY_PORT=7497
IB_CLIENT_ID=1
IB_ENCRYPTION_KEY=$ENCRYPTION_KEY

# Payment Gateways (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_key
STRIPE_WEBHOOK_SECRET=whsec_test_webhook_secret

# Plaid (Sandbox)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_sandbox_secret
PLAID_ENV=sandbox

# Coinbase Commerce (Sandbox)
COINBASE_API_KEY=your_coinbase_sandbox_key
COINBASE_API_SECRET=your_coinbase_sandbox_secret
COINBASE_PASSPHRASE=your_coinbase_sandbox_passphrase
COINBASE_SANDBOX=true

# KYC/AML Compliance (Test Mode)
JUMIO_API_TOKEN=your_jumio_test_token
JUMIO_API_SECRET=your_jumio_test_secret
JUMIO_BASE_URL=https://netverify.com/api/v4
CHAINALYSIS_API_KEY=your_chainalysis_test_key
OFAC_API_KEY=your_ofac_test_key

# Feature Flags for Development
ENABLE_PAPER_TRADING=true
ENABLE_CRYPTO_TRADING=true
ENABLE_OPTIONS_TRADING=false
ENABLE_FOREX_TRADING=false
REQUIRE_KYC_FOR_TRADING=false
MAX_DAILY_TRANSACTION_LIMIT=10000
MAX_TRANSACTION_AMOUNT=1000
MOCK_PAYMENT_GATEWAYS=true
MOCK_KYC_VERIFICATION=true
DEBUG_MODE=true

# Email (Development)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
FROM_EMAIL=noreply@localhost

EOF

    log "Environment file created: .env.local"
    warn "Please update the API keys in .env.local with your actual credentials"
}

# Test database connection
test_db_connection() {
    log "Testing database connection..."

    # Load config
    if [ -f .rds-config ]; then
        source .rds-config
    else
        error "RDS configuration not found"
    fi

    # Test connection
    PGPASSWORD=$DB_PASSWORD psql -h $DB_ENDPOINT -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -c "SELECT version();" || error "Failed to connect to database"

    log "Database connection successful!"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."

    # Check if migration files exist
    if [ ! -f "migrations/001-production-schema.sql" ] || [ ! -f "migrations/002-fintech-schema.sql" ]; then
        error "Migration files not found. Please ensure you're in the project root directory."
    fi

    # Load config
    if [ -f .rds-config ]; then
        source .rds-config
    else
        error "RDS configuration not found"
    fi

    # Run migrations
    log "Running schema migration 001..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_ENDPOINT -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -f migrations/001-production-schema.sql

    log "Running fintech schema migration 002..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_ENDPOINT -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -f migrations/002-fintech-schema.sql

    log "Database migrations completed successfully!"
}

# Install dependencies
install_dependencies() {
    log "Installing Node.js dependencies..."

    if [ ! -f "package.json" ]; then
        error "package.json not found. Please ensure you're in the project root directory."
    fi

    npm install || error "Failed to install dependencies"

    log "Dependencies installed successfully!"
}

# Create crypto payment setup
setup_crypto_payments() {
    log "Setting up crypto payment processing..."

    # Create a simple crypto payment service for testing
    mkdir -p src/services/crypto

    cat > src/services/crypto/TestCryptoService.ts << 'EOF'
import crypto from 'crypto';

interface CryptoPayment {
  id: string;
  amount: number;
  currency: string;
  address: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  txHash?: string;
}

export class TestCryptoService {
  private payments: Map<string, CryptoPayment> = new Map();

  async createPayment(amount: number, currency: string): Promise<CryptoPayment> {
    const payment: CryptoPayment = {
      id: crypto.randomUUID(),
      amount,
      currency,
      address: this.generateTestAddress(currency),
      status: 'pending',
      confirmations: 0
    };

    this.payments.set(payment.id, payment);

    // Simulate payment confirmation after 10 seconds
    setTimeout(() => {
      this.confirmPayment(payment.id);
    }, 10000);

    return payment;
  }

  async getPayment(id: string): Promise<CryptoPayment | null> {
    return this.payments.get(id) || null;
  }

  private generateTestAddress(currency: string): string {
    const hash = crypto.randomBytes(20).toString('hex');
    switch (currency.toUpperCase()) {
      case 'BTC':
        return '1' + hash.substring(0, 33);
      case 'ETH':
        return '0x' + hash;
      default:
        return hash;
    }
  }

  private confirmPayment(id: string): void {
    const payment = this.payments.get(id);
    if (payment) {
      payment.status = 'confirmed';
      payment.confirmations = 6;
      payment.txHash = crypto.randomBytes(32).toString('hex');
      console.log(`💰 Crypto payment ${id} confirmed!`);
    }
  }
}

export default new TestCryptoService();
EOF

    log "Test crypto payment service created!"
}

# Start the application
start_application() {
    log "Starting Valifi Fintech Platform..."

    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        error "Environment file not found. Please run the setup first."
    fi

    # Start the application in development mode
    log "Starting in development mode on http://localhost:3000"
    npm run dev
}

# Main menu
show_menu() {
    echo
    echo "=============================================="
    echo "   VALIFI FINTECH PLATFORM SETUP WIZARD"
    echo "=============================================="
    echo
    echo "1) Complete Setup (Recommended for first time)"
    echo "2) Create AWS RDS Instance"
    echo "3) Create Environment Configuration"
    echo "4) Run Database Migrations"
    echo "5) Install Dependencies"
    echo "6) Setup Crypto Payment Processing"
    echo "7) Test Database Connection"
    echo "8) Start Application"
    echo "9) Check AWS RDS Status"
    echo "0) Exit"
    echo
    read -p "Please select an option: " choice

    case $choice in
        1) complete_setup ;;
        2) check_aws_cli && create_rds_instance ;;
        3) create_env_file ;;
        4) run_migrations ;;
        5) install_dependencies ;;
        6) setup_crypto_payments ;;
        7) test_db_connection ;;
        8) start_application ;;
        9) check_rds_status ;;
        0) exit 0 ;;
        *) error "Invalid option" ;;
    esac
}

# Complete setup
complete_setup() {
    log "Starting complete Valifi setup..."

    check_aws_cli
    check_psql
    create_rds_instance
    create_env_file
    install_dependencies
    setup_crypto_payments
    run_migrations
    test_db_connection

    log "🎉 Setup completed successfully!"
    log "📝 Next steps:"
    log "   1. Update API keys in .env.local"
    log "   2. Run 'npm run dev' to start the application"
    log "   3. Visit http://localhost:3000 to test"
}

# Check RDS status
check_rds_status() {
    if [ -f .rds-config ]; then
        source .rds-config
        STATUS=$(aws rds describe-db-instances \
            --db-instance-identifier ${DB_INSTANCE_IDENTIFIER:-valifi-fintech-db} \
            --query 'DBInstances[0].DBInstanceStatus' \
            --output text 2>/dev/null || echo "not-found")

        log "RDS Instance Status: $STATUS"

        if [ "$STATUS" == "available" ]; then
            get_rds_endpoint
        fi
    else
        warn "No RDS configuration found"
    fi
}

# Main execution
main() {
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "migrations" ]; then
        error "Please run this script from the Valifi project root directory"
    fi

    show_menu
}

# Run main function
main "$@"
EOF