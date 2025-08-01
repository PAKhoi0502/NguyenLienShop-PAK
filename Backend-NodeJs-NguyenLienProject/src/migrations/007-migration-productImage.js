'use strict';
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('ProductImages', {
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
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
         },
         imageUrl: {
            type: Sequelize.STRING,
            allowNull: false
         },
         isThumbnail: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
         },
         isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
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
      await queryInterface.dropTable('ProductImages');
   }
};
