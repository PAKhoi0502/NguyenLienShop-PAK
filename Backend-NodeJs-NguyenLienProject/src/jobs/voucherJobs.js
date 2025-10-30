import cron from 'node-cron';
import db from '../models/index.js';
import { Op } from 'sequelize';
import discountCodeService from '../services/discountCodeService.js';

console.log('🤖 Voucher Cronjobs initialized');

/**
 * 1. Auto expire user vouchers (chạy mỗi giờ)
 * Set status = 'expired' cho vouchers đã hết hạn
 */
cron.schedule('0 * * * *', async () => {
    try {
        console.log('🕐 [Cronjob] Checking expired vouchers...');

        const result = await db.UserDiscount.update(
            { status: 'expired' },
            {
                where: {
                    status: 'active'
                },
                include: [{
                    model: db.DiscountCode,
                    as: 'discount',
                    where: {
                        expiryDate: { [Op.lt]: new Date() }
                    }
                }]
            }
        );

        if (result[0] > 0) {
            console.log(`✅ [Cronjob] Expired ${result[0]} user vouchers`);
        }
    } catch (err) {
        console.error('❌ [Cronjob] Error expiring vouchers:', err);
    }
});

/**
 * 2. Auto deactivate expired discount codes (chạy mỗi ngày lúc 00:00)
 * Set isActive = false cho vouchers đã hết hạn
 */
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('🕛 [Cronjob] Deactivating expired vouchers...');

        const result = await db.DiscountCode.update(
            { isActive: false },
            {
                where: {
                    expiryDate: { [Op.lt]: new Date() },
                    isActive: true
                }
            }
        );

        if (result[0] > 0) {
            console.log(`✅ [Cronjob] Deactivated ${result[0]} expired vouchers`);
        }
    } catch (err) {
        console.error('❌ [Cronjob] Error deactivating vouchers:', err);
    }
});

/**
 * 3. Assign birthday vouchers (chạy ngày 1 hàng tháng lúc 00:00)
 * Gán voucher sinh nhật cho users có sinh nhật trong tháng
 */
cron.schedule('0 0 1 * *', async () => {
    try {
        console.log('🎂 [Cronjob] Assigning birthday vouchers...');
        await discountCodeService.autoAssignBirthdayVouchers();
        console.log('✅ [Cronjob] Birthday vouchers assigned');
    } catch (err) {
        console.error('❌ [Cronjob] Error assigning birthday vouchers:', err);
    }
});

/**
 * 4. Clean up old expired vouchers (chạy mỗi tuần vào Chủ nhật 02:00)
 * Xóa UserDiscounts đã expired quá 30 ngày
 */
cron.schedule('0 2 * * 0', async () => {
    try {
        console.log('🧹 [Cronjob] Cleaning up old expired vouchers...');

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await db.UserDiscount.destroy({
            where: {
                status: 'expired',
                updatedAt: { [Op.lt]: thirtyDaysAgo }
            }
        });

        if (result > 0) {
            console.log(`✅ [Cronjob] Cleaned up ${result} old expired vouchers`);
        }
    } catch (err) {
        console.error('❌ [Cronjob] Error cleaning up vouchers:', err);
    }
});

/**
 * Manual functions (có thể gọi từ admin panel)
 */
export const manualExpireVouchers = async () => {
    console.log('🔧 [Manual] Expiring vouchers...');
    // Same logic as cronjob 1
};

export const manualAssignBirthdayVouchers = async () => {
    console.log('🔧 [Manual] Assigning birthday vouchers...');
    await discountCodeService.autoAssignBirthdayVouchers();
};

export default {
    manualExpireVouchers,
    manualAssignBirthdayVouchers
};

