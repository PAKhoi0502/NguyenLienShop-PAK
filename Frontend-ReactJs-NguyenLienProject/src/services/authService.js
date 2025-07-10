import axios from '../axios';
export const login = async ({ identifier, password }) => {
   console.log("Attempting to login with identifier:", identifier);

   const phonePattern = /^0\d{9}$/;
   if (!phonePattern.test(identifier)) {
      console.log("Invalid phone number:", identifier);
      return {
         errCode: 1,
         errMessage: 'Số điện thoại không hợp lệ!',
      };
   }

   try {
      console.log("Sending login request to the server...");
      const res = await axios.post('/api/login', { identifier, password });

      console.log("Response from login API:", res);  // Log toàn bộ phản hồi từ API

      if (res?.data) {
         console.log("Received data from API:", res.data);  // Kiểm tra dữ liệu trả về từ API
      } else {
         console.log("No data received from API");
      }

      return res?.data || {
         errCode: -1,
         errMessage: 'Phản hồi không hợp lệ từ server',
      };

   } catch (err) {
      console.error('Login API error:', err);
      console.log("Error details:", err?.response?.data);
      return {
         errCode: -1,
         errMessage: err?.response?.data?.message || 'Lỗi máy chủ!',
      };
   }
};
