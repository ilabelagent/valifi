mport os
import anthropic
import json
import sys

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
MODEL_NAME = "claude-3-5-sonnet-20241022"

terminal_tool = {
    "name": "execute_terminal_command",
    "description": "Execute a terminal command and return its output. Use this for running shell commands, checking system status, installing packages, etc.",
    "input_schema": {
        "type": "object",
        "properties": {
            "command": {
                "type": "string",
                "description": "The terminal command to execute"
            }
        },
        "required": ["command"]
    }
}

def execute_terminal_command(command):
    import subprocess
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        return f"Error executing command: {e.stderr}"

tools = [terminal_tool]

def process_tool_call(tool_name, tool_input):
    if tool_name == "execute_terminal_command":
        return execute_terminal_command(tool_input["command"])

def setup_project_structure():
    directories = [
        "agents/terminal_agent",
        "agents/sdk_agent", 
        "deployment",
        "logs",
        "tests"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"Created directory: {directory}")
    
    terminal_agent_code = '''import litserve as ls
from anthropic import Anthropic
import os

class TerminalAgentAPI(ls.LitAPI):
    def setup(self, device):
        self.client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
        self.model = "claude-3-5-sonnet-20241022"
        
    def decode_request(self, request):
        return request["command"]
        
    def predict(self, command):
        import subprocess
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
'''

    sdk_agent_code = '''import litserve as ls
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
            "content": f"Context: {json.dumps(context)}\\n\\nQuery: {query}"
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
'''

    test_code = '''import requests
import json

def test_terminal_agent():
    url = "http://localhost:8001/predict"
    payload = {"command": "echo 'Terminal agent working'"}
    
    response = requests.post(url, json=payload)
    print("Terminal Agent Response:", response.json())

def test_sdk_agent():
    url = "http://localhost:8002/predict"
    payload = {
        "query": "What is the Lightning AI platform?",
        "context": {"platform": "lightning"}
    }
    
    response = requests.post(url, json=payload)
    print("SDK Agent Response:", response.json())

if __name__ == "__main__":
    print("Testing Terminal Agent...")
    test_terminal_agent()
    
    print("\\nTesting SDK Agent...")
    test_sdk_agent()
'''

    readme_content = """# Valifi Agent System

A multi-agent system built with LitServe and Anthropic Claude for terminal automation and SDK interactions.

## Setup

1. Install dependencies:
