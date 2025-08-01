'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Cart extends Model {
      static associate(models) {
         // Mỗi Cart thuộc về 1 User
         Cart.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
         });

         // Một Cart có nhiều CartItem
         Cart.hasMany(models.CartItem, {
            foreignKey: 'cartId',
            as: 'items',
            onDelete: 'CASCADE'
         });

         // Một Cart có thể gắn với một mã giảm giá
         Cart.belongsTo(models.DiscountCode, {
            foreignKey: 'discountCodeId',
            as: 'discount'
         });
      }
   }

   Cart.init({
      userId: {
         type: DataTypes.INTEGER,
         allowNull: true // Cho phép null nếu là khách chưa đăng nhập
      },
      sessionKey: {
         type: DataTypes.STRING,
         allowNull: true // Giỏ hàng tạm chưa login
      },
      discountCodeId: {
         type: DataTypes.INTEGER,
         allowNull: true
      },
      status: {
         type: DataTypes.STRING,
         defaultValue: 'active' // active | saved | checked_out | expired
      }
   }, {
      sequelize,
      modelName: 'Cart',
   });

   return Cart;
};
