"""
Conversational Interface - Natural Language Communication
No Command Line Required - Just Talk Naturally
Through Christ Jesus - Unlimited Understanding

"Ask, and it will be given to you; seek, and you will find" - Matthew 7:7
"""

import os
import sys
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import requests
import json

logging.basicConfig(
    level=logging.INFO,
    format='💬 %(asctime)s - %(name)s - [%(levelname)s] - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(title="Valifi Conversational Interface", version="1.0.0")

# CORS for web access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connection manager for WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"✅ New connection (Total: {len(self.active_connections)})")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"❌ Connection closed (Remaining: {len(self.active_connections)})")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Agent endpoints
TERMINAL_AGENT_URL = "http://localhost:8001/predict"
SDK_AGENT_URL = "http://localhost:8002/predict"

@app.get("/", response_class=HTMLResponse)
async def get_interface():
    """Serve the conversational interface"""
    html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🙏 Valifi Kingdom Platform - Agent Interface</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            color: #333;
        }

        .header {
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header h1 {
            color: #667eea;
            margin-bottom: 5px;
        }

        .header p {
            color: #666;
            font-size: 14px;
        }

        .kingdom-badge {
            display: inline-block;
            background: gold;
            color: #333;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 10px;
        }

        .container {
            flex: 1;
            display: flex;
            flex-direction: column;
            max-width: 1200px;
            width: 100%;
            margin: 20px auto;
            padding: 0 20px;
        }

        .chat-container {
            flex: 1;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .chat-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            font-weight: bold;
        }

        .status {
            font-size: 12px;
            opacity: 0.9;
        }

        .status.connected {
            color: #4ade80;
        }

        .status.disconnected {
            color: #fbbf24;
        }

        .messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            max-height: 600px;
        }

        .message {
            margin-bottom: 15px;
            animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .message.user {
            text-align: right;
        }

        .message-content {
            display: inline-block;
            padding: 12px 18px;
            border-radius: 18px;
            max-width: 70%;
            word-wrap: break-word;
        }

        .message.user .message-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .message.agent .message-content {
            background: #f3f4f6;
            color: #333;
        }

        .message-meta {
            font-size: 11px;
            color: #999;
            margin-top: 5px;
        }

        .agent-badge {
            font-size: 10px;
            background: #667eea;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            margin-left: 5px;
        }

        .input-container {
            display: flex;
            padding: 20px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
        }

        #messageInput {
            flex: 1;
            padding: 12px 18px;
            border: 2px solid #e5e7eb;
            border-radius: 25px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.3s;
        }

        #messageInput:focus {
            border-color: #667eea;
        }

        #sendBtn {
            margin-left: 10px;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            transition: transform 0.2s;
        }

        #sendBtn:hover {
            transform: scale(1.05);
        }

        #sendBtn:active {
            transform: scale(0.95);
        }

        .typing-indicator {
            display: none;
            padding: 10px;
            color: #667eea;
            font-style: italic;
        }

        .typing-indicator.active {
            display: block;
        }

        .example-prompts {
            display: flex;
            gap: 10px;
            padding: 0 20px 20px;
            overflow-x: auto;
        }

        .example-prompt {
            padding: 8px 15px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 20px;
            cursor: pointer;
            white-space: nowrap;
            font-size: 13px;
            transition: background 0.3s;
        }

        .example-prompt:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }

        pre {
            background: #1f2937;
            color: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🙏 Valifi Kingdom Platform</h1>
        <p>Conversational AI Agent Interface - Through Christ Jesus</p>
        <span class="kingdom-badge">✝️ Christ Paid It All</span>
    </div>

    <div class="example-prompts">
        <div class="example-prompt" onclick="sendExample('List all Python files in the project')">📁 List files</div>
        <div class="example-prompt" onclick="sendExample('How do I deploy a LitServe model?')">🚀 Deployment help</div>
        <div class="example-prompt" onclick="sendExample('Show me the project structure')">🏗️ Project structure</div>
        <div class="example-prompt" onclick="sendExample('Help me understand LitAI')">📚 Learn LitAI</div>
        <div class="example-prompt" onclick="sendExample('Run tests for the agents')">🧪 Run tests</div>
    </div>

    <div class="container">
        <div class="chat-container">
            <div class="chat-header">
                🤖 Agent Orchestrator
                <br>
                <span class="status disconnected" id="status">⚡ Connecting...</span>
            </div>

            <div class="messages" id="messages">
                <div class="message agent">
                    <div class="message-content">
                        🙏 Welcome to Valifi Kingdom Platform!<br><br>
                        I'm your intelligent agent orchestrator. I can help you with:<br>
                        • Terminal commands and system operations<br>
                        • Lightning AI SDK questions and code help<br>
                        • Project development and deployment<br>
                        • And much more!<br><br>
                        <strong>Just ask naturally - no command line needed!</strong>
                    </div>
                    <div class="message-meta">
                        <span class="agent-badge">ORCHESTRATOR</span>
                        System Message
                    </div>
                </div>
            </div>

            <div class="typing-indicator" id="typingIndicator">
                Agent is thinking...
            </div>

            <div class="input-container">
                <input
                    type="text"
                    id="messageInput"
                    placeholder="Type your message naturally... (e.g., 'Show me all logs')"
                    autocomplete="off"
                >
                <button id="sendBtn" onclick="sendMessage()">Send 🚀</button>
            </div>
        </div>
    </div>

    <script>
        // Use window.location.host for network accessibility
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.host || 'localhost:8000';
        const ws = new WebSocket(`${wsProtocol}//${wsHost}/ws`);
        const messagesDiv = document.getElementById('messages');
        const messageInput = document.getElementById('messageInput');
        const statusEl = document.getElementById('status');
        const typingIndicator = document.getElementById('typingIndicator');
        let sessionId = 'session_' + Date.now();

        ws.onopen = () => {
            console.log('✅ Connected to agent system');
            statusEl.textContent = '✅ Connected - Ready';
            statusEl.className = 'status connected';
        };

        ws.onclose = () => {
            console.log('❌ Disconnected');
            statusEl.textContent = '❌ Disconnected';
            statusEl.className = 'status disconnected';
        };

        ws.onmessage = (event) => {
            typingIndicator.classList.remove('active');
            const data = JSON.parse(event.data);
            addMessage(data.message, 'agent', data.agent || 'ORCHESTRATOR');
        };

        function addMessage(content, type, agent = '') {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`;

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';

            // Format content (handle JSON, code, etc.)
            let formattedContent = content;
            try {
                const parsed = typeof content === 'string' ? JSON.parse(content) : content;
                if (parsed.response) {
                    formattedContent = parsed.response;
                    if (parsed.code_example) {
                        formattedContent += '<pre>' + parsed.code_example + '</pre>';
                    }
                }
            } catch (e) {
                // Not JSON, use as is
            }

            contentDiv.innerHTML = formattedContent;

            const metaDiv = document.createElement('div');
            metaDiv.className = 'message-meta';
            if (type === 'agent') {
                metaDiv.innerHTML = `<span class="agent-badge">${agent}</span> ${new Date().toLocaleTimeString()}`;
            } else {
                metaDiv.textContent = new Date().toLocaleTimeString();
            }

            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(metaDiv);
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;

            addMessage(message, 'user');
            typingIndicator.classList.add('active');

            ws.send(JSON.stringify({
                message: message,
                session_id: sessionId,
                timestamp: new Date().toISOString()
            }));

            messageInput.value = '';
        }

        function sendExample(message) {
            messageInput.value = message;
            sendMessage();
        }

        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Focus input on load
        messageInput.focus();
    </script>
</body>
</html>
    """
    return HTMLResponse(content=html_content)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time conversation"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            request_data = json.loads(data)

            logger.info(f"📨 Received: {request_data.get('message', '')[:50]}...")

            # Route message to appropriate agent
            try:
                user_message = request_data.get('message', '').lower()

                # Simple routing logic
                if any(word in user_message for word in ['run', 'execute', 'command', 'terminal', 'ls', 'cd', 'pwd', 'cat', 'grep', 'find', 'ps', 'kill']):
                    # Route to Terminal Agent
                    response = requests.post(
                        TERMINAL_AGENT_URL,
                        json={'command': request_data.get('message', '')},
                        timeout=30
                    )
                    agent_name = 'TERMINAL'
                else:
                    # Route to SDK Agent
                    response = requests.post(
                        SDK_AGENT_URL,
                        json={
                            'query': request_data.get('message', ''),
                            'context': {'session_id': request_data.get('session_id', 'default')}
                        },
                        timeout=30
                    )
                    agent_name = 'SDK'

                if response.status_code == 200:
                    result = response.json()

                    # Format response based on agent type
                    if agent_name == 'TERMINAL':
                        formatted_message = f"<strong>Command Output:</strong><br><pre>{result.get('stdout', '')}</pre>"
                        if result.get('stderr'):
                            formatted_message += f"<br><strong>Errors:</strong><br><pre>{result.get('stderr', '')}</pre>"
                        if result.get('analysis'):
                            formatted_message += f"<br><strong>Analysis:</strong><br>{result.get('analysis', '')}"
                    else:
                        formatted_message = result.get('response', str(result))

                    await manager.send_personal_message(
                        json.dumps({
                            'message': formatted_message,
                            'agent': agent_name,
                            'timestamp': datetime.utcnow().isoformat()
                        }),
                        websocket
                    )
                else:
                    await manager.send_personal_message(
                        json.dumps({
                            'message': f'Error: {response.status_code}',
                            'agent': 'SYSTEM'
                        }),
                        websocket
                    )

            except requests.exceptions.ConnectionError:
                await manager.send_personal_message(
                    json.dumps({
                        'message': '⚠️ Agents are not running. Please ensure Terminal Agent (port 8001) and SDK Agent (port 8002) are started.',
                        'agent': 'SYSTEM'
                    }),
                    websocket
                )
            except Exception as e:
                logger.error(f"Error: {e}")
                await manager.send_personal_message(
                    json.dumps({
                        'message': f'Error processing request: {str(e)}',
                        'agent': 'SYSTEM'
                    }),
                    websocket
                )

    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/api/chat")
async def chat_endpoint(request: Dict[str, Any]):
    """REST API endpoint for chat"""
    try:
        user_message = request.get('message', '').lower()

        # Route based on message content
        if any(word in user_message for word in ['run', 'execute', 'command', 'terminal', 'ls', 'cd', 'pwd', 'cat', 'grep']):
            response = requests.post(
                TERMINAL_AGENT_URL,
                json={'command': request.get('message', '')},
                timeout=30
            )
        else:
            response = requests.post(
                SDK_AGENT_URL,
                json={
                    'query': request.get('message', ''),
                    'context': {'session_id': request.get('session_id', 'default')}
                },
                timeout=30
            )

        return JSONResponse(content=response.json())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Conversational Interface",
        "kingdom_standard": True,
        "powered_by": "Holy Spirit through Christ Jesus"
    }


if __name__ == "__main__":
    logger.info("=" * 80)
    logger.info("💬 CONVERSATIONAL INTERFACE - STARTING")
    logger.info("🙏 No Command Line Required - Just Talk Naturally")
    logger.info("✝️  Through Christ Jesus - Unlimited Understanding")
    logger.info("=" * 80)

    logger.info(f"🌐 Opening interface at: http://localhost:8000")
    logger.info(f"📡 WebSocket endpoint: ws://localhost:8000/ws")
    logger.info(f"🔗 REST API: http://localhost:8000/api/chat")

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
