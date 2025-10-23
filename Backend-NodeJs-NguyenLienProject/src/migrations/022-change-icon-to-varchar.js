'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Change icon column from ENUM to VARCHAR to properly support emojis
        await queryInterface.changeColumn('Announcements', 'icon', {
            type: Sequelize.STRING(10),
            allowNull: false,
            defaultValue: '📢',
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci'
        });

        console.log('✅ Changed icon column from ENUM to VARCHAR for proper emoji support');
    },

    async down(queryInterface, Sequelize) {
        // Rollback to ENUM (if needed)
        await queryInterface.changeColumn('Announcements', 'icon', {
            type: Sequelize.ENUM('📢', 'ℹ️', '✅', '⚠️', '🎉', '🔧', '🚀', '🎁', '💰', '❌'),
            allowNull: false,
            defaultValue: '📢'
        });
    }
};
