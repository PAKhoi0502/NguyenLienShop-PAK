
import authService from "../services/authService";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sendResponse from '../utils/sendResponse';
const { blacklistToken, generateAccessToken } = require('../utils/tokenUtils');

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

   // ✅ Sử dụng tokenUtils thay vì tạo token trực tiếp
   const token = generateAccessToken(user);

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

const handleLogout = async (req, res) => {
   try {
      const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

      if (!token) {
         return sendResponse(res, {
            status: 400,
            errCode: 1,
            message: 'Token not provided!',
         });
      }

      // ✅ Thêm token vào blacklist
      blacklistToken(token);

      return sendResponse(res, {
         status: 200,
         errCode: 0,
         message: 'Đăng xuất thành công',
      });

   } catch (error) {
      console.error('Logout error:', error);
      return sendResponse(res, {
         status: 500,
         errCode: -1,
         message: 'Lỗi server khi đăng xuất',
      });
   }
};

export default {
   handleLogin,
   handleRegister,
   handleLogout,
};
