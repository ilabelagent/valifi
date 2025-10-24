#!/usr/bin/env python3
"""
Complete Web Interface Test Suite
Tests all agents through the web interface
"""

import requests
import json
import time
from typing import Dict, Any

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_test(name: str):
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}Testing: {name}{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")

def print_success(msg: str):
    print(f"{GREEN}✅ {msg}{RESET}")

def print_error(msg: str):
    print(f"{RED}❌ {msg}{RESET}")

def print_info(msg: str):
    print(f"{YELLOW}ℹ️  {msg}{RESET}")

def test_health_checks():
    """Test health endpoints for all services"""
    print_test("Health Checks for All Services")

    services = [
        ("Web Interface", "http://localhost:8000/health"),
        ("Terminal Agent", "http://localhost:8001/docs"),
        ("SDK Agent", "http://localhost:8002/docs"),
        ("Orchestrator", "http://localhost:8003/docs"),
    ]

    results = {}
    for name, url in services:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print_success(f"{name} is healthy")
                results[name] = True
            else:
                print_error(f"{name} returned status {response.status_code}")
                results[name] = False
        except Exception as e:
            print_error(f"{name} is not accessible: {e}")
            results[name] = False

    return results

def test_terminal_agent_direct():
    """Test Terminal Agent directly"""
    print_test("Terminal Agent - Direct Test")

    tests = [
        {
            "name": "List Python files",
            "message": "list all python files in the agents directory",
            "session_id": "test_terminal_1"
        },
        {
            "name": "Check git status",
            "message": "show me the git status",
            "session_id": "test_terminal_2"
        },
        {
            "name": "Check current directory",
            "message": "what is my current working directory",
            "session_id": "test_terminal_3"
        }
    ]

    results = []
    for test in tests:
        try:
            print_info(f"Testing: {test['name']}")
            response = requests.post(
                "http://localhost:8001/predict",
                json=test,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                print_success(f"{test['name']} - Success")
                print(f"   Response type: {data.get('type', 'unknown')}")
                if data.get('result'):
                    print(f"   Command executed: {data['result'].get('command', 'N/A')}")
                    print(f"   Success: {data['result'].get('success', False)}")
                results.append(True)
            else:
                print_error(f"{test['name']} - Failed with status {response.status_code}")
                results.append(False)
        except Exception as e:
            print_error(f"{test['name']} - Error: {e}")
            results.append(False)

        time.sleep(1)

    return results

def test_sdk_agent_direct():
    """Test SDK Agent directly"""
    print_test("SDK Agent - Direct Test")

    tests = [
        {
            "name": "LitServe basics",
            "query": "what is a LitAPI class",
            "session_id": "test_sdk_1"
        },
        {
            "name": "LitAI usage",
            "query": "how do I use LitAI LLM",
            "session_id": "test_sdk_2"
        },
        {
            "name": "Deployment",
            "query": "how to deploy a litserve server",
            "session_id": "test_sdk_3"
        }
    ]

    results = []
    for test in tests:
        try:
            print_info(f"Testing: {test['name']}")
            response = requests.post(
                "http://localhost:8002/predict",
                json=test,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                print_success(f"{test['name']} - Success")
                print(f"   Response type: {data.get('type', 'unknown')}")
                print(f"   Knowledge used: {', '.join(data.get('knowledge_used', []))}")
                results.append(True)
            else:
                print_error(f"{test['name']} - Failed with status {response.status_code}")
                results.append(False)
        except Exception as e:
            print_error(f"{test['name']} - Error: {e}")
            results.append(False)

        time.sleep(1)

    return results

def test_orchestrator_direct():
    """Test Orchestrator directly"""
    print_test("Master Orchestrator - Direct Test")

    tests = [
        {
            "name": "General help",
            "message": "help me understand what you can do",
            "session_id": "test_orch_1"
        },
        {
            "name": "Terminal command routing",
            "message": "show me all log files",
            "session_id": "test_orch_2"
        },
        {
            "name": "SDK question routing",
            "message": "explain litserve architecture",
            "session_id": "test_orch_3"
        }
    ]

    results = []
    for test in tests:
        try:
            print_info(f"Testing: {test['name']}")
            response = requests.post(
                "http://localhost:8003/predict",
                json=test,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                print_success(f"{test['name']} - Success")
                print(f"   Handled by: {data.get('handled_by', 'unknown')}")
                print(f"   Type: {data.get('type', 'unknown')}")
                results.append(True)
            else:
                print_error(f"{test['name']} - Failed with status {response.status_code}")
                results.append(False)
        except Exception as e:
            print_error(f"{test['name']} - Error: {e}")
            results.append(False)

        time.sleep(1)

    return results

def test_web_interface():
    """Test Web Interface API"""
    print_test("Web Interface - API Test")

    tests = [
        {
            "name": "Web API - Terminal command",
            "message": "list all python files",
            "session_id": "test_web_1"
        },
        {
            "name": "Web API - SDK question",
            "message": "how do I use LitServe",
            "session_id": "test_web_2"
        },
        {
            "name": "Web API - General query",
            "message": "what can you help me with",
            "session_id": "test_web_3"
        }
    ]

    results = []
    for test in tests:
        try:
            print_info(f"Testing: {test['name']}")
            response = requests.post(
                "http://localhost:8000/api/chat",
                json=test,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                print_success(f"{test['name']} - Success")
                print(f"   Response received: {len(data.get('response', ''))} characters")
                results.append(True)
            else:
                print_error(f"{test['name']} - Failed with status {response.status_code}")
                results.append(False)
        except Exception as e:
            print_error(f"{test['name']} - Error: {e}")
            results.append(False)

        time.sleep(1)

    return results

def print_summary(all_results: Dict[str, list]):
    """Print test summary"""
    print_test("Test Summary")

    total_tests = 0
    passed_tests = 0

    for category, results in all_results.items():
        total = len(results)
        passed = sum(1 for r in results if r)
        total_tests += total
        passed_tests += passed

        status = GREEN if passed == total else (YELLOW if passed > 0 else RED)
        print(f"{status}{category}: {passed}/{total} passed{RESET}")

    print(f"\n{BLUE}{'='*80}{RESET}")
    percentage = (passed_tests / total_tests * 100) if total_tests > 0 else 0
    color = GREEN if percentage >= 80 else (YELLOW if percentage >= 50 else RED)
    print(f"{color}Overall: {passed_tests}/{total_tests} tests passed ({percentage:.1f}%){RESET}")
    print(f"{BLUE}{'='*80}{RESET}")

if __name__ == "__main__":
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}🙏 VALIFI KINGDOM PLATFORM - COMPREHENSIVE TEST SUITE{RESET}")
    print(f"{BLUE}✝️  Through Christ Jesus - Testing All Systems{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")

    all_results = {}

    # Run all tests
    health_results = test_health_checks()
    all_results["Health Checks"] = list(health_results.values())

    terminal_results = test_terminal_agent_direct()
    all_results["Terminal Agent"] = terminal_results

    sdk_results = test_sdk_agent_direct()
    all_results["SDK Agent"] = sdk_results

    orch_results = test_orchestrator_direct()
    all_results["Orchestrator"] = orch_results

    web_results = test_web_interface()
    all_results["Web Interface"] = web_results

    # Print summary
    print_summary(all_results)

    print(f"\n{GREEN}🙏 Testing complete! Kingdom Standard maintained.{RESET}\n")
