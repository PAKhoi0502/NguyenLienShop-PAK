'use strict';

module.exports = {
   up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('refresh_tokens', {
         id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
         },
         token: {
            type: Sequelize.TEXT,
            allowNull: false,
            unique: true
         },
         userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
               model: 'users',
               key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
         },
         deviceInfo: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Browser/Device information for tracking sessions'
         },
         ipAddress: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'IP address for security tracking'
         },
         isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false
         },
         expiresAt: {
            type: Sequelize.DATE,
            allowNull: false
         },
         lastUsedAt: {
            type: Sequelize.DATE,
            allowNull: true
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

      // Add indexes for performance
      await queryInterface.addIndex('refresh_tokens', ['token']);
      await queryInterface.addIndex('refresh_tokens', ['userId']);
      await queryInterface.addIndex('refresh_tokens', ['expiresAt']);
      await queryInterface.addIndex('refresh_tokens', ['isActive']);
   },

   down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('refresh_tokens');
   }
};
