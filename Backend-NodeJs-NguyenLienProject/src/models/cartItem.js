'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class CartItem extends Model {
      static associate(models) {
         // CartItem thuộc về 1 User
         CartItem.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
         });

         // CartItem thuộc về 1 Product
         CartItem.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'product'
         });

         // CartItem thuộc về 1 Cart (nếu dùng bảng Cart riêng)
         CartItem.belongsTo(models.Cart, {
            foreignKey: 'cartId',
            as: 'cart'
         });
      }
   }
   CartItem.init({
      userId: {
         type: DataTypes.INTEGER,
         allowNull: false
      },
      productId: {
         type: DataTypes.INTEGER,
         allowNull: false
      },
      cartId: {
         type: DataTypes.INTEGER,
         allowNull: true // nếu dùng bảng Cart thì bật true
      },
      quantity: {
         type: DataTypes.INTEGER,
         allowNull: false,
         defaultValue: 1,
         validate: {
            min: 1
         }
      },
      priceAtAdd: {
         type: DataTypes.FLOAT,
         allowNull: false
      }
   }, {
      sequelize,
      modelName: 'CartItem',
   });
   return CartItem;
};
