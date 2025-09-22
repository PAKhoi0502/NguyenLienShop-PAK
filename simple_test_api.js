// Simple test để kiểm tra API endpoint
// Run: node simple_test_api.js

const https = require('https');
const http = require('http');

const testAPI = () => {
    const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/api/admin/product-category-stats',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Add authorization header nếu cần
            'Authorization': 'Bearer YOUR_TOKEN_HERE'
        }
    };

    const req = http.request(options, (res) => {
        console.log(`📡 Status: ${res.statusCode}`);
        console.log(`📋 Headers:`, res.headers);

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('✅ Response Data:', JSON.stringify(jsonData, null, 2));
            } catch (err) {
                console.log('❌ Raw Response:', data);
            }
        });
    });

    req.on('error', (err) => {
        console.error('🔥 Request Error:', err);
    });

    req.end();
};

console.log('🧪 Testing Product Category Stats API...');
console.log('🔍 Endpoint: GET http://localhost:8080/api/admin/product-category-stats');
testAPI();