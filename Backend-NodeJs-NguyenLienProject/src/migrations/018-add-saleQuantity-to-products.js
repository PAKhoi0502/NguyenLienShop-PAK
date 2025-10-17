'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Products', 'saleQuantity', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: 'Số lượng trong 1 đơn vị bán (combo)'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Products', 'saleQuantity');
    }
};
