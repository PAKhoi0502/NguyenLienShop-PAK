import db from '../models/index.js';
import { Op } from 'sequelize';

// ==================== ADMIN CRUD ====================

/**
 * Tạo discount code mới
 */
let createDiscountCode = async (data) => {
    try {
        const {
            code, discountType, discountValue, applicationType, conditionType,
            conditionValue, maxDiscountAmount, minOrderValue, expiryDate,
            isPublic, usageLimit, isActive
        } = data;

        // Validate
        if (!code || !discountType || !discountValue) {
            return { errCode: 1, errMessage: 'Thiếu thông tin bắt buộc' };
        }

        // Check code đã tồn tại chưa
        const existingCode = await db.DiscountCode.findOne({ where: { code } });
        if (existingCode) {
            return { errCode: 2, errMessage: 'Mã voucher đã tồn tại' };
        }

        // Tạo voucher
        const voucher = await db.DiscountCode.create({
            code,
            discountType,
            discountValue,
            applicationType: applicationType || 'order',
            conditionType: conditionType || 'none',
            conditionValue: conditionValue || null,
            maxDiscountAmount: maxDiscountAmount || null,
            minOrderValue: minOrderValue || 0,
            expiryDate: expiryDate || null,
            isPublic: isPublic !== undefined ? isPublic : true,
            usageLimit: usageLimit || 1,
            usedCount: 0,
            isActive: isActive !== undefined ? isActive : true
        });

        return {
            errCode: 0,
            errMessage: 'Tạo voucher thành công',
            voucher
        };
    } catch (err) {
        console.error('Error in createDiscountCode:', err);
        throw new Error('Lỗi khi tạo voucher');
    }
};

/**
 * Lấy danh sách tất cả vouchers
 */
let getAllDiscountCodes = async (filters = {}) => {
    try {
        const { isActive, isPublic, applicationType, conditionType } = filters;

        const whereClause = {};
        if (isActive !== undefined) whereClause.isActive = isActive === 'true';
        if (isPublic !== undefined) whereClause.isPublic = isPublic === 'true';
        if (applicationType) whereClause.applicationType = applicationType;
        if (conditionType) whereClause.conditionType = conditionType;

        const vouchers = await db.DiscountCode.findAll({
            where: whereClause,
            include: [
                {
                    model: db.Product,
                    as: 'products',
                    through: { attributes: [] }
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return {
            errCode: 0,
            errMessage: 'Lấy danh sách voucher thành công',
            vouchers
        };
    } catch (err) {
        console.error('Error in getAllDiscountCodes:', err);
        throw new Error('Lỗi khi lấy danh sách voucher');
    }
};

/**
 * Lấy chi tiết voucher theo ID
 */
let getDiscountCodeById = async (id) => {
    try {
        const voucher = await db.DiscountCode.findByPk(id, {
            include: [
                {
                    model: db.Product,
                    as: 'products',
                    through: { attributes: [] }
                },
                {
                    model: db.User,
                    as: 'users',
                    through: {
                        attributes: ['usageLimit', 'usedCount', 'collectedAt', 'status']
                    },
                    attributes: ['id', 'userName', 'email', 'fullName']
                }
            ]
        });

        if (!voucher) {
            return { errCode: 1, errMessage: 'Không tìm thấy voucher' };
        }

        return {
            errCode: 0,
            errMessage: 'Lấy thông tin voucher thành công',
            voucher
        };
    } catch (err) {
        console.error('Error in getDiscountCodeById:', err);
        throw new Error('Lỗi khi lấy thông tin voucher');
    }
};

/**
 * Cập nhật voucher
 */
let updateDiscountCode = async (id, data) => {
    try {
        const voucher = await db.DiscountCode.findByPk(id);
        if (!voucher) {
            return { errCode: 1, errMessage: 'Voucher không tồn tại' };
        }

        // Nếu voucher đang active và có user đang dùng, cẩn thận khi update
        if (voucher.isActive && voucher.usedCount > 0) {
            const sensitiveFields = ['discountType', 'discountValue', 'applicationType'];
            const hasChangedSensitiveFields = sensitiveFields.some(field =>
                data[field] !== undefined && data[field] !== voucher[field]
            );

            if (hasChangedSensitiveFields) {
                return {
                    errCode: 2,
                    errMessage: 'Không thể thay đổi thông tin nhạy cảm của voucher đang được sử dụng'
                };
            }
        }

        // Update
        await voucher.update(data);

        return {
            errCode: 0,
            errMessage: 'Cập nhật voucher thành công',
            voucher
        };
    } catch (err) {
        console.error('Error in updateDiscountCode:', err);
        throw new Error('Lỗi khi cập nhật voucher');
    }
};

/**
 * Xóa voucher
 */
let deleteDiscountCode = async (id) => {
    try {
        const voucher = await db.DiscountCode.findByPk(id);
        if (!voucher) {
            return { errCode: 1, errMessage: 'Voucher không tồn tại' };
        }

        // Kiểm tra có đơn hàng đã dùng voucher này chưa
        const orderCount = await db.Order.count({
            where: { discountCodeId: id }
        });

        if (orderCount > 0) {
            return {
                errCode: 2,
                errMessage: 'Không thể xóa voucher đã được sử dụng trong đơn hàng'
            };
        }

        await voucher.destroy();

        return {
            errCode: 0,
            errMessage: 'Xóa voucher thành công'
        };
    } catch (err) {
        console.error('Error in deleteDiscountCode:', err);
        throw new Error('Lỗi khi xóa voucher');
    }
};

/**
 * Bật/tắt trạng thái voucher
 */
let toggleActiveStatus = async (id) => {
    try {
        const voucher = await db.DiscountCode.findByPk(id);
        if (!voucher) {
            return { errCode: 1, errMessage: 'Voucher không tồn tại' };
        }

        await voucher.update({ isActive: !voucher.isActive });

        return {
            errCode: 0,
            errMessage: `Voucher đã ${voucher.isActive ? 'kích hoạt' : 'tạm dừng'}`,
            voucher
        };
    } catch (err) {
        console.error('Error in toggleActiveStatus:', err);
        throw new Error('Lỗi khi thay đổi trạng thái voucher');
    }
};

// ==================== USER CLAIM & VIEW ====================

/**
 * User claim/lưu voucher
 */
let claimVoucher = async (userId, voucherCode) => {
    try {
        const voucher = await db.DiscountCode.findOne({
            where: { code: voucherCode }
        });

        if (!voucher) {
            return { errCode: 1, errMessage: 'Mã voucher không tồn tại' };
        }

        if (!voucher.isActive) {
            return { errCode: 2, errMessage: 'Voucher không còn hoạt động' };
        }

        if (!voucher.isPublic) {
            return { errCode: 3, errMessage: 'Voucher này không khả dụng' };
        }

        if (voucher.usedCount >= voucher.usageLimit) {
            return { errCode: 4, errMessage: 'Voucher đã hết lượt claim' };
        }

        // Kiểm tra đã hết hạn chưa
        if (voucher.expiryDate && new Date() > new Date(voucher.expiryDate)) {
            return { errCode: 5, errMessage: 'Voucher đã hết hạn' };
        }

        // Kiểm tra user đã claim chưa
        const existing = await db.UserDiscount.findOne({
            where: { userId, discountCodeId: voucher.id }
        });

        if (existing) {
            return { errCode: 6, errMessage: 'Bạn đã lưu voucher này rồi' };
        }

        // Tạo voucher cho user - Mỗi user được dùng 3 lần (có thể config riêng)
        const userVoucher = await db.UserDiscount.create({
            userId,
            discountCodeId: voucher.id,
            usageLimit: 3, // TODO: Có thể lấy từ config của voucher
            usedCount: 0,
            collectedAt: new Date(),
            status: 'active'
        });

        // Tăng số lượng claim
        await voucher.increment('usedCount');

        return {
            errCode: 0,
            errMessage: 'Lưu voucher thành công!',
            userVoucher
        };
    } catch (err) {
        console.error('Error in claimVoucher:', err);
        throw new Error('Lỗi khi lưu voucher');
    }
};

/**
 * Lấy danh sách voucher public chưa claim
 */
let getAvailableVouchers = async (userId) => {
    try {
        // Lấy vouchers public và active
        const publicVouchers = await db.DiscountCode.findAll({
            where: {
                isPublic: true,
                isActive: true,
                [Op.or]: [
                    { expiryDate: null },
                    { expiryDate: { [Op.gt]: new Date() } }
                ]
            },
            order: [['createdAt', 'DESC']]
        });

        // Lấy danh sách voucher user đã claim
        const claimedVouchers = await db.UserDiscount.findAll({
            where: { userId },
            attributes: ['discountCodeId']
        });

        const claimedIds = claimedVouchers.map(v => v.discountCodeId);

        // Đánh dấu voucher đã claim
        const vouchersWithStatus = publicVouchers.map(voucher => ({
            ...voucher.toJSON(),
            claimed: claimedIds.includes(voucher.id),
            available: voucher.usedCount < voucher.usageLimit
        }));

        return {
            errCode: 0,
            errMessage: 'Lấy danh sách voucher thành công',
            vouchers: vouchersWithStatus
        };
    } catch (err) {
        console.error('Error in getAvailableVouchers:', err);
        throw new Error('Lỗi khi lấy danh sách voucher');
    }
};

/**
 * Lấy kho voucher của tôi (đã claim)
 */
let getMyVouchers = async (userId) => {
    try {
        const userVouchers = await db.UserDiscount.findAll({
            where: { userId },
            include: [{
                model: db.DiscountCode,
                as: 'discount',
                where: {
                    isActive: true
                }
            }],
            order: [['collectedAt', 'DESC']]
        });

        // Format data
        const vouchers = userVouchers.map(uv => ({
            ...uv.discount.toJSON(),
            userVoucherInfo: {
                usageLimit: uv.usageLimit,
                usedCount: uv.usedCount,
                remainingUses: uv.remainingUses(),
                collectedAt: uv.collectedAt,
                status: uv.status,
                canUse: uv.canUse()
            }
        }));

        return {
            errCode: 0,
            errMessage: 'Lấy kho voucher thành công',
            vouchers
        };
    } catch (err) {
        console.error('Error in getMyVouchers:', err);
        throw new Error('Lỗi khi lấy kho voucher');
    }
};

// ==================== VALIDATION HELPERS ====================

/**
 * Validate voucher đơn đầu tiên
 */
let validateFirstOrderVoucher = async (userId) => {
    try {
        const orderCount = await db.Order.count({
            where: {
                userId: userId,
                status: { [Op.in]: ['completed', 'processing', 'shipping'] }
            }
        });

        if (orderCount > 0) {
            return {
                valid: false,
                error: 'Voucher chỉ áp dụng cho đơn hàng đầu tiên'
            };
        }

        return { valid: true };
    } catch (err) {
        console.error('Error in validateFirstOrderVoucher:', err);
        return { valid: false, error: 'Lỗi khi kiểm tra đơn hàng' };
    }
};

/**
 * Validate voucher theo địa điểm
 */
let validateLocationVoucher = async (voucher, shippingAddressId) => {
    try {
        if (!shippingAddressId) {
            return { valid: false, error: 'Thiếu thông tin địa chỉ giao hàng' };
        }

        const address = await db.Address.findByPk(shippingAddressId);
        if (!address) {
            return { valid: false, error: 'Địa chỉ không hợp lệ' };
        }

        const condition = voucher.conditionValue;

        if (condition.type === 'city') {
            const cityMatch = condition.values.some(city =>
                address.city.toLowerCase().includes(city.toLowerCase())
            );

            if (!cityMatch) {
                return {
                    valid: false,
                    error: `Voucher chỉ áp dụng cho: ${condition.values.join(', ')}`
                };
            }
        }

        if (condition.type === 'district') {
            const districtMatch = condition.values.includes(address.district);
            if (!districtMatch) {
                return {
                    valid: false,
                    error: `Voucher chỉ áp dụng cho quận: ${condition.values.join(', ')}`
                };
            }
        }

        return { valid: true };
    } catch (err) {
        console.error('Error in validateLocationVoucher:', err);
        return { valid: false, error: 'Lỗi khi kiểm tra địa chỉ' };
    }
};

/**
 * Validate voucher theo phân khúc user
 */
let validateUserSegmentVoucher = async (voucher, userId) => {
    try {
        const user = await db.User.findByPk(userId);
        if (!user) {
            return { valid: false, error: 'User không tồn tại' };
        }

        const condition = voucher.conditionValue;

        if (condition.segment === 'vip') {
            // Tính tổng tiền đã mua
            const totalSpent = await db.Order.sum('totalPrice', {
                where: {
                    userId: userId,
                    status: 'completed'
                }
            }) || 0;

            // Đếm số đơn
            const orderCount = await db.Order.count({
                where: {
                    userId: userId,
                    status: 'completed'
                }
            });

            if (totalSpent < condition.criteria.totalSpent ||
                orderCount < condition.criteria.orderCount) {
                return {
                    valid: false,
                    error: 'Voucher chỉ dành cho khách hàng VIP'
                };
            }
        }

        if (condition.segment === 'loyal') {
            const membershipDays = Math.floor(
                (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
            );

            const orderCount = await db.Order.count({
                where: {
                    userId: userId,
                    status: 'completed'
                }
            });

            if (membershipDays < condition.criteria.membershipDays ||
                orderCount < condition.criteria.orderCount) {
                return {
                    valid: false,
                    error: 'Voucher dành cho thành viên lâu năm'
                };
            }
        }

        return { valid: true };
    } catch (err) {
        console.error('Error in validateUserSegmentVoucher:', err);
        return { valid: false, error: 'Lỗi khi kiểm tra phân khúc user' };
    }
};

/**
 * Validate voucher theo danh mục sản phẩm
 */
let validateCategoryVoucher = async (voucher, cartItems) => {
    try {
        const condition = voucher.conditionValue;
        const productIds = cartItems.map(item => item.productId);

        const products = await db.Product.findAll({
            where: { id: { [Op.in]: productIds } },
            include: [{
                model: db.Category,
                as: 'categories',
                through: { attributes: [] }
            }]
        });

        const hasValidProduct = products.some(product =>
            product.categories.some(cat =>
                condition.categoryIds.includes(cat.id)
            )
        );

        if (!hasValidProduct) {
            return {
                valid: false,
                error: `Voucher chỉ áp dụng cho: ${condition.categoryNames.join(', ')}`
            };
        }

        return { valid: true };
    } catch (err) {
        console.error('Error in validateCategoryVoucher:', err);
        return { valid: false, error: 'Lỗi khi kiểm tra danh mục' };
    }
};

/**
 * Lọc sản phẩm được áp dụng voucher
 */
let filterEligibleProducts = async (voucher, cartItems) => {
    try {
        // Nếu voucher có điều kiện category
        if (voucher.conditionType === 'specific_category') {
            const condition = voucher.conditionValue;
            const productIds = cartItems.map(item => item.productId);

            const products = await db.Product.findAll({
                where: { id: { [Op.in]: productIds } },
                include: [{
                    model: db.Category,
                    as: 'categories',
                    where: { id: { [Op.in]: condition.categoryIds } }
                }]
            });

            const eligibleProductIds = products.map(p => p.id);
            return cartItems.filter(item => eligibleProductIds.includes(item.productId));
        }

        // Nếu voucher áp dụng qua ProductDiscounts
        if (voucher.products && voucher.products.length > 0) {
            const allowedProductIds = voucher.products.map(p => p.id);
            return cartItems.filter(item => allowedProductIds.includes(item.productId));
        }

        // Mặc định: tất cả sản phẩm
        return cartItems;
    } catch (err) {
        console.error('Error in filterEligibleProducts:', err);
        return cartItems;
    }
};

// ==================== CALCULATE DISCOUNT ====================

/**
 * Tính giảm giá
 */
let calculateDiscount = async (voucher, orderData) => {
    try {
        const { cartItems, orderValue, shippingFee } = orderData;

        let discountAmount = 0;
        let discountBreakdown = [];

        // 1. Giảm toàn đơn hàng
        if (voucher.applicationType === 'order') {
            if (voucher.discountType === 'percent') {
                discountAmount = orderValue * (voucher.discountValue / 100);

                // Áp dụng giới hạn tối đa
                if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
                    discountAmount = voucher.maxDiscountAmount;
                }
            } else {
                discountAmount = voucher.discountValue;
            }

            discountBreakdown.push({
                type: 'order',
                description: `Giảm ${voucher.discountValue}${voucher.discountType === 'percent' ? '%' : 'đ'} toàn đơn`,
                amount: discountAmount
            });
        }

        // 2. Giảm từng sản phẩm
        else if (voucher.applicationType === 'product') {
            const eligibleItems = await filterEligibleProducts(voucher, cartItems);

            for (const item of eligibleItems) {
                let itemDiscount = 0;
                const itemTotal = item.price * item.quantity;

                if (voucher.discountType === 'percent') {
                    itemDiscount = itemTotal * (voucher.discountValue / 100);
                } else {
                    itemDiscount = voucher.discountValue * item.quantity;
                }

                discountAmount += itemDiscount;

                discountBreakdown.push({
                    type: 'product',
                    productId: item.productId,
                    productName: item.productName,
                    description: `Giảm ${voucher.discountValue}${voucher.discountType === 'percent' ? '%' : 'đ'}`,
                    amount: itemDiscount
                });
            }

            // Áp dụng max discount
            if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
                const ratio = voucher.maxDiscountAmount / discountAmount;
                discountAmount = voucher.maxDiscountAmount;

                // Điều chỉnh breakdown theo tỷ lệ
                discountBreakdown = discountBreakdown.map(item => ({
                    ...item,
                    amount: item.amount * ratio
                }));
            }
        }

        // 3. Freeship (Giảm phí vận chuyển)
        else if (voucher.applicationType === 'shipping') {
            discountAmount = Math.min(voucher.discountValue, shippingFee || 0);

            discountBreakdown.push({
                type: 'shipping',
                description: 'Miễn phí vận chuyển',
                amount: discountAmount
            });
        }

        return {
            discountAmount,
            discountBreakdown,
            finalTotal: orderValue + (shippingFee || 0) - discountAmount
        };
    } catch (err) {
        console.error('Error in calculateDiscount:', err);
        throw new Error('Lỗi khi tính giảm giá');
    }
};

// ==================== VALIDATE & APPLY ====================

/**
 * Validate voucher tổng hợp
 */
let validateVoucher = async (userId, voucherCode, orderData) => {
    try {
        const voucher = await db.DiscountCode.findOne({
            where: { code: voucherCode },
            include: [
                { model: db.Product, as: 'products' }
            ]
        });

        if (!voucher) {
            return { valid: false, error: 'Mã voucher không tồn tại' };
        }

        // 1. Check trạng thái cơ bản
        if (!voucher.isActive) {
            return { valid: false, error: 'Voucher không còn hoạt động' };
        }

        if (voucher.expiryDate && new Date() > new Date(voucher.expiryDate)) {
            return { valid: false, error: 'Voucher đã hết hạn' };
        }

        // 2. Check user có voucher không
        const userVoucher = await db.UserDiscount.findOne({
            where: { userId, discountCodeId: voucher.id }
        });

        if (!userVoucher) {
            return { valid: false, error: 'Bạn chưa lưu voucher này' };
        }

        if (userVoucher.status !== 'active') {
            return { valid: false, error: 'Voucher không còn khả dụng' };
        }

        if (userVoucher.usedCount >= userVoucher.usageLimit) {
            return { valid: false, error: 'Bạn đã hết lượt sử dụng voucher này' };
        }

        // 3. Check giá trị đơn tối thiểu
        if (orderData.orderValue < voucher.minOrderValue) {
            return {
                valid: false,
                error: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString()}đ`
            };
        }

        // 4. Validate theo điều kiện cụ thể
        let conditionCheck = { valid: true };

        switch (voucher.conditionType) {
            case 'first_order':
                conditionCheck = await validateFirstOrderVoucher(userId);
                break;

            case 'location':
                conditionCheck = await validateLocationVoucher(voucher, orderData.shippingAddressId);
                break;

            case 'user_segment':
                conditionCheck = await validateUserSegmentVoucher(voucher, userId);
                break;

            case 'specific_category':
                conditionCheck = await validateCategoryVoucher(voucher, orderData.cartItems);
                break;

            case 'min_items':
                const itemCount = orderData.cartItems.reduce((sum, item) => sum + item.quantity, 0);
                if (itemCount < voucher.conditionValue.minItems) {
                    conditionCheck = {
                        valid: false,
                        error: `Cần mua tối thiểu ${voucher.conditionValue.minItems} sản phẩm`
                    };
                }
                break;
        }

        if (!conditionCheck.valid) {
            return conditionCheck;
        }

        // 5. Tính toán giảm giá
        const discountResult = await calculateDiscount(voucher, orderData);

        return {
            valid: true,
            voucher,
            userVoucher,
            ...discountResult
        };
    } catch (err) {
        console.error('Error in validateVoucher:', err);
        return { valid: false, error: 'Lỗi khi validate voucher' };
    }
};

/**
 * Áp dụng voucher khi đặt hàng
 */
let applyVoucher = async (userId, voucherCode, orderId) => {
    try {
        // 1. Validate voucher (cần truyền orderData từ order)
        const order = await db.Order.findByPk(orderId, {
            include: [{
                model: db.OrderItem,
                as: 'items',
                include: [{ model: db.Product, as: 'product' }]
            }]
        });

        if (!order || order.userId !== userId) {
            return { errCode: 1, errMessage: 'Đơn hàng không hợp lệ' };
        }

        // Prepare orderData
        const orderData = {
            cartItems: order.items.map(item => ({
                productId: item.productId,
                productName: item.product.nameProduct,
                price: item.price,
                quantity: item.quantity
            })),
            orderValue: order.totalPrice,
            shippingFee: 0, // TODO: get from order
            shippingAddressId: null // TODO: get from order
        };

        const validation = await validateVoucher(userId, voucherCode, orderData);

        if (!validation.valid) {
            return { errCode: 2, errMessage: validation.error };
        }

        // 2. Update UserDiscount
        const userVoucher = validation.userVoucher;
        await userVoucher.increment('usedCount');

        // Nếu hết lượt → set status
        if (userVoucher.usedCount + 1 >= userVoucher.usageLimit) {
            await userVoucher.update({ status: 'used_up' });
        }

        // 3. Update Order với discountCodeId
        await order.update({
            discountCodeId: validation.voucher.id,
            totalPrice: validation.finalTotal
        });

        return {
            errCode: 0,
            errMessage: 'Áp dụng voucher thành công',
            discountAmount: validation.discountAmount,
            discountBreakdown: validation.discountBreakdown,
            finalTotal: validation.finalTotal
        };
    } catch (err) {
        console.error('Error in applyVoucher:', err);
        return { errCode: -1, errMessage: 'Lỗi khi áp dụng voucher' };
    }
};

// ==================== AUTO ASSIGN ====================

/**
 * Auto assign voucher cho user sau khi đăng ký
 */
let assignFirstOrderVoucher = async (userId) => {
    try {
        const newbieVoucher = await db.DiscountCode.findOne({
            where: {
                conditionType: 'first_order',
                isActive: true
            }
        });

        if (newbieVoucher) {
            await db.UserDiscount.create({
                userId: userId,
                discountCodeId: newbieVoucher.id,
                usageLimit: 1,
                usedCount: 0,
                collectedAt: new Date(),
                status: 'active'
            });

            await newbieVoucher.increment('usedCount');
        }
    } catch (err) {
        console.error('Error in assignFirstOrderVoucher:', err);
    }
};

/**
 * Auto assign birthday vouchers (Cronjob)
 */
let autoAssignBirthdayVouchers = async () => {
    try {
        const currentMonth = new Date().getMonth() + 1;

        // Tìm user sinh nhật tháng này
        const users = await db.User.findAll({
            where: db.sequelize.where(
                db.sequelize.fn('MONTH', db.sequelize.col('birthday')),
                currentMonth
            )
        });

        // Tìm voucher sinh nhật
        const birthdayVoucher = await db.DiscountCode.findOne({
            where: {
                code: 'SINHNHAT',
                isActive: true
            }
        });

        if (!birthdayVoucher) return;

        for (const user of users) {
            // Check đã có voucher chưa
            const existing = await db.UserDiscount.findOne({
                where: {
                    userId: user.id,
                    discountCodeId: birthdayVoucher.id,
                    status: 'active'
                }
            });

            if (!existing) {
                await db.UserDiscount.create({
                    userId: user.id,
                    discountCodeId: birthdayVoucher.id,
                    usageLimit: 1,
                    usedCount: 0,
                    collectedAt: new Date(),
                    status: 'active'
                });

                await birthdayVoucher.increment('usedCount');

                console.log(`✅ Assigned birthday voucher to user ${user.id}`);
            }
        }
    } catch (err) {
        console.error('Error in autoAssignBirthdayVouchers:', err);
    }
};

export default {
    // Admin CRUD
    createDiscountCode,
    getAllDiscountCodes,
    getDiscountCodeById,
    updateDiscountCode,
    deleteDiscountCode,
    toggleActiveStatus,

    // User Claim & View
    claimVoucher,
    getAvailableVouchers,
    getMyVouchers,

    // Validation
    validateVoucher,
    applyVoucher,

    // Auto assign
    assignFirstOrderVoucher,
    autoAssignBirthdayVouchers
};

