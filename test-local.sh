#!/bin/bash

# Valiifi Local Testing Script
# This script ensures everything is working before deployment

set -e

echo "🚀 Starting Valiifi local testing..."

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first:"
    echo "curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun is installed"

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Run linting
echo "🔍 Running linter..."
bun run lint:fix

# Run tests
echo "🧪 Running tests..."
bun test

# Build the application
echo "🔨 Building application..."
bun run build

# Start the server in the background
echo "🚀 Starting server..."
bun run start &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test health endpoint
echo "🏥 Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
if [[ $HEALTH_RESPONSE == *"OK"* ]]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    kill $SERVER_PID
    exit 1
fi

# Test API endpoints
echo "🔧 Testing API endpoints..."

# Create an item
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "Test Description"}')

if [[ $CREATE_RESPONSE == *"success\":true"* ]]; then
    echo "✅ Create item test passed"
else
    echo "❌ Create item test failed"
    kill $SERVER_PID
    exit 1
fi

# Get all items
GET_RESPONSE=$(curl -s http://localhost:3000/api/v1/items)
if [[ $GET_RESPONSE == *"success\":true"* ]]; then
    echo "✅ Get items test passed"
else
    echo "❌ Get items test failed"
    kill $SERVER_PID
    exit 1
fi

# Kill the server
kill $SERVER_PID

echo "✅ All tests passed!"
echo ""
echo "📋 Next steps for AWS deployment:"
echo "1. Configure AWS credentials: aws configure"
echo "2. Create ECR repository: aws ecr create-repository --repository-name valiifi"
echo "3. Build and push Docker image"
echo "4. Deploy to ECS/EKS or Lambda"
echo ""
echo "🎉 Valiifi is ready for production deployment!"