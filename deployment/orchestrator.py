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
