ll-in-one setup script for LitAI + LitServe deployment
Checks environment, installs dependencies, fixes common errors, and starts server
"""

import subprocess
import sys
import os
import importlib.util
from pathlib import Path

class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_step(message):
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}[STEP] {message}{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")

def print_success(message):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def check_package_installed(package_name, import_name=None):
    """Check if a Python package is installed"""
    if import_name is None:
        import_name = package_name
    
    spec = importlib.util.find_spec(import_name)
    return spec is not None

def run_command(cmd, check=True, capture_output=False):
    """Run a shell command and handle errors"""
    try:
        if capture_output:
            result = subprocess.run(cmd, shell=True, check=check, 
                                  capture_output=True, text=True)
            return result.stdout.strip()
        else:
            subprocess.run(cmd, shell=True, check=check)
            return None
    except subprocess.CalledProcessError as e:
        print_error(f"Command failed: {cmd}")
        if capture_output and e.stderr:
            print_error(f"Error output: {e.stderr}")
        if check:
            sys.exit(1)
        return None

def check_python_version():
    """Verify Python version is compatible"""
    print_step("Checking Python version")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print_error(f"Python 3.8+ required, found {version.major}.{version.minor}")
        sys.exit(1)
    print_success(f"Python {version.major}.{version.minor}.{version.micro} detected")

def fix_tensorflow_compatibility():
    """Fix TensorFlow compatibility issues"""
    print_step("Checking TensorFlow compatibility")
    
    if check_package_installed("tensorflow"):
        import tensorflow as tf
        tf_version = tf.__version__
        print_warning(f"TensorFlow {tf_version} detected")
        
        # Check if using TF 2.x with old agents package
        if tf_version.startswith("2."):
            print_warning("TensorFlow 2.x detected - some old packages may not work")
            print_warning("Consider using litai for LLM work instead of legacy agents package")
    else:
        print_success("TensorFlow not installed (not needed for litai)")

def fix_gym_compatibility():
    """Fix Gym compatibility issues"""
    print_step("Checking Gym compatibility")
    
    if check_package_installed("gym"):
        print_warning("Old 'gym' package detected")
        print("Installing 'gymnasium' as replacement...")
        run_command("pip install gymnasium --quiet")
        print_success("Installed gymnasium - use 'import gymnasium as gym' in your code")
    else:
        print_success("No gym compatibility issues")

def install_core_dependencies():
    """Install core dependencies for litai and litserve"""
    print_step("Installing core dependencies")
    
    deps = {
        "litai": "litai",
        "litserve": "litserve", 
        "requests": "requests",
        "fastapi": "fastapi",
        "uvicorn": "uvicorn",
    }
    
    missing = []
    for package, import_name in deps.items():
        if not check_package_installed(package, import_name):
            missing.append(package)
    
    if missing:
        print(f"Installing missing packages: {', '.join(missing)}")
        for pkg in missing:
            run_command(f"pip install {pkg} --quiet")
        print_success(f"Installed {len(missing)} packages")
    else:
        print_success("All core dependencies installed")

def check_litai_setup():
    """Verify litai is properly configured"""
    print_step("Checking LitAI configuration")
    
    try:
        from litai import LLM
        
        # Check if Lightning API key is set
        api_key = os.environ.get("LIGHTNING_API_KEY")
        if not api_key:
            print_warning("LIGHTNING_API_KEY not found in environment")
            print("You can set it with: export LIGHTNING_API_KEY='your_key'")
            print("Or litai will prompt you to log in when you first use it")
        else:
            print_success("LIGHTNING_API_KEY configured")
        
        print_success("LitAI installed and ready")
        return True
        
    except ImportError as e:
        print_error(f"Failed to import litai: {e}")
        return False

def create_example_server():
    """Create an example litserve server if none exists"""
    print_step("Checking for server.py")
    
    if Path("server.py").exists():
        print_success("server.py already exists")
        return
    
    print("Creating example server.py...")
    
    server_code = '''import litserve as ls
from litai import LLM

class ChatAPI(ls.LitAPI):
    def setup(self, device):
        """Initialize the LLM"""
        self.llm = LLM(model="google/gemini-2.5-flash")
        print("LitAI model loaded successfully")

    def decode_request(self, request):
        """Extract prompt from request"""
        return request.get("prompt", "")

    def predict(self, prompt):
        """Generate response using LitAI"""
        if not prompt:
            return "Error: No prompt provided"
        return self.llm.chat(prompt)

    def encode_response(self, output):
        """Format response"""
        return {"response": output}

if __name__ == "__main__":
    api = ChatAPI()
    server = ls.LitServer(api, accelerator="auto")
    print("Starting server on http://localhost:8000")
    print("Test with: curl -X POST http://localhost:8000/predict -H 'Content-Type: application/json' -d '{\\"prompt\\": \\"hello\\"}'")
    server.run(port=8000)
'''
    
    with open("server.py", "w") as f:
        f.write(server_code)
    
    print_success("Created example server.py")

def create_example_client():
    """Create an example client if none exists"""
    print_step("Checking for client.py")
    
    if Path("client.py").exists():
        print_success("client.py already exists")
        return
    
    print("Creating example client.py...")
    
    client_code = '''import requests
import sys

def test_server(prompt="What is Lightning AI?"):
    """Test the litserve server"""
    url = "http://localhost:8000/predict"
    
    try:
        response = requests.post(
            url,
            json={"prompt": prompt},
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        print(f"Prompt: {prompt}")
        print(f"Response: {result['response']}")
        return result
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to server. Is it running?")
        print("Start server with: python server.py")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    prompt = sys.argv[1] if len(sys.argv) > 1 else "What is Lightning AI?"
    test_server(prompt)
'''
    
    with open("client.py", "w") as f:
        f.write(client_code)
    
    print_success("Created example client.py")

def check_port_availability(port=8000):
    """Check if port is available"""
    print_step(f"Checking if port {port} is available")
    
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', port))
    sock.close()
    
    if result == 0:
        print_warning(f"Port {port} is already in use")
        print("Kill the process with: lsof -ti:{port} | xargs kill -9")
        print("Or use a different port in server.py")
        return False
    else:
        print_success(f"Port {port} is available")
        return True

def run_basic_tests():
    """Run basic sanity checks"""
    print_step("Running basic tests")
    
    try:
        # Test litai import
        from litai import LLM
        print_success("litai imports successfully")
        
        # Test litserve import
        import litserve as ls
        print_success("litserve imports successfully")
        
        return True
    except Exception as e:
        print_error(f"Basic tests failed: {e}")
        return False

def main():
    """Main setup and run routine"""
    print(f"\n{Colors.BLUE}{'='*60}")
    print("LitAI + LitServe All-in-One Setup")
    print(f"{'='*60}{Colors.END}\n")
    
    # Run all checks and fixes
    check_python_version()
    fix_tensorflow_compatibility()
    fix_gym_compatibility()
    install_core_dependencies()
    
    if not check_litai_setup():
        print_error("LitAI setup failed - please install manually: pip install litai")
        sys.exit(1)
    
    create_example_server()
    create_example_client()
    check_port_availability()
    
    if not run_basic_tests():
        print_error("Basic tests failed - check errors above")
        sys.exit(1)
    
    # Final summary
    print_step("Setup Complete!")
    print_success("All dependencies installed and configured")
    print("\nNext steps:")
    print("1. Start server:  python server.py")
    print("2. Test client:   python client.py")
    print("3. Or test with curl:")
    print("   curl -X POST http://localhost:8000/predict -H 'Content-Type: application/json' -d '{\"prompt\": \"hello\"}'")
    print("\nFor production deployment, check out the litserve docs:")
    print("https://lightning.ai/docs/litserve")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nSetup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

