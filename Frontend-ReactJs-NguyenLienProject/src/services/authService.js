import axios from '../axios';

export const login = async ({ identifier, password }) => {
   try {
      const res = await axios.post('/api/login', { identifier, password });

      return res;
   } catch (err) {
      return {
         errCode: -1,
         errMessage: err?.response?.data?.message || 'Lỗi máy chủ!',
      };
   }
};
