'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Thêm cột 'applicationType' - Phạm vi áp dụng
        await queryInterface.addColumn('DiscountCodes', 'applicationType', {
            type: Sequelize.ENUM('order', 'product', 'shipping'),
            allowNull: false,
            defaultValue: 'order',
            after: 'discountValue',
            comment: 'order: giảm tổng đơn, product: giảm sản phẩm, shipping: freeship'
        });

        // 2. Thêm cột 'conditionType' - Loại điều kiện
        await queryInterface.addColumn('DiscountCodes', 'conditionType', {
            type: Sequelize.ENUM(
                'none',
                'first_order',
                'location',
                'user_segment',
                'min_items',
                'specific_category',
                'payment_method'
            ),
            allowNull: false,
            defaultValue: 'none',
            after: 'applicationType',
            comment: 'Loại điều kiện áp dụng voucher'
        });

        // 3. Thêm cột 'conditionValue' - Chi tiết điều kiện (JSON)
        await queryInterface.addColumn('DiscountCodes', 'conditionValue', {
            type: Sequelize.JSON,
            allowNull: true,
            after: 'conditionType',
            comment: 'Chi tiết điều kiện dạng JSON'
        });

        // 4. Thêm cột 'maxDiscountAmount' - Giảm tối đa
        await queryInterface.addColumn('DiscountCodes', 'maxDiscountAmount', {
            type: Sequelize.FLOAT,
            allowNull: true,
            after: 'conditionValue',
            comment: 'Giảm tối đa bao nhiêu (VD: giảm 20% nhưng max 50k)'
        });
    },

    async down(queryInterface, Sequelize) {
        // Rollback: xóa các cột đã thêm
        await queryInterface.removeColumn('DiscountCodes', 'applicationType');
        await queryInterface.removeColumn('DiscountCodes', 'conditionType');
        await queryInterface.removeColumn('DiscountCodes', 'conditionValue');
        await queryInterface.removeColumn('DiscountCodes', 'maxDiscountAmount');
    }
};

