'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class ProductCategory extends Model {
      static associate(models) {
      }
   }

   ProductCategory.init({
      productId: {
         type: DataTypes.INTEGER,
         allowNull: false
      },
      categoryId: {
         type: DataTypes.INTEGER,
         allowNull: false
      }
   }, {
      sequelize,
      modelName: 'ProductCategory',
      tableName: 'ProductCategory' // bắt buộc để match với migration
   });

   return ProductCategory;
};
