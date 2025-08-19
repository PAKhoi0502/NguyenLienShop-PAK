'use strict';
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('ProductCategory', {
         productId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
               model: 'Products',
               key: 'id'
            },
            onDelete: 'CASCADE'
         },
         categoryId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
               model: 'Categories',
               key: 'id'
            },
            onDelete: 'CASCADE'
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
      await queryInterface.dropTable('ProductCategory');
   }
};
