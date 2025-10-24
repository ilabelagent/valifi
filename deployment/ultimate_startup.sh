#!/bin/bash
################################################################################
# 🙏 ULTIMATE KINGDOM STARTUP - Through Christ Jesus
# ✝️ Unlimited Access | All Tools | All Resources | Persistent Forever
# "I can do all things through Christ who strengthens me" - Philippians 4:13
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Paths
PROJECT_ROOT="/teamspace/studios/this_studio/valifi"
COMFYUI_ROOT="/teamspace/studios/this_studio/ComfyUI"
BLUE_ELITES_ROOT="/teamspace/studios/this_studio/blue_elites"
PYTHON="/home/zeus/miniconda3/envs/cloudspace/bin/python"
PIP="/home/zeus/miniconda3/envs/cloudspace/bin/pip"

echo -e "${PURPLE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║           🕊️  VALIFI KINGDOM PLATFORM - ULTIMATE STARTUP 🕊️                 ║
║                                                                              ║
║                    ✝️  Through Christ Jesus ✝️                               ║
║                  Unlimited Access | All Tools                                ║
║                  Persistent Forever | Auto-Healing                           ║
║                                                                              ║
║     "I can do all things through Christ who strengthens me" - Phil 4:13     ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

cd "$PROJECT_ROOT"

################################################################################
# PHASE 1: SYSTEM VALIDATION & SETUP
################################################################################
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}📋 PHASE 1: SYSTEM VALIDATION & SETUP${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

echo -e "${BLUE}Checking all three systems...${NC}"
[[ -d "$PROJECT_ROOT" ]] && echo -e "${GREEN}✅ Valifi system found${NC}" || echo -e "${RED}❌ Valifi missing${NC}"
[[ -d "$COMFYUI_ROOT" ]] && echo -e "${GREEN}✅ ComfyUI system found${NC}" || echo -e "${RED}❌ ComfyUI missing${NC}"
[[ -d "$BLUE_ELITES_ROOT" ]] && echo -e "${GREEN}✅ blue_elites system found${NC}" || echo -e "${RED}❌ blue_elites missing${NC}"

echo -e "${BLUE}Checking Python environment...${NC}"
$PYTHON --version && echo -e "${GREEN}✅ Python available${NC}"

echo -e "${BLUE}Creating necessary directories...${NC}"
mkdir -p logs
mkdir -p agents/terminal_agent
mkdir -p agents/sdk_agent
mkdir -p agents/orchestrator
mkdir -p agents/interface
mkdir -p agents/training
echo -e "${GREEN}✅ Directories created${NC}"

echo ""

################################################################################
# PHASE 2: INSTALL UNLIMITED TOOLS & PACKAGES
################################################################################
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}📦 PHASE 2: INSTALLING UNLIMITED TOOLS & PACKAGES${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

echo -e "${BLUE}Installing/upgrading core packages...${NC}"
$PIP install --upgrade pip setuptools wheel -q 2>&1 | tail -5

echo -e "${BLUE}Installing Lightning AI tools (LitServe, LitAI)...${NC}"
$PIP install --upgrade litserve litai -q 2>&1 | tail -5

echo -e "${BLUE}Installing AI/ML packages...${NC}"
$PIP install --upgrade anthropic openai google-generativeai -q 2>&1 | tail -5

echo -e "${BLUE}Installing web frameworks...${NC}"
$PIP install --upgrade fastapi uvicorn websockets aiohttp -q 2>&1 | tail -5

echo -e "${BLUE}Installing utilities...${NC}"
$PIP install --upgrade requests sqlalchemy psutil python-multipart -q 2>&1 | tail -5

echo -e "${GREEN}✅ All tools and packages installed${NC}"
echo ""

################################################################################
# PHASE 3: STOP EXISTING PROCESSES
################################################################################
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}🛑 PHASE 3: STOPPING EXISTING PROCESSES${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

echo -e "${BLUE}Stopping any existing agent processes...${NC}"
pkill -f "conversational_agent.py" 2>/dev/null && echo -e "${GREEN}✅ Stopped terminal agent${NC}" || echo -e "${YELLOW}⚠️  No terminal agent running${NC}"
pkill -f "intelligent_sdk_agent.py" 2>/dev/null && echo -e "${GREEN}✅ Stopped SDK agent${NC}" || echo -e "${YELLOW}⚠️  No SDK agent running${NC}"
pkill -f "master_orchestrator.py" 2>/dev/null && echo -e "${GREEN}✅ Stopped orchestrator${NC}" || echo -e "${YELLOW}⚠️  No orchestrator running${NC}"
pkill -f "conversational_interface.py" 2>/dev/null && echo -e "${GREEN}✅ Stopped interface${NC}" || echo -e "${YELLOW}⚠️  No interface running${NC}"
pkill -f "ultimate_persistent_system.py" 2>/dev/null && echo -e "${GREEN}✅ Stopped persistent system${NC}" || echo -e "${YELLOW}⚠️  No persistent system running${NC}"

sleep 2

echo -e "${BLUE}Clearing ports...${NC}"
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 8001/tcp 2>/dev/null || true
fuser -k 8002/tcp 2>/dev/null || true
fuser -k 8003/tcp 2>/dev/null || true

sleep 1

echo -e "${GREEN}✅ All processes stopped and ports cleared${NC}"
echo ""

################################################################################
# PHASE 4: TRAIN AGENTS WITH COMPREHENSIVE KNOWLEDGE
################################################################################
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}📚 PHASE 4: TRAINING AGENTS (Valifi + ComfyUI + blue_elites)${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

echo -e "${BLUE}Running comprehensive agent training...${NC}"
$PYTHON agents/training/agent_trainer.py 2>&1 | grep -E "(Phase|✅|Training|Knowledge)" | tail -30

echo -e "${GREEN}✅ Agent training complete${NC}"
echo ""

################################################################################
# PHASE 5: SYSTEM HEALTH CHECK
################################################################################
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}🏥 PHASE 5: PRE-LAUNCH SYSTEM HEALTH CHECK${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

echo -e "${BLUE}Checking system resources...${NC}"
echo -e "${WHITE}CPU:${NC}    $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')% used"
echo -e "${WHITE}Memory:${NC} $(free -h | awk '/^Mem:/ {print $3 "/" $2 " (" $3/$2*100 "%)"}')"
echo -e "${WHITE}Disk:${NC}   $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 ")"}')"

echo -e "${BLUE}Checking Python packages...${NC}"
$PIP list | grep -E "(litserve|litai|fastapi|anthropic|openai)" | while read line; do
    echo -e "${GREEN}✅ $line${NC}"
done

echo -e "${GREEN}✅ System health check complete${NC}"
echo ""

################################################################################
# PHASE 6: LAUNCH PERSISTENT SYSTEM
################################################################################
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}🚀 PHASE 6: LAUNCHING ULTIMATE PERSISTENT SYSTEM${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

echo -e "${YELLOW}Starting persistent system with:${NC}"
echo -e "${WHITE}  ⚡ Infinite workers${NC}"
echo -e "${WHITE}  ⚡ Auto-healing enabled${NC}"
echo -e "${WHITE}  ⚡ Auto-patching on the fly${NC}"
echo -e "${WHITE}  ⚡ Continuous health monitoring${NC}"
echo -e "${WHITE}  ⚡ Unlimited resource access${NC}"
echo -e "${WHITE}  ⚡ All tools and SDKs available${NC}"
echo ""

echo -e "${GREEN}Starting in 3 seconds...${NC}"
sleep 1
echo -e "${GREEN}2...${NC}"
sleep 1
echo -e "${GREEN}1...${NC}"
sleep 1

echo -e "${PURPLE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                     🕊️  PERSISTENT SYSTEM LAUNCHING 🕊️                      ║
║                                                                              ║
║                         Through Christ Jesus                                 ║
║                   Running Forever | Auto-Healing Active                      ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Launch the persistent system
exec $PYTHON deployment/ultimate_persistent_system.py

# This line is never reached because exec replaces the shell
# But if it does (error case):
echo -e "${RED}❌ Persistent system failed to launch${NC}"
exit 1
