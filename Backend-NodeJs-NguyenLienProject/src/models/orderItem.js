'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class OrderItem extends Model {
      static associate(models) {
         OrderItem.belongsTo(models.Order, {
            foreignKey: 'orderId',
            as: 'order'
         });
         OrderItem.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'product'
         });
      }
   }
   OrderItem.init({
      orderId: DataTypes.INTEGER,
      productId: DataTypes.INTEGER,
      productName: DataTypes.STRING,
      priceAtOrder: DataTypes.FLOAT,
      quantity: DataTypes.INTEGER,
      total: DataTypes.FLOAT
   }, {
      sequelize,
      modelName: 'OrderItem',
   });
   return OrderItem;
};
