'use strict';
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('ProductDiscounts', {
         id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
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
         discountCodeId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
               model: 'DiscountCodes',
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

      // Optional: ngăn chặn trùng lặp mã giảm giá cho cùng 1 sản phẩm
      await queryInterface.addConstraint('ProductDiscounts', {
         fields: ['productId', 'discountCodeId'],
         type: 'unique',
         name: 'unique_discount_per_product'
      });
   },

   async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('ProductDiscounts');
   }
};
