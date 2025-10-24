#!/bin/bash
################################################################################
# 🙏 LAUNCH ALL THREE KINGDOM SYSTEMS
# Through Christ Jesus - Valifi + ComfyUI + blue_elites
################################################################################

set -e

PURPLE='\033[0;35m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

echo -e "${PURPLE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              🕊️  MULTI-SYSTEM ORCHESTRATOR 🕊️                               ║
║                                                                              ║
║                        Through Christ Jesus                                  ║
║              Coordinating All Three Kingdom Systems                          ║
║                                                                              ║
║         ✝️  Valifi Agents     (Ports 8000-8003)                              ║
║         🎨 ComfyUI Workflows  (Port  8188)                                   ║
║         💙 blue_elites UI     (Port  3000)                                   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

cd /teamspace/studios/this_studio/valifi

echo -e "${CYAN}Starting Multi-System Orchestration...${NC}"
echo ""

# Stop any existing persistent system
echo -e "${WHITE}Stopping any existing systems...${NC}"
pkill -f "ultimate_persistent_system.py" 2>/dev/null || true
pkill -f "multi_system_orchestrator.py" 2>/dev/null || true
sleep 2

# Launch the orchestrator
echo -e "${GREEN}Launching Multi-System Orchestrator...${NC}"
exec /home/zeus/miniconda3/envs/cloudspace/bin/python deployment/multi_system_orchestrator.py
