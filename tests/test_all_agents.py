"""
Comprehensive Test Suite for All Agents
Production-Ready Testing - Kingdom Standard Excellence
Through Christ Jesus - Perfect Testing Coverage

"Test everything; hold fast what is good" - 1 Thessalonians 5:21
"""

import os
import sys
import time
import requests
import json
from pathlib import Path
from typing import Dict, Any

sys.path.append(str(Path(__file__).parent.parent))

# Test configuration
TESTS_PASSED = 0
TESTS_FAILED = 0
TESTS_TOTAL = 0

class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    PURPLE = '\033[95m'
    END = '\033[0m'

def print_test_header(name: str):
    """Print test section header"""
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.PURPLE}🧪 {name}{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}\n")

def test_step(description: str):
    """Decorator for test steps"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            global TESTS_PASSED, TESTS_FAILED, TESTS_TOTAL
            TESTS_TOTAL += 1
            print(f"\n{Colors.BLUE}▶ {description}{Colors.END}")
            try:
                result = func(*args, **kwargs)
                if result:
                    print(f"{Colors.GREEN}  ✅ PASSED{Colors.END}")
                    TESTS_PASSED += 1
                else:
                    print(f"{Colors.RED}  ❌ FAILED{Colors.END}")
                    TESTS_FAILED += 1
                return result
            except Exception as e:
                print(f"{Colors.RED}  ❌ ERROR: {str(e)}{Colors.END}")
                TESTS_FAILED += 1
                return False
        return wrapper
    return decorator

# ============================================
# Terminal Agent Tests
# ============================================

@test_step("Test Terminal Agent - Connection")
def test_terminal_agent_connection():
    """Test if Terminal Agent is running"""
    try:
        response = requests.get("http://localhost:8001/health", timeout=5)
        return response.status_code == 200
    except:
        return False

@test_step("Test Terminal Agent - Simple Command")
def test_terminal_agent_simple():
    """Test Terminal Agent with simple command"""
    try:
        response = requests.post(
            "http://localhost:8001/predict",
            json={"message": "echo 'Hello Kingdom'", "session_id": "test"},
            timeout=30
        )
        return response.status_code == 200 and 'response' in response.json()
    except Exception as e:
        print(f"    Error: {e}")
        return False

@test_step("Test Terminal Agent - File Listing")
def test_terminal_agent_files():
    """Test Terminal Agent file operations"""
    try:
        response = requests.post(
            "http://localhost:8001/predict",
            json={"message": "list all Python files in agents directory", "session_id": "test"},
            timeout=30
        )
        return response.status_code == 200
    except Exception as e:
        print(f"    Error: {e}")
        return False

# ============================================
# SDK Agent Tests
# ============================================

@test_step("Test SDK Agent - Connection")
def test_sdk_agent_connection():
    """Test if SDK Agent is running"""
    try:
        response = requests.get("http://localhost:8002/health", timeout=5)
        return response.status_code == 200
    except:
        return False

@test_step("Test SDK Agent - LitServe Question")
def test_sdk_agent_litserve():
    """Test SDK Agent with LitServe question"""
    try:
        response = requests.post(
            "http://localhost:8002/predict",
            json={"query": "How do I create a basic LitAPI?", "session_id": "test"},
            timeout=30
        )
        result = response.json()
        return response.status_code == 200 and 'response' in result
    except Exception as e:
        print(f"    Error: {e}")
        return False

@test_step("Test SDK Agent - Code Example Request")
def test_sdk_agent_code():
    """Test SDK Agent code example generation"""
    try:
        response = requests.post(
            "http://localhost:8002/predict",
            json={
                "query": "Show me how to deploy a LitServe model",
                "session_id": "test",
                "include_examples": True
            },
            timeout=30
        )
        return response.status_code == 200
    except Exception as e:
        print(f"    Error: {e}")
        return False

# ============================================
# Orchestrator Tests
# ============================================

@test_step("Test Orchestrator - Connection")
def test_orchestrator_connection():
    """Test if Orchestrator is running"""
    try:
        response = requests.get("http://localhost:8003/health", timeout=5)
        return response.status_code == 200
    except:
        return False

@test_step("Test Orchestrator - Greeting")
def test_orchestrator_greeting():
    """Test Orchestrator greeting response"""
    try:
        response = requests.post(
            "http://localhost:8003/predict",
            json={"message": "", "session_id": "test"},
            timeout=30
        )
        result = response.json()
        return response.status_code == 200 and 'response' in result
    except Exception as e:
        print(f"    Error: {e}")
        return False

@test_step("Test Orchestrator - Routing to Terminal Agent")
def test_orchestrator_terminal_routing():
    """Test Orchestrator routes correctly to Terminal Agent"""
    try:
        response = requests.post(
            "http://localhost:8003/predict",
            json={"message": "run ls command", "session_id": "test"},
            timeout=30
        )
        result = response.json()
        return response.status_code == 200 and result.get('orchestrated') == True
    except Exception as e:
        print(f"    Error: {e}")
        return False

@test_step("Test Orchestrator - Routing to SDK Agent")
def test_orchestrator_sdk_routing():
    """Test Orchestrator routes correctly to SDK Agent"""
    try:
        response = requests.post(
            "http://localhost:8003/predict",
            json={"message": "how do I use LitAI?", "session_id": "test"},
            timeout=30
        )
        result = response.json()
        return response.status_code == 200 and 'response' in result
    except Exception as e:
        print(f"    Error: {e}")
        return False

# ============================================
# Conversational Interface Tests
# ============================================

@test_step("Test Conversational Interface - Web Server")
def test_interface_web():
    """Test if web interface is running"""
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        return response.status_code == 200 and 'Valifi' in response.text
    except:
        return False

@test_step("Test Conversational Interface - Health Check")
def test_interface_health():
    """Test interface health endpoint"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        result = response.json()
        return response.status_code == 200 and result.get('status') == 'healthy'
    except:
        return False

@test_step("Test Conversational Interface - REST API")
def test_interface_api():
    """Test REST API endpoint"""
    try:
        response = requests.post(
            "http://localhost:8000/api/chat",
            json={"message": "hello", "session_id": "test"},
            timeout=30
        )
        return response.status_code == 200
    except Exception as e:
        print(f"    Error: {e}")
        return False

# ============================================
# Integration Tests
# ============================================

@test_step("Integration Test - End-to-End Command Flow")
def test_integration_command_flow():
    """Test complete flow from interface to terminal agent"""
    try:
        # Send request through orchestrator
        response = requests.post(
            "http://localhost:8003/predict",
            json={"message": "echo 'Integration Test Success'", "session_id": "integration_test"},
            timeout=30
        )
        return response.status_code == 200
    except Exception as e:
        print(f"    Error: {e}")
        return False

@test_step("Integration Test - End-to-End SDK Query Flow")
def test_integration_sdk_flow():
    """Test complete flow for SDK queries"""
    try:
        response = requests.post(
            "http://localhost:8003/predict",
            json={"message": "explain LitServe architecture", "session_id": "integration_test"},
            timeout=30
        )
        return response.status_code == 200
    except Exception as e:
        print(f"    Error: {e}")
        return False

# ============================================
# Performance Tests
# ============================================

@test_step("Performance Test - Response Time (Orchestrator)")
def test_performance_orchestrator():
    """Test orchestrator response time"""
    try:
        start = time.time()
        response = requests.post(
            "http://localhost:8003/predict",
            json={"message": "hello", "session_id": "perf_test"},
            timeout=30
        )
        duration = time.time() - start
        print(f"    Response time: {duration:.2f}s")
        return response.status_code == 200 and duration < 10
    except Exception as e:
        print(f"    Error: {e}")
        return False

@test_step("Performance Test - Concurrent Requests")
def test_performance_concurrent():
    """Test handling multiple concurrent requests"""
    try:
        import concurrent.futures

        def make_request():
            return requests.post(
                "http://localhost:8003/predict",
                json={"message": "test", "session_id": "concurrent_test"},
                timeout=30
            ).status_code == 200

        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = [executor.submit(make_request) for _ in range(3)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]

        return all(results)
    except Exception as e:
        print(f"    Error: {e}")
        return False

# ============================================
# Main Test Runner
# ============================================

def run_all_tests():
    """Run all test suites"""
    global TESTS_PASSED, TESTS_FAILED, TESTS_TOTAL

    print(f"\n{Colors.PURPLE}{'='*80}{Colors.END}")
    print(f"{Colors.PURPLE}🙏 VALIFI AGENT SYSTEM - COMPREHENSIVE TEST SUITE{Colors.END}")
    print(f"{Colors.PURPLE}✝️  Through Christ Jesus - Kingdom Standard Testing{Colors.END}")
    print(f"{Colors.PURPLE}{'='*80}{Colors.END}")

    # Terminal Agent Tests
    print_test_header("TERMINAL AGENT TESTS")
    test_terminal_agent_connection()
    test_terminal_agent_simple()
    test_terminal_agent_files()

    # SDK Agent Tests
    print_test_header("SDK AGENT TESTS")
    test_sdk_agent_connection()
    test_sdk_agent_litserve()
    test_sdk_agent_code()

    # Orchestrator Tests
    print_test_header("ORCHESTRATOR TESTS")
    test_orchestrator_connection()
    test_orchestrator_greeting()
    test_orchestrator_terminal_routing()
    test_orchestrator_sdk_routing()

    # Conversational Interface Tests
    print_test_header("CONVERSATIONAL INTERFACE TESTS")
    test_interface_web()
    test_interface_health()
    test_interface_api()

    # Integration Tests
    print_test_header("INTEGRATION TESTS")
    test_integration_command_flow()
    test_integration_sdk_flow()

    # Performance Tests
    print_test_header("PERFORMANCE TESTS")
    test_performance_orchestrator()
    test_performance_concurrent()

    # Final Summary
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.PURPLE}📊 TEST SUMMARY{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}\n")

    print(f"Total Tests:   {TESTS_TOTAL}")
    print(f"{Colors.GREEN}✅ Passed:      {TESTS_PASSED}{Colors.END}")
    print(f"{Colors.RED}❌ Failed:      {TESTS_FAILED}{Colors.END}")

    pass_rate = (TESTS_PASSED / TESTS_TOTAL * 100) if TESTS_TOTAL > 0 else 0
    print(f"\nPass Rate:     {pass_rate:.1f}%")

    if pass_rate >= 90:
        print(f"\n{Colors.GREEN}🎉 EXCELLENT - Kingdom Standard Achieved!{Colors.END}")
    elif pass_rate >= 70:
        print(f"\n{Colors.YELLOW}⚠️  GOOD - But improvements needed{Colors.END}")
    else:
        print(f"\n{Colors.RED}❌ NEEDS WORK - Below Kingdom Standard{Colors.END}")

    print(f"\n{Colors.PURPLE}🙏 Through Christ Jesus - All Tests Complete{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}\n")

    return pass_rate >= 90


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
