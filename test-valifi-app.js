/**
 * VALIFI APPLICATION TEST SUITE
 * Tests all major components and endpoints
 */

const axios = require('axios');

const FRONTEND_URL = 'http://localhost:4000';
const BACKEND_URL = 'http://localhost:3001';

console.log('🧪 VALIFI APPLICATION TEST SUITE');
console.log('='.repeat(50));

async function testEndpoint(url, description) {
    try {
        const response = await axios.get(url, { timeout: 5000 });
        console.log(`✅ ${description}: ${response.status} - ${response.statusText}`);
        return { success: true, data: response.data };
    } catch (error) {
        console.log(`❌ ${description}: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function testAPI(url, data, description) {
    try {
        const response = await axios.post(url, data, {
            timeout: 5000,
            headers: { 'Content-Type': 'application/json' }
        });
        console.log(`✅ ${description}: ${response.status} - Success`);
        return { success: true, data: response.data };
    } catch (error) {
        console.log(`❌ ${description}: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log('\n📡 FRONTEND TESTS');
    console.log('-'.repeat(30));

    // Test frontend
    await testEndpoint(FRONTEND_URL, 'Frontend HTML Page');
    await testEndpoint(`${FRONTEND_URL}/api/health`, 'Frontend API Proxy');

    console.log('\n🔧 BACKEND TESTS');
    console.log('-'.repeat(30));

    // Test backend directly on common ports
    const ports = [3000, 3001, 3002];
    let backendWorking = false;

    for (const port of ports) {
        const result = await testEndpoint(`http://localhost:${port}/api/health`, `Backend Health (Port ${port})`);
        if (result.success) {
            backendWorking = true;
            console.log(`📊 Backend Data:`, JSON.stringify(result.data, null, 2));
        }
    }

    if (backendWorking) {
        console.log('\n🔐 AUTHENTICATION TESTS');
        console.log('-'.repeat(30));

        // Test authentication endpoints
        for (const port of ports) {
            await testAPI(`http://localhost:${port}/api/auth/login`, {
                email: 'demo@valifi.com',
                password: 'test123'
            }, `Login Test (Port ${port})`);

            await testAPI(`http://localhost:${port}/api/auth/register`, {
                fullName: 'Test User',
                username: 'testuser',
                email: 'test@valifi.com',
                password: 'test123'
            }, `Registration Test (Port ${port})`);
        }

        console.log('\n🤖 BOT FRAMEWORK TESTS');
        console.log('-'.repeat(30));

        // Test bot framework
        for (const port of ports) {
            await testAPI(`http://localhost:${port}/api/bot`, {
                bot: 'banking',
                action: 'get_balance',
                userId: 'demo-user'
            }, `Banking Bot Test (Port ${port})`);

            await testAPI(`http://localhost:${port}/api/bot`, {
                bot: 'trading',
                action: 'get_portfolio',
                userId: 'demo-user'
            }, `Trading Bot Test (Port ${port})`);
        }
    }

    console.log('\n📱 COMPONENT TESTS');
    console.log('-'.repeat(30));

    // Test React components (check for key elements)
    const frontendResult = await testEndpoint(FRONTEND_URL, 'React App Loading');
    if (frontendResult.success) {
        const html = frontendResult.data;
        const hasTitle = html.includes('Valifi - AI-Powered Financial Platform');
        const hasReact = html.includes('react');
        const hasVite = html.includes('vite');

        console.log(`✅ Page Title: ${hasTitle ? 'Found' : 'Missing'}`);
        console.log(`✅ React Integration: ${hasReact ? 'Found' : 'Missing'}`);
        console.log(`✅ Vite Dev Server: ${hasVite ? 'Found' : 'Missing'}`);
    }

    console.log('\n🎯 SUMMARY');
    console.log('='.repeat(50));
    console.log('🌐 Frontend (Vite + React): http://localhost:4000');
    console.log('🔧 Backend (Bun Server): Check ports 3000-3002');
    console.log('📖 Full Documentation: DEPLOYMENT-GUIDE-NO-DOCKER.md');
    console.log('\n✨ Test completed! Check results above.');
}

runTests().catch(console.error);