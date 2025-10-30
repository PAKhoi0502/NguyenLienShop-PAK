'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: 'roleId', targetKey: 'id' });

      // 🔗 Relationship with Address (Sổ địa chỉ giao hàng)
      User.hasMany(models.Address, {
        foreignKey: 'userId',
        as: 'addresses'
      });

      // 🔗 Relationship with RefreshToken
      User.hasMany(models.RefreshToken, {
        foreignKey: 'userId',
        as: 'refreshTokens'
      });

      // 🔗 Relationship with PasswordResetToken
      User.hasMany(models.PasswordResetToken, {
        foreignKey: 'userId',
        as: 'passwordResetTokens'
      });
    }
  }
  User.init({
    userName: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    fullName: DataTypes.STRING,
    gender: DataTypes.STRING,
    birthday: DataTypes.DATEONLY,
    roleId: DataTypes.INTEGER,
    slug: DataTypes.STRING,
    avatar: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};