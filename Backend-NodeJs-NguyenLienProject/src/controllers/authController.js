import authService from "../services/authService";
import refreshTokenService from "../services/refreshTokenService";
import tokenManagementService from "../services/tokenManagementService";
import authResponseHelper from "../utils/authResponseHelper";
import sendResponse from "../utils/sendResponse"; // Add this import
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'; dotenv.config();

const handleLogin = async (req, res) => {
   const { identifier, password, rememberMe } = req.body;

   if (!identifier || !password) {
      return authResponseHelper.sendAuthErrorResponse(res, {
         status: 400,
         errCode: 1,
         message: 'Thiếu thông tin đăng nhập!'
      });
   }

   const userData = await authService.loginUser(identifier, password);

   if (userData.errCode !== 0) {
      return authResponseHelper.sendAuthErrorResponse(res, {
         status: 401,
         errCode: userData.errCode,
         message: userData.errMessage || 'Sai thông tin đăng nhập!'
      });
   }

   const user = userData.user;

   try {
      // 🔧 Create complete auth session using centralized service
      const sessionResult = await tokenManagementService.createAuthSession(
         user,
         req,
         res,
         rememberMe
      );

      // 🎯 Send success response with cookies already set
      return authResponseHelper.sendLoginSuccessResponse(res, {
         user,
         accessToken: sessionResult.accessToken,
         refreshToken: sessionResult.refreshToken,
         rememberMe
      });
   } catch (error) {
      console.error('❌ Login error:', error.message);

      // 🚨 Special handling for database auto-increment errors
      if (error.message?.includes('auto-increment') || error.code === 'ER_AUTOINC_READ_FAILED') {
         return authResponseHelper.sendAuthErrorResponse(res, {
            status: 503,
            errCode: -1,
            message: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.'
         });
      }

      return authResponseHelper.sendServerErrorResponse(res, 'Lỗi server khi đăng nhập', error);
   }
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
      // 🔧 Get tokens from cookies/headers
      const accessToken = req.cookies.authToken || req.headers.authorization?.split(' ')[1];
      const refreshToken = req.cookies.refreshToken;

      if (!accessToken) {
         return authResponseHelper.sendAuthErrorResponse(res, {
            status: 400,
            errCode: 1,
            message: 'Access token not provided!'
         });
      }

      // 🚫 Destroy auth session using centralized service
      await tokenManagementService.destroyAuthSession(accessToken, refreshToken, res);

      // � Send success response with cookies already cleared
      return authResponseHelper.sendLogoutSuccessResponse(res);

   } catch (error) {
      return authResponseHelper.sendServerErrorResponse(res, 'Lỗi server khi đăng xuất', error);
   }
};

// 🔧 New endpoint to check authentication status via cookies
const handleAuthCheck = async (req, res) => {
   try {
      // Token được verify trong verifyToken middleware
      const user = req.user;

      return authResponseHelper.sendAuthCheckSuccessResponse(res, user);
   } catch (error) {
      return authResponseHelper.sendAuthErrorResponse(res, {
         status: 401,
         errCode: 1,
         message: 'Not authenticated'
      });
   }
};

// 🔄 New endpoint to refresh access token using refresh token
const handleRefreshToken = async (req, res) => {
   try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
         return authResponseHelper.sendAuthErrorResponse(res, {
            status: 401,
            errCode: 1,
            message: 'Refresh token not provided!'
         });
      }

      // � Refresh auth session using centralized service
      const sessionResult = await tokenManagementService.refreshAuthSession(
         refreshToken,
         null, // userId will be extracted from token
         req,
         res
      );

      // 🎯 Send success response with cookies already set
      return authResponseHelper.sendTokenRefreshSuccessResponse(res, {
         user: sessionResult.user,
         accessToken: sessionResult.accessToken,
         refreshToken: sessionResult.refreshToken
      });

   } catch (error) {
      return authResponseHelper.sendAuthErrorResponse(res, {
         status: 401,
         errCode: 1,
         message: 'Failed to refresh token'
      });
   }
};

// 📊 Get user's active sessions
const handleGetUserSessions = async (req, res) => {
   try {
      const userId = req.user.id; // From verifyToken middleware

      const sessionInfo = await tokenManagementService.getUserSessionInfo(userId);

      return authResponseHelper.sendAuthCheckSuccessResponse(res, {
         ...req.user,
         sessionInfo
      });
   } catch (error) {
      return authResponseHelper.sendServerErrorResponse(res, 'Failed to get user sessions', error);
   }
};

// 🧹 Cleanup all user sessions (logout from all devices)
const handleLogoutAllDevices = async (req, res) => {
   try {
      const userId = req.user.id; // From verifyToken middleware

      // Get current tokens to preserve this session
      const currentAccessToken = req.cookies.authToken || req.headers.authorization?.split(' ')[1];
      const currentRefreshToken = req.cookies.refreshToken;

      // Cleanup all other sessions
      const revokedCount = await tokenManagementService.cleanupUserSessions(userId);

      // Destroy current session too
      if (currentAccessToken || currentRefreshToken) {
         await tokenManagementService.destroyAuthSession(currentAccessToken, currentRefreshToken, res);
      }

      return authResponseHelper.sendLogoutSuccessResponse(res);
   } catch (error) {
      return authResponseHelper.sendServerErrorResponse(res, 'Failed to logout from all devices', error);
   }
};

// 🔒 Verify admin password for sensitive operations
const handleVerifyPassword = async (req, res) => {
   try {
      const { password } = req.body;
      const userId = req.user.id; // From verifyToken middleware

      if (!password) {
         return res.status(400).json({
            errCode: 1,
            errMessage: 'Mật khẩu không được để trống!'
         });
      }

      // Verify password using auth service
      const verificationResult = await authService.verifyUserPassword(userId, password);

      if (verificationResult.errCode !== 0) {
         return res.status(401).json({
            errCode: verificationResult.errCode,
            errMessage: verificationResult.errMessage || 'Mật khẩu không chính xác!'
         });
      }

      return res.status(200).json({
         errCode: 0,
         errMessage: 'Xác thực mật khẩu thành công!'
      });

   } catch (error) {
      console.error('VerifyPassword error:', error);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Lỗi server khi xác thực mật khẩu!'
      });
   }
};

// 🔄 FORGOT PASSWORD CONTROLLERS

const handleForgotPassword = async (req, res) => {
   try {
      const { phoneNumber } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      console.log(`🔄 Forgot password request from ${phoneNumber}, IP: ${ipAddress}`);

      const result = await authService.requestPasswordReset(phoneNumber, ipAddress, userAgent);

      if (result.errCode !== 0) {
         const statusCode = result.errCode === 1 ? 404 : 
                           result.errCode === 2 ? 429 : 
                           result.errCode === 3 ? 500 : 400;

         return res.status(statusCode).json({
            errCode: result.errCode,
            errMessage: result.errMessage
         });
      }

      return res.status(200).json({
         errCode: 0,
         message: result.message,
         resetToken: result.resetToken,
         expiresIn: result.expiresIn
      });

   } catch (error) {
      console.error('HandleForgotPassword error:', error);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Lỗi server khi xử lý yêu cầu đặt lại mật khẩu!'
      });
   }
};

const handleVerifyResetOTP = async (req, res) => {
   try {
      const { phoneNumber, otpCode } = req.body;

      console.log(`🔐 OTP verification request from ${phoneNumber} with code: ${otpCode}`);

      if (!otpCode || otpCode.length !== 6) {
         return res.status(400).json({
            errCode: 1,
            errMessage: 'Mã OTP phải có 6 chữ số!'
         });
      }

      const result = await authService.verifyResetOTP(phoneNumber, otpCode);

      if (result.errCode !== 0) {
         const statusCode = result.errCode === 1 ? 404 : 
                           result.errCode === 2 || result.errCode === 3 ? 403 : 
                           result.errCode === 4 ? 400 : 500;

         return res.status(statusCode).json({
            errCode: result.errCode,
            errMessage: result.errMessage
         });
      }

      return res.status(200).json({
         errCode: 0,
         message: result.message,
         resetToken: result.resetToken
      });

   } catch (error) {
      console.error('HandleVerifyResetOTP error:', error);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Lỗi server khi xác thực OTP!'
      });
   }
};

const handleResetPassword = async (req, res) => {
   try {
      const { resetToken, newPassword } = req.body;

      console.log(`🔐 Password reset request with token: ${resetToken?.substring(0, 8)}...`);

      if (!newPassword) {
         return res.status(400).json({
            errCode: 1,
            errMessage: 'Mật khẩu mới không được để trống!'
         });
      }

      const result = await authService.resetPassword(resetToken, newPassword);

      if (result.errCode !== 0) {
         const statusCode = result.errCode === 1 ? 400 : 
                           result.errCode === 2 ? 403 : 500;

         return res.status(statusCode).json({
            errCode: result.errCode,
            errMessage: result.errMessage
         });
      }

      return res.status(200).json({
         errCode: 0,
         message: result.message
      });

   } catch (error) {
      console.error('HandleResetPassword error:', error);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Lỗi server khi đặt lại mật khẩu!'
      });
   }
};

export default {
   handleLogin,
   handleRegister,
   handleLogout,
   handleAuthCheck,
   handleRefreshToken,
   handleGetUserSessions,
   handleLogoutAllDevices,
   handleVerifyPassword,
   handleForgotPassword,
   handleVerifyResetOTP,
   handleResetPassword
};
