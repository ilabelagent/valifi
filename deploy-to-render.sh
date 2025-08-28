#!/bin/bash

# Valifi Bot - Render Deployment Script
# This script prepares and deploys the Valifi bot to Render

echo "========================================"
echo "    VALIFI BOT - RENDER DEPLOYMENT"
echo "========================================"
echo ""

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "⚠️  Render CLI is not installed."
    echo "📦 Install it using: npm install -g @render-oss/cli"
    echo "Or visit: https://render.com/docs/cli"
    exit 1
fi

# Function to check required environment variables
check_env() {
    if [ ! -f .env.production ]; then
        echo "⚠️  .env.production file not found!"
        echo "Creating from template..."
        
        if [ -f .env.template ]; then
            cp .env.template .env.production
            echo "✅ Created .env.production from template"
            echo "📝 Please update the values in .env.production before proceeding"
            exit 1
        else
            echo "❌ No .env.template found. Please create .env.production manually"
            exit 1
        fi
    fi
}

# Function to validate package.json
validate_package() {
    if [ ! -f package.json ]; then
        echo "❌ package.json not found!"
        exit 1
    fi
    
    echo "✅ package.json found"
    
    # Check for required scripts
    if ! grep -q '"build"' package.json; then
        echo "⚠️  Warning: No build script found in package.json"
    fi
    
    if ! grep -q '"start"' package.json; then
        echo "⚠️  Warning: No start script found in package.json"
    fi
}

# Function to build the application locally for testing
local_build() {
    echo ""
    echo "🔨 Building application locally for testing..."
    npm install --force --legacy-peer-deps
    
    if [ $? -ne 0 ]; then
        echo "❌ npm install failed!"
        exit 1
    fi
    
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ Build failed!"
        echo "Please fix build errors before deploying"
        exit 1
    fi
    
    echo "✅ Local build successful!"
}

# Function to create render blueprint
create_blueprint() {
    if [ ! -f render.yaml ]; then
        echo "❌ render.yaml not found!"
        echo "Please ensure render.yaml exists in the project root"
        exit 1
    fi
    
    echo "✅ render.yaml found"
}

# Main deployment process
main() {
    echo "🚀 Starting Render deployment process..."
    echo ""
    
    # Step 1: Validate environment
    echo "📋 Step 1: Validating environment..."
    check_env
    validate_package
    create_blueprint
    echo ""
    
    # Step 2: Test build locally (optional)
    read -p "Do you want to test the build locally first? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        local_build
    fi
    echo ""
    
    # Step 3: Git operations
    echo "📋 Step 3: Preparing Git repository..."
    
    # Check if git repo exists
    if [ ! -d .git ]; then
        echo "Initializing git repository..."
        git init
        git add .
        git commit -m "Initial commit for Render deployment"
    else
        echo "Git repository found"
        
        # Check for uncommitted changes
        if ! git diff-index --quiet HEAD --; then
            echo "📝 Uncommitted changes detected"
            read -p "Do you want to commit all changes? (y/n): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git add .
                read -p "Enter commit message: " commit_msg
                git commit -m "$commit_msg"
            fi
        fi
    fi
    echo ""
    
    # Step 4: Deploy to Render
    echo "📋 Step 4: Deploying to Render..."
    echo ""
    echo "You have two options to deploy:"
    echo "1. Use Render Dashboard (Recommended for first-time setup)"
    echo "2. Use Render CLI"
    echo ""
    
    read -p "Choose option (1 or 2): " deploy_option
    
    case $deploy_option in
        1)
            echo ""
            echo "📌 To deploy using Render Dashboard:"
            echo "1. Go to https://dashboard.render.com/"
            echo "2. Click 'New +' → 'Blueprint'"
            echo "3. Connect your GitHub/GitLab repository"
            echo "4. Select the repository containing this project"
            echo "5. Render will detect the render.yaml file"
            echo "6. Review the configuration and click 'Apply'"
            echo "7. Set the required environment variables in the dashboard"
            echo ""
            echo "🔗 Opening Render Dashboard..."
            
            # Try to open browser
            if command -v xdg-open &> /dev/null; then
                xdg-open "https://dashboard.render.com/blueprints"
            elif command -v open &> /dev/null; then
                open "https://dashboard.render.com/blueprints"
            elif command -v start &> /dev/null; then
                start "https://dashboard.render.com/blueprints"
            else
                echo "Please open https://dashboard.render.com/blueprints in your browser"
            fi
            ;;
            
        2)
            echo ""
            echo "📌 Deploying using Render CLI..."
            echo "Make sure you're logged in to Render CLI"
            render deploy
            
            if [ $? -eq 0 ]; then
                echo "✅ Deployment initiated successfully!"
            else
                echo "❌ Deployment failed. Please check the error messages above."
            fi
            ;;
            
        *)
            echo "Invalid option selected"
            exit 1
            ;;
    esac
    
    echo ""
    echo "========================================"
    echo "       DEPLOYMENT PROCESS COMPLETE"
    echo "========================================"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Monitor deployment progress in Render Dashboard"
    echo "2. Set all required environment variables"
    echo "3. Check application logs for any issues"
    echo "4. Test your application at the provided URL"
    echo ""
    echo "🔗 Useful Links:"
    echo "- Render Dashboard: https://dashboard.render.com/"
    echo "- Render Docs: https://render.com/docs"
    echo "- Render Status: https://status.render.com/"
}

# Run main function
main