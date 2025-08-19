import express from 'express';
import { generateAccessToken, blacklistToken, isTokenBlacklisted } from './src/utils/tokenUtils.js';

const app = express();
app.use(express.json());

// Test user
const testUser = { id: 1, roleId: 1 };

// Test logout endpoint
app.post('/test-logout', (req, res) => {
   console.log('\n🧪 Testing Logout Functionality');

   // 1. Generate token
   const token = generateAccessToken(testUser);
   console.log(`1️⃣ Generated token: ${token.substring(0, 50)}...`);

   // 2. Check if initially blacklisted
   const initialCheck = isTokenBlacklisted(token);
   console.log(`2️⃣ Initially blacklisted: ${initialCheck}`);

   // 3. Blacklist the token (simulate logout)
   blacklistToken(token);
   console.log('3️⃣ Token blacklisted (user logged out)');

   // 4. Check if now blacklisted
   const finalCheck = isTokenBlacklisted(token);
   console.log(`4️⃣ Now blacklisted: ${finalCheck}`);

   res.json({
      message: 'Logout test completed',
      results: {
         tokenGenerated: true,
         initiallyBlacklisted: initialCheck,
         finallyBlacklisted: finalCheck,
         logoutSuccessful: finalCheck === true
      }
   });
});

// Test protected endpoint
app.get('/test-protected', (req, res) => {
   const authHeader = req.headers.authorization;
   if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
   }

   const token = authHeader.split(' ')[1];

   if (isTokenBlacklisted(token)) {
      return res.status(401).json({ message: 'Token has been revoked. Please login again.' });
   }

   res.json({ message: 'Access granted! Token is valid.' });
});

const PORT = 3001;
app.listen(PORT, () => {
   console.log(`🚀 Token Blacklist Test Server running on port ${PORT}`);
   console.log(`📋 Available endpoints:`);
   console.log(`   POST http://localhost:${PORT}/test-logout`);
   console.log(`   GET  http://localhost:${PORT}/test-protected`);
});
