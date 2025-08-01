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
   }
   UserDiscount.init({
      userId: DataTypes.INTEGER,
      discountCodeId: DataTypes.INTEGER,
      used: {
         type: DataTypes.BOOLEAN,
         defaultValue: false
      }
   }, {
      sequelize,
      modelName: 'UserDiscount',
   });
   return UserDiscount;
};
