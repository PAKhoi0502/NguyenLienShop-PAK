import axios from '../axios';
import { clearAuthCookies } from '../utils/cookieUtils';

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

      // Axios interceptor already returns data directly
      return res; // Return res instead of res.data
   } catch (err) {
      console.error('📝 [AUTH SERVICE] Register error:', err);
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

      const res = await axios.post('/api/auth/check-phone', { phoneNumber });

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

         // Check if it's the expected backend response structure
         if (res && typeof res === 'object' && res.errCode !== undefined) {
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

         // If it has errCode, it's the expected structure
         if (res.errCode !== undefined) {
            return res;
         }

         // If no errCode but has 'exists', it might be the response data
         if (res.exists !== undefined) {
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
};
export const logout = async () => {
   try {
      const res = await axios.post('/api/auth/logout');

      // ✅ Clear all client-side storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear Redux persist specifically
      localStorage.removeItem('persist:root');

      // 🍪 Force clear cookies on client side as additional safety
      clearAuthCookies();


      return res;
   } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Lỗi server khi đăng xuất!';
      console.error('Logout error:', err);

      // Even if server logout fails, clear client storage
      localStorage.clear();
      sessionStorage.clear();
      localStorage.removeItem('persist:root');

      // 🍪 Force clear cookies on client side even if server fails
      clearAuthCookies();

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
      return {
         errCode: 1,
         errMessage: 'Not authenticated',
      };
   }
};

// 🔐 Password reset services
export const requestPasswordReset = async (phoneNumber) => {
   try {
      const res = await axios.post('/api/auth/forgot-password', { phoneNumber });
      return res;
   } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.response?.data?.errMessage || 'Lỗi máy chủ!';
      const errorStatus = err?.response?.status;

      console.error('Request password reset error:', err);

      return {
         errCode: errorStatus || -1,
         errMessage: errorMessage,
      };
   }
};

export const verifyResetOTP = async (phoneNumber, otpCode) => {
   try {
      const res = await axios.post('/api/auth/verify-reset-otp', { phoneNumber, otpCode });
      return res;
   } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.response?.data?.errMessage || 'Lỗi máy chủ!';
      const errorStatus = err?.response?.status;

      console.error('Verify reset OTP error:', err);

      return {
         errCode: errorStatus || -1,
         errMessage: errorMessage,
      };
   }
};

export const resetPassword = async (resetToken, newPassword) => {
   try {
      const res = await axios.post('/api/auth/reset-password', { resetToken, newPassword });
      return res;
   } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.response?.data?.errMessage || 'Lỗi máy chủ!';
      const errorStatus = err?.response?.status;

      console.error('Reset password error:', err);

      return {
         errCode: errorStatus || -1,
         errMessage: errorMessage,
      };
   }
};

// 🗑️ Clear OTP for phone number (when user goes back to step 1)
export const clearServerOTP = async (phoneNumber) => {
   try {
      const res = await axios.post('/api/auth/clear-otp', { phoneNumber });
      return res.data;
   } catch (err) {
      const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi xóa OTP!';
      const errorStatus = err?.response?.status;

      console.error('Clear OTP error:', err);

      return {
         errCode: errorStatus || -1,
         errMessage: errorMessage,
      };
   }
};
