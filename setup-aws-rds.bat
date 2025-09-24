@echo off
setlocal enabledelayedexpansion

REM =============================================================================
REM VALIFI FINTECH PLATFORM - AWS RDS SETUP SCRIPT (Windows)
REM =============================================================================

title Valifi Fintech Platform Setup

:main_menu
cls
echo ==============================================
echo    VALIFI FINTECH PLATFORM SETUP WIZARD
echo ==============================================
echo.
echo 1) Complete Setup (Recommended for first time)
echo 2) Create AWS RDS Instance
echo 3) Create Environment Configuration
echo 4) Run Database Migrations
echo 5) Install Dependencies
echo 6) Setup Crypto Payment Processing
echo 7) Test Database Connection
echo 8) Start Application
echo 9) Check Prerequisites
echo 0) Exit
echo.
set /p choice="Please select an option: "

if "%choice%"=="1" goto complete_setup
if "%choice%"=="2" goto create_rds
if "%choice%"=="3" goto create_env
if "%choice%"=="4" goto run_migrations
if "%choice%"=="5" goto install_deps
if "%choice%"=="6" goto setup_crypto
if "%choice%"=="7" goto test_connection
if "%choice%"=="8" goto start_app
if "%choice%"=="9" goto check_prereqs
if "%choice%"=="0" exit /b 0

echo Invalid option. Please try again.
pause
goto main_menu

:check_prereqs
echo [INFO] Checking prerequisites...

REM Check if AWS CLI is installed
aws --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] AWS CLI is not installed.
    echo Please install AWS CLI from: https://aws.amazon.com/cli/
    pause
    goto main_menu
)
echo [OK] AWS CLI is installed

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed.
    echo Please install Node.js from: https://nodejs.org/
    pause
    goto main_menu
)
echo [OK] Node.js is installed

REM Check if PostgreSQL client is available
psql --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] PostgreSQL client (psql) is not installed.
    echo You can install it from: https://www.postgresql.org/download/windows/
    echo Or use pgAdmin for GUI management.
) else (
    echo [OK] PostgreSQL client is available
)

REM Check AWS credentials
aws sts get-caller-identity >nul 2>&1
if errorlevel 1 (
    echo [ERROR] AWS credentials not configured.
    echo Please run: aws configure
    pause
    goto main_menu
)
echo [OK] AWS credentials are configured

echo.
echo All prerequisites check completed!
pause
goto main_menu

:complete_setup
echo [INFO] Starting complete Valifi setup...
call :check_prereqs
call :create_rds
call :create_env
call :install_deps
call :setup_crypto
call :run_migrations

echo.
echo ============================================
echo 🎉 SETUP COMPLETED SUCCESSFULLY!
echo ============================================
echo.
echo 📝 Next steps:
echo    1. Update API keys in .env.local
echo    2. Run 'npm run dev' to start the application
echo    3. Visit http://localhost:3000 to test
echo.
pause
goto main_menu

:create_rds
echo [INFO] Creating AWS RDS PostgreSQL instance...

REM Generate random password
for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(16,4)"') do set DB_PASSWORD=%%i

REM Set variables
set DB_INSTANCE_IDENTIFIER=valifi-fintech-db
set DB_NAME=valifi_fintech
set DB_USERNAME=valifi_user
set DB_INSTANCE_CLASS=db.t3.micro

echo [INFO] Configuration:
echo   Instance ID: %DB_INSTANCE_IDENTIFIER%
echo   Database: %DB_NAME%
echo   Username: %DB_USERNAME%
echo   Password: [HIDDEN]

REM Check if instance already exists
aws rds describe-db-instances --db-instance-identifier %DB_INSTANCE_IDENTIFIER% >nul 2>&1
if not errorlevel 1 (
    echo [INFO] RDS instance already exists!
    for /f "tokens=*" %%i in ('aws rds describe-db-instances --db-instance-identifier %DB_INSTANCE_IDENTIFIER% --query "DBInstances[0].DBInstanceStatus" --output text') do set INSTANCE_STATUS=%%i
    echo [INFO] Instance status: !INSTANCE_STATUS!

    if "!INSTANCE_STATUS!"=="available" (
        echo [INFO] RDS instance is ready!
        call :get_rds_endpoint
    ) else (
        echo [INFO] Waiting for RDS instance to be available...
        aws rds wait db-instance-available --db-instance-identifier %DB_INSTANCE_IDENTIFIER%
        call :get_rds_endpoint
    )
    goto :eof
)

echo [INFO] Creating new RDS instance (this may take 10-15 minutes)...

REM Get default VPC
for /f "tokens=*" %%i in ('aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query "Vpcs[0].VpcId" --output text') do set DEFAULT_VPC=%%i

if "%DEFAULT_VPC%"=="None" (
    echo [INFO] Creating default VPC...
    aws ec2 create-default-vpc
    for /f "tokens=*" %%i in ('aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query "Vpcs[0].VpcId" --output text') do set DEFAULT_VPC=%%i
)

echo [INFO] Using VPC: %DEFAULT_VPC%

REM Create security group
echo [INFO] Creating security group...
aws ec2 create-security-group --group-name valifi-rds-sg --description "Security group for Valifi RDS PostgreSQL" --vpc-id %DEFAULT_VPC% >nul 2>&1

for /f "tokens=*" %%i in ('aws ec2 describe-security-groups --filters "Name=group-name,Values=valifi-rds-sg" --query "SecurityGroups[0].GroupId" --output text') do set SECURITY_GROUP_ID=%%i

REM Get public IP and add inbound rule
for /f "tokens=*" %%i in ('curl -s https://checkip.amazonaws.com') do set MY_IP=%%i
echo [INFO] Adding inbound rule for IP: %MY_IP%

aws ec2 authorize-security-group-ingress --group-id %SECURITY_GROUP_ID% --protocol tcp --port 5432 --cidr %MY_IP%/32 >nul 2>&1

REM Get subnets for subnet group
for /f "tokens=*" %%i in ('aws ec2 describe-subnets --filters "Name=vpc-id,Values=%DEFAULT_VPC%" --query "Subnets[].SubnetId" --output text') do set SUBNETS=%%i

REM Create DB subnet group
aws rds create-db-subnet-group --db-subnet-group-name valifi-subnet-group --db-subnet-group-description "Subnet group for Valifi RDS" --subnet-ids %SUBNETS% >nul 2>&1

REM Create RDS instance
echo [INFO] Creating RDS PostgreSQL instance...
aws rds create-db-instance ^
    --db-instance-identifier %DB_INSTANCE_IDENTIFIER% ^
    --db-instance-class %DB_INSTANCE_CLASS% ^
    --engine postgres ^
    --engine-version 15.4 ^
    --master-username %DB_USERNAME% ^
    --master-user-password %DB_PASSWORD% ^
    --allocated-storage 20 ^
    --storage-type gp2 ^
    --db-name %DB_NAME% ^
    --vpc-security-group-ids %SECURITY_GROUP_ID% ^
    --db-subnet-group-name valifi-subnet-group ^
    --backup-retention-period 7 ^
    --storage-encrypted ^
    --publicly-accessible

REM Save configuration
echo DB_INSTANCE_IDENTIFIER=%DB_INSTANCE_IDENTIFIER% > .rds-config
echo DB_NAME=%DB_NAME% >> .rds-config
echo DB_USERNAME=%DB_USERNAME% >> .rds-config
echo DB_PASSWORD=%DB_PASSWORD% >> .rds-config
echo SECURITY_GROUP_ID=%SECURITY_GROUP_ID% >> .rds-config

echo [INFO] Waiting for RDS instance to be available...
aws rds wait db-instance-available --db-instance-identifier %DB_INSTANCE_IDENTIFIER%

call :get_rds_endpoint
echo [SUCCESS] RDS instance created and ready!
goto :eof

:get_rds_endpoint
if exist .rds-config (
    for /f "tokens=1,2 delims==" %%a in (.rds-config) do set %%a=%%b
)

for /f "tokens=*" %%i in ('aws rds describe-db-instances --db-instance-identifier %DB_INSTANCE_IDENTIFIER% --query "DBInstances[0].Endpoint.Address" --output text') do set DB_ENDPOINT=%%i
for /f "tokens=*" %%i in ('aws rds describe-db-instances --db-instance-identifier %DB_INSTANCE_IDENTIFIER% --query "DBInstances[0].Endpoint.Port" --output text') do set DB_PORT=%%i

echo DB_ENDPOINT=%DB_ENDPOINT% >> .rds-config
echo DB_PORT=%DB_PORT% >> .rds-config

echo [INFO] RDS Endpoint: %DB_ENDPOINT%:%DB_PORT%
goto :eof

:create_env
echo [INFO] Creating local environment configuration...

if not exist .rds-config (
    echo [ERROR] RDS configuration not found. Please create RDS instance first.
    pause
    goto main_menu
)

REM Load RDS config
for /f "tokens=1,2 delims==" %%a in (.rds-config) do set %%a=%%b

REM Generate secrets (simple version for Windows)
set JWT_SECRET=%RANDOM%%RANDOM%%RANDOM%%RANDOM%
set JWT_REFRESH_SECRET=%RANDOM%%RANDOM%%RANDOM%%RANDOM%
set ENCRYPTION_KEY=%RANDOM%%RANDOM%%RANDOM%%RANDOM%

(
echo # =============================================================================
echo # VALIFI FINTECH PLATFORM - LOCAL DEVELOPMENT ENVIRONMENT
echo # =============================================================================
echo # Generated on %date% %time%
echo.
echo # Basic Application Settings
echo NODE_ENV=development
echo PORT=3000
echo BASE_URL=http://localhost:3000
echo.
echo # AWS RDS PostgreSQL Database
echo AWS_RDS_HOST=%DB_ENDPOINT%
echo AWS_RDS_PORT=%DB_PORT%
echo AWS_RDS_DATABASE=%DB_NAME%
echo AWS_RDS_USERNAME=%DB_USERNAME%
echo AWS_RDS_PASSWORD=%DB_PASSWORD%
echo AWS_RDS_SSL=true
echo AWS_RDS_MAX_CONNECTIONS=10
echo AWS_RDS_CONNECTION_TIMEOUT=30000
echo AWS_REGION=us-east-1
echo.
echo # Legacy database URL for migrations
echo DATABASE_URL=postgresql://%DB_USERNAME%:%DB_PASSWORD%@%DB_ENDPOINT%:%DB_PORT%/%DB_NAME%?sslmode=require
echo.
echo # Security
echo JWT_SECRET=%JWT_SECRET%
echo JWT_REFRESH_SECRET=%JWT_REFRESH_SECRET%
echo ENCRYPTION_KEY=%ENCRYPTION_KEY%
echo.
echo # Feature Flags for Development
echo ENABLE_PAPER_TRADING=true
echo ENABLE_CRYPTO_TRADING=true
echo REQUIRE_KYC_FOR_TRADING=false
echo MAX_DAILY_TRANSACTION_LIMIT=10000
echo MAX_TRANSACTION_AMOUNT=1000
echo MOCK_PAYMENT_GATEWAYS=true
echo MOCK_KYC_VERIFICATION=true
echo DEBUG_MODE=true
echo.
echo # ArmorWallet Integration ^(Development/Mock^)
echo ARMOR_WALLET_API_URL=https://api.armorwallet.com/v1
echo ARMOR_WALLET_API_KEY=dev-key-replace-with-real
echo ARMOR_WALLET_API_SECRET=dev-secret-replace-with-real
echo ARMOR_WALLET_ENCRYPTION_KEY=%ENCRYPTION_KEY%
echo.
echo # Alpaca Trading ^& Market Data ^(Paper Trading^)
echo ALPACA_API_KEY=your-alpaca-api-key
echo ALPACA_API_SECRET=your-alpaca-api-secret
echo ALPACA_PAPER_TRADING=true
echo ALPACA_BASE_URL=https://paper-api.alpaca.markets/v2
echo ALPACA_DATA_URL=https://data.alpaca.markets/v2
) > .env.local

echo [SUCCESS] Environment file created: .env.local
echo [WARNING] Please update the API keys in .env.local with your actual credentials
goto :eof

:install_deps
echo [INFO] Installing Node.js dependencies...

if not exist package.json (
    echo [ERROR] package.json not found. Please ensure you're in the project root directory.
    pause
    goto main_menu
)

npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    goto main_menu
)

echo [SUCCESS] Dependencies installed successfully!
goto :eof

:setup_crypto
echo [INFO] Setting up crypto payment processing...

if not exist src\services\crypto mkdir src\services\crypto

(
echo import crypto from 'crypto';
echo.
echo interface CryptoPayment {
echo   id: string;
echo   amount: number;
echo   currency: string;
echo   address: string;
echo   status: 'pending' ^| 'confirmed' ^| 'failed';
echo   confirmations: number;
echo   txHash?: string;
echo }
echo.
echo export class TestCryptoService {
echo   private payments: Map^<string, CryptoPayment^> = new Map^(^);
echo.
echo   async createPayment^(amount: number, currency: string^): Promise^<CryptoPayment^> {
echo     const payment: CryptoPayment = {
echo       id: crypto.randomUUID^(^),
echo       amount,
echo       currency,
echo       address: this.generateTestAddress^(currency^),
echo       status: 'pending',
echo       confirmations: 0
echo     };
echo.
echo     this.payments.set^(payment.id, payment^);
echo.
echo     // Simulate payment confirmation after 10 seconds
echo     setTimeout^(^(^) =^> {
echo       this.confirmPayment^(payment.id^);
echo     }, 10000^);
echo.
echo     return payment;
echo   }
echo.
echo   async getPayment^(id: string^): Promise^<CryptoPayment ^| null^> {
echo     return this.payments.get^(id^) ^|^| null;
echo   }
echo.
echo   private generateTestAddress^(currency: string^): string {
echo     const hash = crypto.randomBytes^(20^).toString^('hex'^);
echo     switch ^(currency.toUpperCase^(^)^) {
echo       case 'BTC':
echo         return '1' + hash.substring^(0, 33^);
echo       case 'ETH':
echo         return '0x' + hash;
echo       default:
echo         return hash;
echo     }
echo   }
echo.
echo   private confirmPayment^(id: string^): void {
echo     const payment = this.payments.get^(id^);
echo     if ^(payment^) {
echo       payment.status = 'confirmed';
echo       payment.confirmations = 6;
echo       payment.txHash = crypto.randomBytes^(32^).toString^('hex'^);
echo       console.log^(`💰 Crypto payment ${id} confirmed!`^);
echo     }
echo   }
echo }
echo.
echo export default new TestCryptoService^(^);
) > src\services\crypto\TestCryptoService.ts

echo [SUCCESS] Test crypto payment service created!
goto :eof

:run_migrations
echo [INFO] Running database migrations...

if not exist migrations\001-production-schema.sql (
    echo [ERROR] Migration files not found. Please ensure you're in the project root directory.
    pause
    goto main_menu
)

if not exist .rds-config (
    echo [ERROR] RDS configuration not found. Please create RDS instance first.
    pause
    goto main_menu
)

REM Load RDS config
for /f "tokens=1,2 delims==" %%a in (.rds-config) do set %%a=%%b

echo [INFO] Running schema migration 001...
set PGPASSWORD=%DB_PASSWORD%
psql -h %DB_ENDPOINT% -p %DB_PORT% -U %DB_USERNAME% -d %DB_NAME% -f migrations\001-production-schema.sql

if errorlevel 1 (
    echo [ERROR] Migration 001 failed
    pause
    goto main_menu
)

echo [INFO] Running fintech schema migration 002...
psql -h %DB_ENDPOINT% -p %DB_PORT% -U %DB_USERNAME% -d %DB_NAME% -f migrations\002-fintech-schema.sql

if errorlevel 1 (
    echo [ERROR] Migration 002 failed
    pause
    goto main_menu
)

echo [SUCCESS] Database migrations completed successfully!
goto :eof

:test_connection
echo [INFO] Testing database connection...

if not exist .rds-config (
    echo [ERROR] RDS configuration not found. Please create RDS instance first.
    pause
    goto main_menu
)

for /f "tokens=1,2 delims==" %%a in (.rds-config) do set %%a=%%b

set PGPASSWORD=%DB_PASSWORD%
psql -h %DB_ENDPOINT% -p %DB_PORT% -U %DB_USERNAME% -d %DB_NAME% -c "SELECT version();"

if errorlevel 1 (
    echo [ERROR] Failed to connect to database
    pause
    goto main_menu
)

echo [SUCCESS] Database connection successful!
goto :eof

:start_app
echo [INFO] Starting Valifi Fintech Platform...

if not exist .env.local (
    echo [ERROR] Environment file not found. Please run the setup first.
    pause
    goto main_menu
)

echo [INFO] Starting in development mode on http://localhost:3000
echo [INFO] Press Ctrl+C to stop the application
npm run dev
goto :eof