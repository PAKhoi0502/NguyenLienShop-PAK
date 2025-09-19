const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// In-memory blacklist (for development)
// For production, use Redis or database
const tokenBlacklist = new Set();

/**
 * Generate access token with dynamic expiration
 */
const generateAccessToken = (user, expiresIn = '1h') => {
   return jwt.sign(
      {
         id: user.id,
         roleId: user.roleId,
         type: 'access'
      },
      process.env.JWT_SECRET,
      { expiresIn }
   );
};

/**
 * Generate refresh token with longer expiration
 */
const generateRefreshToken = (user) => {
   return jwt.sign(
      {
         id: user.id,
         type: 'refresh',
         // ✅ Add timestamp and random nonce to ensure uniqueness
         iat: Math.floor(Date.now() / 1000), // Issued at timestamp
         jti: Math.random().toString(36).substring(2) + Date.now().toString(36) // Unique JWT ID
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '30d' } // 30 days for refresh token
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

/**
 * Generate pair of access and refresh tokens
 */
const generateTokenPair = (user, accessTokenExpiry = '30m') => {
   const accessToken = generateAccessToken(user, accessTokenExpiry);
   const refreshToken = generateRefreshToken(user);

   return {
      accessToken,
      refreshToken,
      accessTokenExpiry: accessTokenExpiry,
      refreshTokenExpiry: '30d'
   };
};

/**
 * Create refresh token expiration date
 */
const createRefreshTokenExpiry = (days = 30) => {
   const expiry = new Date();
   expiry.setDate(expiry.getDate() + days);
   return expiry;
};

/**
 * Extract device info from request headers
 */
const extractDeviceInfo = (req) => {
   const userAgent = req.get('User-Agent') || 'Unknown';
   const platform = req.get('sec-ch-ua-platform') || '';
   return `${userAgent} ${platform}`.trim();
};

/**
 * Extract IP address from request
 */
const extractIpAddress = (req) => {
   return req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
      '127.0.0.1';
};

module.exports = {
   generateAccessToken,
   generateRefreshToken,
   verifyAccessToken,
   verifyRefreshToken,
   blacklistToken,
   isTokenBlacklisted,
   cleanupBlacklist,
   getBlacklistStats,
   generateTokenPair,
   createRefreshTokenExpiry,
   extractDeviceInfo,
   extractIpAddress
};