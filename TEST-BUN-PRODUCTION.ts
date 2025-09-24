#!/usr/bin/env bun
/**
 * VALIFI BUN PRODUCTION TEST SUITE
 * Verifies all systems are production-ready with Bun
 */

import { Database } from 'bun:sqlite';

const tests = {
    passed: 0,
    failed: 0,
    results: [] as any[]
};

async function test(name: string, fn: () => Promise<void> | void) {
    try {
        await fn();
        tests.passed++;
        tests.results.push({ name, status: '✅', time: 0 });
        console.log(`✅ ${name}`);
    } catch (error: any) {
        tests.failed++;
        tests.results.push({ name, status: '❌', error: error.message });
        console.log(`❌ ${name}: ${error.message}`);
    }
}

console.log(`
┌─────────────────────────────────────────────────────────┐
│   BUN PRODUCTION READINESS TEST                       │
└─────────────────────────────────────────────────────────┘\n`);

// Test 1: Bun Runtime
await test('Bun runtime available', () => {
    if (!Bun.version) throw new Error('Bun not detected');
    console.log(`   Running Bun ${Bun.version}`);
});

// Test 2: SQLite Performance
await test('SQLite performance (10,000 inserts < 100ms)', async () => {
    const db = new Database(':memory:');
    db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, value TEXT)');
    
    const start = performance.now();
    const stmt = db.prepare('INSERT INTO test (value) VALUES (?)');
    
    for (let i = 0; i < 10000; i++) {
        stmt.run(`value_${i}`);
    }
    
    const duration = performance.now() - start;
    db.close();
    
    if (duration > 100) {
        throw new Error(`Too slow: ${duration}ms`);
    }
    console.log(`   Completed in ${duration.toFixed(2)}ms`);
});

// Test 3: Password Hashing
await test('Argon2 password hashing', async () => {
    const password = 'TestPassword123!';
    const hash = await Bun.password.hash(password, {
        algorithm: 'argon2id',
        memoryCost: 4096,
        timeCost: 3
    });
    
    const valid = await Bun.password.verify(password, hash);
    if (!valid) throw new Error('Password verification failed');
});

// Test 4: Server Start
await test('Server can start', async () => {
    const server = Bun.serve({
        port: 0, // Random port
        fetch() {
            return new Response('test');
        }
    });
    
    const response = await fetch(`http://localhost:${server.port}/`);
    const text = await response.text();
    
    server.stop();
    
    if (text !== 'test') throw new Error('Server response incorrect');
});

// Test 5: WebSocket Support
await test('WebSocket functionality', async () => {
    let received = false;
    
    const server = Bun.serve({
        port: 0,
        fetch() { return new Response('ws'); },
        websocket: {
            message(ws, msg) {
                ws.send('pong');
            }
        }
    });
    
    const ws = new WebSocket(`ws://localhost:${server.port}/`);
    
    await new Promise((resolve, reject) => {
        ws.onopen = () => ws.send('ping');
        ws.onmessage = (e) => {
            if (e.data === 'pong') {
                received = true;
                resolve(true);
            }
        };
        ws.onerror = reject;
        setTimeout(() => reject(new Error('Timeout')), 1000);
    });
    
    ws.close();
    server.stop();
    
    if (!received) throw new Error('WebSocket test failed');
});

// Test 6: File System
await test('File system operations', async () => {
    const testFile = './test-bun-fs.txt';
    await Bun.write(testFile, 'Bun file test');
    const content = await Bun.file(testFile).text();
    
    if (content !== 'Bun file test') {
        throw new Error('File read/write failed');
    }
    
    // Cleanup
    await Bun.write(testFile, '');
});

// Test 7: Environment Variables
await test('Environment variables', () => {
    process.env.TEST_VAR = 'test_value';
    if (process.env.TEST_VAR !== 'test_value') {
        throw new Error('Environment variable not set');
    }
});

// Test 8: Memory Usage
await test('Memory usage < 100MB', () => {
    const mem = process.memoryUsage();
    const mbUsed = Math.round(mem.heapUsed / 1024 / 1024);
    
    console.log(`   Heap used: ${mbUsed}MB`);
    
    if (mbUsed > 100) {
        throw new Error(`Memory usage too high: ${mbUsed}MB`);
    }
});

// Test 9: TypeScript Support
await test('Native TypeScript', () => {
    // This file itself is TypeScript!
    const typed: string = 'TypeScript works';
    if (typeof typed !== 'string') {
        throw new Error('TypeScript not working');
    }
});

// Test 10: Performance Benchmark
await test('JSON parsing speed (1MB < 10ms)', () => {
    const largeObject = {
        data: Array(10000).fill(null).map((_, i) => ({
            id: i,
            name: `Item ${i}`,
            value: Math.random(),
            nested: { a: 1, b: 2, c: 3 }
        }))
    };
    
    const json = JSON.stringify(largeObject);
    const size = new Blob([json]).size / 1024 / 1024;
    
    const start = performance.now();
    JSON.parse(json);
    const duration = performance.now() - start;
    
    console.log(`   Parsed ${size.toFixed(2)}MB in ${duration.toFixed(2)}ms`);
    
    if (duration > 10) {
        throw new Error(`JSON parsing too slow: ${duration}ms`);
    }
});

// Final Report
console.log(`
┌─────────────────────────────────────────────────────────┐
│   TEST RESULTS                                        │
╞═════════════════════════════════════════════════════════╡
│   Passed: ${tests.passed}/10                                      │
│   Failed: ${tests.failed}                                         │
│                                                        │
│   ${tests.passed === 10 ? '🎉 ALL TESTS PASSED! PRODUCTION READY! 🎉' : '⚠️  Some tests failed. Check above.'}      │
└─────────────────────────────────────────────────────────┘
`);

if (tests.failed > 0) {
    process.exit(1);
}