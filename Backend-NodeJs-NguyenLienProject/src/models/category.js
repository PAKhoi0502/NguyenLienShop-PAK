'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Category extends Model {
      static associate(models) {
         // 1 Category có nhiều Product
         Category.hasMany(models.Product, {
            foreignKey: 'categoryId',
            as: 'products'
         });
      }
   }
   Category.init({
      nameCategory: {
         type: DataTypes.STRING,
         allowNull: false
      },
      slug: {
         type: DataTypes.STRING,
         allowNull: false,
         unique: true
      },
      description: {
         type: DataTypes.TEXT,
         allowNull: true
      },
      isActive: {
         type: DataTypes.BOOLEAN,
         defaultValue: true
      }
   }, {
      sequelize,
      modelName: 'Category',
   });
   return Category;
};
