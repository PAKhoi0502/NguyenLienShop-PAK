'use strict';
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('Carts', {
         id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
         },
         userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
               model: 'Users',
               key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
         },
         sessionKey: {
            type: Sequelize.STRING,
            allowNull: true
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
         status: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'active'
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
      await queryInterface.dropTable('Carts');
   }
};
