// src/utils/refreshTokenTest.js
// Utility functions để test refresh token mechanism

import { refreshAccessToken } from '../services/refreshTokenService';
import { checkAuth } from '../services/authService';

/**
 * 🧪 Comprehensive test của refresh token flow
 */
export const testRefreshTokenFlow = async () => {
   console.log('🧪 Starting comprehensive refresh token test...');

   const results = {
      step1_initialAuth: null,
      step2_refreshToken: null,
      step3_finalAuth: null,
      summary: null
   };

   try {
      // Step 1: Check initial auth status
      console.log('📝 Step 1: Checking initial auth status...');
      const initialAuth = await checkAuth();
      results.step1_initialAuth = {
         success: initialAuth.errCode === 0,
         data: initialAuth
      };
      console.log('Initial auth result:', initialAuth);

      // Step 2: Test refresh token
      console.log('📝 Step 2: Testing refresh token...');
      const refreshResult = await refreshAccessToken();
      results.step2_refreshToken = refreshResult;
      console.log('Refresh token result:', refreshResult);

      // Step 3: Check auth status after refresh
      console.log('📝 Step 3: Checking auth status after refresh...');
      const finalAuth = await checkAuth();
      results.step3_finalAuth = {
         success: finalAuth.errCode === 0,
         data: finalAuth
      };
      console.log('Final auth result:', finalAuth);

      // Summary
      const allStepsSuccessful =
         results.step1_initialAuth.success &&
         results.step2_refreshToken.success &&
         results.step3_finalAuth.success;

      results.summary = {
         allStepsSuccessful,
         message: allStepsSuccessful
            ? '✅ All refresh token tests passed!'
            : '❌ Some refresh token tests failed',
         timestamp: new Date().toISOString()
      };

      console.log('🎉 Test Summary:', results.summary);
      return results;

   } catch (error) {
      console.error('❌ Refresh token test failed:', error);
      results.summary = {
         allStepsSuccessful: false,
         message: `❌ Test failed with error: ${error.message}`,
         error: error.message,
         timestamp: new Date().toISOString()
      };
      return results;
   }
};

/**
 * 📊 Generate test report
 */
export const generateRefreshTokenReport = (testResults) => {
   const report = {
      testTimestamp: testResults.summary?.timestamp || new Date().toISOString(),
      overallResult: testResults.summary?.allStepsSuccessful ? 'PASS' : 'FAIL',
      steps: {
         initialAuth: {
            status: testResults.step1_initialAuth?.success ? 'PASS' : 'FAIL',
            details: testResults.step1_initialAuth?.data
         },
         refreshToken: {
            status: testResults.step2_refreshToken?.success ? 'PASS' : 'FAIL',
            details: testResults.step2_refreshToken
         },
         finalAuth: {
            status: testResults.step3_finalAuth?.success ? 'PASS' : 'FAIL',
            details: testResults.step3_finalAuth?.data
         }
      },
      recommendations: []
   };

   // Add recommendations based on results
   if (!testResults.step1_initialAuth?.success) {
      report.recommendations.push('Initial authentication failed - check login status');
   }
   if (!testResults.step2_refreshToken?.success) {
      report.recommendations.push('Refresh token failed - check backend implementation');
   }
   if (!testResults.step3_finalAuth?.success) {
      report.recommendations.push('Final auth check failed - refresh token may not be working properly');
   }
   if (report.overallResult === 'PASS') {
      report.recommendations.push('✅ Refresh token mechanism is working correctly!');
   }

   return report;
};

/**
 * 🎯 Quick refresh token status check
 */
export const quickRefreshTokenCheck = async () => {
   try {
      const result = await refreshAccessToken();
      return {
         working: result.success,
         message: result.success ? 'Refresh token is working' : result.error,
         timestamp: new Date().toISOString()
      };
   } catch (error) {
      return {
         working: false,
         message: `Error: ${error.message}`,
         timestamp: new Date().toISOString()
      };
   }
};

const refreshTokenTest = {
   testRefreshTokenFlow,
   generateRefreshTokenReport,
   quickRefreshTokenCheck
};

export default refreshTokenTest;
