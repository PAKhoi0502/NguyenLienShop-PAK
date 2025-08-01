'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class ProductImage extends Model {
      static associate(models) {
         // Mỗi ProductImage thuộc về 1 Product
         ProductImage.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'product'
         });
      }
   }
   ProductImage.init({
      productId: {
         type: DataTypes.INTEGER,
         allowNull: false
      },
      imageUrl: {
         type: DataTypes.STRING,
         allowNull: false
      },
      isThumbnail: {
         type: DataTypes.BOOLEAN,
         defaultValue: false
      },
      isActive: {
         type: DataTypes.BOOLEAN,
         defaultValue: true
      }
   }, {
      sequelize,
      modelName: 'ProductImage',
   });
   return ProductImage;
};
