import axios from '../axios';

/**
 * Address Service - Private API (requires authentication)
 * Quản lý sổ địa chỉ giao hàng của user
 */

/**
 * Lấy tất cả địa chỉ của user hiện tại
 */
export const getUserAddresses = async () => {
    try {
        const res = await axios.get('/api/user/addresses');
        if (res.errCode === 0) {
            return {
                errCode: 0,
                addresses: res.addresses,
                message: 'OK'
            };
        }
        return {
            errCode: res.errCode || -1,
            errMessage: res.errMessage || 'Không thể lấy danh sách địa chỉ'
        };
    } catch (err) {
        console.error('getUserAddresses error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi lấy danh sách địa chỉ';
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Lấy thông tin địa chỉ theo ID
 * @param {number} addressId - ID của địa chỉ
 */
export const getAddressById = async (addressId) => {
    try {
        if (!addressId) {
            return { errCode: 1, errMessage: 'Thiếu ID địa chỉ' };
        }

        const res = await axios.get(`/api/user/address/${addressId}`);
        if (res.errCode === 0) {
            return {
                errCode: 0,
                address: res.address,
                message: 'OK'
            };
        }
        return {
            errCode: res.errCode || -1,
            errMessage: res.errMessage || 'Không thể lấy thông tin địa chỉ'
        };
    } catch (err) {
        console.error('getAddressById error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi lấy thông tin địa chỉ';
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Tạo địa chỉ mới
 * @param {Object} addressData - Dữ liệu địa chỉ
 */
export const createAddress = async (addressData) => {
    try {
        if (!addressData.receiverName || !addressData.receiverPhone || !addressData.addressLine1) {
            return {
                errCode: 1,
                errMessage: 'Thiếu thông tin bắt buộc: receiverName, receiverPhone, addressLine1'
            };
        }

        if (!addressData.city || !addressData.district || !addressData.ward) {
            return {
                errCode: 1,
                errMessage: 'Thiếu thông tin bắt buộc: city, district, ward'
            };
        }

        const res = await axios.post('/api/user/address-create', addressData);
        if (res.errCode === 0) {
            return {
                errCode: 0,
                address: res.address,
                message: 'Tạo địa chỉ thành công'
            };
        }
        return {
            errCode: res.errCode || -1,
            errMessage: res.errMessage || 'Không thể tạo địa chỉ'
        };
    } catch (err) {
        console.error('createAddress error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi tạo địa chỉ';
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Cập nhật địa chỉ
 * @param {number} addressId - ID của địa chỉ
 * @param {Object} addressData - Dữ liệu địa chỉ mới
 */
export const updateAddress = async (addressId, addressData) => {
    try {
        if (!addressId) {
            return { errCode: 1, errMessage: 'Thiếu ID địa chỉ' };
        }

        const res = await axios.put(`/api/user/address-update/${addressId}`, addressData);
        if (res.errCode === 0) {
            return {
                errCode: 0,
                address: res.address,
                message: 'Cập nhật địa chỉ thành công'
            };
        }
        return {
            errCode: res.errCode || -1,
            errMessage: res.errMessage || 'Không thể cập nhật địa chỉ'
        };
    } catch (err) {
        console.error('updateAddress error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi cập nhật địa chỉ';
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Xóa địa chỉ
 * @param {number} addressId - ID của địa chỉ
 */
export const deleteAddress = async (addressId) => {
    try {
        if (!addressId) {
            return { errCode: 1, errMessage: 'Thiếu ID địa chỉ' };
        }

        const res = await axios.delete(`/api/user/address-delete/${addressId}`);
        if (res.errCode === 0) {
            return {
                errCode: 0,
                message: 'Xóa địa chỉ thành công'
            };
        }
        return {
            errCode: res.errCode || -1,
            errMessage: res.errMessage || 'Không thể xóa địa chỉ'
        };
    } catch (err) {
        console.error('deleteAddress error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi xóa địa chỉ';
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Đặt địa chỉ làm mặc định
 * @param {number} addressId - ID của địa chỉ
 */
export const setDefaultAddress = async (addressId) => {
    try {
        if (!addressId) {
            return { errCode: 1, errMessage: 'Thiếu ID địa chỉ' };
        }

        const res = await axios.put(`/api/user/address-set-default/${addressId}`);
        if (res.errCode === 0) {
            return {
                errCode: 0,
                message: 'Đặt địa chỉ mặc định thành công'
            };
        }
        return {
            errCode: res.errCode || -1,
            errMessage: res.errMessage || 'Không thể đặt địa chỉ mặc định'
        };
    } catch (err) {
        console.error('setDefaultAddress error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi đặt địa chỉ mặc định';
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Lấy địa chỉ mặc định
 */
export const getDefaultAddress = async () => {
    try {
        const res = await axios.get('/api/user/address-default');
        if (res.errCode === 0) {
            return {
                errCode: 0,
                address: res.address,
                message: 'OK'
            };
        }
        return {
            errCode: res.errCode || -1,
            errMessage: res.errMessage || 'Không thể lấy địa chỉ mặc định'
        };
    } catch (err) {
        console.error('getDefaultAddress error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi lấy địa chỉ mặc định';
        return { errCode: -1, errMessage: errorMessage };
    }
};
