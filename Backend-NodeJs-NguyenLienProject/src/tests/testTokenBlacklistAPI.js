// API Test for Token Blacklist
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

// Test credentials
const testCredentials = {
    identifier: '0123456789', // Thay bằng phone number có trong DB
    password: '123456' // Thay bằng password thực tế
};

async function testTokenBlacklist() {
    console.log('🧪 Testing Token Blacklist API...\n');

    try {
        // Step 1: Login to get token
        console.log('1️⃣ Testing login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testCredentials);
        
        if (!loginResponse.data.token) {
            console.error('❌ Login failed - no token received');
            return;
        }

        const token = loginResponse.data.token;
        console.log('✅ Login successful, token:', token.substring(0, 30) + '...');

        // Step 2: Test authenticated request
        console.log('\n2️⃣ Testing authenticated request...');
        const authHeaders = { Authorization: `Bearer ${token}` };
        
        const profileResponse = await axios.get(`${BASE_URL}/user/profile`, { headers: authHeaders });
        console.log('✅ Authenticated request successful');

        // Step 3: Logout (blacklist token)
        console.log('\n3️⃣ Testing logout...');
        const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {}, { headers: authHeaders });
        console.log('✅ Logout successful:', logoutResponse.data.message);

        // Step 4: Try to use blacklisted token
        console.log('\n4️⃣ Testing blacklisted token usage...');
        try {
            await axios.get(`${BASE_URL}/user/profile`, { headers: authHeaders });
            console.log('❌ ERROR: Blacklisted token still works!');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Blacklisted token correctly rejected:', error.response.data.message);
            } else {
                console.log('⚠️ Unexpected error:', error.message);
            }
        }

        console.log('\n🎉 Token blacklist test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testTokenBlacklist();
