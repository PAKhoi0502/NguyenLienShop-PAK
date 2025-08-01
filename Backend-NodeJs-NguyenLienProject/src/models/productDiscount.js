'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class ProductDiscount extends Model {
      static associate(models) {
         ProductDiscount.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'product'
         });

         ProductDiscount.belongsTo(models.DiscountCode, {
            foreignKey: 'discountCodeId',
            as: 'discount'
         });
      }
   }

   ProductDiscount.init({
      productId: {
         type: DataTypes.INTEGER,
         allowNull: false
      },
      discountCodeId: {
         type: DataTypes.INTEGER,
         allowNull: false
      }
   }, {
      sequelize,
      modelName: 'ProductDiscount',
      timestamps: true
   });

   return ProductDiscount;
};
