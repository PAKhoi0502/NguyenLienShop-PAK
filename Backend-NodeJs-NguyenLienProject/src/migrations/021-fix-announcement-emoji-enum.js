'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Sửa ENUM values cho icon column để hỗ trợ emoji đúng cách
        await queryInterface.changeColumn('Announcements', 'icon', {
            type: Sequelize.ENUM('📢', 'ℹ️', '✅', '⚠️', '🎉', '🔧', '🚀', '🎁', '💰', '❌'),
            allowNull: false,
            defaultValue: '📢'
        });
        
        console.log('✅ Fixed announcement icon ENUM values for proper emoji support');
    },

    async down(queryInterface, Sequelize) {
        // Rollback về ENUM cũ (nếu cần)
        await queryInterface.changeColumn('Announcements', 'icon', {
            type: Sequelize.ENUM('📢', 'ℹ️', '✅', '⚠️', '🎉', '🔧', '🚀', '🎁', '💰', '❌'),
            allowNull: false,
            defaultValue: '📢'
        });
    }
};

