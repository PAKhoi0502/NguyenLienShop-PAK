import axios from '../axios';

const instance = axios.create({
    baseURL: 'http://localhost:8080',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.url.includes('/admin/')) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ==================== ADMIN APIs ====================

/**
 * Lấy danh sách tất cả vouchers (Admin)
 * @param {Object} filters - { isActive, isPublic, applicationType, conditionType }
 */
export const getAllVouchers = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
        if (filters.isPublic !== undefined) params.append('isPublic', filters.isPublic);
        if (filters.applicationType) params.append('applicationType', filters.applicationType);
        if (filters.conditionType) params.append('conditionType', filters.conditionType);

        const res = await instance.get(`/api/admin/discount-management?${params.toString()}`);
        return res.data;
    } catch (err) {
        console.error('getAllVouchers error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi tải danh sách voucher';
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Lấy chi tiết voucher theo ID (Admin)
 * @param {Number} id - Voucher ID
 */
export const getVoucherById = async (id) => {
    try {
        if (!id) {
            return { errCode: 1, errMessage: 'ID voucher không hợp lệ' };
        }

        const res = await instance.get(`/api/admin/discount/${id}`);

        if (res.data && res.data.errCode === 0) {
            return { errCode: 0, voucher: res.data.voucher };
        } else {
            return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể lấy thông tin voucher' };
        }
    } catch (err) {
        console.error('getVoucherById error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi lấy thông tin voucher';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy voucher.' };
        }
        if (errorStatus === 403) {
            return { errCode: 403, errMessage: 'Bạn không có quyền xem thông tin voucher.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Tạo voucher mới (Admin)
 * @param {Object} voucherData - Dữ liệu voucher
 */
export const createVoucher = async (voucherData) => {
    try {
        const res = await instance.post('/api/admin/discount-create', voucherData);

        if (res.data && res.data.errCode === 0) {
            return { errCode: 0, voucher: res.data.voucher, errMessage: res.data.errMessage };
        } else {
            return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể tạo voucher' };
        }
    } catch (err) {
        console.error('createVoucher error:', err);
        const errorData = err?.response?.data;
        const errorMessage = errorData?.errorMessage || errorData?.errMessage || 'Lỗi khi tạo voucher';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 400) {
            return { errCode: 400, errMessage: errorMessage };
        }
        if (errorStatus === 403) {
            return { errCode: 403, errMessage: 'Bạn không có quyền tạo voucher.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Cập nhật voucher (Admin)
 * @param {Object} voucherData - Dữ liệu cập nhật (phải có id)
 */
export const updateVoucher = async (voucherData) => {
    try {
        if (!voucherData || !voucherData.id) {
            return { errCode: 1, errMessage: 'ID voucher là bắt buộc' };
        }

        const res = await instance.put('/api/admin/discount-update', voucherData);

        if (res.data && res.data.errCode === 0) {
            return { errCode: 0, voucher: res.data.voucher, errMessage: res.data.errMessage };
        } else {
            return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể cập nhật voucher' };
        }
    } catch (err) {
        console.error('updateVoucher error:', err);
        const errorData = err?.response?.data;
        const errorMessage = errorData?.errorMessage || errorData?.errMessage || 'Lỗi khi cập nhật voucher';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 400) {
            return { errCode: 400, errMessage: errorMessage };
        }
        if (errorStatus === 403) {
            return { errCode: 403, errMessage: 'Bạn không có quyền cập nhật voucher.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Xóa voucher (Admin)
 * @param {Number} id - Voucher ID
 */
export const deleteVoucher = async (id) => {
    try {
        if (!id) {
            return { errCode: 1, errMessage: 'ID voucher là bắt buộc' };
        }

        const res = await instance.delete('/api/admin/discount-delete', {
            data: { id }
        });

        if (res.data && res.data.errCode === 0) {
            return { errCode: 0, errMessage: res.data.errMessage || 'Xóa voucher thành công' };
        } else {
            return { errCode: -1, errMessage: res.data?.errMessage || 'Lỗi khi xóa voucher' };
        }
    } catch (err) {
        console.error('deleteVoucher error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi xóa voucher';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 400) {
            return { errCode: 400, errMessage: errorMessage };
        }
        if (errorStatus === 403) {
            return { errCode: 403, errMessage: 'Bạn không có quyền xóa voucher.' };
        }
        if (errorStatus === 404) {
            return { errCode: 404, errMessage: 'Voucher không tồn tại.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Bật/tắt trạng thái voucher (Admin)
 * @param {Number} id - Voucher ID
 */
export const toggleVoucherStatus = async (id) => {
    try {
        if (!id) {
            return { errCode: 1, errMessage: 'ID voucher là bắt buộc' };
        }

        const res = await instance.patch(`/api/admin/discount-toggle/${id}`);

        if (res.data && res.data.errCode === 0) {
            return { errCode: 0, voucher: res.data.voucher, errMessage: res.data.errMessage };
        } else {
            return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể thay đổi trạng thái voucher' };
        }
    } catch (err) {
        console.error('toggleVoucherStatus error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi thay đổi trạng thái voucher';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 404) {
            return { errCode: 404, errMessage: 'Voucher không tồn tại.' };
        }
        if (errorStatus === 403) {
            return { errCode: 403, errMessage: 'Bạn không có quyền thay đổi trạng thái voucher.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};

// ==================== USER APIs ====================

/**
 * Lấy danh sách voucher public chưa claim (User)
 */
export const getAvailableVouchers = async () => {
    try {
        const res = await instance.get('/api/user/vouchers-available', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return res.data;
    } catch (err) {
        console.error('getAvailableVouchers error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi tải danh sách voucher';
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Lấy kho voucher của tôi (User)
 */
export const getMyVouchers = async () => {
    try {
        const res = await instance.get('/api/user/my-vouchers', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return res.data;
    } catch (err) {
        console.error('getMyVouchers error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi tải kho voucher';
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Claim/lưu voucher (User)
 * @param {String} code - Mã voucher
 */
export const claimVoucher = async (code) => {
    try {
        if (!code) {
            return { errCode: 1, errMessage: 'Mã voucher là bắt buộc' };
        }

        const res = await instance.post('/api/user/claim-voucher',
            { code },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        if (res.data && res.data.errCode === 0) {
            return { errCode: 0, userVoucher: res.data.userVoucher, errMessage: res.data.errMessage };
        } else {
            return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể lưu voucher' };
        }
    } catch (err) {
        console.error('claimVoucher error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi lưu voucher';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 400) {
            return { errCode: 400, errMessage: errorMessage };
        }
        if (errorStatus === 401) {
            return { errCode: 401, errMessage: 'Vui lòng đăng nhập để lưu voucher.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Validate voucher trước khi checkout (User)
 * @param {String} code - Mã voucher
 * @param {Object} orderData - Thông tin đơn hàng
 */
export const validateVoucher = async (code, orderData) => {
    try {
        if (!code || !orderData) {
            return { errCode: 1, errMessage: 'Thiếu thông tin voucher hoặc đơn hàng' };
        }

        const res = await instance.post('/api/user/validate-voucher',
            { code, orderData },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        return res.data;
    } catch (err) {
        console.error('validateVoucher error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi kiểm tra voucher';
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Áp dụng voucher vào đơn hàng (User)
 * @param {String} code - Mã voucher
 * @param {Number} orderId - Order ID
 */
export const applyVoucher = async (code, orderId) => {
    try {
        if (!code || !orderId) {
            return { errCode: 1, errMessage: 'Thiếu thông tin voucher hoặc đơn hàng' };
        }

        const res = await instance.post('/api/user/apply-voucher',
            { code, orderId },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        return res.data;
    } catch (err) {
        console.error('applyVoucher error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi áp dụng voucher';
        return { errCode: -1, errMessage: errorMessage };
    }
};

// ==================== PUBLIC APIs ====================

/**
 * Lấy danh sách voucher công khai (không cần login)
 */
export const getPublicVouchers = async () => {
    try {
        // Axios interceptor đã trả về data trực tiếp, không cần .data
        const res = await axios.get('/api/public/vouchers');
        // Interceptor trả về data object trực tiếp
        return res;
    } catch (err) {
        console.error('getPublicVouchers error:', err);
        const errorMessage = err?.response?.data?.errMessage || err?.errorMessage || err?.message || 'Lỗi khi tải danh sách voucher';
        return { errCode: -1, errMessage: errorMessage };
    }
};


