mport os
import sys
import subprocess
import json
from pathlib import Path

def setup_environment():
    """Install required dependencies"""
    print("Installing dependencies...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", 
                   "anthropic", "openai", "requests", "python-dotenv"], check=True)
    print("Dependencies installed successfully")

def setup_api_keys():
    """Setup API keys from environment or prompt user"""
    from dotenv import load_dotenv
    load_dotenv()
    
    api_keys = {}
    
    # Check for existing keys
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    
    if not anthropic_key:
        print("\nAnthropic API key not found in environment")
        anthropic_key = input("Enter your Anthropic API key (or press Enter to skip): ").strip()
        if anthropic_key:
            api_keys["ANTHROPIC_API_KEY"] = anthropic_key
    
    if not openai_key:
        print("\nOpenAI API key not found in environment")
        openai_key = input("Enter your OpenAI API key (or press Enter to skip): ").strip()
        if openai_key:
            api_keys["OPENAI_API_KEY"] = openai_key
    
    # Save to .env file if new keys were provided
    if api_keys:
        env_path = Path(".env")
        with open(env_path, "a") as f:
            for key, value in api_keys.items():
                f.write(f"\n{key}={value}")
        print(f"\nAPI keys saved to {env_path}")
    
    return anthropic_key or api_keys.get("ANTHROPIC_API_KEY"), openai_key or api_keys.get("OPENAI_API_KEY")

def create_terminal_agent():
    """Create the terminal agent script"""
    terminal_agent_code = '''#!/usr/bin/env python3
import os
import sys
import subprocess
from anthropic import Anthropic

def run_terminal_agent():
    """Terminal agent that executes commands using Claude"""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY not set")
        sys.exit(1)
    
    client = Anthropic(api_key=api_key)
    
    print("Terminal Agent Ready - Type your command in natural language")
    print("Type 'exit' to quit")
    
    while True:
        user_input = input("\\n> ").strip()
        
        if user_input.lower() in ["exit", "quit"]:
            break
        
        if not user_input:
            continue
        
        try:
            # Ask Claude to convert natural language to shell command
            response = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1024,
                messages=[{
                    "role": "user",
                    "content": f"""Convert this request to a bash command. Reply ONLY with the command, no explanations:
{user_input}"""
                }]
            )
            
            command = response.content[0].text.strip()
            print(f"Command: {command}")
            
            confirm = input("Execute? (y/n): ").strip().lower()
            if confirm == "y":
                result = subprocess.run(command, shell=True, capture_output=True, text=True)
                print(result.stdout)
                if result.stderr:
                    print(f"Error: {result.stderr}", file=sys.stderr)
        
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)

if __name__ == "__main__":
    run_terminal_agent()
'''
    
    script_path = Path("terminal_agent.py")
    script_path.write_text(terminal_agent_code)
    script_path.chmod(0o755)
    print(f"Created {script_path}")
    return script_path

def create_sdk_agent():
    """Create the SDK agent script"""
    sdk_agent_code = '''#!/usr/bin/env python3
import os
import sys
from openai import OpenAI

def run_sdk_agent():
    """SDK agent that helps with Lightning SDK usage"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY not set")
        sys.exit(1)
    
    client = OpenAI(api_key=api_key)
    
    print("SDK Agent Ready - Ask questions about Lightning SDK")
    print("Type 'exit' to quit")
    
    conversation = []
    
    while True:
        user_input = input("\\n> ").strip()
        
        if user_input.lower() in ["exit", "quit"]:
            break
        
        if not user_input:
            continue
        
        conversation.append({"role": "user", "content": user_input})
        
        try:
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that knows about Lightning AI SDK and platform. Provide code examples when helpful."},
                    *conversation
                ]
            )
            
            assistant_message = response.choices[0].message.content
            conversation.append({"role": "assistant", "content": assistant_message})
            
            print(f"\\n{assistant_message}")
        
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)

if __name__ == "__main__":
    run_sdk_agent()
'''
    
    script_path = Path("sdk_agent.py")
    script_path.write_text(sdk_agent_code)
    script_path.chmod(0o755)
    print(f"Created {script_path}")
    return script_path

def create_deployment_script():
    """Create a simple deployment example"""
    deployment_code = '''#!/usr/bin/env python3
import litserve as ls

class SimpleAPI(ls.LitAPI):
    def setup(self, device):
        """Setup your model here"""
        self.model = lambda x: {"result": f"Processed: {x}"}
    
    def predict(self, request):
        """Run inference"""
        return self.model(request.get("input", ""))

if __name__ == "__main__":
    api = SimpleAPI()
    server = ls.LitServer(api, accelerator="auto")
    server.run(port=8000)
'''
    
    script_path = Path("deployment.py")
    script_path.write_text(deployment_code)
    script_path.chmod(0o755)
    print(f"Created {script_path}")
    return script_path

def create_readme():
    """Create README with usage instructions"""
    readme_content = """# Valifi Agent System

## Setup Complete

Three components have been created:

### 1. Terminal Agent (`terminal_agent.py`)
Uses Claude to convert natural language to bash commands.

Usage:
