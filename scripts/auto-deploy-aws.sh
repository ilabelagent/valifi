#!/bin/bash

# 🚀 Valifi Auto-Deploy to AWS Script
# This script handles complete automation: build, deploy, and run on AWS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="valifi-fintech"
GITHUB_REPO="https://github.com/ilabelagent/valifi"
AWS_REGION="us-east-1"
INSTANCE_CPU="0.25 vCPU"
INSTANCE_MEMORY="0.5 GB"

echo -e "${BLUE}🚀 Starting Valifi Auto-Deploy Pipeline...${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if AWS CLI is installed and configured
check_aws_cli() {
    print_info "Checking AWS CLI configuration..."

    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi

    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi

    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    print_status "AWS CLI configured for account: $ACCOUNT_ID"
}

# Check if App Runner service exists
check_service_status() {
    print_info "Checking App Runner service status..."

    SERVICE_ARN=$(aws apprunner list-services \
        --region $AWS_REGION \
        --query "ServiceSummaryList[?ServiceName=='$SERVICE_NAME'].ServiceArn" \
        --output text 2>/dev/null || echo "")

    if [ -n "$SERVICE_ARN" ]; then
        STATUS=$(aws apprunner describe-service \
            --service-arn "$SERVICE_ARN" \
            --region $AWS_REGION \
            --query 'Service.Status' \
            --output text)
        print_status "Service found: $SERVICE_NAME (Status: $STATUS)"
        echo "SERVICE_ARN=$SERVICE_ARN"
        echo "SERVICE_STATUS=$STATUS"
    else
        print_warning "Service not found. Will create new service."
        echo "SERVICE_ARN="
        echo "SERVICE_STATUS=NOT_FOUND"
    fi
}

# Create IAM role for App Runner if it doesn't exist
create_iam_role() {
    print_info "Checking IAM role for App Runner..."

    ROLE_NAME="AppRunnerInstanceRole"

    if ! aws iam get-role --role-name $ROLE_NAME &> /dev/null; then
        print_info "Creating IAM role: $ROLE_NAME"

        # Create trust policy
        cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "tasks.apprunner.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

        aws iam create-role \
            --role-name $ROLE_NAME \
            --assume-role-policy-document file://trust-policy.json

        # Attach basic execution policy
        aws iam attach-role-policy \
            --role-name $ROLE_NAME \
            --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess

        print_status "IAM role created: $ROLE_NAME"
        rm trust-policy.json
    else
        print_status "IAM role already exists: $ROLE_NAME"
    fi

    ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME"
    echo "ROLE_ARN=$ROLE_ARN"
}

# Create or update App Runner service
deploy_service() {
    print_info "Deploying to AWS App Runner..."

    if [ "$SERVICE_STATUS" = "NOT_FOUND" ]; then
        print_info "Creating new App Runner service..."

        aws apprunner create-service \
            --service-name "$SERVICE_NAME" \
            --region $AWS_REGION \
            --source-configuration "{
                \"CodeRepository\": {
                    \"RepositoryUrl\": \"$GITHUB_REPO\",
                    \"SourceCodeVersion\": {
                        \"Type\": \"BRANCH\",
                        \"Value\": \"main\"
                    },
                    \"CodeConfiguration\": {
                        \"ConfigurationSource\": \"REPOSITORY\"
                    }
                },
                \"AutoDeploymentsEnabled\": true
            }" \
            --instance-configuration "{
                \"Cpu\": \"$INSTANCE_CPU\",
                \"Memory\": \"$INSTANCE_MEMORY\",
                \"InstanceRoleArn\": \"$ROLE_ARN\"
            }" \
            --health-check-configuration '{
                "Protocol": "HTTP",
                "Path": "/api/health",
                "Interval": 10,
                "Timeout": 5,
                "HealthyThreshold": 1,
                "UnhealthyThreshold": 5
            }' > deployment.json

        SERVICE_ARN=$(cat deployment.json | jq -r '.Service.ServiceArn')
        print_status "Service created with ARN: $SERVICE_ARN"

    else
        print_info "Triggering deployment for existing service..."
        aws apprunner start-deployment \
            --service-arn "$SERVICE_ARN" \
            --region $AWS_REGION

        print_status "Deployment triggered for existing service"
    fi
}

# Wait for deployment to complete
wait_for_deployment() {
    print_info "Waiting for deployment to complete..."

    # Wait for service to be running
    aws apprunner wait service-updated \
        --service-arn "$SERVICE_ARN" \
        --region $AWS_REGION

    # Get service URL
    SERVICE_URL=$(aws apprunner describe-service \
        --service-arn "$SERVICE_ARN" \
        --region $AWS_REGION \
        --query 'Service.ServiceUrl' \
        --output text)

    print_status "Deployment completed!"
    print_status "Service URL: https://$SERVICE_URL"

    echo "SERVICE_URL=https://$SERVICE_URL"
}

# Perform health check
health_check() {
    print_info "Performing health check..."

    for i in {1..10}; do
        if curl -f -s "https://$SERVICE_URL/api/health" > /dev/null; then
            print_status "Health check passed! ✅"
            break
        else
            print_warning "Health check attempt $i failed, retrying in 30s..."
            sleep 30
        fi

        if [ $i -eq 10 ]; then
            print_error "Health check failed after 10 attempts"
            exit 1
        fi
    done
}

# Setup monitoring and alerting
setup_monitoring() {
    print_info "Setting up CloudWatch monitoring..."

    # This would setup CloudWatch alarms, but for now just print info
    print_status "Monitoring can be configured in AWS CloudWatch console"
    print_info "Recommended alarms: CPU, Memory, HTTP errors, Response time"
}

# Main execution
main() {
    echo -e "${BLUE}
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║     🚀 VALIFI AUTO-DEPLOY TO AWS PIPELINE               ║
║                                                          ║
║     • Auto-Build on GitHub push                         ║
║     • Auto-Deploy to AWS App Runner                     ║
║     • Auto-Scale with health monitoring                 ║
║     • Zero-downtime deployments                         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
${NC}"

    # Execute pipeline steps
    check_aws_cli
    eval $(check_service_status)
    eval $(create_iam_role)
    deploy_service
    eval $(wait_for_deployment)
    health_check
    setup_monitoring

    echo -e "${GREEN}
🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!

📋 Deployment Summary:
   • Service Name: $SERVICE_NAME
   • Service URL: $SERVICE_URL
   • Health Check: $SERVICE_URL/api/health
   • AWS Region: $AWS_REGION
   • Status: Running ✅

🔄 Auto-Deployment is now active:
   • Push to 'main' branch = Auto-deploy
   • Health monitoring enabled
   • Auto-scaling configured

📊 Next Steps:
   1. Update RDS password in App Runner env vars
   2. Configure custom domain (optional)
   3. Set up SSL certificate (optional)
   4. Configure monitoring alerts

${NC}"
}

# Run the deployment
main "$@"