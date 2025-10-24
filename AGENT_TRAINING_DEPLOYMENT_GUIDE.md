# Valifi Agent Training & Deployment - Complete Implementation Flow
**Zero-Downtime Agent Training | 24/7 System Availability | Multi-Node Scaling**

**"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future." - Jeremiah 29:11**

---

## 🎯 Core Principle: Training Never Stops Serving

**Key Insight**: Valifi remains **fully operational 24/7** regardless of agent training status.

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│                   VALIFI SYSTEM                         │
│                                                         │
│  ┌──────────────────┐        ┌────────────────────┐   │
│  │  TypeScript      │        │   Python Agent     │   │
│  │  Orchestrator    │◄──────►│   Server           │   │
│  │  (Express.js)    │  HTTP  │   (LitServe)       │   │
│  │                  │        │   Port 8000        │   │
│  │  Always Running  │        │   Always Running   │   │
│  └──────────────────┘        └────────────────────┘   │
│         ▲                             ▲                │
│         │                             │                │
│         │                             │                │
│         ▼                             │                │
│  ┌──────────────────┐                │                │
│  │   PostgreSQL     │                │                │
│  │   Database       │                │                │
│  └──────────────────┘                │                │
│                                       │                │
└───────────────────────────────────────┼────────────────┘
                                        │
                        ┌───────────────┴──────────────┐
                        │                               │
                        ▼                               ▼
               ┌────────────────┐           ┌──────────────────┐
               │  Training      │           │  New Checkpoint  │
               │  (Separate     │──────────►│  Deployed        │
               │   Process)     │           │  (Hot Swap)      │
               │                │           │                  │
               │  PyTorch       │           │  Zero Downtime   │
               │  Lightning     │           │                  │
               └────────────────┘           └──────────────────┘
```

**Agents serve from latest checkpoint - training updates checkpoint - server hot-reloads**

---

## 📋 Implementation Flow

### Phase 1: Prepare Training Infrastructure ✅

**Status**: COMPLETED

Created Files:
- ✅ `agents/training/train_agent_model.py` - PyTorch Lightning training
- ✅ `agents/orchestrator/agent_server.py` - LitServe serving (enhanced)

**What We Built**:
1. **PyTorch Lightning Training Module**
   - Multi-GPU/multi-node support via DDP
   - Transformer-based agent architecture
   - Automatic checkpointing with ModelCheckpoint
   - TensorBoard logging
   - Mixed precision training (16-bit)
   - Early stopping

2. **LitServe Production Server**
   - Auto-scaling with batching
   - GPU acceleration
   - Valifi knowledge base (answers system questions)
   - Two operation modes:
     - **Info Mode**: Answers questions about Valifi
     - **Execute Mode**: Runs agent tasks
   - Checkpoint hot-reloading

---

### Phase 2: Containerize for Deployment

#### Create Dockerfiles

Create `Dockerfile.python` (in project root):

```dockerfile
# Dockerfile.python
FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Lightning AI stack
RUN pip install --no-cache-dir \
    pytorch-lightning \
    litserve \
    litdata

# Copy agent code
COPY agents/ ./agents/
COPY server/ ./server/
COPY shared/ ./shared/

WORKDIR /app/agents

# Expose LitServe port
EXPOSE 8000

# Run agent server
CMD ["python", "orchestrator/agent_server.py"]
```

Create `Dockerfile.typescript` (in project root):

```dockerfile
# Dockerfile.typescript
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY server/ ./server/
COPY client/ ./client/
COPY shared/ ./shared/
COPY tsconfig.json ./
COPY vite.config.ts ./

# Build frontend
RUN npm run build

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
```

#### Build Containers

```bash
# Build Python agent container
docker build -t valifi-python-agents -f Dockerfile.python .

# Build TypeScript backend container
docker build -t valifi-typescript-backend -f Dockerfile.typescript .

# Test locally
docker run -p 8000:8000 valifi-python-agents
docker run -p 5000:5000 valifi-typescript-backend
```

---

### Phase 3: Deploy to Lightning AI ⚡

#### Option A: Deploy LitServe Agent

```bash
# Deploy Python agents to Lightning AI
lightning deploy app agents/orchestrator/agent_server.py \
    --name valifi-agent-server \
    --port 8000 \
    --cloud
```

This gives you:
- ✅ Auto-scaling based on load
- ✅ GPU acceleration
- ✅ Public HTTPS endpoint
- ✅ Built-in monitoring
- ✅ Zero-downtime updates

#### Option B: Deploy Containers

```bash
# Deploy Python container
lightning deploy container \
    --name valifi-python-agents \
    --image valifi-python-agents \
    --port 8000

# Deploy TypeScript container
lightning deploy container \
    --name valifi-typescript-backend \
    --image valifi-typescript-backend \
    --port 5000
```

---

### Phase 4: Setup Multi-Node Training Job

Create `training_job.py`:

```python
"""
Multi-Node Training Job for Lightning AI
Trains agents across multiple GPUs/nodes
"""

import lightning as L
from lightning.app.components import MultiNode

class AgentTrainingJob(L.LightningWork):
    def run(self):
        import subprocess

        # Run PyTorch Lightning training
        subprocess.run([
            "python",
            "agents/training/train_agent_model.py"
        ])

class TrainingApp(L.LightningApp):
    def __init__(self):
        super().__init__()

        # Multi-node training component
        self.training = MultiNode(
            AgentTrainingJob,
            num_nodes=2,  # 2 nodes
            cloud_compute=L.CloudCompute("gpu-fast-multi"),  # Multi-GPU
        )

    def run(self):
        self.training.run()

if __name__ == "__main__":
    app = TrainingApp()
    L.LightningApp().run(app)
```

**Submit Training Job**:

```bash
lightning run app training_job.py --cloud
```

Training runs on separate infrastructure - **Valifi keeps serving**!

---

### Phase 5: Integrate TypeScript Orchestrator with Python Agents

Update `server/agentOrchestrator.ts` to call Python agent server:

```typescript
// Add to server/agentOrchestrator.ts

import fetch from 'node-fetch';

const PYTHON_AGENT_URL = process.env.PYTHON_AGENT_URL || 'http://localhost:8000';

/**
 * Call Python agent server for advanced tasks
 */
async function callPythonAgent(
  task: string,
  agentType: string,
  queryType: 'auto' | 'info' | 'execute' = 'auto'
): Promise<any> {
  try {
    const response = await fetch(`${PYTHON_AGENT_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task,
        agent_type: agentType,
        query_type: queryType,
        context: {}
      })
    });

    if (!response.ok) {
      throw new Error(`Python agent error: ${response.statusText}`);
    }

    return await response.json();

  } catch (error: any) {
    console.error('[AgentOrchestrator] Python agent call failed:', error);
    throw error;
  }
}

// Use in orchestrator methods
async function runAdvancedAnalytics(state: AgentState): Promise<Partial<AgentState>> {
  const result = await callPythonAgent(
    state.task,
    'analytics',
    'execute'
  );

  return {
    status: "completed",
    result: result,
    logs: [...state.logs, "Advanced analytics completed via Python agent"]
  };
}
```

Add environment variable:

```bash
# .env
PYTHON_AGENT_URL=https://your-deployment-url.lightning.ai
```

---

### Phase 6: Continuous Training Pipeline

Create training automation script `agents/training/continuous_training.py`:

```python
"""
Continuous Training Pipeline
Automatically trains agents on new data
"""

import os
import time
import schedule
from pathlib import Path
from datetime import datetime
import psycopg2
import json

def export_training_data():
    """Export latest training data from PostgreSQL"""

    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cursor = conn.cursor()

    # Get training data from last 7 days
    query = """
        SELECT input, "actualOutput", reward, "botId", "dataType"
        FROM bot_training_data
        WHERE "createdAt" >= NOW() - INTERVAL '7 days'
        ORDER BY "createdAt" DESC
        LIMIT 10000
    """

    cursor.execute(query)
    rows = cursor.fetchall()

    # Convert to training format
    training_data = []
    for row in rows:
        training_data.append({
            'input': row[0],
            'actualOutput': row[1],
            'reward': float(row[2] or 0),
            'botId': row[3],
            'dataType': row[4]
        })

    # Save to file
    output_path = Path(__file__).parent / 'training_data.json'
    with open(output_path, 'w') as f:
        json.dump(training_data, f, indent=2)

    print(f"✅ Exported {len(training_data)} training samples")

    cursor.close()
    conn.close()

    return len(training_data)

def run_training():
    """Run training job"""
    print(f"🙏 Starting training at {datetime.now()}")

    # Export fresh data
    sample_count = export_training_data()

    if sample_count < 100:
        print("⚠️ Insufficient training data, skipping...")
        return

    # Run training
    import subprocess

    result = subprocess.run(
        ["python", "train_agent_model.py"],
        cwd=Path(__file__).parent,
        capture_output=True,
        text=True
    )

    if result.returncode == 0:
        print("✅ Training completed successfully")
        print(result.stdout)
    else:
        print("❌ Training failed")
        print(result.stderr)

def main():
    """Main continuous training loop"""

    # Run immediately
    run_training()

    # Schedule daily training at 2 AM
    schedule.every().day.at("02:00").do(run_training)

    # Or run every 6 hours
    # schedule.every(6).hours.do(run_training)

    print("📅 Training scheduler started")

    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

if __name__ == "__main__":
    main()
```

**Run as Background Service**:

```bash
# Local/development
nohup python agents/training/continuous_training.py > training.log 2>&1 &

# Or deploy as Lightning Work
lightning deploy app agents/training/continuous_training.py --cloud
```

---

### Phase 7: Hot-Reload New Checkpoints (Zero Downtime)

The LitServe server automatically detects new checkpoints. To enable hot-reloading, add this to `agent_server.py`:

```python
# Add to ValifiAgentAPI class

def reload_model(self):
    """Hot-reload latest checkpoint"""
    if AgentModel is None:
        return

    checkpoint_dir = Path(__file__).parent.parent / "training" / "checkpoints"
    checkpoints = list(checkpoint_dir.glob("agent-*.ckpt"))

    if not checkpoints:
        return

    latest_checkpoint = max(checkpoints, key=lambda p: p.stat().st_mtime)

    # Check if newer than current
    if hasattr(self, 'current_checkpoint'):
        if latest_checkpoint.stat().st_mtime <= self.current_checkpoint.stat().st_mtime:
            return  # No new checkpoint

    print(f"🔄 Hot-reloading new checkpoint: {latest_checkpoint}")

    try:
        self.model = AgentModel.load_from_checkpoint(
            str(latest_checkpoint),
            map_location=self.device
        )
        self.model.eval()
        self.current_checkpoint = latest_checkpoint
        print("✅ Model reloaded successfully!")

    except Exception as e:
        print(f"⚠️ Failed to reload model: {e}")

# Add periodic reload check
import threading

def periodic_reload(self, interval=300):  # 5 minutes
    """Periodically check for new checkpoints"""
    while True:
        time.sleep(interval)
        self.reload_model()

# Start in setup()
def setup(self, device):
    # ... existing setup ...

    # Start background reload thread
    reload_thread = threading.Thread(
        target=periodic_reload,
        args=(self, 300),  # Check every 5 minutes
        daemon=True
    )
    reload_thread.start()
```

Now agents automatically use improved models without restart!

---

## 🔄 Complete Workflow

### Day-to-Day Operation

```
1. Valifi serves requests 24/7
   └─> TypeScript orchestrator running
   └─> Python LitServe agents running
   └─> Both read from latest checkpoint

2. Background training runs (daily or continuous)
   └─> Exports fresh training data from PostgreSQL
   └─> Trains on multi-GPU/multi-node infrastructure
   └─> Saves improved checkpoint

3. LitServe detects new checkpoint
   └─> Hot-reloads model
   └─> Continues serving without downtime
   └─> Performance improves automatically

4. Monitoring observes performance
   └─> Observability system tracks metrics
   └─> Alerts if performance degrades
   └─> Can rollback to previous checkpoint if needed
```

### Manual Training Trigger

```bash
# Export training data
python agents/training/continuous_training.py export

# Run training manually
python agents/training/train_agent_model.py

# Or submit to Lightning AI for distributed training
lightning run model agents/training/train_agent_model.py --cloud
```

### Query Valifi System Info

```bash
# Ask about Valifi
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "task": "What is Valifi?",
    "query_type": "info"
  }'

# List agents
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "task": "List all agents",
    "query_type": "info"
  }'

# Check status
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "task": "What is the system status?",
    "query_type": "info"
  }'
```

### Execute Agent Tasks

```bash
# Execute trading task
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Analyze AAPL stock and suggest trade",
    "agent_type": "trading_advanced",
    "query_type": "execute"
  }'
```

---

## 📊 Monitoring & Health Checks

### Check Agent Server Status

```python
# agents/health_check.py
import requests

def check_agent_health():
    try:
        response = requests.post(
            'http://localhost:8000/predict',
            json={'task': 'What is the system status?', 'query_type': 'info'},
            timeout=5
        )

        if response.status_code == 200:
            print("✅ Agent server healthy")
            result = response.json()
            print(result['answer'])
            return True
        else:
            print(f"⚠️ Agent server returned {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Agent server unreachable: {e}")
        return False

if __name__ == '__main__':
    check_agent_health()
```

### Monitor Training Progress

```python
# View TensorBoard logs
tensorboard --logdir agents/training/logs --port 6006

# Access at http://localhost:6006
```

---

## 🚀 Deployment Checklist

- [ ] **Phase 1**: Training infrastructure created ✅
- [ ] **Phase 2**: Dockerfiles created
- [ ] **Phase 3**: Deploy to Lightning AI
- [ ] **Phase 4**: Setup multi-node training
- [ ] **Phase 5**: Integrate TypeScript ↔ Python
- [ ] **Phase 6**: Continuous training pipeline
- [ ] **Phase 7**: Hot-reload implementation
- [ ] **Monitoring**: Health checks and metrics
- [ ] **Testing**: Verify zero-downtime updates

---

## 🎯 Key Benefits

✅ **Zero Downtime**: Valifi always available, even during training
✅ **Auto-Improvement**: Agents get smarter automatically
✅ **Scalable Training**: Multi-GPU/multi-node with PyTorch Lightning
✅ **Hot-Reload**: New models deployed without restart
✅ **Knowledge Base**: Agents answer questions about Valifi
✅ **Dual Mode**: Info queries + task execution
✅ **Production Ready**: LitServe auto-scaling and monitoring

---

## 🙏 Next Steps

1. **Build Docker containers** (Phase 2)
2. **Deploy to Lightning AI** (Phase 3)
3. **Test info queries** via LitServe
4. **Setup continuous training** (Phase 6)
5. **Monitor and iterate**

**All glory to God through Christ Jesus our Lord!**

**Built with the power of the Holy Spirit | For the advancement of the Kingdom**

---

**Status**: ✅ Phase 1 COMPLETE | Ready for Phase 2 Deployment
