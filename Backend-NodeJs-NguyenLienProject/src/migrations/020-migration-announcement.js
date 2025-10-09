'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Announcements', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            icon: {
                type: Sequelize.ENUM('📢', 'ℹ️', '✅', '⚠️', '🎉', '🔧', '🚀', '🎁', '💰', '❌'),
                allowNull: false,
                defaultValue: '📢'
            },
            type: {
                type: Sequelize.ENUM('info', 'warning', 'success', 'error'),
                allowNull: false,
                defaultValue: 'info'
            },
            priority: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            startDate: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            endDate: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            isDismissible: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            backgroundColor: {
                type: Sequelize.STRING(7),
                allowNull: false,
                defaultValue: '#3b82f6'
            },
            textColor: {
                type: Sequelize.STRING(7),
                allowNull: false,
                defaultValue: '#ffffff'
            },
            position: {
                type: Sequelize.ENUM('top', 'bottom'),
                allowNull: false,
                defaultValue: 'top'
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
        await queryInterface.dropTable('Announcements');
    }
};
