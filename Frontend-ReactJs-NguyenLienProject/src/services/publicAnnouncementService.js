import axios from '../axios';

const instance = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {}
});

// Không cần token cho public API
instance.interceptors.request.use(
    (config) => {
        // Không thêm Authorization header cho public API
        delete config.headers.Authorization;
        return config;
    },
    (error) => Promise.reject(error)
);

export const getActiveAnnouncements = async () => {
    try {
        const res = await instance.get('/api/public/announcements/active');
        if (res.data && res.data.errCode === 0) {
            return { errCode: 0, announcements: res.data.announcements };
        } else {
            return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể lấy thông báo' };
        }
    } catch (err) {
        console.error('getActiveAnnouncements error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi lấy thông báo';
        return { errCode: -1, errMessage: errorMessage };
    }
};
