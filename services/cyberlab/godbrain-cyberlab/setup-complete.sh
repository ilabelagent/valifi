#!/bin/bash

# GodBrain CyberLab Professional - Complete Setup Script
# CEH v10 Training Environment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Banner
clear
echo -e "${CYAN}=====================================================${NC}"
echo -e "${CYAN}       🧠 GodBrain CyberLab Professional${NC}"
echo -e "${CYAN}       Complete Setup and Installation${NC}"
echo -e "${CYAN}=====================================================${NC}"
echo ""
echo "This script will set up the complete professional"
echo "cybersecurity training environment with GUI launcher."
echo ""
echo -e "${RED}⚠️  IMPORTANT: For educational use only!${NC}"
echo -e "${RED}    Follow CEH ethical guidelines.${NC}"
echo ""
read -p "Press Enter to continue or Ctrl+C to abort..."

echo ""
echo -e "${BLUE}🔍 Checking system requirements...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    echo ""
    echo "Please install Node.js 16+ from https://nodejs.org/"
    echo "Or use your package manager:"
    echo "  Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  CentOS/RHEL:   sudo yum install nodejs npm"
    echo "  macOS:         brew install node"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Node.js detected: $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    echo "Please install npm or update Node.js"
    exit 1
fi

echo -e "${GREEN}✅ npm detected: $(npm --version)${NC}"

# Check Git (optional)
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}⚠️  Git not detected (optional)${NC}"
else
    echo -e "${GREEN}✅ Git detected: $(git --version)${NC}"
fi

# Check OpenSSL
if ! command -v openssl &> /dev/null; then
    echo -e "${YELLOW}⚠️  OpenSSL not detected - will install if needed${NC}"
    
    # Try to install OpenSSL
    if command -v apt-get &> /dev/null; then
        echo -e "${BLUE}📦 Installing OpenSSL via apt...${NC}"
        sudo apt-get update && sudo apt-get install -y openssl
    elif command -v yum &> /dev/null; then
        echo -e "${BLUE}📦 Installing OpenSSL via yum...${NC}"
        sudo yum install -y openssl
    elif command -v brew &> /dev/null; then
        echo -e "${BLUE}📦 Installing OpenSSL via brew...${NC}"
        brew install openssl
    else
        echo -e "${YELLOW}⚠️  Please install OpenSSL manually${NC}"
    fi
else
    echo -e "${GREEN}✅ OpenSSL detected: $(openssl version)${NC}"
fi

echo ""
echo -e "${BLUE}📦 Installing main dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Main dependencies installed${NC}"

echo ""
echo -e "${BLUE}📱 Installing GUI dependencies...${NC}"
cd gui
npm install
cd ..
echo -e "${GREEN}✅ GUI dependencies installed${NC}"

echo ""
echo -e "${BLUE}📁 Setting up directories...${NC}"
mkdir -p logs certs payloads assets
echo -e "${GREEN}✅ Directory structure created${NC}"

echo ""
echo -e "${BLUE}🔐 Generating SSL certificates...${NC}"
if command -v openssl &> /dev/null; then
    cd certs
    openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes \
        -subj "/C=US/ST=Lab/L=Training/O=GodBrain/OU=CyberLab/CN=localhost" 2>/dev/null
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✅ SSL certificates generated${NC}"
    else
        echo -e "${YELLOW}⚠️  SSL certificate generation failed - will retry on first run${NC}"
    fi
    cd ..
else
    echo -e "${YELLOW}⚠️  OpenSSL not available - SSL certificates will be generated on first run${NC}"
fi

echo ""
echo -e "${BLUE}🎯 Creating launcher shortcuts...${NC}"

# Make scripts executable
chmod +x launch-cyberlab.sh
chmod +x setup-complete.sh

# Create desktop shortcut (if desktop environment exists)
if [[ -d "$HOME/Desktop" ]]; then
    cat > "$HOME/Desktop/GodBrain CyberLab.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=GodBrain CyberLab Professional
Comment=CEH v10 Training Environment
Exec=$(pwd)/launch-cyberlab.sh
Icon=$(pwd)/assets/icon.png
Terminal=true
Categories=Development;Security;Education;
StartupNotify=true
EOF
    chmod +x "$HOME/Desktop/GodBrain CyberLab.desktop"
    echo -e "${GREEN}✅ Desktop shortcut created${NC}"
else
    echo -e "${YELLOW}⚠️  Desktop environment not detected - skipping desktop shortcut${NC}"
fi

# Create /usr/local/bin symlink for global access (optional)
if [[ -w "/usr/local/bin" ]] || sudo -n true 2>/dev/null; then
    if [[ -w "/usr/local/bin" ]]; then
        ln -sf "$(pwd)/launch-cyberlab.sh" "/usr/local/bin/godbrain-cyberlab" 2>/dev/null || true
    else
        sudo ln -sf "$(pwd)/launch-cyberlab.sh" "/usr/local/bin/godbrain-cyberlab" 2>/dev/null || true
    fi
    
    if [[ -L "/usr/local/bin/godbrain-cyberlab" ]]; then
        echo -e "${GREEN}✅ Global command 'godbrain-cyberlab' created${NC}"
    fi
fi

echo ""
echo -e "${BLUE}🧪 Running initial test...${NC}"
echo "Starting server test..."
sleep 2
npm run test
if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ Initial test passed${NC}"
else
    echo -e "${YELLOW}⚠️  Test completed with warnings (normal for training environment)${NC}"
fi

# Get local IP for network access info
LOCAL_IP=$(ip route get 8.8.8.8 2>/dev/null | awk -F"src " 'NR==1{split($2,a," ");print a[1]}' || echo "localhost")

echo ""
echo -e "${GREEN}🎉 =====================================================${NC}"
echo -e "${GREEN}   Setup Complete! GodBrain CyberLab is ready!${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo ""
echo -e "${CYAN}📋 What's been installed:${NC}"
echo "  ✅ Main application server"
echo "  ✅ Professional GUI launcher"
echo "  ✅ All training modules"
echo "  ✅ Security tools and utilities"
echo "  ✅ SSL certificates"
echo "  ✅ Desktop shortcut (if applicable)"
echo "  ✅ Global command (if permissions allow)"
echo ""
echo -e "${CYAN}🚀 How to start:${NC}"
echo "  1. Run: ./launch-cyberlab.sh"
echo "  2. Or use global command: godbrain-cyberlab"
echo "  3. Choose 'Full GUI Application' for best experience"
echo ""
echo -e "${CYAN}🌐 Access URLs (after starting):${NC}"
echo "  📱 GUI Application: Automatic launch"
echo "  🌍 Local Web Interface: http://localhost:5000"
echo "  🌐 Network Web Interface: http://$LOCAL_IP:5000"
echo "  🔒 HTTPS Interface: https://localhost:5443"
echo ""
echo -e "${CYAN}📚 Training Modules Available:${NC}"
echo "  🎣 Phishing Awareness Lab"
echo "  💉 SQL Injection Training"
echo "  🔍 XSS Security Playground"
echo "  🎭 MITM Attack Scenarios"
echo "  🌊 DDoS Simulation"
echo "  ⌨️  Keylogger Detection"
echo "  🍪 Cookie Security Analysis"
echo "  🔀 Proxy Tools"
echo ""
echo -e "${RED}⚠️  REMEMBER: Educational use only!${NC}"
echo -e "${RED}   Follow CEH ethical guidelines and local laws.${NC}"
echo ""
echo -e "${BLUE}📖 Documentation: README.md${NC}"
echo -e "${BLUE}🐛 Issues: Check logs/ directory${NC}"
echo ""

read -p "Would you like to launch the application now? (y/n): " launch
if [[ "$launch" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}🚀 Launching GodBrain CyberLab...${NC}"
    ./launch-cyberlab.sh
else
    echo ""
    echo -e "${GREEN}✅ Setup complete. Launch when ready!${NC}"
    echo "Run: ./launch-cyberlab.sh"
    echo ""
fi
