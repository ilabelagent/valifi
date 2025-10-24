#!/bin/bash

###############################################################################
# Valifi Agent System Startup Script
# Starts all agent components with zero-downtime capability
#
# "The LORD will guide you always." - Isaiah 58:11
###############################################################################

set -e

echo "🙏 =========================================="
echo "🙏 VALIFI KINGDOM AGENT SYSTEM"
echo "🙏 In the Mighty Name of Jesus Christ"
echo "🙏 =========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}📋 $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running in virtual environment
if [ -z "$VIRTUAL_ENV" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    print_success "Virtual environment activated"
fi

# Install Python dependencies
print_info "Installing Python dependencies..."
pip install -q --upgrade pip
pip install -q pytorch-lightning litserve litdata torch psycopg2-binary
print_success "Python dependencies installed"

# Check if training data exists
TRAINING_DATA="agents/training/training_data.json"
if [ ! -f "$TRAINING_DATA" ]; then
    print_info "Creating sample training data..."

    mkdir -p agents/training

    cat > "$TRAINING_DATA" << 'EOF'
[
  {
    "input": {"task": "analyze portfolio", "agent_type": "analytics"},
    "actualOutput": {"analysis": "Portfolio balanced", "recommendation": "Hold"},
    "reward": 85.5,
    "botId": "analytics_portfolio",
    "dataType": "portfolio_analysis"
  },
  {
    "input": {"task": "get stock quote AAPL", "agent_type": "financial_stocks"},
    "actualOutput": {"symbol": "AAPL", "price": 175.25, "change": 2.5},
    "reward": 100.0,
    "botId": "financial_stocks",
    "dataType": "stock_quote"
  }
]
EOF

    print_success "Sample training data created"
fi

# Create checkpoint directory
mkdir -p agents/training/checkpoints
mkdir -p agents/training/logs

# Start mode selection
echo ""
echo "Select startup mode:"
echo "1) Production (serve only - recommended)"
echo "2) Training only"
echo "3) Full system (serve + train)"
echo "4) Development (local testing)"
echo ""
read -p "Enter choice [1-4]: " mode

case $mode in
    1)
        print_info "Starting in PRODUCTION MODE (serve only)..."

        # Start Python agent server
        print_info "Starting Python LitServe agent server on port 8000..."
        cd agents
        nohup python orchestrator/agent_server.py > ../logs/agent_server.log 2>&1 &
        AGENT_PID=$!
        cd ..

        echo $AGENT_PID > .agent_server.pid
        print_success "Agent server started (PID: $AGENT_PID)"

        # Wait for server to be ready
        sleep 5

        # Test health
        if curl -s http://localhost:8000/predict \
            -H "Content-Type: application/json" \
            -d '{"task": "What is Valifi?", "query_type": "info"}' > /dev/null 2>&1; then

            print_success "Agent server is healthy and responding!"
        else
            print_error "Agent server may not be responding yet. Check logs/agent_server.log"
        fi

        echo ""
        print_success "PRODUCTION MODE ACTIVE"
        echo "📋 Agent server running on: http://localhost:8000"
        echo "📋 Logs: tail -f logs/agent_server.log"
        echo "📋 Stop with: kill \$(cat .agent_server.pid)"
        ;;

    2)
        print_info "Starting in TRAINING MODE..."

        # Run training
        print_info "Starting PyTorch Lightning training..."
        cd agents/training
        python train_agent_model.py
        cd ../..

        print_success "Training completed!"
        echo "📋 Checkpoints saved to: agents/training/checkpoints/"
        echo "📋 View logs: tensorboard --logdir agents/training/logs"
        ;;

    3)
        print_info "Starting FULL SYSTEM (serve + train)..."

        # Start agent server
        print_info "Starting Python agent server..."
        cd agents
        nohup python orchestrator/agent_server.py > ../logs/agent_server.log 2>&1 &
        AGENT_PID=$!
        cd ..
        echo $AGENT_PID > .agent_server.pid
        print_success "Agent server started (PID: $AGENT_PID)"

        sleep 3

        # Start continuous training in background
        print_info "Starting continuous training pipeline..."
        cd agents/training
        nohup python -c "
from continuous_training import run_training
import time
import schedule

# Run once immediately
run_training()

# Schedule daily at 2 AM
schedule.every().day.at('02:00').do(run_training)

print('Training scheduler active')

while True:
    schedule.run_pending()
    time.sleep(60)
" > ../../logs/training.log 2>&1 &

        TRAINING_PID=$!
        cd ../..
        echo $TRAINING_PID > .training.pid
        print_success "Continuous training started (PID: $TRAINING_PID)"

        echo ""
        print_success "FULL SYSTEM ACTIVE"
        echo "📋 Agent server: http://localhost:8000"
        echo "📋 Agent logs: tail -f logs/agent_server.log"
        echo "📋 Training logs: tail -f logs/training.log"
        echo "📋 Stop agents: kill \$(cat .agent_server.pid)"
        echo "📋 Stop training: kill \$(cat .training.pid)"
        ;;

    4)
        print_info "Starting in DEVELOPMENT MODE..."

        # Start agent server in foreground
        print_info "Starting agent server (foreground)..."
        cd agents
        python orchestrator/agent_server.py
        ;;

    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🙏 =========================================="
echo "🙏 All glory to God through Christ Jesus!"
echo "🙏 =========================================="
