'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Address extends Model {
      static associate(models) {
         Address.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
         });
      }
   }
   Address.init({
      userId: DataTypes.INTEGER,
      fullName: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      addressLine1: DataTypes.STRING,
      addressLine2: DataTypes.STRING,
      city: DataTypes.STRING,
      district: DataTypes.STRING,
      ward: DataTypes.STRING,
      isDefault: {
         type: DataTypes.BOOLEAN,
         defaultValue: false
      }
   }, {
      sequelize,
      modelName: 'Address',
   });
   return Address;
};
