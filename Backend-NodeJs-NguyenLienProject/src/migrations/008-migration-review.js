'use strict';
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('Reviews', {
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
         comment: {
            type: Sequelize.TEXT,
            allowNull: true
         },
         rating: {
            type: Sequelize.INTEGER,
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
      await queryInterface.dropTable('Reviews');
   }
};
