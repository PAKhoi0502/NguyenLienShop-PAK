'use strict';
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('Orders', {
         id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
         },
         userId: {
            type: Sequelize.INTEGER,
            references: {
               model: 'Users',
               key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
         },
         discountCodeId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
               model: 'DiscountCodes',
               key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
         },
         totalPrice: {
            type: Sequelize.FLOAT,
            allowNull: false
         },
         paymentMethod: {
            type: Sequelize.STRING,
            allowNull: false
         },
         shippingAddress: {
            type: Sequelize.TEXT,
            allowNull: true
         },
         note: {
            type: Sequelize.TEXT,
            allowNull: true
         },
         status: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'pending'
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
      await queryInterface.dropTable('Orders');
   }
};
