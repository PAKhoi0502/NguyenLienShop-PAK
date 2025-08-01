'use strict';
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('CartItems', {
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
               model: 'Users',
               key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
         },
         productId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
               model: 'Products',
               key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
         },
         cartId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
               model: 'Carts',
               key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
         },
         quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1
         },
         priceAtAdd: {
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
      await queryInterface.dropTable('CartItems');
   }
};
