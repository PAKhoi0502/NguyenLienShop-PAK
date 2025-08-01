'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Order extends Model {
      static associate(models) {
         Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
         Order.belongsTo(models.DiscountCode, { foreignKey: 'discountCodeId', as: 'discount' });
         Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' });
      }
   }
   Order.init({
      userId: DataTypes.INTEGER,
      discountCodeId: DataTypes.INTEGER,
      totalPrice: DataTypes.FLOAT,
      paymentMethod: DataTypes.STRING,
      shippingAddress: DataTypes.TEXT,
      note: DataTypes.TEXT,
      status: {
         type: DataTypes.STRING,
         defaultValue: 'pending'
      }
   }, {
      sequelize,
      modelName: 'Order',
   });
   return Order;
};
