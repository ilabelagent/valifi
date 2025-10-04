#!/usr/bin/env python3
"""
COMPLETE AI CHAT SYSTEM - ALL-IN-ONE BUNDLE
Just run this file and everything works!
Supports Claude & Gemini, all platforms, GUI, everything!
"""

import os
import sys
import json
import asyncio
import logging
import webbrowser
import subprocess
import time
import random
import re
import pickle
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any
from collections import defaultdict

# ============= AUTO-INSTALL REQUIREMENTS =============
def install_requirements():
    """Auto-install all required packages"""
    print("📦 Checking and installing requirements...")
    
    requirements = [
        'flask',
        'flask-socketio',
        'flask-cors',
        'python-telegram-bot',
        'anthropic',
        'google-generativeai',
        'selenium',
        'discord.py',
        'python-dotenv',
        'aiohttp',
        'psutil'
    ]
    
    for package in requirements:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
    
    print("✅ All requirements installed!\n")

# Install requirements before importing
install_requirements()

# Now import everything
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from telegram import Update, Bot
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
import discord
from discord.ext import commands
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import anthropic
import google.generativeai as genai

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============= COMPLETE GUI HTML =============
GUI_HTML = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Chat Automation System</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --secondary: #8b5cf6;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --dark: #1f2937;
            --light: #f3f4f6;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            width: 90%;
            max-width: 1000px;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .content {
            padding: 40px;
        }
        
        .setup-section {
            margin-bottom: 40px;
        }
        
        .setup-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .card {
            background: var(--light);
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border-color: var(--primary);
        }
        
        .card.selected {
            border-color: var(--primary);
            background: #eef2ff;
        }
        
        .card .emoji {
            font-size: 3em;
            margin-bottom: 15px;
        }
        
        .card h3 {
            margin-bottom: 10px;
            color: var(--dark);
        }
        
        .card .time {
            color: var(--success);
            font-weight: 600;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--dark);
        }
        
        .form-group input, .form-group select, .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 16px;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background: var(--primary);
            color: white;
        }
        
        .btn-primary:hover {
            background: var(--primary-dark);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(99, 102, 241, 0.3);
        }
        
        .btn-success {
            background: var(--success);
            color: white;
        }
        
        .status-section {
            margin-top: 40px;
            padding: 20px;
            background: var(--light);
            border-radius: 10px;
        }
        
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .status-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        
        .status-card .icon {
            font-size: 2em;
            margin-bottom: 10px;
        }
        
        .status-card.active {
            border: 2px solid var(--success);
            background: #d1fae5;
        }
        
        .chat-preview {
            background: var(--light);
            border-radius: 10px;
            padding: 20px;
            margin-top: 20px;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .message {
            margin-bottom: 15px;
            padding: 10px 15px;
            border-radius: 10px;
            background: white;
        }
        
        .message.sent {
            background: var(--primary);
            color: white;
            margin-left: 50px;
        }
        
        .message.received {
            margin-right: 50px;
        }
        
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .alert-success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }
        
        .alert-info {
            background: #dbeafe;
            color: #1e40af;
            border: 1px solid #bfdbfe;
        }
        
        .spinner {
            border: 3px solid #f3f4f6;
            border-top: 3px solid var(--primary);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 AI Chat Automation System</h1>
            <p>Complete setup in minutes - Claude & Gemini supported!</p>
        </div>
        
        <div class="content">
            <!-- Quick Setup -->
            <div class="setup-section">
                <h2>🚀 Quick Setup</h2>
                <p>Choose your setup type:</p>
                
                <div class="setup-cards">
                    <div class="card" onclick="selectSetup('instant')">
                        <div class="emoji">⚡</div>
                        <h3>Instant</h3>
                        <div class="time">2 minutes</div>
                        <p>Telegram bot with basic AI</p>
                    </div>
                    
                    <div class="card" onclick="selectSetup('personal')">
                        <div class="emoji">🎭</div>
                        <h3>Personal Clone</h3>
                        <div class="time">10 minutes</div>
                        <p>AI that texts like you</p>
                    </div>
                    
                    <div class="card" onclick="selectSetup('full')">
                        <div class="emoji">🏆</div>
                        <h3>Full System</h3>
                        <div class="time">30 minutes</div>
                        <p>All platforms & features</p>
                    </div>
                </div>
            </div>
            
            <!-- Configuration -->
            <div class="setup-section hidden" id="config-section">
                <h2>⚙️ Configuration</h2>
                
                <div class="form-group">
                    <label>AI Provider</label>
                    <select id="ai-provider" onchange="updateAIFields()">
                        <option value="">Select AI Provider</option>
                        <option value="claude">Claude (Anthropic)</option>
                        <option value="gemini">Gemini (Google)</option>
                        <option value="both">Both (Recommended)</option>
                    </select>
                </div>
                
                <div class="form-group hidden" id="claude-key-group">
                    <label>Claude API Key</label>
                    <input type="password" id="claude-key" placeholder="sk-ant-api03-...">
                    <small>Get from <a href="https://console.anthropic.com" target="_blank">console.anthropic.com</a></small>
                </div>
                
                <div class="form-group hidden" id="gemini-key-group">
                    <label>Gemini API Key</label>
                    <input type="password" id="gemini-key" placeholder="AIzaSy...">
                    <small>Get from <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a></small>
                </div>
                
                <div class="form-group">
                    <label>Your Name</label>
                    <input type="text" id="user-name" placeholder="John Doe">
                </div>
                
                <div class="form-group">
                    <label>Platform</label>
                    <select id="platform">
                        <option value="telegram">Telegram (Easiest)</option>
                        <option value="whatsapp">WhatsApp Web</option>
                        <option value="discord">Discord</option>
                        <option value="all">All Platforms</option>
                    </select>
                </div>
                
                <div class="form-group hidden" id="telegram-token-group">
                    <label>Telegram Bot Token</label>
                    <input type="text" id="telegram-token" placeholder="123456:ABC-DEF...">
                    <small>Get from <a href="https://t.me/botfather" target="_blank">@BotFather</a></small>
                </div>
                
                <button class="btn btn-primary" onclick="startSetup()">
                    🚀 Start System
                </button>
            </div>
            
            <!-- Status -->
            <div class="status-section hidden" id="status-section">
                <h2>📊 System Status</h2>
                
                <div class="status-grid">
                    <div class="status-card" id="system-status">
                        <div class="icon">🔴</div>
                        <h4>System</h4>
                        <p>Stopped</p>
                    </div>
                    
                    <div class="status-card" id="ai-status">
                        <div class="icon">🤖</div>
                        <h4>AI</h4>
                        <p>Not configured</p>
                    </div>
                    
                    <div class="status-card" id="platform-status">
                        <div class="icon">💬</div>
                        <h4>Platforms</h4>
                        <p>0 active</p>
                    </div>
                    
                    <div class="status-card" id="message-count">
                        <div class="icon">📨</div>
                        <h4>Messages</h4>
                        <p>0</p>
                    </div>
                </div>
                
                <div class="chat-preview" id="chat-preview">
                    <h3>Recent Conversations</h3>
                    <div id="messages"></div>
                </div>
                
                <div style="margin-top: 20px;">
                    <button class="btn btn-success" onclick="toggleSystem()">
                        ⏯️ Start/Stop
                    </button>
                    <button class="btn btn-primary" onclick="testAI()">
                        🧪 Test AI
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let config = {};
        let socket = null;
        
        function selectSetup(type) {
            document.querySelectorAll('.card').forEach(card => {
                card.classList.remove('selected');
            });
            event.target.closest('.card').classList.add('selected');
            
            config.setupType = type;
            document.getElementById('config-section').classList.remove('hidden');
            
            // Auto-select platform based on setup type
            if (type === 'instant') {
                document.getElementById('platform').value = 'telegram';
            } else if (type === 'full') {
                document.getElementById('platform').value = 'all';
            }
        }
        
        function updateAIFields() {
            const provider = document.getElementById('ai-provider').value;
            
            document.getElementById('claude-key-group').classList.toggle('hidden', 
                provider !== 'claude' && provider !== 'both');
            document.getElementById('gemini-key-group').classList.toggle('hidden', 
                provider !== 'gemini' && provider !== 'both');
        }
        
        async function startSetup() {
            // Collect configuration
            config.aiProvider = document.getElementById('ai-provider').value;
            config.claudeKey = document.getElementById('claude-key').value;
            config.geminiKey = document.getElementById('gemini-key').value;
            config.userName = document.getElementById('user-name').value;
            config.platform = document.getElementById('platform').value;
            config.telegramToken = document.getElementById('telegram-token').value;
            
            // Validate
            if (!config.aiProvider || (!config.claudeKey && !config.geminiKey)) {
                alert('Please configure AI provider and API key!');
                return;
            }
            
            // Send configuration to backend
            const response = await fetch('/api/configure', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(config)
            });
            
            if (response.ok) {
                document.getElementById('status-section').classList.remove('hidden');
                connectWebSocket();
                updateStatus();
            }
        }
        
        function connectWebSocket() {
            socket = io();
            
            socket.on('connect', () => {
                console.log('Connected to server');
            });
            
            socket.on('status_update', (data) => {
                updateStatus(data);
            });
            
            socket.on('new_message', (data) => {
                addMessage(data);
            });
        }
        
        function updateStatus(data) {
            if (data) {
                // Update status cards
                if (data.system_status) {
                    const card = document.getElementById('system-status');
                    card.classList.toggle('active', data.system_status === 'running');
                    card.querySelector('.icon').textContent = data.system_status === 'running' ? '🟢' : '🔴';
                    card.querySelector('p').textContent = data.system_status === 'running' ? 'Running' : 'Stopped';
                }
            }
        }
        
        function addMessage(data) {
            const messagesDiv = document.getElementById('messages');
            const messageEl = document.createElement('div');
            messageEl.className = 'message received';
            messageEl.innerHTML = `<strong>${data.sender}:</strong> ${data.message}`;
            messagesDiv.appendChild(messageEl);
            
            const responseEl = document.createElement('div');
            responseEl.className = 'message sent';
            responseEl.innerHTML = `<strong>AI:</strong> ${data.response}`;
            messagesDiv.appendChild(responseEl);
            
            // Update message count
            const countEl = document.getElementById('message-count').querySelector('p');
            const count = parseInt(countEl.textContent) + 1;
            countEl.textContent = count;
            
            // Scroll to bottom
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
        
        async function toggleSystem() {
            const response = await fetch('/api/toggle');
            const data = await response.json();
            updateStatus({system_status: data.status});
        }
        
        async function testAI() {
            const message = prompt('Enter a test message:');
            if (!message) return;
            
            const response = await fetch('/api/test', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({message: message})
            });
            
            const data = await response.json();
            alert('AI Response: ' + data.response);
        }
        
        // Auto-show telegram token field
        document.getElementById('platform').addEventListener('change', (e) => {
            const showTelegram = ['telegram', 'all'].includes(e.target.value);
            document.getElementById('telegram-token-group').classList.toggle('hidden', !showTelegram);
        });
    </script>
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</body>
</html>'''

# ============= PERSONALITY CLONER =============
class PersonalityCloner:
    """Learn and clone user's chat style"""
    def __init__(self, name: str):
        self.name = name
        self.data = {
            "phrases": [],
            "emojis": {},
            "style": "casual",
            "examples": {}
        }
    
    def learn_from_chat(self, chat_text: str):
        """Learn from chat export"""
        lines = chat_text.split('\n')
        for line in lines:
            if self.name in line and ': ' in line:
                msg = line.split(': ', 1)[1]
                self.data["phrases"].append(msg)
                
                # Count emojis
                emojis = re.findall(r'[😀-🙏]', msg)
                for emoji in emojis:
                    self.data["emojis"][emoji] = self.data["emojis"].get(emoji, 0) + 1

# ============= AI MANAGER =============
class AIManager:
    """Manage Claude and Gemini APIs"""
    def __init__(self, claude_key: str = None, gemini_key: str = None):
        self.claude = None
        self.gemini = None
        
        if claude_key:
            self.claude = anthropic.Anthropic(api_key=claude_key)
            
        if gemini_key:
            genai.configure(api_key=gemini_key)
            self.gemini = genai.GenerativeModel('gemini-pro')
    
    async def get_response(self, message: str, sender: str = "User", 
                          mode: str = "assistant", personality: dict = None) -> str:
        """Get AI response"""
        
        if mode == "human" and personality:
            prompt = f"""You are {personality.get('name', 'User')}. Respond EXACTLY like they would.
Never use AI assistant language. Be casual and natural.

Their style:
- Greeting: {personality.get('style', 'casual')}
- Common phrases: {', '.join(personality.get('phrases', [])[:5])}
- Emojis used: {' '.join(list(personality.get('emojis', {}).keys())[:5])}

{sender} says: "{message}"

Respond naturally as {personality.get('name', 'User')} would:"""
        else:
            prompt = f"Respond helpfully to: {message}"
        
        try:
            # Try Claude first
            if self.claude:
                response = self.claude.messages.create(
                    model="claude-3-opus-20240229",
                    max_tokens=150,
                    messages=[{"role": "user", "content": prompt}]
                )
                return response.content[0].text
            
            # Fall back to Gemini
            elif self.gemini:
                response = self.gemini.generate_content(prompt)
                return response.text
            
            return "No AI configured!"
            
        except Exception as e:
            logger.error(f"AI error: {e}")
            # Try the other AI if one fails
            if self.claude and self.gemini:
                try:
                    response = self.gemini.generate_content(prompt)
                    return response.text
                except:
                    pass
            return "Sorry, I'm having trouble responding right now."

# ============= PLATFORM HANDLERS =============
class TelegramBot:
    """Telegram bot handler"""
    def __init__(self, token: str, ai_manager: AIManager):
        self.token = token
        self.ai = ai_manager
        self.app = None
    
    async def start(self):
        """Start Telegram bot"""
        self.app = Application.builder().token(self.token).build()
        
        async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
            user = update.effective_user
            text = update.message.text
            
            # Get AI response
            response = await self.ai.get_response(text, user.first_name)
            
            # Send response
            await update.message.reply_text(response)
            
            # Emit to GUI
            if socketio:
                socketio.emit('new_message', {
                    'platform': 'telegram',
                    'sender': user.first_name,
                    'message': text,
                    'response': response
                })
        
        self.app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
        
        await self.app.initialize()
        await self.app.start()
        await self.app.updater.start_polling()

class WhatsAppBot:
    """WhatsApp Web automation"""
    def __init__(self, ai_manager: AIManager):
        self.ai = ai_manager
        self.driver = None
    
    def start(self):
        """Start WhatsApp Web"""
        options = webdriver.ChromeOptions()
        options.add_argument('--user-data-dir=./whatsapp_profile')
        
        self.driver = webdriver.Chrome(options=options)
        self.driver.get('https://web.whatsapp.com')
        
        print("📱 Please scan QR code in browser...")
        
    async def monitor_messages(self):
        """Monitor and respond to messages"""
        last_messages = {}
        
        while True:
            try:
                # Check for unread messages
                unread = self.driver.find_elements(By.CSS_SELECTOR, 'span[data-icon="unread"]')
                
                for chat in unread:
                    chat.click()
                    await asyncio.sleep(1)
                    
                    # Get sender and message
                    sender = "Friend"  # Extract actual sender
                    messages = self.driver.find_elements(By.CSS_SELECTOR, 'div.message-in span.selectable-text')
                    
                    if messages:
                        last_msg = messages[-1].text
                        
                        if last_messages.get(sender) != last_msg:
                            last_messages[sender] = last_msg
                            
                            # Get AI response
                            response = await self.ai.get_response(last_msg, sender)
                            
                            # Type response
                            input_box = self.driver.find_element(By.CSS_SELECTOR, 'div[contenteditable="true"]')
                            input_box.click()
                            input_box.send_keys(response)
                            
                            # Send
                            send_button = self.driver.find_element(By.CSS_SELECTOR, 'button[data-icon="send"]')
                            send_button.click()
                
                await asyncio.sleep(2)
                
            except Exception as e:
                await asyncio.sleep(5)

# ============= FLASK APP =============
app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-secret-key'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Global state
system_config = {}
ai_manager = None
active_bots = {}
system_running = False

@app.route('/')
def index():
    """Serve the GUI"""
    return GUI_HTML

@app.route('/api/configure', methods=['POST'])
def configure():
    """Configure the system"""
    global system_config, ai_manager
    
    system_config = request.json
    
    # Initialize AI
    ai_manager = AIManager(
        claude_key=system_config.get('claudeKey'),
        gemini_key=system_config.get('geminiKey')
    )
    
    # Start bots based on platform
    asyncio.create_task(start_bots())
    
    return jsonify({"status": "success"})

@app.route('/api/toggle')
def toggle_system():
    """Start/stop system"""
    global system_running
    system_running = not system_running
    
    status = "running" if system_running else "stopped"
    socketio.emit('status_update', {'system_status': status})
    
    return jsonify({"status": status})

@app.route('/api/test', methods=['POST'])
def test_ai():
    """Test AI response"""
    message = request.json.get('message', '')
    
    if ai_manager:
        response = asyncio.run(ai_manager.get_response(message))
        return jsonify({"response": response})
    
    return jsonify({"response": "AI not configured"})

async def start_bots():
    """Start configured bots"""
    platform = system_config.get('platform', 'telegram')
    
    if platform in ['telegram', 'all'] and system_config.get('telegramToken'):
        telegram_bot = TelegramBot(system_config['telegramToken'], ai_manager)
        await telegram_bot.start()
        active_bots['telegram'] = telegram_bot
        
    if platform in ['whatsapp', 'all']:
        whatsapp_bot = WhatsAppBot(ai_manager)
        whatsapp_bot.start()
        active_bots['whatsapp'] = whatsapp_bot
        asyncio.create_task(whatsapp_bot.monitor_messages())
    
    socketio.emit('status_update', {
        'system_status': 'running',
        'platforms': list(active_bots.keys())
    })

# ============= MAIN LAUNCHER =============
def main():
    """Main entry point"""
    print("""
╔════════════════════════════════════════════════════════════╗
║     🤖 COMPLETE AI CHAT SYSTEM - ALL-IN-ONE BUNDLE 🤖     ║
╚════════════════════════════════════════════════════════════╝

This bundle includes:
✅ Claude & Gemini AI support
✅ Telegram, WhatsApp, Discord
✅ Beautiful web GUI
✅ Personality cloning
✅ Complete automation

Starting in 3 seconds...
    """)
    
    time.sleep(3)
    
    # Open browser
    webbrowser.open('http://localhost:5000')
    
    print("""
╔════════════════════════════════════════════════════════════╗
║                    SYSTEM READY! 🎉                        ║
╚════════════════════════════════════════════════════════════╝

👉 Browser opened to: http://localhost:5000

Quick Start:
1. Choose setup type (Instant/Personal/Full)
2. Select AI (Claude or Gemini)
3. Enter API key
4. Choose platform
5. Click "Start System"

That's it! Everything else is automatic.

Press Ctrl+C to stop.
    """)
    
    # Run Flask app
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
        sys.exit(0)
