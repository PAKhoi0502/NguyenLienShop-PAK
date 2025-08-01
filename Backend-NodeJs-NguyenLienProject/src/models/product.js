'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Product extends Model {
      static associate(models) {
         // 1 Product thuộc 1 Category
         Product.belongsTo(models.Category, {
            foreignKey: 'categoryId',
            as: 'category'
         });

         // 1 Product có nhiều hình ảnh
         Product.hasMany(models.ProductImage, {
            foreignKey: 'productId',
            as: 'images'
         });

         // 1 Product có nhiều review
         Product.hasMany(models.Review, {
            foreignKey: 'productId',
            as: 'reviews'
         });

         // 1 Product xuất hiện trong nhiều OrderItem
         Product.hasMany(models.OrderItem, {
            foreignKey: 'productId',
            as: 'orderItems'
         });

         // 1 Product có thể được thêm vào nhiều CartItem
         Product.hasMany(models.CartItem, {
            foreignKey: 'productId',
            as: 'cartItems'
         });

         // Wishlist: many-to-many giữa Product và User
         Product.belongsToMany(models.User, {
            through: 'Wishlist',
            foreignKey: 'productId',
            otherKey: 'userId',
            as: 'wishlistedBy'
         });

         // Voucher (DiscountCode): nếu 1 voucher áp dụng cho nhiều sản phẩm
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
      categoryId: DataTypes.INTEGER,
      isNew: DataTypes.BOOLEAN,
      isBestSeller: DataTypes.BOOLEAN
   }, {
      sequelize,
      modelName: 'Product',
   });
   return Product;
};
