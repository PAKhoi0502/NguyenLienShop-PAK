'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Xóa cột 'used' cũ (boolean)
        await queryInterface.removeColumn('UserDiscounts', 'used');

        // 2. Thêm cột 'usageLimit' - Số lần user này được dùng voucher
        await queryInterface.addColumn('UserDiscounts', 'usageLimit', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: 'Số lần user này được dùng voucher'
        });

        // 3. Thêm cột 'usedCount' - Số lần đã sử dụng
        await queryInterface.addColumn('UserDiscounts', 'usedCount', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Số lần đã sử dụng'
        });

        // 4. Thêm cột 'collectedAt' - Thời điểm user claim voucher
        await queryInterface.addColumn('UserDiscounts', 'collectedAt', {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'Thời điểm user claim voucher'
        });

        // 5. Thêm cột 'status' - Trạng thái voucher
        await queryInterface.addColumn('UserDiscounts', 'status', {
            type: Sequelize.ENUM('active', 'used_up', 'expired'),
            allowNull: false,
            defaultValue: 'active',
            comment: 'Trạng thái: active (còn dùng), used_up (hết lượt), expired (hết hạn)'
        });
    },

    async down(queryInterface, Sequelize) {
        // Rollback: xóa các cột mới và khôi phục cột cũ
        await queryInterface.removeColumn('UserDiscounts', 'usageLimit');
        await queryInterface.removeColumn('UserDiscounts', 'usedCount');
        await queryInterface.removeColumn('UserDiscounts', 'collectedAt');
        await queryInterface.removeColumn('UserDiscounts', 'status');

        await queryInterface.addColumn('UserDiscounts', 'used', {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        });
    }
};

