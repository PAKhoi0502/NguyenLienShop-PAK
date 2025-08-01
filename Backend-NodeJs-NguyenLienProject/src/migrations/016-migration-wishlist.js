'use strict';
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('Wishlists', {
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
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
         },
         productId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
               model: 'Products',
               key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
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

      // Optional: tránh trùng sản phẩm trong wishlist của cùng 1 user
      await queryInterface.addConstraint('Wishlists', {
         fields: ['userId', 'productId'],
         type: 'unique',
         name: 'unique_wishlist_per_user_product'
      });
   },

   async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('Wishlists');
   }
};
