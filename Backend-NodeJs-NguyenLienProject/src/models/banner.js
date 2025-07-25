'use strict';
const {
   Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
   class Banner extends Model {
      static associate(models) {
         // Định nghĩa các association nếu có (Ví dụ: liên kết với bảng khác)
      }
   }

   Banner.init({
      imageUrl: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      title: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      subtitle: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      link: {
         type: DataTypes.STRING,
         allowNull: true,  // Tuỳ chọn, nếu có đường link dẫn đến trang khác
      },
      isActive: {
         type: DataTypes.BOOLEAN,
         defaultValue: true, // Banner có thể ẩn đi
      },
      order: {
         type: DataTypes.INTEGER,
         defaultValue: 0,  // Thứ tự hiển thị
      }
   }, {
      sequelize,
      modelName: 'Banner',
   });

   return Banner;
};
