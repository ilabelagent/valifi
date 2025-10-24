import requests
import json
import time

def test_terminal_agent():
    url = "http://localhost:8001/predict"
    payload = {"command": "use your agent and analyzize the remaining steps for valifi development and deployment and clarify on what needs to be done and i want you to deeply scan/read through the project so you start execution immediately"}
    
    try:
        response = requests.post(url, json=payload)
        result = response.json()
        print("Terminal Agent Response:")
        print(f"stdout: {result.get('stdout')}")
        print(f"analysis: {result.get('analysis')}")
        return True
    except Exception as e:
        print(f"Terminal Agent Error: {e}")
        return False

def test_sdk_agent():
    url = "http://localhost:8002/predict"
    payload = {
        "query": "how do i deploy a model on lightning ai?",
        "context": {"platform": "lightning", "task": "deployment"}
    }
    
    try:
        response = requests.post(url, json=payload)
        result = response.json()
        print("\nSDK Agent Response:")
        print(result.get('response'))
        return True
    except Exception as e:
        print(f"SDK Agent Error: {e}")
        return False

if __name__ == "__main__":
    print("testing terminal agent...")
    terminal_ok = test_terminal_agent()
    
    print("\n" + "="*50)
    print("testing sdk agent...")
    sdk_ok = test_sdk_agent()
    
    if terminal_ok and sdk_ok:
        print("\n✅ all agents working")
    else:
        print("\n❌ some agents failed")