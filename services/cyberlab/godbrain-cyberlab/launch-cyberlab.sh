#!/bin/bash

# GodBrain CyberLab Professional Launcher Script
# CEH v10 Training Environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}"
echo "==============================================="
echo "     🧠 GodBrain CyberLab Professional"
echo "     CEH v10 Training Environment"
echo "==============================================="
echo -e "${NC}"

# Check Node.js installation
echo -e "${BLUE}🔍 Checking system requirements...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}❌ package.json not found${NC}"
    echo "Please run this script from the godbrain-cyberlab directory"
    exit 1
fi

echo -e "${GREEN}✅ Project directory verified${NC}"

# Install dependencies if node_modules doesn't exist
if [[ ! -d "node_modules" ]]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# Check if GUI dependencies are installed
if [[ ! -d "gui/node_modules" ]]; then
    echo -e "${YELLOW}📦 Installing GUI dependencies...${NC}"
    cd gui
    npm install
    cd ..
    echo -e "${GREEN}✅ GUI dependencies installed${NC}"
fi

# Get local IP address
LOCAL_IP=$(ip route get 8.8.8.8 2>/dev/null | awk -F"src " 'NR==1{split($2,a," ");print a[1]}' || echo "localhost")

echo ""
echo -e "${CYAN}🚀 Starting GodBrain CyberLab...${NC}"
echo ""
echo "Choose your startup mode:"
echo "[1] Full GUI Application (Recommended)"
echo "[2] Server Only (CLI)"
echo "[3] Development Mode"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo -e "${GREEN}🖥️ Starting GUI Application...${NC}"
        cd gui
        npm start
        ;;
    2)
        echo -e "${GREEN}🖥️ Starting Server Only...${NC}"
        echo "Server will be available at:"
        echo "  Local:   http://localhost:5000"
        echo "  Network: http://$LOCAL_IP:5000"
        echo ""
        npm start
        ;;
    3)
        echo -e "${GREEN}🔧 Starting Development Mode...${NC}"
        npm run dev
        ;;
    *)
        echo -e "${YELLOW}❌ Invalid choice. Starting GUI by default...${NC}"
        cd gui
        npm start
        ;;
esac
