'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
   class RefreshToken extends Model {
      static associate(models) {
         // 🔗 Relationship with User
         RefreshToken.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
         });
      }

      // 🔧 Instance methods
      isExpired() {
         return new Date() > this.expiresAt;
      }

      isValid() {
         return this.isActive && !this.isExpired();
      }

      // 🔧 Update last used timestamp
      async updateLastUsed() {
         this.lastUsedAt = new Date();
         return await this.save();
      }

      // 🔧 Revoke token
      async revoke() {
         this.isActive = false;
         return await this.save();
      }
   }

   RefreshToken.init({
      token: {
         type: DataTypes.TEXT,
         allowNull: false,
         unique: true,
         validate: {
            notEmpty: true
         }
      },
      userId: {
         type: DataTypes.INTEGER,
         allowNull: false,
         validate: {
            isInt: true
         }
      },
      deviceInfo: {
         type: DataTypes.STRING,
         allowNull: true
      },
      ipAddress: {
         type: DataTypes.STRING,
         allowNull: true,
         validate: {
            isIP: true
         }
      },
      isActive: {
         type: DataTypes.BOOLEAN,
         defaultValue: true,
         allowNull: false
      },
      expiresAt: {
         type: DataTypes.DATE,
         allowNull: false,
         validate: {
            isDate: true,
            isAfter: new Date().toISOString()
         }
      },
      lastUsedAt: {
         type: DataTypes.DATE,
         allowNull: true,
         validate: {
            isDate: true
         }
      }
   }, {
      sequelize,
      modelName: 'RefreshToken',
      tableName: 'refresh_tokens',
      timestamps: true,
      indexes: [
         {
            fields: ['token']
         },
         {
            fields: ['userId']
         },
         {
            fields: ['expiresAt']
         },
         {
            fields: ['isActive']
         }
      ]
   });

   return RefreshToken;
};
