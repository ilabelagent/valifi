#!/bin/bash

# ============================================
# VALIFI FINTECH PLATFORM - AWS DEPLOYMENT
# Production deployment script for AWS ECS
# ============================================

set -e

# Configuration
AWS_REGION="us-east-1"
ECR_REPOSITORY="valifi-fintech-platform"
ECS_CLUSTER="valifi-production"
ECS_SERVICE="valifi-app-service"
TASK_DEFINITION="valifi-fintech-platform"
CONTAINER_NAME="valifi-app"

echo "🚀 Starting Valifi production deployment..."

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
IMAGE_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest"

echo "📋 Configuration:"
echo "   AWS Account: $AWS_ACCOUNT_ID"
echo "   Region: $AWS_REGION"
echo "   Image: $IMAGE_URI"
echo "   Cluster: $ECS_CLUSTER"
echo "   Service: $ECS_SERVICE"

# Build and push Docker image
echo "🔨 Building Docker image..."
docker build -t $ECR_REPOSITORY:latest .

echo "🔐 Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "📦 Tagging and pushing image..."
docker tag $ECR_REPOSITORY:latest $IMAGE_URI
docker push $IMAGE_URI

# Update task definition
echo "📝 Updating ECS task definition..."
aws ecs register-task-definition \
    --cli-input-json file://aws-task-definition.json \
    --region $AWS_REGION

# Update ECS service
echo "🔄 Updating ECS service..."
aws ecs update-service \
    --cluster $ECS_CLUSTER \
    --service $ECS_SERVICE \
    --task-definition $TASK_DEFINITION \
    --force-new-deployment \
    --region $AWS_REGION

# Wait for deployment to complete
echo "⏳ Waiting for deployment to complete..."
aws ecs wait services-stable \
    --cluster $ECS_CLUSTER \
    --services $ECS_SERVICE \
    --region $AWS_REGION

echo "✅ Deployment completed successfully!"
echo "🌐 Application URL: https://valifi.com"
echo "📊 Monitor at: https://console.aws.amazon.com/ecs/"