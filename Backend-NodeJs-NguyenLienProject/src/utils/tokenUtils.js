const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// In-memory blacklist (for development)
// For production, use Redis or database
const tokenBlacklist = new Set();

/**
 * Generate access token
 */
const generateAccessToken = (user) => {
   return jwt.sign(
      {
         id: user.id,
         roleId: user.roleId,
         type: 'access'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
   );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (user) => {
   return jwt.sign(
      {
         id: user.id,
         type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
   );
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
   return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
   return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
};

/**
 * Add token to blacklist
 */
const blacklistToken = (token) => {
   tokenBlacklist.add(token);
   console.log(`Token added to blacklist. Total blacklisted tokens: ${tokenBlacklist.size}`);
};

/**
 * Check if token is blacklisted
 */
const isTokenBlacklisted = (token) => {
   return tokenBlacklist.has(token);
};

/**
 * Clear expired tokens from blacklist (optional cleanup)
 */
const cleanupBlacklist = () => {
   // For in-memory implementation, we can't easily clean expired tokens
   // This would be easier with Redis using TTL
   console.log(`Current blacklist size: ${tokenBlacklist.size}`);
};

/**
 * Get blacklist stats (for debugging)
 */
const getBlacklistStats = () => {
   return {
      totalBlacklistedTokens: tokenBlacklist.size,
      blacklistedTokens: Array.from(tokenBlacklist)
   };
};

module.exports = {
   generateAccessToken,
   generateRefreshToken,
   verifyAccessToken,
   verifyRefreshToken,
   blacklistToken,
   isTokenBlacklisted,
   cleanupBlacklist,
   getBlacklistStats
};