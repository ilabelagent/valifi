#!/usr/bin/env tsx
/**
 * Test script to verify TypeScript AgentOrchestrator integration with Python agents
 */

import { agentOrchestrator } from './agentOrchestrator';
import axios from 'axios';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

async function testPythonAgents() {
  console.log('=== Testing Python Agent Connectivity ===\n');

  // Test 1: Terminal Agent Health
  try {
    const response = await axios.post('http://localhost:8001/predict', {
      command: 'echo "Integration test"'
    }, { timeout: 5000 });

    if (response.status === 200 && response.data.returncode === 0) {
      results.push({
        test: 'Terminal Agent Connectivity',
        status: 'PASS',
        details: 'Terminal Agent responding correctly'
      });
      console.log('✓ Terminal Agent (Port 8001): HEALTHY');
    } else {
      results.push({
        test: 'Terminal Agent Connectivity',
        status: 'FAIL',
        details: `Unexpected response: ${JSON.stringify(response.data)}`
      });
      console.log('✗ Terminal Agent: UNHEALTHY');
    }
  } catch (error: any) {
    results.push({
      test: 'Terminal Agent Connectivity',
      status: 'FAIL',
      error: error.message
    });
    console.log(`✗ Terminal Agent: ERROR - ${error.message}`);
  }

  // Test 2: SDK Agent Health
  try {
    const response = await axios.post('http://localhost:8002/predict', {
      query: 'Integration test',
      context: { test: true }
    }, { timeout: 5000 });

    if (response.status === 200 && response.data.status === 'success') {
      results.push({
        test: 'SDK Agent Connectivity',
        status: 'PASS',
        details: `SDK Agent responding in ${response.data.mode} mode`
      });
      console.log(`✓ SDK Agent (Port 8002): HEALTHY (${response.data.mode} mode)`);
    } else {
      results.push({
        test: 'SDK Agent Connectivity',
        status: 'FAIL',
        details: `Unexpected response: ${JSON.stringify(response.data)}`
      });
      console.log('✗ SDK Agent: UNHEALTHY');
    }
  } catch (error: any) {
    results.push({
      test: 'SDK Agent Connectivity',
      status: 'FAIL',
      error: error.message
    });
    console.log(`✗ SDK Agent: ERROR - ${error.message}`);
  }
}

async function testTypeScriptOrchestrator() {
  console.log('\n=== Testing TypeScript AgentOrchestrator ===\n');

  // Test 3: Orchestrator Execution
  try {
    const result = await agentOrchestrator.execute('Test orchestrator integration');

    if (result && result.status) {
      results.push({
        test: 'TypeScript Orchestrator Execution',
        status: 'PASS',
        details: `Orchestrator executed with status: ${result.status}`
      });
      console.log(`✓ TypeScript Orchestrator: WORKING`);
      console.log(`  - Status: ${result.status}`);
      console.log(`  - Agent: ${result.currentAgent || 'orchestrator'}`);
      console.log(`  - Logs: ${result.logs?.length || 0} entries`);
    } else {
      results.push({
        test: 'TypeScript Orchestrator Execution',
        status: 'FAIL',
        details: 'No result returned from orchestrator'
      });
      console.log('✗ TypeScript Orchestrator: NO RESULT');
    }
  } catch (error: any) {
    results.push({
      test: 'TypeScript Orchestrator Execution',
      status: 'FAIL',
      error: error.message
    });
    console.log(`✗ TypeScript Orchestrator: ERROR - ${error.message}`);
  }

  // Test 4: Orchestrator with specific agent type
  try {
    const result = await agentOrchestrator.execute('Check blockchain status', 'blockchain');

    if (result && result.status === 'completed') {
      results.push({
        test: 'Orchestrator Specific Agent Routing',
        status: 'PASS',
        details: `Successfully routed to ${result.currentAgent} agent`
      });
      console.log(`✓ Agent Routing: Correctly routed to ${result.currentAgent}`);
    } else {
      results.push({
        test: 'Orchestrator Specific Agent Routing',
        status: 'FAIL',
        details: `Failed to route correctly. Status: ${result?.status}`
      });
      console.log('✗ Agent Routing: FAILED');
    }
  } catch (error: any) {
    results.push({
      test: 'Orchestrator Specific Agent Routing',
      status: 'FAIL',
      error: error.message
    });
    console.log(`✗ Agent Routing: ERROR - ${error.message}`);
  }
}

async function printSummary() {
  console.log('\n=== Test Summary ===\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} ✓`);
  console.log(`Failed: ${failed} ✗`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  console.log('\nDetailed Results:');
  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✓' : '✗';
    console.log(`\n${index + 1}. ${icon} ${result.test}`);
    if (result.details) {
      console.log(`   Details: ${result.details}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Valifi Agent System Integration Test                 ║');
  console.log('║  Testing TypeScript ↔ Python Agent Communication      ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    await testPythonAgents();
    await testTypeScriptOrchestrator();
    await printSummary();

    // Exit with appropriate code
    const failed = results.filter(r => r.status === 'FAIL').length;
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n🚨 Fatal error during testing:', error);
    process.exit(1);
  }
}

main();
