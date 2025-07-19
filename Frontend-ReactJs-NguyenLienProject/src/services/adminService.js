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
        const res = await axios.get(`/api/admin/users-manager?id=${id}`);
        if (!res) return { errCode: -1, errMessage: 'Không nhận được dữ liệu từ server.' };
        return res;
    } catch (err) {
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi máy chủ! Không thể tải danh sách người dùng.';
        return { errCode: -1, errMessage: errorMessage };
    }
};
export const deleteUser = async (userId) => {
    try {
        const res = await axios.delete(`/api/admin/user-delete?id=${userId}`);
        return res.data;
    } catch (err) {
        const errorMessage = err?.response?.data?.message || 'Lỗi máy chủ! Không thể xóa người dùng.';
        const errorStatus = err?.response?.status || 500;

        // Kiểm tra lỗi xóa
        if (errorStatus === 404) {
            return {
                errCode: 404,
                errMessage: 'Người dùng không tồn tại.',
            };
        }

        if (errorStatus === 403) {
            return {
                errCode: 403,
                errMessage: 'Bạn không có quyền xóa người dùng này.',
            };
        }

        return {
            errCode: -1,
            errMessage: errorMessage,
        };
    }
};
export const createUser = async (userData) => {
    try {
        const res = await axios.post('/api/admin/user-register', userData);
        return res.data;  // Trả về kết quả tạo người dùng
    } catch (err) {
        const errorMessage = err?.response?.data?.message || 'Lỗi máy chủ! Không thể tạo người dùng.';
        const errorStatus = err?.response?.status || 500;

        // Kiểm tra lỗi khi tạo người dùng
        if (errorStatus === 400) {
            return {
                errCode: 400,
                errMessage: 'Dữ liệu không hợp lệ.',
            };
        }

        if (errorStatus === 403) {
            return {
                errCode: 403,
                errMessage: 'Bạn không có quyền tạo người dùng mới.',
            };
        }

        return {
            errCode: -1,
            errMessage: errorMessage,
        };
    }
};
export const createAdmin = async (adminData) => {
    try {
        const res = await axios.post('/api/admin/admin-register', adminData);
        return res.data;
    } catch (err) {
        const errorMessage = err?.response?.data?.message || 'Lỗi máy chủ! Không thể tạo tài khoản quản trị viên.';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 400) {
            return {
                errCode: 400,
                errMessage: 'Dữ liệu không hợp lệ.',
            };
        }

        if (errorStatus === 403) {
            return {
                errCode: 403,
                errMessage: 'Bạn không có quyền tạo tài khoản quản trị viên.',
            };
        }

        return {
            errCode: -1,
            errMessage: errorMessage,
        };
    }
};
export const editUser = async (userData) => {
    try {
        const res = await axios.put('/api/admin/user-edit', userData);
        return res.data;  // Trả về kết quả chỉnh sửa
    } catch (err) {
        const errorMessage = err?.response?.data?.message || 'Lỗi máy chủ! Không thể cập nhật thông tin người dùng.';
        const errorStatus = err?.response?.status || 500;

        // Kiểm tra lỗi khi cập nhật
        if (errorStatus === 400) {
            return {
                errCode: 400,
                errMessage: 'Dữ liệu cập nhật không hợp lệ.',
            };
        }

        if (errorStatus === 403) {
            return {
                errCode: 403,
                errMessage: 'Bạn không có quyền chỉnh sửa thông tin người dùng này.',
            };
        }

        return {
            errCode: -1,
            errMessage: errorMessage,
        };
    }
};
export const getAdmins = async (id = 'ALL') => {
    try {
        const res = await axios.get(`/api/admin/admins-manager?id=${id}`);
        if (!res) return { errCode: -1, errMessage: 'Không nhận được dữ liệu từ server.' };
        return res;
    } catch (err) {
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi máy chủ! Không thể tải danh sách quản trị viên.';
        return { errCode: -1, errMessage: errorMessage };
    }
};