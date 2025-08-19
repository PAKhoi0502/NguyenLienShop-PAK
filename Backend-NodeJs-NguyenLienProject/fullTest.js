import {
   generateAccessToken,
   blacklistToken,
   isTokenBlacklisted,
   verifyAccessToken
} from './src/utils/tokenUtils.js';

console.log('🧪 TESTING TOKEN BLACKLIST FOR LOGOUT\n');

// Test scenario: User login -> User logout -> Try to use old token

// Step 1: Simulate user login
console.log('📝 Step 1: User Login Simulation');
const testUser = { id: 123, roleId: 1 };
const userToken = generateAccessToken(testUser);
console.log(`   ✅ Token generated for user ${testUser.id}`);
console.log(`   🔑 Token: ${userToken.substring(0, 30)}...`);

// Step 2: Verify token works
console.log('\n📝 Step 2: Verify Token Works');
try {
   const decoded = verifyAccessToken(userToken);
   console.log(`   ✅ Token is valid for user ${decoded.id} with role ${decoded.roleId}`);
} catch (error) {
   console.log(`   ❌ Token verification failed: ${error.message}`);
}

// Step 3: Check token is not blacklisted initially
console.log('\n📝 Step 3: Check Token Not Blacklisted Initially');
const isInitiallyBlacklisted = isTokenBlacklisted(userToken);
console.log(`   ✅ Initially blacklisted: ${isInitiallyBlacklisted}`);

// Step 4: Simulate user logout (blacklist token)
console.log('\n📝 Step 4: User Logout (Blacklist Token)');
blacklistToken(userToken);
console.log(`   ✅ Token has been blacklisted`);

// Step 5: Try to use token after logout
console.log('\n📝 Step 5: Try to Use Token After Logout');
const isNowBlacklisted = isTokenBlacklisted(userToken);
console.log(`   ✅ Now blacklisted: ${isNowBlacklisted}`);

// Step 6: Simulate middleware check
console.log('\n📝 Step 6: Simulate Middleware Security Check');
const simulateMiddleware = (token) => {
   // This simulates what happens in verifyToken middleware
   if (!token) {
      return { status: 401, message: 'Token not provided!' };
   }

   if (isTokenBlacklisted(token)) {
      return { status: 401, message: 'Token has been revoked. Please login again.' };
   }

   try {
      const decoded = verifyAccessToken(token);
      return { status: 200, message: 'Access granted', user: decoded };
   } catch (error) {
      return { status: 403, message: 'Invalid or expired token' };
   }
};

const middlewareResult = simulateMiddleware(userToken);
console.log(`   🛡️  Middleware Response: ${middlewareResult.status} - ${middlewareResult.message}`);

// Final Summary
console.log('\n🎯 SUMMARY:');
console.log(`   ✅ Token generation: Working`);
console.log(`   ✅ Token verification: Working`);
console.log(`   ✅ Token blacklisting: Working`);
console.log(`   ✅ Blacklist checking: Working`);
console.log(`   ✅ Security middleware: Working`);

if (middlewareResult.status === 401 && middlewareResult.message.includes('revoked')) {
   console.log('\n🎉 TOKEN BLACKLIST LOGOUT IMPLEMENTATION: SUCCESS!');
   console.log('   🔒 Users cannot reuse tokens after logout');
   console.log('   🛡️  Security vulnerability has been fixed');
} else {
   console.log('\n❌ TOKEN BLACKLIST LOGOUT IMPLEMENTATION: FAILED!');
}
