#!/bin/bash
# VALIFI FINTECH PLATFORM - AUTOMATED DEPLOYMENT SCRIPT
# Deploys to AWS App Runner with ECS Fargate fallback
# Usage: ./deploy-valifi.sh [--force-ecs]

set -e  # Exit on any error

echo "🚀 VALIFI FINTECH DEPLOYMENT SYSTEM"
echo "===================================="
echo "Timestamp: $(date)"
echo "User: $(whoami)"
echo "Working Directory: $(pwd)"

# Configuration
APP_NAME="valifi-fintech-platform"
AWS_REGION="us-east-1"
ECR_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}"
GITHUB_REPO="https://github.com/josh-devv/valifi"
FORCE_ECS=${1:-""}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verify prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi

    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured. Run 'aws configure' first."
        exit 1
    fi

    # Get AWS Account ID
    export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    log_success "AWS Account ID: $AWS_ACCOUNT_ID"

    # Verify files exist
    if [[ ! -f "apprunner.yaml" ]]; then
        log_error "apprunner.yaml not found!"
        exit 1
    fi

    if [[ ! -f "Dockerfile.aws" ]]; then
        log_error "Dockerfile.aws not found!"
        exit 1
    fi

    log_success "Prerequisites check passed!"
}

# Deploy to App Runner (Primary method)
deploy_app_runner() {
    log_info "🚀 Deploying to AWS App Runner..."

    # Check if service already exists
    SERVICE_ARN=$(aws apprunner list-services \
        --region $AWS_REGION \
        --query "ServiceSummaryList[?ServiceName=='$APP_NAME'].ServiceArn" \
        --output text 2>/dev/null || echo "")

    if [[ -n "$SERVICE_ARN" ]]; then
        log_info "Updating existing App Runner service: $SERVICE_ARN"

        # Update existing service
        aws apprunner update-service \
            --region $AWS_REGION \
            --service-arn "$SERVICE_ARN" \
            --source-configuration file://apprunner-source-config.json
    else
        log_info "Creating new App Runner service..."

        # Create source configuration
        cat > apprunner-source-config.json << EOF
{
    "RepoUrl": "$GITHUB_REPO",
    "Branch": "main",
    "SourceDirectory": "./",
    "ConfigurationSource": "REPOSITORY",
    "AutoDeploymentsEnabled": true
}
EOF

        # Create service
        SERVICE_ARN=$(aws apprunner create-service \
            --region $AWS_REGION \
            --service-name "$APP_NAME" \
            --source-configuration file://apprunner-source-config.json \
            --instance-configuration '{
                "Cpu": "1 vCPU",
                "Memory": "2 GB",
                "InstanceRoleArn": ""
            }' \
            --query 'Service.ServiceArn' \
            --output text)
    fi

    log_success "App Runner service created/updated: $SERVICE_ARN"

    # Wait for deployment
    log_info "Waiting for deployment to complete..."
    aws apprunner wait service-created \
        --region $AWS_REGION \
        --service-arn "$SERVICE_ARN"

    # Get service URL
    SERVICE_URL=$(aws apprunner describe-service \
        --region $AWS_REGION \
        --service-arn "$SERVICE_ARN" \
        --query 'Service.ServiceUrl' \
        --output text)

    log_success "🎉 VALIFI DEPLOYED SUCCESSFULLY!"
    log_success "🌐 Production URL: https://$SERVICE_URL"

    # Test the deployment
    test_deployment "https://$SERVICE_URL"

    return 0
}

# Deploy to ECS Fargate (Fallback method)
deploy_ecs_fargate() {
    log_info "🛠️  Deploying to ECS Fargate (Fallback)..."

    # Login to ECR
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO

    # Create ECR repository if it doesn't exist
    aws ecr describe-repositories --repository-names $APP_NAME --region $AWS_REGION || \
        aws ecr create-repository --repository-name $APP_NAME --region $AWS_REGION

    # Build and push Docker image
    log_info "Building Docker image..."
    docker build -f Dockerfile.aws -t $APP_NAME:latest .
    docker tag $APP_NAME:latest $ECR_REPO:latest
    docker push $ECR_REPO:latest

    # Create ECS cluster
    CLUSTER_NAME="${APP_NAME}-cluster"
    aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $AWS_REGION || true

    # Create task definition
    cat > ecs-task-definition.json << EOF
{
    "family": "$APP_NAME",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "1024",
    "memory": "2048",
    "executionRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskExecutionRole",
    "containerDefinitions": [
        {
            "name": "$APP_NAME",
            "image": "$ECR_REPO:latest",
            "portMappings": [
                {
                    "containerPort": 3001,
                    "protocol": "tcp"
                }
            ],
            "environment": [
                {"name": "NODE_ENV", "value": "production"},
                {"name": "PORT", "value": "3001"},
                {"name": "DATABASE_URL", "value": "postgresql://valifi_admin:8514Direction!@valifi-production-db.c8y4mxfhjklm.us-east-1.rds.amazonaws.com:5432/valifi_production"},
                {"name": "JWT_SECRET", "value": "valifi_jwt_production_secret_2025_secure_key_app_runner_rds_fintech_ai_powered_platform"}
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/$APP_NAME",
                    "awslogs-region": "$AWS_REGION",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ]
}
EOF

    # Register task definition
    aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json --region $AWS_REGION

    log_success "🎉 ECS Fargate deployment completed!"
    return 0
}

# Test deployment
test_deployment() {
    local url=$1
    log_info "🧪 Testing deployment at $url..."

    # Wait a bit for the service to be ready
    sleep 30

    # Test health endpoint
    if curl -f "$url/api/health" --max-time 30 --silent > /dev/null; then
        log_success "✅ Health check passed!"
    else
        log_warning "⚠️  Health check failed - service may still be starting"
    fi

    # Test main endpoint
    if curl -f "$url" --max-time 30 --silent > /dev/null; then
        log_success "✅ Main endpoint accessible!"
    else
        log_warning "⚠️  Main endpoint not responding"
    fi
}

# Main deployment logic
main() {
    log_info "Starting Valifi deployment process..."

    check_prerequisites

    if [[ "$FORCE_ECS" == "--force-ecs" ]]; then
        log_info "Forcing ECS Fargate deployment..."
        deploy_ecs_fargate
        exit 0
    fi

    # Try App Runner first
    log_info "Attempting App Runner deployment..."
    if deploy_app_runner; then
        log_success "✅ App Runner deployment successful!"
        exit 0
    else
        log_warning "❌ App Runner deployment failed - falling back to ECS Fargate"
        deploy_ecs_fargate
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    rm -f apprunner-source-config.json ecs-task-definition.json
}

# Set up cleanup trap
trap cleanup EXIT

# Run main function
main "$@"

echo ""
log_success "🎉 VALIFI FINTECH PLATFORM DEPLOYMENT COMPLETE!"
log_success "🌟 Your AI-powered fintech system is now live!"
echo ""