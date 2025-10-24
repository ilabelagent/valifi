reate directory structure
mkdir -p agents/terminal_agent agents/sdk_agent deployment logs tests

# Create Terminal Agent using heredoc
cat > agents/terminal_agent/server.py << 'EOF'
import litserve as ls
from anthropic import Anthropic
import os
import subprocess

class TerminalAgentAPI(ls.LitAPI):
    def setup(self, device):
        self.client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
        self.model = "claude-3-5-sonnet-20241022"
        
    def decode_request(self, request):
        return request["command"]
        
    def predict(self, command):
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30
            )
            return {
                "stdout": result.stdout,
                "stderr": result.stderr,
                "returncode": result.returncode
            }
        except subprocess.TimeoutExpired:
            return {"error": "Command timed out after 30 seconds"}
        except Exception as e:
            return {"error": str(e)}
            
    def encode_response(self, output):
        return output

if __name__ == "__main__":
    api = TerminalAgentAPI()
    server = ls.LitServer(api, accelerator="auto")
    server.run(port=8001)
EOF

# Create SDK Agent using heredoc
cat > agents/sdk_agent/server.py << 'EOF'
import litserve as ls
from anthropic import Anthropic
import os
import json

class SDKAgentAPI(ls.LitAPI):
    def setup(self, device):
        self.client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
        self.model = "claude-3-5-sonnet-20241022"
        
    def decode_request(self, request):
        return request
        
    def predict(self, request):
        query = request.get("query", "")
        context = request.get("context", {})
        
        messages = [{
            "role": "user",
            "content": f"Context: {json.dumps(context)}\n\nQuery: {query}"
        }]
        
        response = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=messages
        )
        
        return {"response": response.content[0].text}
            
    def encode_response(self, output):
        return output

if __name__ == "__main__":
    api = SDKAgentAPI()
    server = ls.LitServer(api, accelerator="auto")
    server.run(port=8002)
EOF

# Create test file using heredoc
cat > tests/test_agents.py << 'EOF'
import requests
import json
import time

def test_terminal_agent():
    url = "http://localhost:8001/predict"
    payload = {"command": "echo 'Terminal agent working'"}
    
    try:
        response = requests.post(url, json=payload)
        print("Terminal Agent Response:", response.json())
        return True
    except Exception as e:
        print(f"Terminal Agent Error: {e}")
        return False

def test_sdk_agent():
    url = "http://localhost:8002/predict"
    payload = {
        "query": "What is the Lightning AI platform?",
        "context": {"platform": "lightning"}
    }
    
    try:
        response = requests.post(url, json=payload)
        print("SDK Agent Response:", response.json())
        return True
    except Exception as e:
        print(f"SDK Agent Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Terminal Agent...")
    terminal_ok = test_terminal_agent()
    
    print("\nTesting SDK Agent...")
    sdk_ok = test_sdk_agent()
    
    if terminal_ok and sdk_ok:
        print("\n✅ All agents working")
    else:
        print("\n❌ Some agents failed")
EOF

# Create deployment orchestrator using heredoc
cat > deployment/orchestrator.py << 'EOF'
import subprocess
import time
import signal
import sys

processes = []

def signal_handler(sig, frame):
    print("\nShutting down agents...")
    for p in processes:
        p.terminate()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

def start_agents():
    print("Starting Terminal Agent on port 8001...")
    terminal_agent = subprocess.Popen(
        ["python", "agents/terminal_agent/server.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    processes.append(terminal_agent)
    
    print("Starting SDK Agent on port 8002...")
    sdk_agent = subprocess.Popen(
        ["python", "agents/sdk_agent/server.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    processes.append(sdk_agent)
    
    print("\n✅ Both agents running")
    print("Terminal Agent: http://localhost:8001")
    print("SDK Agent: http://localhost:8002")
    print("\nPress Ctrl+C to stop all agents")
    
    while True:
        time.sleep(1)

if __name__ == "__main__":
    start_agents()
EOF

# Create requirements using heredoc
cat > requirements.txt << 'EOF'
litserve
anthropic
requests
EOF

# Create README using heredoc
cat > README.md << 'EOF'
# Valifi Agent System

A multi-agent system built with LitServe and Anthropic Claude for terminal automation and SDK interactions.

## Setup

1. Install dependencies:
