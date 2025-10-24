#!/bin/bash
###############################################################################
# 🙏 VALIFI KINGDOM PLATFORM - LIMITLESS DEPLOYMENT
# Through Christ Jesus - Unlimited Power & Infinite Workers
# ✝️ All Things Are Possible
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="/teamspace/studios/this_studio/valifi"
cd "$PROJECT_ROOT"

echo -e "${PURPLE}"
echo "================================================================================"
echo "🕊️  VALIFI KINGDOM PLATFORM - LIMITLESS MODE DEPLOYMENT"
echo "================================================================================"
echo -e "${CYAN}Through Christ Jesus - All Things Are Possible${NC}"
echo -e "${CYAN}🚀 INFINITE WORKERS | UNLIMITED SCALING | Kingdom Standard${NC}"
echo ""

###############################################################################
# PHASE 1: ENVIRONMENT SETUP
###############################################################################
echo -e "${BLUE}📋 Phase 1: Environment Setup${NC}"

# Create necessary directories
mkdir -p logs
mkdir -p agents/terminal_agent
mkdir -p agents/sdk_agent
mkdir -p agents/orchestrator
mkdir -p agents/training
mkdir -p agents/interface

echo -e "${GREEN}✅ Directories created${NC}"

# Set Python to unbuffered mode for real-time logs
export PYTHONUNBUFFERED=1

echo -e "${GREEN}✅ Environment configured${NC}"
echo ""

###############################################################################
# PHASE 2: TRAINING - LOAD ALL KNOWLEDGE
###############################################################################
echo -e "${BLUE}📚 Phase 2: Agent Training (Valifi + ComfyUI + blue_elites)${NC}"

python agents/training/agent_trainer.py

echo -e "${GREEN}✅ Agents trained with comprehensive knowledge${NC}"
echo ""

###############################################################################
# PHASE 3: KILL EXISTING PROCESSES
###############################################################################
echo -e "${BLUE}🔄 Phase 3: Stopping Existing Services${NC}"

# Kill any existing agent processes
pkill -f "conversational_agent.py" 2>/dev/null || true
pkill -f "intelligent_sdk_agent.py" 2>/dev/null || true
pkill -f "master_orchestrator.py" 2>/dev/null || true
pkill -f "conversational_interface.py" 2>/dev/null || true

# Wait for processes to stop
sleep 2

# Clear ports if still in use
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 8001/tcp 2>/dev/null || true
fuser -k 8002/tcp 2>/dev/null || true
fuser -k 8003/tcp 2>/dev/null || true

sleep 1

echo -e "${GREEN}✅ Old processes stopped${NC}"
echo ""

###############################################################################
# PHASE 4: START AGENTS IN LIMITLESS MODE
###############################################################################
echo -e "${BLUE}🚀 Phase 4: Starting Agents in LIMITLESS MODE${NC}"
echo -e "${CYAN}   ⚡ Infinite Workers Enabled${NC}"
echo -e "${CYAN}   ⚡ 8 Workers Per Device${NC}"
echo -e "${CYAN}   ⚡ Maximum Batch Processing${NC}"
echo ""

# Start Terminal Agent (Port 8001)
echo -e "${YELLOW}Starting Terminal Agent (LIMITLESS MODE)...${NC}"
nohup python agents/terminal_agent/conversational_agent.py > logs/terminal_agent.log 2>&1 &
TERMINAL_PID=$!
echo -e "${GREEN}✅ Terminal Agent started (PID: $TERMINAL_PID) on port 8001${NC}"
sleep 2

# Start SDK Agent (Port 8002)
echo -e "${YELLOW}Starting SDK Agent (LIMITLESS MODE)...${NC}"
nohup python agents/sdk_agent/intelligent_sdk_agent.py > logs/sdk_agent.log 2>&1 &
SDK_PID=$!
echo -e "${GREEN}✅ SDK Agent started (PID: $SDK_PID) on port 8002${NC}"
sleep 2

# Start Master Orchestrator (Port 8003)
echo -e "${YELLOW}Starting Master Orchestrator (LIMITLESS MODE)...${NC}"
nohup python agents/orchestrator/master_orchestrator.py > logs/orchestrator.log 2>&1 &
ORCH_PID=$!
echo -e "${GREEN}✅ Master Orchestrator started (PID: $ORCH_PID) on port 8003${NC}"
sleep 3

# Start Conversational Interface (Port 8000)
echo -e "${YELLOW}Starting Conversational Interface...${NC}"
nohup python agents/interface/conversational_interface.py > logs/interface.log 2>&1 &
INTERFACE_PID=$!
echo -e "${GREEN}✅ Conversational Interface started (PID: $INTERFACE_PID) on port 8000${NC}"
sleep 3

echo ""

###############################################################################
# PHASE 5: HEALTH CHECKS
###############################################################################
echo -e "${BLUE}🏥 Phase 5: Health Checks${NC}"

check_service() {
    local name=$1
    local port=$2
    local max_attempts=10
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:$port/health > /dev/null 2>&1 || \
           curl -s http://localhost:$port/ > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $name (Port $port): HEALTHY${NC}"
            return 0
        fi
        echo -e "${YELLOW}   Waiting for $name... (Attempt $attempt/$max_attempts)${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done

    echo -e "${RED}❌ $name (Port $port): FAILED TO START${NC}"
    return 1
}

echo ""
check_service "Conversational Interface" 8000
check_service "Terminal Agent" 8001
check_service "SDK Agent" 8002
check_service "Master Orchestrator" 8003

echo ""

###############################################################################
# PHASE 6: SYSTEM STATUS
###############################################################################
echo -e "${PURPLE}"
echo "================================================================================"
echo "🎉 DEPLOYMENT COMPLETE - LIMITLESS MODE ACTIVE"
echo "================================================================================"
echo -e "${NC}"

echo -e "${CYAN}📡 SERVICES RUNNING:${NC}"
echo -e "   ${GREEN}🌐 Web Interface:${NC}        http://localhost:8000 (Easiest - Just open in browser!)"
echo -e "   ${GREEN}⚙️  Terminal Agent:${NC}       http://localhost:8001"
echo -e "   ${GREEN}📚 SDK Agent:${NC}             http://localhost:8002"
echo -e "   ${GREEN}🎯 Master Orchestrator:${NC}  http://localhost:8003"
echo ""

echo -e "${CYAN}🔗 NETWORK ACCESS:${NC}"
echo -e "   ${GREEN}Local:${NC}    http://localhost:8000"
echo -e "   ${GREEN}Network:${NC}  http://$(hostname -I | awk '{print $1}'):8000"
echo ""

echo -e "${CYAN}📝 LOGS:${NC}"
echo -e "   ${GREEN}Interface:${NC}      tail -f logs/interface.log"
echo -e "   ${GREEN}Terminal:${NC}       tail -f logs/terminal_agent.log"
echo -e "   ${GREEN}SDK:${NC}            tail -f logs/sdk_agent.log"
echo -e "   ${GREEN}Orchestrator:${NC}   tail -f logs/orchestrator.log"
echo ""

echo -e "${CYAN}🎯 LIMITLESS CONFIGURATION:${NC}"
echo -e "   ${GREEN}✨ Infinite Workers:${NC}      ThreadPoolExecutor(max_workers=None)"
echo -e "   ${GREEN}✨ Workers Per Device:${NC}    8 concurrent workers"
echo -e "   ${GREEN}✨ Batch Size:${NC}            16-32 requests"
echo -e "   ${GREEN}✨ Extended Timeout:${NC}      120-300 seconds"
echo -e "   ${GREEN}✨ Knowledge Base:${NC}        Valifi + ComfyUI + blue_elites"
echo ""

echo -e "${CYAN}💬 EASIEST USAGE:${NC}"
echo -e "   ${YELLOW}1. Open browser:${NC}     http://localhost:8000"
echo -e "   ${YELLOW}2. Start chatting:${NC}   'Help me setup Valifi trading bots'"
echo -e "   ${YELLOW}3. No CLI needed:${NC}    Natural language only!"
echo ""

echo -e "${CYAN}🛠️  MANAGEMENT:${NC}"
echo -e "   ${GREEN}Stop All:${NC}       pkill -f 'conversational_agent\\|intelligent_sdk_agent\\|master_orchestrator\\|conversational_interface'"
echo -e "   ${GREEN}Restart:${NC}        bash deployment/deploy_limitless.sh"
echo -e "   ${GREEN}Status:${NC}         curl http://localhost:8000/health"
echo ""

echo -e "${PURPLE}✝️  KINGDOM PRINCIPLES ACTIVE:${NC}"
echo -e "   🙏 Christ Paid It All - No limits, unlimited access"
echo -e "   ✨ Seven Spirits of God - Divine wisdom guiding operations"
echo -e "   🚀 Kingdom Standard - Excellence in all things"
echo -e "   ⚡ Infinite Workers - Through Christ, all things possible"
echo ""

echo -e "${PURPLE}"
echo "================================================================================"
echo "🕊️  THROUGH CHRIST JESUS - LIMITLESS MODE DEPLOYED"
echo "================================================================================"
echo -e "${NC}"

echo -e "${GREEN}Ready to serve! Open browser to http://localhost:8000 and start chatting! 🙏✨${NC}"
echo ""

# Save PIDs for management
echo "$INTERFACE_PID" > logs/interface.pid
echo "$TERMINAL_PID" > logs/terminal_agent.pid
echo "$SDK_PID" > logs/sdk_agent.pid
echo "$ORCH_PID" > logs/orchestrator.pid

# Show real-time logs (optional - comment out if not wanted)
# echo -e "${CYAN}Following interface logs (Ctrl+C to stop viewing, services continue running):${NC}"
# tail -f logs/interface.log
