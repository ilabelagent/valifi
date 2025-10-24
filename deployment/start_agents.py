import subprocess
import time
import sys
import os

def start_agent(name, script_path, port):
    """Start an agent server in the background"""
    log_file = f"logs/{name}.log"
    os.makedirs("logs", exist_ok=True)
    
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    absolute_script_path = os.path.join(project_root, script_path)

    print(f"Attempting to start agent with script: {absolute_script_path}")

    process = subprocess.Popen(
        [sys.executable, absolute_script_path],
        stdout=open(log_file, 'w'),
        stderr=subprocess.STDOUT
    )
    
    print(f"✓ Started {name} on port {port} (PID: {process.pid})")
    print(f"  Logs: {log_file}")
    return process

def main():
    print("Starting Valifi agent system...\n")
    
    agents = [
        ("Terminal Agent", "agents/terminal_agent/server.py", 8001),
        ("SDK Agent", "agents/sdk_agent/server.py", 8002),
    ]
    
    processes = []
    for name, script, port in agents:
        proc = start_agent(name, script, port)
        processes.append(proc)
        time.sleep(2)  # give each agent time to start
    
    print("\n✅ All agents running")
    print("Press Ctrl+C to stop all agents\n")
    
    try:
        # Keep script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping agents...")
        for proc in processes:
            proc.terminate()
        print("✓ All agents stopped")

if __name__ == "__main__":
    main()