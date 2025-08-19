'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Category extends Model {
      static associate(models) {
         Category.belongsToMany(models.Product, {
            through: 'ProductCategory',
            foreignKey: 'categoryId',
            otherKey: 'productId',
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
         defaultValue: false
      }
   }, {
      sequelize,
      modelName: 'Category',
   });

   return Category;
};
