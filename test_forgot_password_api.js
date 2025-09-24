/**
 * Test script cho Forgot Password APIs
 * Chạy: node test_forgot_password.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:8080';
const TEST_PHONE = '0987654321';

const api = axios.create({
   baseURL: BASE_URL,
   headers: {
      'Content-Type': 'application/json'
   }
});

async function testForgotPasswordFlow() {
   console.log('🧪 Testing Forgot Password Flow...\n');

   try {
      // Step 1: Test Forgot Password Request
      console.log('1️⃣ Testing POST /api/auth/forgot-password');
      const step1 = await api.post('/api/auth/forgot-password', {
         phoneNumber: TEST_PHONE
      });
      
      console.log('✅ Response:', step1.data);
      const resetToken = step1.data.resetToken;
      console.log('Reset Token:', resetToken);

      // Wait a bit for OTP generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Test OTP Verification (Manual input needed)
      console.log('\n2️⃣ Testing POST /api/auth/verify-reset-otp');
      console.log('📝 Check console logs above for OTP code and enter it manually');
      
      // For testing, we'll use a placeholder OTP (in real scenario, use the OTP from console)
      const testOTP = '123456'; // Replace with actual OTP from console
      
      try {
         const step2 = await api.post('/api/auth/verify-reset-otp', {
            phoneNumber: TEST_PHONE,
            otpCode: testOTP
         });
         console.log('✅ OTP Verification:', step2.data);

         // Step 3: Test Password Reset
         console.log('\n3️⃣ Testing POST /api/auth/reset-password');
         const step3 = await api.post('/api/auth/reset-password', {
            resetToken: step2.data.resetToken,
            newPassword: 'newpassword123'
         });
         console.log('✅ Password Reset:', step3.data);

      } catch (otpError) {
         console.log('⚠️ OTP Verification failed (expected - use actual OTP):', otpError.response?.data);
      }

   } catch (error) {
      console.error('❌ Test failed:', error.response?.data || error.message);
   }
}

async function testErrorCases() {
   console.log('\n🧪 Testing Error Cases...\n');

   try {
      // Test with non-existent phone number
      console.log('1️⃣ Testing with non-existent phone number');
      await api.post('/api/auth/forgot-password', {
         phoneNumber: '0999999999'
      });
   } catch (error) {
      console.log('✅ Expected error:', error.response?.data);
   }

   try {
      // Test with invalid OTP
      console.log('\n2️⃣ Testing with invalid OTP');
      await api.post('/api/auth/verify-reset-otp', {
         phoneNumber: TEST_PHONE,
         otpCode: '000000'
      });
   } catch (error) {
      console.log('✅ Expected error:', error.response?.data);
   }

   try {
      // Test with invalid reset token
      console.log('\n3️⃣ Testing with invalid reset token');
      await api.post('/api/auth/reset-password', {
         resetToken: 'invalid-token',
         newPassword: 'newpassword123'
      });
   } catch (error) {
      console.log('✅ Expected error:', error.response?.data);
   }
}

async function runTests() {
   console.log('🚀 Starting Forgot Password API Tests\n');
   console.log('📋 Prerequisites:');
   console.log('- Backend server running on port 8080');
   console.log('- Database connected and migrated');
   console.log('- User with phone', TEST_PHONE, 'exists in database\n');

   await testForgotPasswordFlow();
   await testErrorCases();

   console.log('\n✨ Test completed! Check console logs for OTP codes during actual testing.');
}

// Run tests if this file is executed directly
if (require.main === module) {
   runTests().catch(console.error);
}

module.exports = {
   testForgotPasswordFlow,
   testErrorCases,
   runTests
};