
import authService from "../services/authService.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sendResponse from '../utils/sendResponse.js';

dotenv.config();

const handleLogin = async (req, res) => {
   const { identifier, password } = req.body;

   if (!identifier || !password) {
      return sendResponse(res, {
         status: 400,
         errCode: 1,
         message: 'Thiếu thông tin đăng nhập!',
      });
   }

   const userData = await authService.loginUser(identifier, password);

   if (userData.errCode !== 0) {
      return sendResponse(res, {
         status: 401,
         errCode: userData.errCode,
         message: userData.errMessage || 'Sai thông tin đăng nhập!',
      });
   }

   const user = userData.user;

   const token = jwt.sign(
      { id: user.id, roleId: user.roleId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
   );

   return sendResponse(res, {
      message: 'Đăng nhập thành công',
      token,
      expiresIn: 3600, // 1 giờ = 3600 giây
      data: user
   });
};
const handleRegister = async (req, res) => {
   const result = await authService.registerUser(req.body);

   return sendResponse(res, {
      status: result.errCode === 0 ? 200 : 400,
      errCode: result.errCode,
      message: result.errMessage || result.message,
   });
};

export default {
   handleLogin,
   handleRegister,
};
