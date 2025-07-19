'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('Users', {
         id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
         },
         userName: {
            type: Sequelize.STRING
         },
         password: {
            type: Sequelize.STRING
         },
         email: {
            type: Sequelize.STRING
         },
         phoneNumber: {
            type: Sequelize.STRING
         },
         fullName: {
            type: Sequelize.STRING
         },
         birthday: {
            type: Sequelize.DATEONLY
         },
         gender: {
            type: Sequelize.STRING
         },
         roleId: {
            type: Sequelize.INTEGER,
            references: {
               model: 'Roles',
               key: 'id'
            }
         },
         slug: {
            type: Sequelize.STRING
         },
         createdAt: {
            allowNull: false,
            type: Sequelize.DATE
         },
         updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
         }
      });
   },
   async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('Users');
   }
};