import axios from '../axios';

export const getUserProfile = async () => {
    try {
        const res = await axios.get('/api/user/profile');
        return res;
    } catch (err) {
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi máy chủ!';
        return { errCode: -1, errMessage: errorMessage };
    }
};

export const updateUserProfile = async (formData) => {
    try {
        const res = await axios.put('/api/user/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        const data = res.data || res;
        if (!data) {
            return { errCode: -1, errMessage: 'Không nhận được dữ liệu từ server.' };
        }
        return {
            errCode: data.errCode !== undefined ? data.errCode : -1,
            errMessage: data.errMessage || 'Cập nhật thành công.'
        };
    } catch (err) {
        console.error('Update profile API error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi máy chủ! Không thể cập nhật thông tin.';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 400) {
            return { errCode: 400, errMessage: errorMessage };
        }
        if (errorStatus === 403) {
            return { errCode: 403, errMessage: 'Bạn không có quyền chỉnh sửa thông tin này.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};