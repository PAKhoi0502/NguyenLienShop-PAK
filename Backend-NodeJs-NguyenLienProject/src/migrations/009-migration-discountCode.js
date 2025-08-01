'use strict';
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('DiscountCodes', {
         id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
         },
         code: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
         },
         discountType: {
            type: Sequelize.STRING,
            allowNull: false
         },
         discountValue: {
            type: Sequelize.FLOAT,
            allowNull: false
         },
         minOrderValue: {
            type: Sequelize.FLOAT,
            defaultValue: 0
         },
         expiryDate: {
            type: Sequelize.DATE,
            allowNull: true
         },
         isPublic: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
         },
         usageLimit: {
            type: Sequelize.INTEGER,
            defaultValue: 1
         },
         usedCount: {
            type: Sequelize.INTEGER,
            defaultValue: 0
         },
         isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
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
      await queryInterface.dropTable('DiscountCodes');
   }
};
