import axios from '../axios';

export const login = async ({ identifier, password }) => {
   try {
      const res = await axios.post('/api/auth/login', { identifier, password });
      return res;
   } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Lỗi máy chủ!';
      const errorStatus = err?.response?.status;

      if (errorStatus === 400) {
         return {
            errCode: 400,
            errMessage: 'Thông tin đăng nhập không chính xác.',
         };
      }

      return {
         errCode: -1,
         errMessage: errorMessage,
      };
   }
};

export const register = async ({ phoneNumber, password, roleId, phoneVerified = false }) => {
   try {
      const res = await axios.post('/api/auth/register', { phoneNumber, password, roleId, phoneVerified });
      return res.data; // Return data instead of response object
   } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Lỗi máy chủ!';
      const errorStatus = err?.response?.status;

      if (errorStatus === 409) {
         return {
            errCode: 409,
            errMessage: 'Số điện thoại này đã được đăng ký.',
         };
      }

      return {
         errCode: -1,
         errMessage: errorMessage,
      };
   }
};

export const checkPhoneExists = async (phoneNumber) => {
   try {
      console.log('🔍 [AUTH SERVICE] Calling check phone API with:', phoneNumber);
      console.log('🔍 [AUTH SERVICE] Using baseURL:', process.env.REACT_APP_BACKEND_URL);

      const res = await axios.post('/api/auth/check-phone', { phoneNumber });
      console.log('🔍 [AUTH SERVICE] Full API response:', res);
      console.log('🔍 [AUTH SERVICE] Response status:', res.status);
      console.log('🔍 [AUTH SERVICE] Response data:', res.data);
      console.log('🔍 [AUTH SERVICE] Response headers:', res.headers);
      console.log('🔍 [AUTH SERVICE] Response type:', typeof res);

      // Check if response is empty object (network/server issue)
      if (!res || (typeof res === 'object' && Object.keys(res).length === 0)) {
         console.error('🔍 [AUTH SERVICE] Empty response - backend server may not be running');
         return {
            errCode: -2,
            errMessage: 'Không thể kết nối đến server. Vui lòng kiểm tra backend server.',
            exists: false
         };
      }

      // Check if response has undefined status (network issue)
      if (res.status === undefined && res.data === undefined && res.headers === undefined) {
         // This means axios interceptor returned data directly
         console.log('🔍 [AUTH SERVICE] Axios interceptor returned data directly:', res);

         // Check if it's the expected backend response structure
         if (res && typeof res === 'object' && res.errCode !== undefined) {
            console.log('🔍 [AUTH SERVICE] Valid backend response structure:', res);
            return res;
         }

         console.error('🔍 [AUTH SERVICE] Invalid response structure after interceptor');
         return {
            errCode: -3,
            errMessage: 'Cấu trúc phản hồi không hợp lệ.',
            exists: false
         };
      }

      // The axios interceptor transforms successful responses to return data directly
      // So 'res' here should already be the data object from the backend
      if (res && typeof res === 'object') {
         console.log('🔍 [AUTH SERVICE] Processing intercepted response:', res);

         // If it has errCode, it's the expected structure
         if (res.errCode !== undefined) {
            console.log('🔍 [AUTH SERVICE] Valid API response structure:', res);
            return res;
         }

         // If no errCode but has 'exists', it might be the response data
         if (res.exists !== undefined) {
            console.log('🔍 [AUTH SERVICE] Direct response data:', res);
            return {
               errCode: 0,
               exists: res.exists,
               message: res.message || 'Phone check completed'
            };
         }
      }

      console.warn('🔍 [AUTH SERVICE] Unexpected response format:', res);
      return {
         errCode: -1,
         errMessage: 'Định dạng phản hồi không mong đợi',
         exists: false
      };

   } catch (err) {
      console.error('🔍 [AUTH SERVICE] API error:', err);
      console.error('🔍 [AUTH SERVICE] Error message:', err.message);
      console.error('🔍 [AUTH SERVICE] Error code:', err.code);
      console.error('🔍 [AUTH SERVICE] Error response status:', err.response?.status);
      console.error('🔍 [AUTH SERVICE] Error response data:', err.response?.data);

      // Check for network errors (server not running)
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
         return {
            errCode: -4,
            errMessage: 'Không thể kết nối đến backend server. Vui lòng khởi động server.',
            exists: false
         };
      }

      // Check for connection refused (server not running)
      if (err.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED')) {
         return {
            errCode: -5,
            errMessage: 'Backend server chưa được khởi động. Vui lòng khởi động server trên port 8080.',
            exists: false
         };
      }

      const errorMessage = err?.response?.data?.errMessage || err?.response?.data?.message || err.message || 'Lỗi máy chủ!';
      return {
         errCode: err?.response?.status || -1,
         errMessage: errorMessage,
         exists: false
      };
   }
}; export const logout = async () => {
   try {
      const res = await axios.post('/api/auth/logout');

      // ✅ Clear all client-side storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear Redux persist specifically
      localStorage.removeItem('persist:root');

      console.log('🚪 Logout: All storage cleared');

      return res;
   } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Lỗi server khi đăng xuất!';
      console.error('Logout error:', err);

      // Even if server logout fails, clear client storage
      localStorage.clear();
      sessionStorage.clear();
      localStorage.removeItem('persist:root');

      return {
         errCode: -1,
         errMessage: errorMessage,
      };
   }
};

// 🔧 New auth check service for cookie-based authentication
export const checkAuth = async () => {
   try {
      const res = await axios.get('/api/auth/check');
      return res;
   } catch (err) {
      console.log('🍪 Auth check failed:', err.message);
      return {
         errCode: 1,
         errMessage: 'Not authenticated',
      };
   }
};
