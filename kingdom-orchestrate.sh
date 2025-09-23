#!/bin/bash
# VALIFI KINGDOM ORCHESTRATION SCRIPT

echo "╔════════════════════════════════════════════════════════╗"
echo "║         VALIFI KINGDOM ORCHESTRATION SYSTEM           ║"
echo "╚════════════════════════════════════════════════════════╝"

# Function to start the kingdom
start_kingdom() {
    echo "🏰 Starting Valifi Kingdom..."
    
    # Start MCP server
    echo "  Starting MCP server..."
    node kingdom-mcp-server.js &
    MCP_PID=$!
    echo "  MCP server started (PID: $MCP_PID)"
    
    # Start Next.js application
    echo "  Starting Next.js application..."
    npm run dev &
    NEXT_PID=$!
    echo "  Next.js started (PID: $NEXT_PID)"
    
    echo "✅ Kingdom is now running!"
    echo "  Dashboard: http://localhost:3000"
    echo "  MCP Console: Interactive in terminal"
    
    # Keep script running
    wait
}

# Function to deploy to production
deploy_production() {
    echo "🚀 Deploying to production..."
    
    # Build project
    npm run build
    
    # Deploy to Render
    git add -A
    git commit -m "Kingdom deployment $(date)"
    git push origin main
    
    echo "✅ Deployed to production!"
}

# Main menu
case "$1" in
    start)
        start_kingdom
        ;;
    deploy)
        deploy_production
        ;;
    *)
        echo "Usage: $0 {start|deploy}"
        exit 1
        ;;
esac
