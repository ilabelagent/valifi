#!/usr/bin/env python3
"""
Simple Integration Test for Valifi Agent System
Tests connectivity between Python agents and TypeScript orchestrator
"""

import requests
import json
import sys

def test_terminal_agent():
    """Test Terminal Agent connectivity"""
    print("Testing Terminal Agent...")
    try:
        response = requests.post(
            'http://localhost:8001/predict',
            json={'command': 'echo "Integration Test"'},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('returncode') == 0:
                print("✓ Terminal Agent: HEALTHY")
                return True
        print("✗ Terminal Agent: UNHEALTHY")
        return False
    except Exception as e:
        print(f"✗ Terminal Agent: ERROR - {e}")
        return False

def test_sdk_agent():
    """Test SDK Agent connectivity"""
    print("Testing SDK Agent...")
    try:
        response = requests.post(
            'http://localhost:8002/predict',
            json={'query': 'Integration Test', 'context': {}},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                mode = data.get('mode', 'unknown')
                ai_available = data.get('ai_available', False)
                print(f"✓ SDK Agent: HEALTHY (mode: {mode}, AI: {ai_available})")
                return True
        print("✗ SDK Agent: UNHEALTHY")
        return False
    except Exception as e:
        print(f"✗ SDK Agent: ERROR - {e}")
        return False

def main():
    print("=" * 60)
    print("Valifi Agent System Integration Test")
    print("=" * 60)
    print()

    results = []
    results.append(("Terminal Agent", test_terminal_agent()))
    results.append(("SDK Agent", test_sdk_agent()))

    print()
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{name}: {status}")

    print()
    print(f"Total: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")

    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
