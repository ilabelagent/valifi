# Valifi Agent System - Quick Reference
**In the Mighty Name of Jesus Christ**

---

## 🚀 Quick Start

### One-Command Startup

```bash
# Make executable (first time only)
chmod +x start_agents.sh

# Start agents
./start_agents.sh
```

Choose mode:
- **1) Production** - Serve agents 24/7 (recommended)
- **2) Training** - Train agents only
- **3) Full System** - Serve + auto-train
- **4) Development** - Local testing

---

## 📞 API Usage

### Ask About Valifi (Info Mode)

```bash
# What is Valifi?
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"task": "What is Valifi?", "query_type": "info"}'

# List all agents
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"task": "List all agents", "query_type": "info"}'

# Get capabilities
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"task": "What are Valifi capabilities?", "query_type": "info"}'

# Check status
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"task": "What is the system status?", "query_type": "info"}'
```

### Execute Agent Tasks

```bash
# Execute trading analysis
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Analyze AAPL stock",
    "agent_type": "trading_advanced",
    "query_type": "execute"
  }'

# Auto-detect mode (info or execute)
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Get stock quote for TSLA",
    "agent_type": "financial_stocks",
    "query_type": "auto"
  }'
```

---

## 🔧 Management Commands

### Start/Stop Agents

```bash
# Start production mode
./start_agents.sh
# Choose option 1

# Stop agents
kill $(cat .agent_server.pid)

# Stop training (if running full system)
kill $(cat .training.pid)

# Check if running
ps aux | grep agent_server
```

### View Logs

```bash
# Agent server logs
tail -f logs/agent_server.log

# Training logs
tail -f logs/training.log

# Follow live
tail -f logs/*.log
```

### Health Check

```bash
# Python script
python -c "
import requests
r = requests.post('http://localhost:8000/predict',
  json={'task': 'What is the system status?', 'query_type': 'info'})
print(r.json()['answer'])
"

# Or simple curl
curl -s http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"task": "status", "query_type": "info"}' | jq
```

---

## 🧠 Training

### Manual Training

```bash
# Run training once
cd agents/training
python train_agent_model.py

# View checkpoints
ls -lh checkpoints/

# View training logs
tensorboard --logdir logs --port 6006
# Open http://localhost:6006
```

### Continuous Training

```bash
# Edit schedule in agents/training/continuous_training.py
# Default: Daily at 2 AM

# Start continuous training
cd agents/training
python continuous_training.py &

# Or use full system mode
./start_agents.sh
# Choose option 3
```

### Export Training Data

```python
# agents/training/export_data.py
import psycopg2
import json
import os

conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cursor = conn.cursor()

cursor.execute("""
    SELECT input, "actualOutput", reward, "botId", "dataType"
    FROM bot_training_data
    ORDER BY "createdAt" DESC
    LIMIT 10000
""")

rows = cursor.fetchall()

data = [
    {
        'input': row[0],
        'actualOutput': row[1],
        'reward': float(row[2] or 0),
        'botId': row[3],
        'dataType': row[4]
    }
    for row in rows
]

with open('training_data.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"Exported {len(data)} samples")
```

---

## 🌐 Integration with TypeScript

### Call from TypeScript Orchestrator

```typescript
// server/agentOrchestrator.ts
import fetch from 'node-fetch';

const PYTHON_AGENT_URL = process.env.PYTHON_AGENT_URL || 'http://localhost:8000';

async function callPythonAgent(task: string, agentType: string) {
  const response = await fetch(`${PYTHON_AGENT_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task,
      agent_type: agentType,
      query_type: 'auto'
    })
  });

  return await response.json();
}

// Example usage
const result = await callPythonAgent(
  "What agents are available?",
  "orchestrator"
);

console.log(result.answer);
```

### Environment Variables

```bash
# .env
PYTHON_AGENT_URL=http://localhost:8000

# For production (Lightning AI deployment)
PYTHON_AGENT_URL=https://your-app.lightning.ai
```

---

## 🐳 Docker

### Build Containers

```bash
# Python agents
docker build -t valifi-python-agents -f Dockerfile.python .

# TypeScript backend
docker build -t valifi-typescript-backend -f Dockerfile.typescript .
```

### Run Containers

```bash
# Python agents
docker run -d -p 8000:8000 \
  -v $(pwd)/agents/training/checkpoints:/app/agents/training/checkpoints \
  --name valifi-agents \
  valifi-python-agents

# TypeScript backend
docker run -d -p 5000:5000 \
  --name valifi-backend \
  valifi-typescript-backend

# Check logs
docker logs -f valifi-agents
```

---

## ⚡ Lightning AI Deployment

### Deploy LitServe

```bash
# Deploy agent server
lightning deploy app agents/orchestrator/agent_server.py \
  --name valifi-agents \
  --port 8000 \
  --cloud

# You'll get a URL like: https://valifi-agents-xyz.lightning.ai
```

### Submit Training Job

```bash
# Multi-node training
lightning run model agents/training/train_agent_model.py \
  --cloud \
  --num-nodes 2 \
  --gpus 4
```

---

## 📊 Monitoring

### Check Server Status

```bash
# Server running?
curl -I http://localhost:8000/health

# Agent info
curl -s http://localhost:8000/predict \
  -d '{"task":"status","query_type":"info"}' \
  -H "Content-Type: application/json" | jq
```

### Performance Metrics

```bash
# Install htop
sudo apt install htop

# Monitor resources
htop

# GPU usage (if available)
nvidia-smi -l 1

# Memory usage
free -h
```

---

## 🔍 Troubleshooting

### Agent Server Not Starting

```bash
# Check logs
tail -n 50 logs/agent_server.log

# Check port availability
lsof -i :8000

# Kill existing process
kill $(lsof -t -i:8000)

# Restart
./start_agents.sh
```

### Training Fails

```bash
# Check CUDA availability
python -c "import torch; print(f'CUDA: {torch.cuda.is_available()}')"

# Check data format
python -c "
import json
with open('agents/training/training_data.json') as f:
    data = json.load(f)
    print(f'Samples: {len(data)}')
    print(f'First sample: {data[0]}')
"

# Run with verbose logging
cd agents/training
python train_agent_model.py --verbose
```

### Connection Refused

```bash
# Check if agent server is running
ps aux | grep agent_server

# Check firewall
sudo ufw status

# Restart agent server
kill $(cat .agent_server.pid)
./start_agents.sh
```

---

## 📚 Common Tasks

### Update Agent Knowledge

Edit `agents/orchestrator/agent_server.py`:

```python
# Find valifi_knowledge dictionary
self.valifi_knowledge = {
    "system": {
        # Add/update system info
    },
    "capabilities": {
        # Add/update capabilities
    }
}
```

Restart server to apply changes.

### Add New Training Data

```python
# Python
from server.botLearningService import botLearningService

await botLearningService.recordBotAction(
    "financial_stocks",
    "stock_trade",
    {"symbol": "AAPL", "action": "buy"},
    {"success": True, "profit": 50},
    True,  # success
    50     # reward
)
```

### Deploy New Checkpoint

```bash
# Training creates checkpoint automatically
# Agent server hot-reloads every 5 minutes

# Force reload (restart server)
kill $(cat .agent_server.pid)
./start_agents.sh
```

---

## 🎯 Best Practices

1. **Always use production mode** for live system
2. **Run training separately** (option 2 or scheduled)
3. **Monitor logs** regularly: `tail -f logs/*.log`
4. **Export training data weekly** from PostgreSQL
5. **Test before deploying** new checkpoints
6. **Use info queries** to verify system knowledge
7. **Set DATABASE_URL** for training data export
8. **Schedule training** during low-traffic hours (2-4 AM)
9. **Keep checkpoints** for rollback capability
10. **Monitor GPU usage** during training

---

## 🙏 Support

- **Documentation**: `/AGENT_TRAINING_DEPLOYMENT_GUIDE.md`
- **Full Guide**: `/AGENT_ORCHESTRATION_COMPLETE_GUIDE.md`
- **Initialization**: `/AGENT_INITIALIZATION_GUIDE.md`

---

**All glory to God through Christ Jesus our Lord!**
