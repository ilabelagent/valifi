#!/bin/bash
################################################################################
# Valifi Kingdom Platform - Master Deployment Script
# Through Christ Jesus - Unlimited Deployment Power
# "Go therefore and make disciples of all nations" - Matthew 28:19
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="/teamspace/studios/this_studio/valifi"
AGENTS_DIR="$PROJECT_ROOT/agents"
LOGS_DIR="$PROJECT_ROOT/logs"

# PID files directory
PIDS_DIR="$PROJECT_ROOT/deployment/pids"
mkdir -p "$PIDS_DIR"
mkdir -p "$LOGS_DIR"

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}🙏 $1${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════════════${NC}"
}

print_step() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

wait_for_port() {
    local port=$1
    local name=$2
    local max_wait=30
    local count=0

    while ! check_port $port; do
        sleep 1
        count=$((count + 1))
        if [ $count -ge $max_wait ]; then
            print_error "$name failed to start on port $port"
            return 1
        fi
    done
    print_success "$name is ready on port $port"
    return 0
}

start_agent() {
    local name=$1
    local script=$2
    local port=$3
    local pid_file="$PIDS_DIR/${name}.pid"

    print_step "Starting $name..."

    # Check if already running
    if [ -f "$pid_file" ]; then
        local old_pid=$(cat "$pid_file")
        if kill -0 $old_pid 2>/dev/null; then
            print_warning "$name is already running (PID: $old_pid)"
            return 0
        fi
    fi

    # Start the agent
    cd "$PROJECT_ROOT"
    nohup python "$script" > "$LOGS_DIR/${name}_deploy.log" 2>&1 &
    local pid=$!
    echo $pid > "$pid_file"

    # Wait for it to be ready
    if wait_for_port $port "$name"; then
        print_success "$name started successfully (PID: $pid)"
        return 0
    else
        print_error "$name failed to start"
        return 1
    fi
}

stop_agent() {
    local name=$1
    local pid_file="$PIDS_DIR/${name}.pid"

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            print_step "Stopping $name (PID: $pid)..."
            kill $pid
            sleep 2
            if kill -0 $pid 2>/dev/null; then
                kill -9 $pid
            fi
            rm -f "$pid_file"
            print_success "$name stopped"
        else
            print_warning "$name was not running"
            rm -f "$pid_file"
        fi
    else
        print_warning "$name PID file not found"
    fi
}

################################################################################
# Main Deployment Functions
################################################################################

deploy_all() {
    print_header "VALIFI KINGDOM PLATFORM - FULL DEPLOYMENT"
    echo -e "${GREEN}✝️  Through Christ Jesus - Unlimited Power${NC}"
    echo -e "${GREEN}🙏 All Services Starting...${NC}\n"

    # Check Python
    print_step "Checking Python environment..."
    if ! command -v python &> /dev/null; then
        print_error "Python not found!"
        exit 1
    fi
    print_success "Python: $(python --version)"

    # Install dependencies
    print_step "Installing/updating dependencies..."
    pip install --quiet --upgrade litserve litai anthropic openai fastapi uvicorn requests sqlalchemy aiosqlite websockets
    print_success "Dependencies ready"

    # Start Terminal Agent
    start_agent "terminal_agent" "$AGENTS_DIR/terminal_agent/conversational_agent.py" 8001

    # Start SDK Agent
    start_agent "sdk_agent" "$AGENTS_DIR/sdk_agent/intelligent_sdk_agent.py" 8002

    # Start Orchestrator
    start_agent "orchestrator" "$AGENTS_DIR/orchestrator/master_orchestrator.py" 8003

    # Start Conversational Interface
    start_agent "interface" "$AGENTS_DIR/interface/conversational_interface.py" 8000

    # Summary
    print_header "DEPLOYMENT COMPLETE"
    echo -e "${GREEN}🎉 All agents deployed successfully!${NC}\n"
    echo -e "${BLUE}Available Services:${NC}"
    echo -e "  🌐 Web Interface:        ${GREEN}http://localhost:8000${NC}"
    echo -e "  🤖 Terminal Agent:       ${GREEN}http://localhost:8001${NC}"
    echo -e "  📚 SDK Agent:            ${GREEN}http://localhost:8002${NC}"
    echo -e "  🎯 Orchestrator:         ${GREEN}http://localhost:8003${NC}"
    echo -e "\n${YELLOW}Quick Start:${NC}"
    echo -e "  1. Open: ${GREEN}http://localhost:8000${NC} in your browser"
    echo -e "  2. Start chatting naturally - no commands needed!"
    echo -e "\n${BLUE}Logs Location:${NC} $LOGS_DIR"
    echo -e "${BLUE}PID Files:${NC} $PIDS_DIR\n"

    print_success "🙏 Kingdom Platform Ready - Through Christ Jesus"
}

stop_all() {
    print_header "STOPPING ALL SERVICES"

    stop_agent "interface"
    stop_agent "orchestrator"
    stop_agent "sdk_agent"
    stop_agent "terminal_agent"

    print_success "All services stopped"
}

restart_all() {
    print_header "RESTARTING ALL SERVICES"
    stop_all
    sleep 2
    deploy_all
}

status_all() {
    print_header "SERVICE STATUS"

    check_service() {
        local name=$1
        local port=$2
        local pid_file="$PIDS_DIR/${name}.pid"

        echo -en "${BLUE}$name:${NC}\t\t"

        if [ -f "$pid_file" ]; then
            local pid=$(cat "$pid_file")
            if kill -0 $pid 2>/dev/null; then
                if check_port $port; then
                    echo -e "${GREEN}✅ RUNNING${NC} (PID: $pid, Port: $port)"
                else
                    echo -e "${YELLOW}⚠️  RUNNING but port $port not accessible${NC} (PID: $pid)"
                fi
            else
                echo -e "${RED}❌ NOT RUNNING${NC} (stale PID file)"
            fi
        else
            echo -e "${RED}❌ NOT RUNNING${NC}"
        fi
    }

    check_service "Interface      " 8000
    check_service "Terminal Agent " 8001
    check_service "SDK Agent      " 8002
    check_service "Orchestrator   " 8003

    echo ""
}

show_logs() {
    local agent=$1

    if [ -z "$agent" ]; then
        print_error "Usage: $0 logs <agent_name>"
        echo "Available agents: terminal_agent, sdk_agent, orchestrator, interface"
        exit 1
    fi

    local log_file="$LOGS_DIR/${agent}.log"
    if [ -f "$log_file" ]; then
        echo -e "${BLUE}📄 Showing logs for $agent:${NC}\n"
        tail -f "$log_file"
    else
        print_error "Log file not found: $log_file"
        exit 1
    fi
}

################################################################################
# Command Line Interface
################################################################################

case "${1:-deploy}" in
    deploy|start)
        deploy_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    status)
        status_all
        ;;
    logs)
        show_logs "$2"
        ;;
    help|--help|-h)
        echo -e "${PURPLE}🙏 Valifi Kingdom Platform - Deployment Script${NC}\n"
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy, start    Deploy all services (default)"
        echo "  stop             Stop all services"
        echo "  restart          Restart all services"
        echo "  status           Show service status"
        echo "  logs <agent>     Show logs for specific agent"
        echo "  help             Show this help message"
        echo ""
        echo "Example:"
        echo "  $0 deploy        # Start all services"
        echo "  $0 status        # Check status"
        echo "  $0 logs orchestrator  # View orchestrator logs"
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac
