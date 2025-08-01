'use strict';
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('Addresses', {
         id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
         },
         userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
               model: 'Users', // Tên bảng (chữ U hoa)
               key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
         },
         fullName: {
            type: Sequelize.STRING
         },
         phoneNumber: {
            type: Sequelize.STRING
         },
         addressLine1: {
            type: Sequelize.STRING
         },
         addressLine2: {
            type: Sequelize.STRING
         },
         city: {
            type: Sequelize.STRING
         },
         district: {
            type: Sequelize.STRING
         },
         ward: {
            type: Sequelize.STRING
         },
         isDefault: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
         },
         createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
         },
         updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
         }
      });
   },

   async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('Addresses');
   }
};
