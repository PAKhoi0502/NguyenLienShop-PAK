'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
   class PasswordResetToken extends Model {
      static associate(models) {
         // 🔗 Relationship with User
         PasswordResetToken.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
         });
      }

      // 🔧 Instance methods
      isExpired() {
         return new Date() > this.expiresAt;
      }

      isValid() {
         return !this.isUsed && !this.isExpired() && this.attempts < this.maxAttempts;
      }

      canAttempt() {
         return this.attempts < this.maxAttempts && !this.isExpired() && !this.isUsed;
      }

      // 🔧 Increment attempt counter
      async incrementAttempts() {
         this.attempts += 1;
         return await this.save();
      }

      // 🔧 Mark as used after successful password reset
      async markAsUsed() {
         this.isUsed = true;
         return await this.save();
      }

      // 🔧 Check if OTP matches
      verifyOTP(inputOTP) {
         return this.otpCode && this.otpCode === inputOTP;
      }

      // 🔧 Get remaining attempts
      getRemainingAttempts() {
         return Math.max(0, this.maxAttempts - this.attempts);
      }

      // 🔧 Get remaining time in minutes
      getRemainingTime() {
         const now = new Date();
         const remaining = this.expiresAt - now;
         return Math.max(0, Math.ceil(remaining / (1000 * 60))); // Convert to minutes
      }

      // 🔧 Static method: Clean up expired tokens
      static async cleanupExpiredTokens() {
         const now = new Date();
         const deletedCount = await PasswordResetToken.destroy({
            where: {
               expiresAt: {
                  [sequelize.Sequelize.Op.lt]: now
               }
            }
         });
         console.log(`🗑️ Cleaned up ${deletedCount} expired password reset tokens`);
         return deletedCount;
      }

      // 🔧 Static method: Find valid token
      static async findValidToken(resetToken) {
         const now = new Date();
         return await PasswordResetToken.findOne({
            where: {
               resetToken: resetToken,
               isUsed: false,
               expiresAt: {
                  [sequelize.Sequelize.Op.gt]: now
               },
               attempts: {
                  [sequelize.Sequelize.Op.lt]: sequelize.literal('maxAttempts')
               }
            },
            include: [{
               model: sequelize.models.User,
               as: 'user',
               attributes: ['id', 'phoneNumber', 'userName']
            }]
         });
      }

      // 🔧 Static method: Find by phone number
      static async findByPhoneNumber(phoneNumber, includeExpired = false) {
         const whereClause = {
            phoneNumber: phoneNumber,
            isUsed: false
         };

         if (!includeExpired) {
            whereClause.expiresAt = {
               [sequelize.Sequelize.Op.gt]: new Date()
            };
         }

         return await PasswordResetToken.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: 5 // Limit to recent tokens
         });
      }
   }

   PasswordResetToken.init({
      userId: {
         type: DataTypes.INTEGER,
         allowNull: false,
         validate: {
            isInt: true
         }
      },
      phoneNumber: {
         type: DataTypes.STRING(255), // Increased to support both phone & email
         allowNull: false,
         validate: {
            notEmpty: true
            // Removed len validation to support email addresses
         }
      },
      targetEmail: {
         type: DataTypes.STRING(255),
         allowNull: true, // Only used for email update requests
         validate: {
            isEmail: {
               msg: 'Must be a valid email address'
            }
         },
         comment: 'Target email address for email update requests'
      },
      resetToken: {
         type: DataTypes.STRING(255),
         allowNull: false,
         unique: true,
         validate: {
            notEmpty: true
         }
      },
      otpCode: {
         type: DataTypes.STRING(6),
         allowNull: true,
         validate: {
            len: [6, 6],
            isNumeric: true
         }
      },
      expiresAt: {
         type: DataTypes.DATE,
         allowNull: false,
         validate: {
            isDate: true,
            isAfter: new Date().toISOString()
         }
      },
      isUsed: {
         type: DataTypes.BOOLEAN,
         defaultValue: false,
         allowNull: false
      },
      attempts: {
         type: DataTypes.INTEGER,
         defaultValue: 0,
         allowNull: false,
         validate: {
            isInt: true,
            min: 0
         }
      },
      maxAttempts: {
         type: DataTypes.INTEGER,
         defaultValue: 3,
         allowNull: false,
         validate: {
            isInt: true,
            min: 1,
            max: 10
         }
      },
      ipAddress: {
         type: DataTypes.STRING,
         allowNull: true,
         validate: {
            isIP: true
         }
      },
      userAgent: {
         type: DataTypes.TEXT,
         allowNull: true
      }
   }, {
      sequelize,
      modelName: 'PasswordResetToken',
      tableName: 'password_reset_tokens',
      timestamps: true,
      indexes: [
         {
            fields: ['resetToken'],
            unique: true
         },
         {
            fields: ['phoneNumber', 'isUsed']
         },
         {
            fields: ['userId', 'isUsed']
         },
         {
            fields: ['expiresAt']
         },
         {
            fields: ['createdAt']
         }
      ],
      hooks: {
         // 🔧 Auto cleanup old tokens before creating new ones
         beforeCreate: async (resetToken, options) => {
            // Clean up old unused tokens for the same phone number
            await PasswordResetToken.destroy({
               where: {
                  phoneNumber: resetToken.phoneNumber,
                  isUsed: false,
                  expiresAt: {
                     [sequelize.Sequelize.Op.lt]: new Date()
                  }
               }
            });
         }
      }
   });

   return PasswordResetToken;
};