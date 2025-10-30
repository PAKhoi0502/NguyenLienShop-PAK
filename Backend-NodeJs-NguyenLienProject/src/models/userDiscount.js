'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class UserDiscount extends Model {
      static associate(models) {
         UserDiscount.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
         });
         UserDiscount.belongsTo(models.DiscountCode, {
            foreignKey: 'discountCodeId',
            as: 'discount'
         });
      }

      // ⭐ Helper method: Kiểm tra voucher còn dùng được không
      canUse() {
         return this.status === 'active' && this.usedCount < this.usageLimit;
      }

      // ⭐ Helper method: Số lần còn lại
      remainingUses() {
         return Math.max(0, this.usageLimit - this.usedCount);
      }
   }

   UserDiscount.init({
      userId: {
         type: DataTypes.INTEGER,
         allowNull: false
      },
      discountCodeId: {
         type: DataTypes.INTEGER,
         allowNull: false
      },
      usageLimit: {
         type: DataTypes.INTEGER,
         allowNull: false,
         defaultValue: 1,
         comment: 'Số lần user này được dùng voucher'
      },
      usedCount: {
         type: DataTypes.INTEGER,
         allowNull: false,
         defaultValue: 0,
         comment: 'Số lần đã sử dụng'
      },
      collectedAt: {
         type: DataTypes.DATE,
         allowNull: true,
         comment: 'Thời điểm user claim voucher'
      },
      status: {
         type: DataTypes.ENUM('active', 'used_up', 'expired'),
         allowNull: false,
         defaultValue: 'active',
         comment: 'Trạng thái: active (còn dùng), used_up (hết lượt), expired (hết hạn)'
      }
   }, {
      sequelize,
      modelName: 'UserDiscount',
   });

   return UserDiscount;
};
