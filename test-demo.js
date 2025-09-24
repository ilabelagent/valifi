// Test with demo credentials
const BASE_URL = 'http://localhost:3000';

async function testDemo() {
    console.log('🧪 Testing Valifi with Demo Credentials\n');
    
    try {
        // Test demo login
        console.log('1. Testing Demo Login...');
        const loginData = {
            email: 'demo@valifi.com',
            password: 'demo123'
        };
        
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        
        const loginResult = await loginResponse.json();
        console.log('✅ Demo Login:', loginResult);
        
        // Test admin login
        console.log('\n2. Testing Admin Login...');
        const adminData = {
            email: 'admin@valifi.com',
            password: 'admin123'
        };
        
        const adminResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminData)
        });
        
        const adminResult = await adminResponse.json();
        console.log('✅ Admin Login:', adminResult);
        
        console.log('\n🎉 Demo tests completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testDemo();