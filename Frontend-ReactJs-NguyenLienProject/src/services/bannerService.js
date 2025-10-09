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

//controller banner

export const getAllBanners = async () => {
   const res = await instance.get('/api/admin/banner-management');
   return res.data;
};

export const getBannerById = async (id) => {
   try {
      const res = await instance.get(`/api/admin/banner/${id}`);
      if (res.data && res.data.errCode === 0) {
         return { errCode: 0, banner: res.data.banner };
      } else {
         return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể lấy thông tin banner' };
      }
   } catch (err) {
      console.error('getBannerById error:', err);
      const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi lấy thông tin banner';
      const errorStatus = err?.response?.status || 500;

      if (errorStatus === 404) {
         return { errCode: 404, errMessage: 'Không tìm thấy banner.' };
      }
      if (errorStatus === 403) {
         return { errCode: 403, errMessage: 'Bạn không có quyền xem thông tin banner.' };
      }
      return { errCode: -1, errMessage: errorMessage };
   }
};

export const getActiveBanners = async () => {
   try {
      const res = await instance.get('/api/admin/banner-active');
      return res.data;
   } catch (err) {
      console.error('getActiveBanners error:', err);
      return { errCode: -1, errMessage: 'Lỗi khi tải banner đang hoạt động.' };
   }
};

export const createBanner = async (formData) => {
   try {
      const res = await instance.post('/api/admin/banner-create', formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.errCode === 0) {
         return { errCode: 0, id: res.data.id, banner: res.data.banner };
      } else {
         return { errCode: -1, errMessage: res.data?.errMessage || 'Không thể tạo banner' };
      }
   } catch (err) {
      console.error('createBanner error:', err);
      const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi tạo banner';
      const errorStatus = err?.response?.status || 500;

      if (errorStatus === 400) {
         return { errCode: 400, errMessage: 'Dữ liệu không hợp lệ.' };
      }
      if (errorStatus === 403) {
         return { errCode: 403, errMessage: 'Bạn không có quyền tạo banner.' };
      }
      return { errCode: -1, errMessage: errorMessage };
   }
};

export const updateBanner = async (data) => {
   try {
      const res = await instance.put('/api/admin/banner-update', data);
      return res.data;
   } catch (err) {
      console.error('updateBanner error:', err);
      const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi cập nhật banner';
      const errorStatus = err?.response?.status || 500;

      if (errorStatus === 400) {
         return { errCode: 400, errMessage: 'Dữ liệu không hợp lệ.' };
      }
      if (errorStatus === 403) {
         return { errCode: 403, errMessage: 'Bạn không có quyền cập nhật banner.' };
      }
      return { errCode: -1, errMessage: errorMessage };
   }
};

export const deleteBanner = async (id) => {
   try {
      const res = await instance.delete('/api/admin/banner-delete', {
         data: { id },
      });
      if (res.data && res.data.errCode === 0) {
         return { errCode: 0, errMessage: res.data.errMessage || 'Xóa banner thành công' };
      } else {
         return { errCode: -1, errMessage: res.data?.errMessage || 'Lỗi khi xóa banner' };
      }
   } catch (err) {
      console.error('deleteBanner error:', err);
      const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi xóa banner';
      const errorStatus = err?.response?.status || 500;

      if (errorStatus === 400) {
         return { errCode: 400, errMessage: 'Dữ liệu không hợp lệ.' };
      }
      if (errorStatus === 403) {
         return { errCode: 403, errMessage: 'Bạn không có quyền xóa banner.' };
      }
      return { errCode: -1, errMessage: errorMessage };
   }
};

export const publicBanner = async () => {
   try {
      const res = await instance.get('/api/public/banner');
      return res.data.data;
   } catch (err) {
      console.error('getPublicActiveBanners error:', err);
      throw err;
   }
};