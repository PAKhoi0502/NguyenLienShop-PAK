import axios from '../axios';

const createError = (httpStatusCode, statusCode, errorMessage, problems, errorCode = '') => {
    const error = new Error();
    error.httpStatusCode = httpStatusCode;
    error.statusCode = statusCode;
    error.errorMessage = errorMessage;
    error.problems = problems;
    error.errorCode = String(errorCode);
    return error;
};
export const isSuccessStatusCode = (s) => {
    return (typeof s === 'number' && s === 0) || (typeof s === 'string' && s.toUpperCase() === 'OK');
};
export const getUsers = async (id = 'ALL') => {
    try {
        const res = await axios.get(`/api/admin/user-management?id=${id}`);
        return res;
    } catch (err) {
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi máy chủ!';
        return { errCode: -1, errMessage: errorMessage };
    }
};
export const deleteUser = async (userId) => {
    try {
        const res = await axios.delete(`/api/admin/user-delete?id=${userId}`);
        console.log('Raw API response:', res.data); // Log để kiểm tra
        const data = res.data || res; // Đảm bảo lấy dữ liệu từ interceptor
        if (!data) {
            return { errCode: -1, errMessage: 'Không nhận được dữ liệu từ server.' };
        }
        return {
            errCode: data.errCode !== undefined ? data.errCode : -1,
            errMessage: data.errMessage || 'Lỗi không xác định từ server.'
        };
    } catch (err) {
        console.error('DeleteUser API error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi máy chủ! Không thể xóa người dùng.';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 404) {
            return { errCode: 404, errMessage: 'Người dùng không tồn tại.' };
        }
        if (errorStatus === 403) {
            return { errCode: 403, errMessage: 'Bạn không có quyền xóa người dùng này.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};
export const createUser = async (userData) => {
    try {
        const res = await axios.post('/api/admin/user-register', userData);
        const data = res.data || res; // Đảm bảo lấy dữ liệu từ interceptor
        if (!data) {
            return { errCode: -1, errMessage: 'Không nhận được dữ liệu từ server.' };
        }
        return {
            errCode: data.errCode !== undefined ? data.errCode : -1,
            errMessage: data.errMessage || 'Tạo tài khoản thành công.'
        };
    } catch (err) {
        console.error('CreateUser API error:', err); // Log lỗi chi tiết
        const errorMessage = err?.response?.data?.message || 'Lỗi máy chủ! Không thể tạo người dùng.';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 400) {
            return { errCode: 400, errMessage: 'Dữ liệu không hợp lệ.' };
        }
        if (errorStatus === 403) {
            return { errCode: 403, errMessage: 'Bạn không có quyền tạo người dùng mới.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};
export const createAdmin = async (adminData) => {
    try {
        const res = await axios.post('/api/admin/user-register', adminData);
        const data = res.data || res; // Đảm bảo lấy dữ liệu từ interceptor
        if (!data) {
            return { errCode: -1, errMessage: 'Không nhận được dữ liệu từ server.' };
        }
        return {
            errCode: data.errCode !== undefined ? data.errCode : -1,
            errMessage: data.errMessage || 'Tạo tài khoản thành công.'
        };
    } catch (err) {
        console.error('CreateUser API error:', err); // Log lỗi chi tiết
        const errorMessage = err?.response?.data?.message || 'Lỗi máy chủ! Không thể tạo người dùng.';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 400) {
            return { errCode: 400, errMessage: 'Dữ liệu không hợp lệ.' };
        }
        if (errorStatus === 403) {
            return { errCode: 403, errMessage: 'Bạn không có quyền tạo người dùng mới.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};
export const updateUser = async (userData) => {
    try {
        const res = await axios.put('/api/admin/user-update', userData);
        const data = res.data || res; // Đảm bảo lấy dữ liệu từ interceptor
        if (!data) {
            return { errCode: -1, errMessage: 'Không nhận được dữ liệu từ server.' };
        }
        return {
            errCode: data.errCode !== undefined ? data.errCode : -1,
            errMessage: data.errMessage || 'Cập nhật thành công.'
        };
    } catch (err) {
        console.error('EditUser API error:', err); // Log lỗi chi tiết
        const errorMessage = err?.response?.data?.message || 'Lỗi máy chủ! Không thể cập nhật thông tin người dùng.';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 400) {
            return { errCode: 400, errMessage: 'Dữ liệu cập nhật không hợp lệ.' };
        }
        if (errorStatus === 403) {
            return { errCode: 403, errMessage: 'Bạn không có quyền chỉnh sửa thông tin người dùng này.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};
export const updateAdmin = async (userData) => {
    try {
        const res = await axios.put('/api/admin/admin-update', userData);
        const data = res.data || res; // Đảm bảo lấy dữ liệu từ interceptor
        if (!data) {
            return { errCode: -1, errMessage: 'Không nhận được dữ liệu từ server.' };
        }
        return {
            errCode: data.errCode !== undefined ? data.errCode : -1,
            errMessage: data.errMessage || 'Cập nhật thành công.'
        };
    } catch (err) {
        console.error('EditUser API error:', err); // Log lỗi chi tiết
        const errorMessage = err?.response?.data?.message || 'Lỗi máy chủ! Không thể cập nhật thông tin quản trị viên.';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 400) {
            return { errCode: 400, errMessage: 'Dữ liệu cập nhật không hợp lệ.' };
        }
        if (errorStatus === 403) {
            return { errCode: 403, errMessage: 'Bạn không có quyền chỉnh sửa thông tin quản trị viên này.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};
export const getAdmins = async (id = 'ALL') => {
    try {
        const res = await axios.get(`/api/admin/admin-management?id=${id}`);
        return res;
    } catch (err) {
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi máy chủ!';
        return { errCode: -1, errMessage: errorMessage };
    }
};