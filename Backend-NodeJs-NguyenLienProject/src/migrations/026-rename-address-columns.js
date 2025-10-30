'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Rename fullName to receiverName
        await queryInterface.renameColumn('Addresses', 'fullName', 'receiverName');

        // Rename phoneNumber to receiverPhone
        await queryInterface.renameColumn('Addresses', 'phoneNumber', 'receiverPhone');
    },

    async down(queryInterface, Sequelize) {
        // Rollback: rename back to original names
        await queryInterface.renameColumn('Addresses', 'receiverName', 'fullName');
        await queryInterface.renameColumn('Addresses', 'receiverPhone', 'phoneNumber');
    }
};

