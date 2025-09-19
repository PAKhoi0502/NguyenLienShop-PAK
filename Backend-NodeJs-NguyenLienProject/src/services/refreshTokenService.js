import db from '../models/index';
import {
   generateTokenPair,
   createRefreshTokenExpiry,
   extractDeviceInfo,
   extractIpAddress,
   verifyRefreshToken
} from '../utils/tokenUtils';

const { RefreshToken, User } = db;

/**
 * 🔧 Create new refresh token in database
 */
const createRefreshToken = async (userId, refreshToken, req) => {
   try {
      const deviceInfo = extractDeviceInfo(req);
      const ipAddress = extractIpAddress(req);
      const expiresAt = createRefreshTokenExpiry(30); // 30 days

      // 🔄 Try to create token, handle duplicates gracefully
      let tokenRecord;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
         try {
            tokenRecord = await RefreshToken.create({
               token: refreshToken,
               userId: userId,
               deviceInfo: deviceInfo,
               ipAddress: ipAddress,
               expiresAt: expiresAt,
               isActive: true
            });
            break; // Success, exit loop
         } catch (error) {
            // 🚨 Handle auto-increment failure
            if (error.code === 'ER_AUTOINC_READ_FAILED') {
               console.error('🚨 CRITICAL: MySQL auto-increment failed!');
               console.error('💡 Please run: ALTER TABLE refresh_tokens AUTO_INCREMENT = 1;');
               throw new Error('Database auto-increment error. Please contact administrator.');
            }

            if (error.name === 'SequelizeUniqueConstraintError' && retryCount < maxRetries - 1) {
               console.log(`🔄 Duplicate token detected, regenerating... (attempt ${retryCount + 1}/${maxRetries})`);

               // Generate new unique token
               const user = { id: userId };
               const { refreshToken: newRefreshToken } = generateTokenPair(user);
               refreshToken = newRefreshToken;
               retryCount++;
            } else {
               throw error; // Re-throw if not duplicate or max retries reached
            }
         }
      } console.log('✅ Refresh token created:', {
         id: tokenRecord.id,
         userId: userId,
         deviceInfo: deviceInfo,
         expiresAt: expiresAt
      });

      return tokenRecord;
   } catch (error) {
      console.error('❌ Error creating refresh token:', error);
      throw error;
   }
};

/**
 * 🔍 Find refresh token by token string
 */
const findRefreshToken = async (tokenString) => {
   try {
      const tokenRecord = await RefreshToken.findOne({
         where: {
            token: tokenString,
            isActive: true
         },
         include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'roleId', 'userName', 'email']
         }]
      });

      return tokenRecord;
   } catch (error) {
      console.error('❌ Error finding refresh token:', error);
      throw error;
   }
};

/**
 * 🔄 Rotate refresh token (invalidate old, create new)
 */
const rotateRefreshToken = async (oldTokenString, userId, req) => {
   try {
      // 1. Find and invalidate old token
      const oldToken = await findRefreshToken(oldTokenString);
      if (oldToken) {
         await oldToken.revoke();
         console.log('🔄 Old refresh token revoked:', oldToken.id);
      }

      // 2. Generate new token pair
      const user = { id: userId };
      const { refreshToken: newRefreshToken } = generateTokenPair(user);

      // 3. Save new refresh token
      const newTokenRecord = await createRefreshToken(userId, newRefreshToken, req);

      return {
         newRefreshToken,
         tokenRecord: newTokenRecord
      };
   } catch (error) {
      console.error('❌ Error rotating refresh token:', error);
      throw error;
   }
};

/**
 * 🧹 Cleanup expired refresh tokens
 */
const cleanupExpiredTokens = async () => {
   try {
      const expiredCount = await RefreshToken.destroy({
         where: {
            expiresAt: {
               [db.Sequelize.Op.lt]: new Date()
            }
         }
      });

      console.log(`🧹 Cleaned up ${expiredCount} expired refresh tokens`);
      return expiredCount;
   } catch (error) {
      console.error('❌ Error cleaning up expired tokens:', error);
      throw error;
   }
};

/**
 * 🚫 Revoke all refresh tokens for a user
 */
const revokeAllUserTokens = async (userId) => {
   try {
      const updatedCount = await RefreshToken.update(
         { isActive: false },
         {
            where: {
               userId: userId,
               isActive: true
            }
         }
      );

      console.log(`🚫 Revoked ${updatedCount[0]} refresh tokens for user ${userId}`);
      return updatedCount[0];
   } catch (error) {
      console.error('❌ Error revoking user tokens:', error);
      throw error;
   }
};

/**
 * 🚫 Revoke specific refresh token
 */
const revokeRefreshToken = async (tokenString) => {
   try {
      const tokenRecord = await findRefreshToken(tokenString);
      if (!tokenRecord) {
         return false;
      }

      await tokenRecord.revoke();
      console.log('🚫 Refresh token revoked:', tokenRecord.id);
      return true;
   } catch (error) {
      console.error('❌ Error revoking refresh token:', error);
      throw error;
   }
};

/**
 * 📊 Get user's active refresh tokens
 */
const getUserActiveTokens = async (userId) => {
   try {
      const tokens = await RefreshToken.findAll({
         where: {
            userId: userId,
            isActive: true,
            expiresAt: {
               [db.Sequelize.Op.gt]: new Date()
            }
         },
         attributes: ['id', 'deviceInfo', 'ipAddress', 'lastUsedAt', 'createdAt'],
         order: [['lastUsedAt', 'DESC'], ['createdAt', 'DESC']]
      });

      return tokens;
   } catch (error) {
      console.error('❌ Error getting user active tokens:', error);
      throw error;
   }
};

/**
 * ✅ Validate refresh token
 */
const validateRefreshToken = async (tokenString) => {
   try {
      // 1. Verify JWT signature and expiration
      const decoded = verifyRefreshToken(tokenString);

      // 2. Find token in database
      const tokenRecord = await findRefreshToken(tokenString);

      if (!tokenRecord) {
         return { valid: false, error: 'Token not found in database' };
      }

      if (!tokenRecord.isValid()) {
         return { valid: false, error: 'Token is expired or inactive' };
      }

      // 3. Update last used timestamp
      await tokenRecord.updateLastUsed();

      return {
         valid: true,
         user: tokenRecord.user,
         tokenRecord: tokenRecord
      };
   } catch (error) {
      console.error('❌ Error validating refresh token:', error);
      return { valid: false, error: error.message };
   }
};

export default {
   createRefreshToken,
   findRefreshToken,
   rotateRefreshToken,
   cleanupExpiredTokens,
   revokeAllUserTokens,
   revokeRefreshToken,
   getUserActiveTokens,
   validateRefreshToken
};
