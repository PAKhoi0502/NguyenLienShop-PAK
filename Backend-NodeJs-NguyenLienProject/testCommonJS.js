const {
   generateAccessToken,
   blacklistToken,
   isTokenBlacklisted,
   getBlacklistStats
} = require('./src/utils/tokenUtils');

console.log('🧪 Testing Token Blacklist (CommonJS)\n');

// Test data
const testUser = { id: 1, roleId: 1 };

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

console.log('🎉 CommonJS Token Blacklist Implementation Working!');

if (isNowBlacklisted && !isInitiallyBlacklisted) {
   console.log('✅ LOGOUT SECURITY FIX: SUCCESS');
} else {
   console.log('❌ LOGOUT SECURITY FIX: FAILED');
}
