// src/services/tokenManagementService.js
// Centralized token management operations

import refreshTokenService from './refreshTokenService';
import cookieHelper from '../utils/cookieHelper';
import { generateTokenPair } from '../utils/tokenUtils';

/**
 * 🔧 Create complete auth session (tokens + database + cookies)
 */
const createAuthSession = async (user, req, res, rememberMe = false) => {
   try {
      // 1. Generate token pair
      const accessTokenExpiry = rememberMe ? '2h' : '30m';
      const { accessToken, refreshToken } = generateTokenPair(user, accessTokenExpiry);

      // 2. Save refresh token to database
      await refreshTokenService.createRefreshToken(user.id, refreshToken, req);

      // 3. Set cookies
      cookieHelper.setAuthCookies(res, { accessToken, refreshToken }, rememberMe);

      console.log(`✅ Auth session created for user ${user.id} (Remember: ${rememberMe})`);

      return {
         success: true,
         accessToken,
         refreshToken,
         user
      };
   } catch (error) {
      console.error('❌ Error creating auth session:', error);
      throw error;
   }
};

/**
 * 🔄 Refresh auth session (rotate tokens + update database + cookies)
 */
const refreshAuthSession = async (oldRefreshToken, userId, req, res) => {
   try {
      // 1. Validate refresh token
      const validation = await refreshTokenService.validateRefreshToken(oldRefreshToken);
      
      if (!validation.valid) {
         throw new Error(validation.error || 'Invalid refresh token');
      }

      const user = validation.user;

      // 2. Rotate refresh token
      const { newRefreshToken } = await refreshTokenService.rotateRefreshToken(
         oldRefreshToken,
         user.id,
         req
      );

      // 3. Generate new access token
      const { accessToken } = generateTokenPair(user, '30m');

      // 4. Set new cookies
      cookieHelper.setAccessTokenCookie(res, accessToken, false); // Refresh always uses 30min
      cookieHelper.setRefreshTokenCookie(res, newRefreshToken);

      console.log(`✅ Auth session refreshed for user ${user.id}`);

      return {
         success: true,
         accessToken,
         refreshToken: newRefreshToken,
         user
      };
   } catch (error) {
      console.error('❌ Error refreshing auth session:', error);
      throw error;
   }
};

/**
 * 🚫 Destroy auth session (revoke tokens + clear cookies)
 */
const destroyAuthSession = async (accessToken, refreshToken, res) => {
   try {
      const { blacklistToken } = require('../utils/tokenUtils');

      // 1. Blacklist access token
      if (accessToken) {
         blacklistToken(accessToken);
         console.log('🚫 Access token blacklisted');
      }

      // 2. Revoke refresh token
      if (refreshToken) {
         await refreshTokenService.revokeRefreshToken(refreshToken);
         console.log('🚫 Refresh token revoked');
      }

      // 3. Clear cookies
      cookieHelper.clearAuthCookies(res);

      console.log('✅ Auth session destroyed successfully');

      return {
         success: true,
         message: 'Session destroyed'
      };
   } catch (error) {
      console.error('❌ Error destroying auth session:', error);
      throw error;
   }
};

/**
 * 🧹 Cleanup expired sessions for user
 */
const cleanupUserSessions = async (userId) => {
   try {
      const revokedCount = await refreshTokenService.revokeAllUserTokens(userId);
      console.log(`🧹 Cleaned up ${revokedCount} sessions for user ${userId}`);
      return revokedCount;
   } catch (error) {
      console.error('❌ Error cleaning up user sessions:', error);
      throw error;
   }
};

/**
 * 📊 Get user session info
 */
const getUserSessionInfo = async (userId) => {
   try {
      const activeSessions = await refreshTokenService.getUserActiveTokens(userId);
      return {
         userId,
         activeSessionCount: activeSessions.length,
         sessions: activeSessions.map(session => ({
            id: session.id,
            deviceInfo: session.deviceInfo,
            ipAddress: session.ipAddress,
            lastUsedAt: session.lastUsedAt,
            createdAt: session.createdAt
         }))
      };
   } catch (error) {
      console.error('❌ Error getting user session info:', error);
      throw error;
   }
};

const tokenManagementService = {
   createAuthSession,
   refreshAuthSession,
   destroyAuthSession,
   cleanupUserSessions,
   getUserSessionInfo
};

export default tokenManagementService;
