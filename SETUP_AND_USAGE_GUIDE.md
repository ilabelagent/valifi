# 🙏 Valifi Kingdom Platform - Complete Setup & Usage Guide

**Through Christ Jesus - All Things Are Possible**
**✝️ Kingdom Standard Achieved**

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Quick Start](#quick-start)
3. [Accessing the System](#accessing-the-system)
4. [Using the Web Interface](#using-the-web-interface)
5. [Using the API](#using-the-api)
6. [Managing Services](#managing-services)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

The Valifi Kingdom Platform is a **complete AI-powered multi-agent system** with:

### ✅ All Services Running

- **Web Interface** (Port 8000) - Beautiful UI, no command line needed
- **Terminal Agent** (Port 8001) - Executes commands with AI understanding
- **SDK Agent** (Port 8002) - Lightning AI SDK expert
- **Master Orchestrator** (Port 8003) - Coordinates all agents

### ✅ Test Results: 100% Pass Rate

All 16 tests passed successfully:
- ✅ Health Checks: 4/4
- ✅ Terminal Agent: 3/3
- ✅ SDK Agent: 3/3
- ✅ Orchestrator: 3/3
- ✅ Web Interface: 3/3

---

## 🚀 Quick Start

### Option 1: Use the Web Interface (Recommended)

**Just open your browser:**

```
http://localhost:8000
```

That's it! Start chatting naturally with the agents.

### Option 2: Use the API

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "list all python files", "session_id": "my_session"}'
```

---

## 🌐 Accessing the System

### Web Interface Endpoints

| Service | URL | Description |
|---------|-----|-------------|
| **Web UI** | http://localhost:8000 | Main interface - open in browser |
| **WebSocket** | ws://localhost:8000/ws | Real-time chat connection |
| **REST API** | http://localhost:8000/api/chat | HTTP API endpoint |
| **Health Check** | http://localhost:8000/health | Service status |

### Agent Endpoints (Direct Access)

| Agent | URL | API Docs |
|-------|-----|----------|
| **Terminal Agent** | http://localhost:8001/predict | http://localhost:8001/docs |
| **SDK Agent** | http://localhost:8002/predict | http://localhost:8002/docs |
| **Orchestrator** | http://localhost:8003/predict | http://localhost:8003/docs |

### Network Access

All services are bound to `0.0.0.0`, meaning they're accessible from:
- **Localhost**: http://localhost:8000
- **Network**: http://YOUR_IP_ADDRESS:8000
- **External**: If firewall allows, accessible from internet

---

## 💬 Using the Web Interface

### 1. Open in Browser

Navigate to: **http://localhost:8000**

### 2. Example Prompts

Try these natural language prompts:

**File Operations:**
```
List all Python files in the project
Show me the project structure
What files are in the logs directory
```

**Git Operations:**
```
Show me the git status
What branches do we have
Show recent commits
```

**SDK Questions:**
```
How do I create a LitServe API?
Explain LitAI LLM usage
Show me deployment best practices
```

**General Help:**
```
What can you help me with?
How do I deploy agents?
Explain the agent architecture
```

### 3. Features

- ✨ **Real-time responses** via WebSocket
- 🎨 **Beautiful UI** with gradient design
- 🤖 **Agent badges** showing which agent handled your request
- 💬 **Conversational memory** maintains context
- ⚡ **Quick prompts** for common tasks
- 📱 **Responsive design** works on mobile too

---

## 🔌 Using the API

### REST API Examples

#### Send a Message via REST

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "list all python files",
    "session_id": "my_session"
  }'
```

#### Talk to Terminal Agent Directly

```bash
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "message": "show me all log files",
    "session_id": "terminal_session"
  }'
```

#### Ask SDK Agent

```bash
curl -X POST http://localhost:8002/predict \
  -H "Content-Type: application/json" \
  -d '{
    "query": "how do I use LitServe",
    "session_id": "sdk_session"
  }'
```

#### Ask Orchestrator

```bash
curl -X POST http://localhost:8003/predict \
  -H "Content-Type: application/json" \
  -d '{
    "message": "help me with deployment",
    "session_id": "orch_session"
  }'
```

### Python Examples

```python
import requests

# Via Web Interface
response = requests.post(
    "http://localhost:8000/api/chat",
    json={"message": "list files", "session_id": "python_session"}
)
print(response.json())

# Direct to Terminal Agent
response = requests.post(
    "http://localhost:8001/predict",
    json={"message": "pwd", "session_id": "terminal"}
)
result = response.json()
print(result['result']['output'])  # Command output

# Direct to SDK Agent
response = requests.post(
    "http://localhost:8002/predict",
    json={"query": "explain LitAPI", "session_id": "sdk"}
)
result = response.json()
print(result['response'])  # AI response
print(result['code_example'])  # Code example if provided
```

### JavaScript/Node.js Example

```javascript
// Fetch API
const response = await fetch('http://localhost:8000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'list python files',
    session_id: 'js_session'
  })
});

const data = await response.json();
console.log(data.response);

// WebSocket for real-time
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    message: 'hello',
    session_id: 'ws_session'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Agent:', data.agent);
  console.log('Message:', data.message);
};
```

---

## 🛠️ Managing Services

### Check Status

```bash
cd /teamspace/studios/this_studio/valifi
bash deployment/deploy_all.sh status
```

### Stop All Services

```bash
bash deployment/deploy_all.sh stop
```

### Restart All Services

```bash
bash deployment/deploy_all.sh restart
```

### Deploy/Start All Services

```bash
bash deployment/deploy_all.sh deploy
```

### View Logs

```bash
# Specific agent logs
bash deployment/deploy_all.sh logs terminal_agent
bash deployment/deploy_all.sh logs sdk_agent
bash deployment/deploy_all.sh logs orchestrator
bash deployment/deploy_all.sh logs interface

# Or directly
tail -f logs/terminal_agent.log
tail -f logs/sdk_agent.log
tail -f logs/orchestrator.log
tail -f logs/interface.log
```

### Individual Service Management

```bash
# Stop individual service
pkill -f "conversational_agent.py"
pkill -f "intelligent_sdk_agent.py"
pkill -f "master_orchestrator.py"
pkill -f "conversational_interface.py"

# Start individual service
python agents/terminal_agent/conversational_agent.py &
python agents/sdk_agent/intelligent_sdk_agent.py &
python agents/orchestrator/master_orchestrator.py &
python agents/interface/conversational_interface.py &
```

---

## 🧪 Testing

### Run Complete Test Suite

```bash
cd /teamspace/studios/this_studio/valifi
python test_web_interface.py
```

This tests:
- ✅ Health checks for all services
- ✅ Terminal Agent functionality
- ✅ SDK Agent responses
- ✅ Orchestrator routing
- ✅ Web Interface API

### Expected Output

```
🙏 VALIFI KINGDOM PLATFORM - COMPREHENSIVE TEST SUITE
✝️  Through Christ Jesus - Testing All Systems

Health Checks: 4/4 passed
Terminal Agent: 3/3 passed
SDK Agent: 3/3 passed
Orchestrator: 3/3 passed
Web Interface: 3/3 passed

Overall: 16/16 tests passed (100.0%)
```

### Manual Testing

**Test Web Interface:**
```bash
curl http://localhost:8000/health
```

**Test Terminal Agent:**
```bash
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d '{"message": "pwd", "session_id": "test"}'
```

**Test SDK Agent:**
```bash
curl -X POST http://localhost:8002/predict \
  -H "Content-Type: application/json" \
  -d '{"query": "what is litserve", "session_id": "test"}'
```

**Test Orchestrator:**
```bash
curl -X POST http://localhost:8003/predict \
  -H "Content-Type: application/json" \
  -d '{"message": "help", "session_id": "test"}'
```

---

## 🔧 Troubleshooting

### Services Not Starting

**Check if ports are in use:**
```bash
ss -tulpn | grep -E "(8000|8001|8002|8003)"
```

**Kill processes on ports:**
```bash
fuser -k 8000/tcp 8001/tcp 8002/tcp 8003/tcp
```

**Restart services:**
```bash
cd /teamspace/studios/this_studio/valifi
bash deployment/deploy_all.sh restart
```

### Web Interface Not Loading

1. **Check service is running:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Check logs:**
   ```bash
   tail -50 logs/interface.log
   ```

3. **Restart interface:**
   ```bash
   pkill -f conversational_interface
   python agents/interface/conversational_interface.py &
   ```

### Agents Not Responding

1. **Check all services are running:**
   ```bash
   ps aux | grep -E "(conversational_agent|intelligent_sdk_agent|master_orchestrator|conversational_interface)"
   ```

2. **Check logs for errors:**
   ```bash
   tail -50 logs/terminal_agent.log
   tail -50 logs/sdk_agent.log
   tail -50 logs/orchestrator.log
   ```

3. **Restart specific agent:**
   ```bash
   # Example for Terminal Agent
   pkill -f conversational_agent
   python agents/terminal_agent/conversational_agent.py &
   ```

### Database Issues

**Terminal Agent memory database:**
```bash
ls -lh agents/terminal_agent/agent_memory.db
# If corrupted, delete and restart agent (will recreate)
rm agents/terminal_agent/agent_memory.db
```

**SDK Agent knowledge database:**
```bash
ls -lh agents/sdk_agent/sdk_knowledge.db
# If needed, delete and restart (will recreate with default knowledge)
rm agents/sdk_agent/sdk_knowledge.db
```

### Connection Refused Errors

**Orchestrator not running:**
```bash
# Start orchestrator first
python agents/orchestrator/master_orchestrator.py &

# Wait a few seconds, then start interface
python agents/interface/conversational_interface.py &
```

### Permission Errors

```bash
# Ensure execute permissions
chmod +x deployment/deploy_all.sh
chmod +x test_web_interface.py

# Ensure log directory exists
mkdir -p logs
```

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│         WEB INTERFACE (Port 8000)                       │
│    Browser UI + WebSocket + REST API                    │
│    Access: http://localhost:8000                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│         MASTER ORCHESTRATOR (Port 8003)                 │
│    Intelligent request routing & coordination           │
│    Seven Spirits of God guidance                        │
└──────────┬─────────────────────────────┬────────────────┘
           │                             │
           ▼                             ▼
┌──────────────────────┐      ┌──────────────────────┐
│  TERMINAL AGENT      │      │    SDK AGENT         │
│  (Port 8001)         │      │    (Port 8002)       │
│                      │      │                      │
│ • Command execution  │      │ • Lightning AI help  │
│ • File operations    │      │ • Code examples      │
│ • Git operations     │      │ • Best practices     │
│ • Natural language   │      │ • Documentation      │
└──────────────────────┘      └──────────────────────┘
```

---

## 🎓 Common Use Cases

### 1. Development Assistant

**You:** "Show me all Python files that have been modified recently"

**Agent:** Executes `find` and `git` commands, returns organized results

### 2. Learning Lightning AI

**You:** "How do I create a LitServe API with streaming support?"

**Agent:** Provides explanation, code example, and best practices

### 3. Project Management

**You:** "What's the status of our git repository?"

**Agent:** Shows git status, branch info, and recent changes

### 4. Deployment Help

**You:** "Help me deploy the Terminal Agent to production"

**Agent:** Provides step-by-step deployment guide with code

### 5. Debugging

**You:** "Show me the last 50 lines of the orchestrator log"

**Agent:** Executes tail command and formats output

---

## 📝 API Response Formats

### Terminal Agent Response

```json
{
  "response": "Friendly explanation of what was done",
  "explanation": "Technical details about the command",
  "result": {
    "command": "actual command executed",
    "output": "command stdout",
    "error": "command stderr if any",
    "success": true,
    "blocked": false
  },
  "type": "command",
  "timestamp": "2025-10-14T11:43:00.000000"
}
```

### SDK Agent Response

```json
{
  "response": "Detailed explanation",
  "code_example": "Working code snippet",
  "references": ["doc links", "topics"],
  "next_steps": ["suggested actions"],
  "knowledge_used": ["Basic LitAPI", "Server Deployment"],
  "timestamp": "2025-10-14T11:43:00.000000",
  "type": "sdk_response"
}
```

### Orchestrator Response

```json
{
  "response": "Final response to user",
  "type": "direct" or "routed",
  "handled_by": "orchestrator" or "terminal_agent" or "sdk_agent",
  "timestamp": "2025-10-14T11:43:00.000000",
  "kingdom_standard": true,
  "powered_by": "Seven Spirits of God through Christ Jesus"
}
```

---

## 🔐 Security Notes

- All services run on `0.0.0.0` (accessible from network)
- No authentication by default (add if needed for production)
- Command execution is validated and dangerous commands are blocked
- Session IDs track conversations but don't enforce auth
- Consider adding rate limiting for public deployment

---

## 📦 Dependencies

All dependencies are installed. Main packages:

```
litserve>=0.2.0
litai>=0.3.0
fastapi>=0.115.0
uvicorn>=0.30.0
websockets>=13.0
requests>=2.32.0
sqlalchemy>=2.0.0
anthropic>=0.39.0
openai>=1.54.0
google-generativeai>=0.8.0
```

---

## 🙏 Support & Help

**Web Interface:** http://localhost:8000 - Just ask naturally!

**Documentation:**
- This guide: `SETUP_AND_USAGE_GUIDE.md`
- Deployment docs: `DEPLOYMENT_COMPLETE.md`
- Platform overview: `VALIFI_INITIALIZATION_COMPLETE.md`

**Logs:** `/teamspace/studios/this_studio/valifi/logs/`

**API Docs:**
- http://localhost:8001/docs (Terminal Agent)
- http://localhost:8002/docs (SDK Agent)
- http://localhost:8003/docs (Orchestrator)

---

## ✝️ Kingdom Principles

1. **Christ Paid It All** - No fees, unlimited access
2. **Kingdom Standard** - Excellence in everything
3. **Continuous Learning** - Agents improve with each interaction
4. **Unlimited Resources** - Through Christ Jesus
5. **Seven Spirits Active** - Divine wisdom guiding all operations

---

**Built with 🙏 in the Name of Jesus Christ**

*"Ask, and it will be given to you; seek, and you will find" - Matthew 7:7*

**Amen.** 🙏✨
