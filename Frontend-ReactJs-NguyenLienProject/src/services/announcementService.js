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

// ==============================================
// 📢 GET ALL ANNOUNCEMENTS
// ==============================================
export const getAnnouncements = async () => {
    try {
        const res = await instance.get('/api/admin/announcement-management');
        if (res.data && res.data.errCode === 0) {
            return { errCode: 0, announcements: res.data.announcements };
        } else {
            return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể lấy danh sách thông báo' };
        }
    } catch (err) {
        console.error('getAnnouncements error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi lấy danh sách thông báo';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy thông báo.' };
        }
        if (errorStatus === 403) {
            return { errCode: 403, errMessage: 'Bạn không có quyền xem thông báo.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};

// Alias for compatibility
export const getAllAnnouncements = getAnnouncements;

// ==============================================
// 📢 GET ANNOUNCEMENT BY ID
// ==============================================
export const getAnnouncementById = async (id) => {
    try {
        const res = await instance.get(`/api/admin/announcement/${id}`);
        if (res.data && res.data.errCode === 0) {
            return { errCode: 0, announcement: res.data.announcement };
        } else {
            return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể lấy thông tin thông báo' };
        }
    } catch (err) {
        console.error('getAnnouncementById error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi lấy thông tin thông báo';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy thông báo.' };
        }
        if (errorStatus === 403) {
            return { errCode: 403, errMessage: 'Bạn không có quyền xem thông báo.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};

// ==============================================
// 📢 CREATE ANNOUNCEMENT
// ==============================================
export const createAnnouncement = async (data) => {
    try {
        const res = await instance.post('/api/admin/announcement-create', data);
        if (res.data && res.data.errCode === 0) {
            return { errCode: 0, announcement: res.data.announcement };
        } else {
            return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể tạo thông báo' };
        }
    } catch (err) {
        console.error('createAnnouncement error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi tạo thông báo';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 400) {
            return { errCode: 400, errMessage: 'Dữ liệu không hợp lệ.' };
        }
        if (errorStatus === 403) {
            return { errCode: 403, errMessage: 'Bạn không có quyền tạo thông báo.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};

// ==============================================
// 📢 UPDATE ANNOUNCEMENT
// ==============================================
export const updateAnnouncement = async (id, data) => {
    try {
        const res = await instance.put(`/api/admin/announcement-update/${id}`, data);
        if (res.data && res.data.errCode === 0) {
            return { errCode: 0, announcement: res.data.announcement };
        } else {
            return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể cập nhật thông báo' };
        }
    } catch (err) {
        console.error('updateAnnouncement error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi cập nhật thông báo';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 400) {
            return { errCode: 400, errMessage: 'Dữ liệu không hợp lệ.' };
        }
        if (errorStatus === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy thông báo.' };
        }
        if (errorStatus === 403) {
            return { errCode: 403, errMessage: 'Bạn không có quyền cập nhật thông báo.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};

// ==============================================
// 📢 DELETE ANNOUNCEMENT
// ==============================================
export const deleteAnnouncement = async (id) => {
    try {
        const res = await instance.delete(`/api/admin/announcement-delete/${id}`);
        if (res.data && res.data.errCode === 0) {
            return { errCode: 0, errMessage: res.data.errMessage };
        } else {
            return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể xóa thông báo' };
        }
    } catch (err) {
        console.error('deleteAnnouncement error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi xóa thông báo';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy thông báo.' };
        }
        if (errorStatus === 403) {
            return { errCode: 403, errMessage: 'Bạn không có quyền xóa thông báo.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};

// ==============================================
// 📢 TOGGLE ANNOUNCEMENT STATUS
// ==============================================
export const toggleAnnouncementStatus = async (id) => {
    try {
        const res = await instance.patch(`/api/admin/announcement-toggle/${id}`);
        if (res.data && res.data.errCode === 0) {
            return { errCode: 0, announcement: res.data.announcement };
        } else {
            return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể thay đổi trạng thái thông báo' };
        }
    } catch (err) {
        console.error('toggleAnnouncementStatus error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi thay đổi trạng thái thông báo';
        const errorStatus = err?.response?.status || 500;

        if (errorStatus === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy thông báo.' };
        }
        if (errorStatus === 403) {
            return { errCode: 403, errMessage: 'Bạn không có quyền thay đổi trạng thái thông báo.' };
        }
        return { errCode: -1, errMessage: errorMessage };
    }
};

// ==============================================
// 📢 GET ACTIVE ANNOUNCEMENTS (PUBLIC API)
// ==============================================
export const getActiveAnnouncements = async () => {
    try {
        const res = await instance.get('/api/public-homepage/announcements/active');
        if (res.data && res.data.errCode === 0) {
            return { errCode: 0, announcements: res.data.announcements };
        } else {
            return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể lấy thông báo đang hoạt động' };
        }
    } catch (err) {
        console.error('getActiveAnnouncements error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi lấy thông báo đang hoạt động';
        return { errCode: -1, errMessage: errorMessage };
    }
};

// ==============================================
// 📢 SEARCH ANNOUNCEMENTS
// ==============================================
export const searchAnnouncements = async (query) => {
    try {
        const res = await instance.get(`/api/admin/announcement-search?keyword=${encodeURIComponent(query)}`);
        if (res.data && res.data.errCode === 0) {
            return { errCode: 0, announcements: res.data.announcements };
        } else {
            return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể tìm kiếm thông báo' };
        }
    } catch (err) {
        console.error('searchAnnouncements error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi tìm kiếm thông báo';
        return { errCode: -1, errMessage: errorMessage };
    }
};

// ==============================================
// 📢 GET ANNOUNCEMENTS BY TYPE
// ==============================================
export const getAnnouncementsByType = async (type) => {
    try {
        const res = await instance.get(`/api/admin/announcement-type/${type}`);
        if (res.data && res.data.errCode === 0) {
            return { errCode: 0, announcements: res.data.announcements };
        } else {
            return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể lấy thông báo theo loại' };
        }
    } catch (err) {
        console.error('getAnnouncementsByType error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi lấy thông báo theo loại';
        return { errCode: -1, errMessage: errorMessage };
    }
};

// ==============================================
// 📢 GET ANNOUNCEMENTS BY POSITION
// ==============================================
export const getAnnouncementsByPosition = async (position) => {
    try {
        const res = await instance.get(`/api/admin/announcement-position/${position}`);
        if (res.data && res.data.errCode === 0) {
            return { errCode: 0, announcements: res.data.announcements };
        } else {
            return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể lấy thông báo theo vị trí' };
        }
    } catch (err) {
        console.error('getAnnouncementsByPosition error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi lấy thông báo theo vị trí';
        return { errCode: -1, errMessage: errorMessage };
    }
};
