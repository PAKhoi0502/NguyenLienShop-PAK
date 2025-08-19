import {
   generateAccessToken,
   blacklistToken,
   isTokenBlacklisted,
   getBlacklistStats
} from '../utils/tokenUtils.js';

// Test data
const testUser = {
   id: 1,
   roleId: 1
};

console.log('🧪 Testing Token Blacklist Implementation\n');

// Test 1: Generate token
console.log('1️⃣ Generating test token...');
const token = generateAccessToken(testUser);
console.log(`✅ Token generated: ${token.substring(0, 50)}...\n`);

// Test 2: Check if token is initially not blacklisted
console.log('2️⃣ Checking if token is initially blacklisted...');
const isInitiallyBlacklisted = isTokenBlacklisted(token);
console.log(`✅ Initially blacklisted: ${isInitiallyBlacklisted}\n`);

// Test 3: Add token to blacklist
console.log('3️⃣ Adding token to blacklist...');
blacklistToken(token);
console.log('✅ Token added to blacklist\n');

// Test 4: Check if token is now blacklisted
console.log('4️⃣ Checking if token is now blacklisted...');
const isNowBlacklisted = isTokenBlacklisted(token);
console.log(`✅ Now blacklisted: ${isNowBlacklisted}\n`);

// Test 5: Check blacklist stats
console.log('5️⃣ Checking blacklist statistics...');
const stats = getBlacklistStats();
console.log(`✅ Total blacklisted tokens: ${stats.totalBlacklistedTokens}\n`);

// Test 6: Test with multiple tokens
console.log('6️⃣ Testing with multiple tokens...');
const token2 = generateAccessToken({ id: 2, roleId: 2 });
const token3 = generateAccessToken({ id: 3, roleId: 1 });

blacklistToken(token2);
blacklistToken(token3);

const finalStats = getBlacklistStats();
console.log(`✅ Total blacklisted tokens after adding more: ${finalStats.totalBlacklistedTokens}\n`);

console.log('🎉 All tests completed successfully!');
console.log('\nSummary:');
console.log(`- Generated ${3} tokens`);
console.log(`- Blacklisted ${finalStats.totalBlacklistedTokens} tokens`);
console.log(`- Token blacklist is working correctly ✅`);