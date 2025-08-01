'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('Banners', {
         id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
         },
         imageUrl: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         title: {
            type: Sequelize.STRING,
         },
         subtitle: {
            type: Sequelize.STRING,
         },
         link: {
            type: Sequelize.STRING,
         },
         isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true, // Banner mặc định hiển thị
         },
         order: {
            type: Sequelize.INTEGER,
            defaultValue: 0,  // Mặc định thứ tự banner
         },
         createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
         },
         updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
         }
      });
   },

   async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('Banners');
   }
};
