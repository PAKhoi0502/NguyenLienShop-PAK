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

export const register = async ({ phoneNumber, password, roleId }) => {
   try {
      const res = await axios.post('/api/auth/register', { phoneNumber, password, roleId });
      return res;
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

export const logout = async () => {
   try {
      const res = await axios.post('/api/auth/logout');
      return res;
   } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Lỗi server khi đăng xuất!';
      console.error('Logout error:', err);

      return {
         errCode: -1,
         errMessage: errorMessage,
      };
   }
};
