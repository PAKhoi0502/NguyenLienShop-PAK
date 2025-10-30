import discountCodeService from '../services/discountCodeService.js';
import dotenv from 'dotenv';
dotenv.config();

// ==================== ADMIN ENDPOINTS ====================

/**
 * Lấy danh sách tất cả vouchers (Admin)
 */
let handleGetAllDiscountCodes = async (req, res) => {
    try {
        const result = await discountCodeService.getAllDiscountCodes(req.query);
        return res.status(200).json(result);
    } catch (err) {
        console.error('Error in handleGetAllDiscountCodes:', err.message, err.stack);
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server' });
    }
};

/**
 * Lấy chi tiết voucher theo ID (Admin)
 */
let handleGetDiscountCodeById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ errCode: 1, errMessage: 'ID voucher là bắt buộc' });
        }

        const result = await discountCodeService.getDiscountCodeById(id);

        if (result.errCode !== 0) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (err) {
        console.error('Error in handleGetDiscountCodeById:', err.message, err.stack);
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server' });
    }
};

/**
 * Tạo voucher mới (Admin)
 */
let handleCreateDiscountCode = async (req, res) => {
    try {
        const result = await discountCodeService.createDiscountCode(req.body);

        if (result.errCode !== 0) {
            return res.status(400).json(result);
        }

        return res.status(201).json(result);
    } catch (err) {
        console.error('Error in handleCreateDiscountCode:', err.message, err.stack);
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server: ' + err.message });
    }
};

/**
 * Cập nhật voucher (Admin)
 */
let handleUpdateDiscountCode = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ errCode: 1, errMessage: 'ID voucher là bắt buộc' });
        }

        const result = await discountCodeService.updateDiscountCode(id, req.body);

        if (result.errCode !== 0) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (err) {
        console.error('Error in handleUpdateDiscountCode:', err.message, err.stack);
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server: ' + err.message });
    }
};

/**
 * Xóa voucher (Admin)
 */
let handleDeleteDiscountCode = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ errCode: 1, errMessage: 'ID voucher là bắt buộc' });
        }

        const result = await discountCodeService.deleteDiscountCode(id);

        if (result.errCode !== 0) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (err) {
        console.error('Error in handleDeleteDiscountCode:', err.message, err.stack);
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server' });
    }
};

/**
 * Bật/tắt trạng thái voucher (Admin)
 */
let handleToggleActiveStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ errCode: 1, errMessage: 'ID voucher là bắt buộc' });
        }

        const result = await discountCodeService.toggleActiveStatus(id);

        if (result.errCode !== 0) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (err) {
        console.error('Error in handleToggleActiveStatus:', err.message, err.stack);
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server' });
    }
};

// ==================== USER ENDPOINTS ====================

/**
 * User claim/lưu voucher
 */
let handleClaimVoucher = async (req, res) => {
    try {
        const userId = req.user.id;
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ errCode: 1, errMessage: 'Mã voucher là bắt buộc' });
        }

        const result = await discountCodeService.claimVoucher(userId, code);

        if (result.errCode !== 0) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (err) {
        console.error('Error in handleClaimVoucher:', err.message, err.stack);
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server' });
    }
};

/**
 * Lấy danh sách voucher public chưa claim
 */
let handleGetAvailableVouchers = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await discountCodeService.getAvailableVouchers(userId);

        return res.status(200).json(result);
    } catch (err) {
        console.error('Error in handleGetAvailableVouchers:', err.message, err.stack);
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server' });
    }
};

/**
 * Lấy kho voucher của tôi
 */
let handleGetMyVouchers = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await discountCodeService.getMyVouchers(userId);

        return res.status(200).json(result);
    } catch (err) {
        console.error('Error in handleGetMyVouchers:', err.message, err.stack);
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server' });
    }
};

/**
 * Validate voucher trước khi checkout
 */
let handleValidateVoucher = async (req, res) => {
    try {
        const userId = req.user.id;
        const { code, orderData } = req.body;

        if (!code || !orderData) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Thiếu thông tin voucher hoặc đơn hàng'
            });
        }

        const result = await discountCodeService.validateVoucher(userId, code, orderData);

        if (!result.valid) {
            return res.status(400).json({
                errCode: 2,
                errMessage: result.error
            });
        }

        return res.status(200).json({
            errCode: 0,
            errMessage: 'Voucher hợp lệ',
            ...result
        });
    } catch (err) {
        console.error('Error in handleValidateVoucher:', err.message, err.stack);
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server' });
    }
};

/**
 * Áp dụng voucher khi đặt hàng
 */
let handleApplyVoucher = async (req, res) => {
    try {
        const userId = req.user.id;
        const { code, orderId } = req.body;

        if (!code || !orderId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Thiếu thông tin voucher hoặc đơn hàng'
            });
        }

        const result = await discountCodeService.applyVoucher(userId, code, orderId);

        if (result.errCode !== 0) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (err) {
        console.error('Error in handleApplyVoucher:', err.message, err.stack);
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server' });
    }
};

// ==================== PUBLIC ENDPOINTS ====================

/**
 * Lấy danh sách voucher công khai (không cần login)
 */
let handleGetPublicVouchers = async (req, res) => {
    try {
        const result = await discountCodeService.getAllDiscountCodes({
            isPublic: 'true',
            isActive: 'true'
        });

        return res.status(200).json(result);
    } catch (err) {
        console.error('Error in handleGetPublicVouchers:', err.message, err.stack);
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server' });
    }
};

export default {
    // Admin
    handleGetAllDiscountCodes,
    handleGetDiscountCodeById,
    handleCreateDiscountCode,
    handleUpdateDiscountCode,
    handleDeleteDiscountCode,
    handleToggleActiveStatus,

    // User
    handleClaimVoucher,
    handleGetAvailableVouchers,
    handleGetMyVouchers,
    handleValidateVoucher,
    handleApplyVoucher,

    // Public
    handleGetPublicVouchers
};

