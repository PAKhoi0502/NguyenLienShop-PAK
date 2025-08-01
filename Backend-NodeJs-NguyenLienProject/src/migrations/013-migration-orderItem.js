'use strict';
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('OrderItems', {
         id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
         },
         orderId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
               model: 'orders',
               key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
         },
         productId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
               model: 'products',
               key: 'id'
            },
            onUpdate: 'CASCADE'
         },
         productName: {
            type: Sequelize.STRING,
            allowNull: false
         },
         priceAtOrder: {
            type: Sequelize.FLOAT,
            allowNull: false
         },
         quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1
         },
         total: {
            type: Sequelize.FLOAT,
            allowNull: false
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
      await queryInterface.dropTable('OrderItems');
   }
};
