'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Review extends Model {
      static associate(models) {
         // Review thuộc về 1 User
         Review.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
         });

         // Review thuộc về 1 Product
         Review.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'product'
         });
      }
   }
   Review.init({
      userId: {
         type: DataTypes.INTEGER,
         allowNull: false
      },
      productId: {
         type: DataTypes.INTEGER,
         allowNull: false
      },
      comment: {
         type: DataTypes.TEXT,
         allowNull: true
      },
      rating: {
         type: DataTypes.INTEGER,
         allowNull: false,
         validate: {
            min: 1,
            max: 5
         }
      }
   }, {
      sequelize,
      modelName: 'Review',
   });
   return Review;
};
