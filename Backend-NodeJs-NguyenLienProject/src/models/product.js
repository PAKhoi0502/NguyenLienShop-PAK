'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Product extends Model {
      static associate(models) {
         Product.belongsToMany(models.Category, {
            through: 'ProductCategory',
            foreignKey: 'productId',
            otherKey: 'categoryId',
            as: 'categories'
         });

         Product.hasMany(models.ProductImage, { foreignKey: 'productId', as: 'images' });
         Product.hasMany(models.Review, { foreignKey: 'productId', as: 'reviews' });
         Product.hasMany(models.OrderItem, { foreignKey: 'productId', as: 'orderItems' });
         Product.hasMany(models.CartItem, { foreignKey: 'productId', as: 'cartItems' });

         Product.belongsToMany(models.User, {
            through: 'Wishlist',
            foreignKey: 'productId',
            otherKey: 'userId',
            as: 'wishlistedBy'
         });

         Product.belongsToMany(models.DiscountCode, {
            through: 'ProductDiscount',
            foreignKey: 'productId',
            otherKey: 'discountCodeId',
            as: 'discounts'
         });
      }
   }

   Product.init({
      nameProduct: DataTypes.STRING,
      description: DataTypes.TEXT,
      price: DataTypes.FLOAT,
      discountPrice: DataTypes.FLOAT,
      dimensions: DataTypes.STRING,
      slug: DataTypes.STRING,
      stock: DataTypes.INTEGER,
      isNew: {
         type: DataTypes.BOOLEAN,
         defaultValue: false
      },
      isBestSeller: {
         type: DataTypes.BOOLEAN,
         defaultValue: false
      },
      isActive: {
         type: DataTypes.BOOLEAN,
         defaultValue: false
      }
   }, {
      sequelize,
      modelName: 'Product',
   });

   return Product;
};
