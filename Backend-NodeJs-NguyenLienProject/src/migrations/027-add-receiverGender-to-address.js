'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Add receiverGender column to Addresses table
        await queryInterface.addColumn('Addresses', 'receiverGender', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'receiverPhone' // Đặt sau receiverPhone
        });
    },

    async down(queryInterface, Sequelize) {
        // Remove receiverGender column
        await queryInterface.removeColumn('Addresses', 'receiverGender');
    }
};

