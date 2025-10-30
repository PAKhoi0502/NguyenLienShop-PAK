'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add targetEmail column for email update feature
        await queryInterface.addColumn('password_reset_tokens', 'targetEmail', {
            type: Sequelize.STRING(255),
            allowNull: true,
            comment: 'Target email address for email update requests (separate from phoneNumber)'
        });

        console.log('✅ Added targetEmail column to password_reset_tokens table');
    },

    down: async (queryInterface, Sequelize) => {
        // Remove targetEmail column
        await queryInterface.removeColumn('password_reset_tokens', 'targetEmail');

        console.log('⬇️ Removed targetEmail column from password_reset_tokens table');
    }
};

