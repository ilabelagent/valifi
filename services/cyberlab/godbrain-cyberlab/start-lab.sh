#!/bin/bash

echo ""
echo "==============================================="
echo "   🧠 GodBrain Cybersecurity Lab Launcher"
echo "==============================================="
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo "✅ Dependencies ready"
echo ""
echo "Starting GodBrain Cybersecurity Lab..."
echo ""
echo "🌐 Lab will be available at: http://127.0.0.1:5000"
echo "🔒 Localhost only - Safe for training"
echo "📚 CEH v14 compatible simulations"
echo "⚠️  Educational use only"
echo ""
echo "Press Ctrl+C to stop the lab"
echo ""

npm start
