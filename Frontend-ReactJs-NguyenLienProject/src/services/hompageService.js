import axios from '../axios';
const instance = axios.create({
   baseURL: 'http://localhost:8080',
   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});
export const getAllBanners = async () => {
   const res = await instance.get('/api/admin/banner-management');
   return res.data;
};

export const getActiveBanners = async () => {
   try {
      const res = await axios.get('/api/admin/banner-active');
      return res.data;
   } catch (err) {
      console.error('getActiveBanners error:', err);
      return { errCode: -1, errMessage: 'Lỗi khi tải banner đang hoạt động.' };
   }
};

export const createBanner = async (formData) => {
   try {
      const res = await axios.post('/api/admin/banner-create', formData, {
         headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
   } catch (err) {
      console.error('createBanner error:', err);
      return { errCode: -1, errMessage: 'Lỗi khi tạo banner.' };
   }
};

export const updateBanner = async (data) => {
   try {
      const res = await axios.put('/api/admin/banner-update', data);
      return res.data;
   } catch (err) {
      console.error('updateBanner error:', err);
      return { errCode: -1, errMessage: 'Lỗi khi cập nhật banner.' };
   }
};

export const deleteBanner = async (id) => {
   try {
      const res = await axios.delete('/api/admin/banner-delete', {
         data: { id },
      });
      return res.data;
   } catch (err) {
      console.error('deleteBanner error:', err);
      return { errCode: -1, errMessage: 'Lỗi khi xoá banner.' };
   }
};
