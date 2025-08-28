#!/bin/bash
# Valifi FinTech Bot - Build, Run, and Deploy Script (Linux/Mac)

PROJECT_DIR=$(pwd)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================================================"
echo "   VALIFI FINTECH BOT - BUILD AND DEPLOYMENT MANAGER"
echo "================================================================"
echo ""

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to fix project issues
fix_issues() {
    echo -e "${YELLOW}Fixing project issues...${NC}"
    
    # Create API directory
    if [ ! -d "api" ]; then
        mkdir api
        echo -e "${GREEN}✓ Created API directory${NC}"
    fi
    
    # Create consolidated API file
    if [ ! -f "api/index.js" ] && [ -f "pages/api/bot.js" ]; then
        cp pages/api/bot.js api/index.js
        echo -e "${GREEN}✓ Created API index.js${NC}"
    fi
    
    # Check environment file
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            echo -e "${GREEN}✓ Created .env.local from template${NC}"
        else
            cat > .env.local << EOF
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
EOF
            echo -e "${GREEN}✓ Created .env.local with defaults${NC}"
        fi
    fi
}

# Function to install dependencies
install_deps() {
    echo -e "${YELLOW}Installing dependencies...${NC}"
    
    # Clean install
    if [ -d "node_modules" ]; then
        echo "Cleaning old node_modules..."
        rm -rf node_modules
    fi
    
    if [ -f "package-lock.json" ]; then
        rm package-lock.json
    fi
    
    # Install all dependencies
    npm install
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
    else
        echo -e "${RED}✗ Failed to install dependencies${NC}"
        exit 1
    fi
}

# Function to build project
build_project() {
    echo -e "${YELLOW}Building project...${NC}"
    
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Build completed successfully${NC}"
    else
        echo -e "${RED}✗ Build failed${NC}"
        exit 1
    fi
}

# Function to run development server
run_dev() {
    echo -e "${YELLOW}Starting development server...${NC}"
    echo "Server will run at: http://localhost:3000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    
    npm run dev
}

# Function to deploy to Vercel
deploy_vercel() {
    echo -e "${YELLOW}Deploying to Vercel...${NC}"
    
    # Check if Vercel CLI is installed
    if ! command_exists vercel; then
        echo "Installing Vercel CLI..."
        npm i -g vercel
    fi
    
    # Deploy
    if [ -f ".vercel/project.json" ]; then
        echo "Deploying to production..."
        vercel --prod
    else
        echo "First time deployment, follow the prompts..."
        vercel
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Deployment completed successfully${NC}"
    else
        echo -e "${RED}✗ Deployment failed${NC}"
    fi
}

# Main menu
show_menu() {
    echo ""
    echo "Select an action:"
    echo "================================================================"
    echo "1. Fix Project Issues"
    echo "2. Install Dependencies"
    echo "3. Build Project"
    echo "4. Run Development Server"
    echo "5. Deploy to Vercel"
    echo "6. Complete Setup (All Steps)"
    echo "7. Quick Dev Start"
    echo "8. Production Deploy"
    echo "9. Exit"
    echo "================================================================"
    echo ""
    read -p "Enter your choice (1-9): " choice
    
    case $choice in
        1)
            fix_issues
            show_menu
            ;;
        2)
            install_deps
            show_menu
            ;;
        3)
            build_project
            show_menu
            ;;
        4)
            run_dev
            ;;
        5)
            deploy_vercel
            show_menu
            ;;
        6)
            fix_issues
            install_deps
            build_project
            run_dev
            ;;
        7)
            if [ ! -d "node_modules" ]; then
                npm install
            fi
            npm run dev
            ;;
        8)
            fix_issues
            install_deps
            NODE_ENV=production npm run build
            vercel --prod
            show_menu
            ;;
        9)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            show_menu
            ;;
    esac
}

# Check Node.js is installed
if ! command_exists node; then
    echo -e "${RED}Node.js is not installed!${NC}"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Start the menu
show_menu