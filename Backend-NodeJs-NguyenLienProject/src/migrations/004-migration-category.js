'use strict';
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('Categories', {
         id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
         },
         nameCategory: {
            type: Sequelize.STRING,
            allowNull: false
         },
         slug: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
         },
         description: {
            type: Sequelize.TEXT,
            allowNull: true
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
      await queryInterface.dropTable('Categories');
   }
};
