'use strict';
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('Products', {
         id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
         },
         nameProduct: {
            type: Sequelize.STRING
         },
         description: {
            type: Sequelize.TEXT
         },
         price: {
            type: Sequelize.FLOAT
         },
         discountPrice: {
            type: Sequelize.FLOAT
         },
         dimensions: {
            type: Sequelize.STRING
         },
         slug: {
            type: Sequelize.STRING
         },
         stock: {
            type: Sequelize.INTEGER
         },
         isNew: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
         },
         isBestSeller: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
         },
         isActive: {
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
      await queryInterface.dropTable('Products');
   }
};
