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
      allowNull: false,
      comment: 'percent: giảm theo %, amount: giảm số tiền cố định'
    },
    discountValue: {
      type: DataTypes.FLOAT,
      allowNull: false
    },

    // ⭐ NEW FIELDS - Phạm vi & Điều kiện
    applicationType: {
      type: DataTypes.ENUM('order', 'product', 'shipping'),
      allowNull: false,
      defaultValue: 'order',
      comment: 'order: giảm tổng đơn, product: giảm sản phẩm, shipping: freeship'
    },
    conditionType: {
      type: DataTypes.ENUM(
        'none',
        'first_order',
        'location',
        'user_segment',
        'min_items',
        'specific_category',
        'payment_method'
      ),
      allowNull: false,
      defaultValue: 'none',
      comment: 'Loại điều kiện áp dụng voucher'
    },
    conditionValue: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Chi tiết điều kiện dạng JSON'
    },
    maxDiscountAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Giảm tối đa bao nhiêu (VD: giảm 20% nhưng max 50k)'
    },

    // EXISTING FIELDS
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
      defaultValue: 1 // Tổng số lần có thể claim/sử dụng trong hệ thống
    },
    usedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0 // Số lần đã được claim/sử dụng
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
