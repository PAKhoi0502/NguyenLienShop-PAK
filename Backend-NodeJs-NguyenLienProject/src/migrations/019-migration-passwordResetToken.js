'use strict';

module.exports = {
   up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('password_reset_tokens', {
         id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
         },
         userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
               model: 'users',
               key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
         },
         phoneNumber: {
            type: Sequelize.STRING(20),
            allowNull: false,
            comment: 'Phone number for which password reset is requested'
         },
         resetToken: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true,
            comment: 'Unique token for password reset link/session'
         },
         otpCode: {
            type: Sequelize.STRING(6),
            allowNull: true,
            comment: '6-digit OTP code sent via SMS'
         },
         expiresAt: {
            type: Sequelize.DATE,
            allowNull: false,
            comment: 'When the reset token/OTP expires'
         },
         isUsed: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            comment: 'Whether this token has been used for password reset'
         },
         attempts: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
            comment: 'Number of OTP verification attempts'
         },
         maxAttempts: {
            type: Sequelize.INTEGER,
            defaultValue: 3,
            allowNull: false,
            comment: 'Maximum allowed OTP verification attempts'
         },
         ipAddress: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'IP address that requested password reset'
         },
         userAgent: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'User agent string for security tracking'
         },
         createdAt: {
            allowNull: false,
            type: Sequelize.DATE
         },
         updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
         }
      });

      // Add indexes for performance and security
      await queryInterface.addIndex('password_reset_tokens', ['resetToken'], {
         name: 'password_reset_tokens_token_idx',
         unique: true
      });
      await queryInterface.addIndex('password_reset_tokens', ['phoneNumber', 'isUsed'], {
         name: 'password_reset_tokens_phone_used_idx'
      });
      await queryInterface.addIndex('password_reset_tokens', ['userId', 'isUsed'], {
         name: 'password_reset_tokens_user_used_idx'
      });
      await queryInterface.addIndex('password_reset_tokens', ['expiresAt'], {
         name: 'password_reset_tokens_expires_idx'
      });
      await queryInterface.addIndex('password_reset_tokens', ['createdAt'], {
         name: 'password_reset_tokens_created_idx'
      });
   },

   down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('password_reset_tokens');
   }
};