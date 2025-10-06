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

// Lấy thống kê dashboard tổng quan
export const getDashboardStats = async () => {
   try {
      const response = await instance.get('/api/admin/dashboard-stats', {
         headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
         }
      });

      if (response.data && response.data.errCode === 0) {
         return { errCode: 0, data: response.data.data };
      } else {
         return { errCode: -1, errMessage: response.data?.errMessage || 'Lỗi khi lấy thống kê dashboard' };
      }
   } catch (error) {
      console.error('getDashboardStats error:', error);
      return {
         errCode: -1,
         errMessage: error.response?.data?.errMessage || 'Lỗi kết nối khi lấy thống kê dashboard'
      };
   }
};

// Lấy thống kê account management
export const getAccountStats = async () => {
   try {
      const response = await instance.get('/api/admin/account-stats', {
         headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
         }
      });

      if (response.data && response.data.errCode === 0) {
         return { errCode: 0, data: response.data.data };
      } else {
         return { errCode: -1, errMessage: response.data?.errMessage || 'Lỗi khi lấy thống kê tài khoản' };
      }
   } catch (error) {
      console.error('getAccountStats error:', error);
      return {
         errCode: -1,
         errMessage: error.response?.data?.errMessage || 'Lỗi kết nối khi lấy thống kê tài khoản'
      };
   }
};

// Lấy số lượng admin và user đơn giản  
export const getAccountCountStats = async () => {
   try {
      const response = await instance.get('/api/admin/account-count-stats', {
         headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
         }
      });

      if (response.data && response.data.errCode === 0) {
         return { errCode: 0, data: response.data.data };
      } else {
         return { errCode: -1, errMessage: response.data?.errMessage || 'Lỗi khi lấy số lượng tài khoản' };
      }
   } catch (error) {
      console.error('getAccountCountStats error:', error);
      return {
         errCode: -1,
         errMessage: error.response?.data?.errMessage || 'Lỗi kết nối khi lấy số lượng tài khoản'
      };
   }
};

// Lấy thống kê sản phẩm và danh mục
export const getProductCategoryStats = async () => {
   try {
      const response = await instance.get('/api/admin/product-category-stats', {
         headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
         }
      });

      if (response.data && response.data.errCode === 0) {
         return { errCode: 0, data: response.data.data };
      } else {
         return { errCode: -1, errMessage: 'Lỗi khi lấy thống kê sản phẩm và danh mục' };
      }
   } catch (error) {
      console.error('getProductCategoryStats error:', error);
      return { errCode: -1, errMessage: 'Lỗi kết nối server' };
   }
};

// Lấy thống kê homepage (banner, etc.)
export const getHomepageStats = async () => {
   try {
      const response = await instance.get('/api/admin/homepage-stats', {
         headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
         }
      });

      if (response.data && response.data.errCode === 0) {
         return { errCode: 0, data: response.data.data };
      } else {
         return { errCode: -1, errMessage: response.data?.errMessage || 'Lỗi khi lấy thống kê homepage' };
      }
   } catch (error) {
      console.error('getHomepageStats error:', error);
      return { errCode: -1, errMessage: 'Lỗi kết nối server' };
   }
};

const dashboardService = {
   getDashboardStats,
   getAccountStats,
   getAccountCountStats,
   getProductCategoryStats,
   getHomepageStats
};

export default dashboardService;
