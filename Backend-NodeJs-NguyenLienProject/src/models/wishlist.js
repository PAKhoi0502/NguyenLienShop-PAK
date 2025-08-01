'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Wishlist extends Model {
      static associate(models) {
         Wishlist.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
         Wishlist.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
      }
   }
   Wishlist.init({
      userId: DataTypes.INTEGER,
      productId: DataTypes.INTEGER
   }, {
      sequelize,
      modelName: 'Wishlist',
      timestamps: true // để có createdAt
   });
   return Wishlist;
};
