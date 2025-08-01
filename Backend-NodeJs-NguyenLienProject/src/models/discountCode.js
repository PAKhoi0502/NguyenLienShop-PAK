'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DiscountCode extends Model {
    static associate(models) {
      // Một mã giảm giá có thể dùng cho nhiều đơn hàng
      DiscountCode.hasMany(models.Order, {
        foreignKey: 'discountCodeId',
        as: 'orders'
      });

      // Một mã giảm giá có thể dùng cho nhiều sản phẩm (nếu áp dụng riêng từng sản phẩm)
      DiscountCode.belongsToMany(models.Product, {
        through: 'ProductDiscount',
        foreignKey: 'discountCodeId',
        otherKey: 'productId',
        as: 'products'
      });

      // Một mã giảm giá có thể áp dụng cho nhiều người dùng (dùng bảng UserDiscount để quản lý)
      DiscountCode.belongsToMany(models.User, {
        through: 'UserDiscount',
        foreignKey: 'discountCodeId',
        otherKey: 'userId',
        as: 'users'
      });
    }
  }
  DiscountCode.init({
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    discountType: {
      type: DataTypes.STRING, // 'percent' hoặc 'amount'
      allowNull: false
    },
    discountValue: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    minOrderValue: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true // true = dùng chung, false = mã cá nhân
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 1 // 1 = mã dùng 1 lần, lớn hơn 1 = dùng nhiều lần
    },
    usedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'DiscountCode',
  });
  return DiscountCode;
};
