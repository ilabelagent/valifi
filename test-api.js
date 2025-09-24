// Valifi API Testing Script
const BASE_URL = 'http://localhost:3000';

async function testAPI() {
    console.log('🧪 Testing Valifi Fintech Platform API\n');
    
    try {
        // Test 1: Health Check
        console.log('1. Testing Health Endpoint...');
        const healthResponse = await fetch(`${BASE_URL}/api/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health:', healthData);
        
        // Test 2: User Registration
        console.log('\n2. Testing User Registration...');
        const registerData = {
            email: 'test@valifi.com',
            password: 'TestPassword123!',
            firstName: 'Test',
            lastName: 'User'
        };
        
        const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });
        
        const registerResult = await registerResponse.json();
        console.log('✅ Registration:', registerResult);
        
        // Test 3: User Login
        console.log('\n3. Testing User Login...');
        const loginData = {
            email: 'test@valifi.com',
            password: 'TestPassword123!'
        };
        
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        
        const loginResult = await loginResponse.json();
        console.log('✅ Login:', loginResult);
        
        // Test 4: Wallet Access (if login successful)
        if (loginResult.token) {
            console.log('\n4. Testing Wallet Access...');
            const walletResponse = await fetch(`${BASE_URL}/api/wallet`, {
                headers: { 'Authorization': `Bearer ${loginResult.token}` }
            });
            
            const walletData = await walletResponse.json();
            console.log('✅ Wallet:', walletData);
        }
        
        // Test 5: Transactions
        console.log('\n5. Testing Transactions...');
        const transactionsResponse = await fetch(`${BASE_URL}/api/transactions`);
        const transactionsData = await transactionsResponse.json();
        console.log('✅ Transactions:', transactionsData);
        
        console.log('\n🎉 All API tests completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run tests
testAPI();