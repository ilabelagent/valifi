#!/bin/bash

# Memory API Test Script
# This script tests all conversation memory API endpoints

BASE_URL="http://localhost:5000/api/memory"
SESSION_ID="test-session-$(date +%s)"

echo "==================================="
echo "MEMORY API ENDPOINT TEST"
echo "==================================="
echo "Session ID: $SESSION_ID"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4

    echo -e "${YELLOW}Testing:${NC} $description"
    echo "  $method $endpoint"

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "  ${GREEN}✓ Success${NC} (HTTP $http_code)"
        echo "  Response: $(echo $body | jq -c '.' 2>/dev/null || echo $body | head -c 100)"
    else
        echo -e "  ${RED}✗ Failed${NC} (HTTP $http_code)"
        echo "  Response: $body"
    fi
    echo ""
}

echo "1. Testing Session Summary (GET)"
test_endpoint "GET" "/session/$SESSION_ID/summary" "" "Get session summary"

echo "2. Testing Store Memory (POST)"
test_endpoint "POST" "/session/$SESSION_ID/memory" '{
  "memoryType": "task_context",
  "memoryKey": "test_task",
  "memoryValue": {
    "description": "Testing memory API",
    "status": "in_progress"
  },
  "importance": 100
}' "Store task context memory"

echo "3. Testing Get Memories by Type (GET)"
test_endpoint "GET" "/session/$SESSION_ID/memories/task_context?limit=5" "" "Get task context memories"

echo "4. Testing Store Context (POST)"
test_endpoint "POST" "/session/$SESSION_ID/context" '{
  "contextType": "file",
  "contextKey": "test.ts",
  "contextValue": {
    "purpose": "Testing",
    "lastEdit": "2025-10-21"
  },
  "relevanceScore": 100
}' "Store file context"

echo "5. Testing Store Task (POST)"
test_endpoint "POST" "/session/$SESSION_ID/task" '{
  "taskDescription": "Test memory workflow integration",
  "status": "in_progress",
  "priority": 80,
  "completionPercentage": 50,
  "filesModified": ["test.ts", "memory.ts"]
}' "Create task"

echo "6. Testing Get Tasks (GET)"
test_endpoint "GET" "/session/$SESSION_ID/tasks?status=in_progress" "" "Get in-progress tasks"

echo "7. Testing Final Session Summary (GET)"
test_endpoint "GET" "/session/$SESSION_ID/summary" "" "Get final session summary with all data"

echo "==================================="
echo "TEST COMPLETE"
echo "==================================="
echo ""
echo "Note: If you see 500 errors, the database may not be accessible."
echo "Run 'npm run db:push' first to create the schema."
