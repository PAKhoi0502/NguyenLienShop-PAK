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
            type: Sequelize.STRING,
            allowNull: false
         },
         description: {
            type: Sequelize.TEXT,
            allowNull: true
         },
         price: {
            type: Sequelize.FLOAT,
            allowNull: false
         },
         discountPrice: {
            type: Sequelize.FLOAT,
            allowNull: true
         },
         dimensions: {
            type: Sequelize.STRING,
            allowNull: true
         },
         slug: {
            type: Sequelize.STRING,
            allowNull: true
         },
         stock: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
         },
         categoryId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
               model: 'Categories',
               key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
         },
         isNew: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
         },
         isBestSeller: {
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
