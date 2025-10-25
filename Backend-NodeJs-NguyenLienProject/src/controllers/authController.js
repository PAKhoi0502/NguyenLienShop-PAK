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
            errMessage: result.errMessage,
            attemptsRemaining: result.attemptsRemaining || 0
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

// 🗑️ Clear OTP for phone number (when user goes back to step 1)
const handleClearOTP = async (req, res) => {
   try {
      const { phoneNumber } = req.body;

      // Validate phone number format
      const phoneRegex = /^(84|0)[35789][0-9]{8}$/;
      if (!phoneRegex.test(phoneNumber)) {
         return res.status(400).json({
            errCode: 1,
            errMessage: 'Số điện thoại không hợp lệ!'
         });
      }

      console.log('🗑️ Clearing OTP for phone:', phoneNumber);

      // Clear OTP data from database
      const result = await authService.clearOTPForPhone(phoneNumber);

      if (result.errCode === 0) {
         return res.status(200).json({
            errCode: 0,
            errMessage: 'Đã xóa OTP thành công!'
         });
      } else {
         return res.status(400).json({
            errCode: result.errCode,
            errMessage: result.errMessage
         });
      }

   } catch (error) {
      console.error('HandleClearOTP error:', error);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Lỗi server khi xóa OTP!'
      });
   }
};

// 🔄 CHANGE PASSWORD CONTROLLERS (for authenticated users)

const handleRequestChangePassword = async (req, res) => {
   try {
      const { currentPassword } = req.body;
      const userId = req.user.id; // From verifyToken middleware
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      console.log(`🔄 Change password request from user ${userId}`);

      if (!currentPassword) {
         return res.status(400).json({
            errCode: 1,
            errMessage: 'Vui lòng nhập mật khẩu hiện tại!'
         });
      }

      // Call service with only userId - it will query phoneNumber from database
      const result = await authService.requestChangePassword(
         userId,
         currentPassword,
         ipAddress,
         userAgent
      );

      if (result.errCode !== 0) {
         const statusCode =
            result.errCode === 1 ? 404 :
               result.errCode === 2 ? 401 :
                  result.errCode === 3 ? 400 :
                     result.errCode === 4 ? 429 : 500;

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
      console.error('HandleRequestChangePassword error:', error);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Lỗi server!'
      });
   }
};

const handleChangePassword = async (req, res) => {
   try {
      const { resetToken, newPassword } = req.body;
      const userId = req.user.id; // From verifyToken middleware

      console.log(`🔐 Change password request from user ${userId}`);

      if (!newPassword) {
         return res.status(400).json({
            errCode: 1,
            errMessage: 'Mật khẩu mới không được để trống!'
         });
      }

      const result = await authService.changePassword(resetToken, newPassword);

      if (result.errCode !== 0) {
         const statusCode =
            result.errCode === 1 ? 400 :
               result.errCode === 2 ? 403 :
                  result.errCode === 3 ? 400 : 500;

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
      console.error('HandleChangePassword error:', error);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Lỗi server!'
      });
   }
};

// 📧 UPDATE EMAIL CONTROLLERS (NEW FLOW - for authenticated users)
// Flow: Email input → OTP to email → Verify OTP & Update

const handleSendEmailOTP = async (req, res) => {
   try {
      const { newEmail } = req.body;
      const userId = req.user.id;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      console.log(`📧 Send email OTP request from user ${userId} to ${newEmail}`);

      if (!newEmail) {
         return res.status(400).json({
            errCode: 1,
            errMessage: 'Vui lòng nhập email!'
         });
      }

      const result = await authService.sendEmailOTP(
         userId,
         newEmail,
         ipAddress,
         userAgent
      );

      if (result.errCode !== 0) {
         const statusCode =
            result.errCode === 1 ? 400 : // Invalid email
               result.errCode === 2 ? 404 : // User not found
                  result.errCode === 3 ? 409 : // Email exists
                     result.errCode === 4 ? 429 : // Rate limit
                        500;

         return res.status(statusCode).json({
            errCode: result.errCode,
            errMessage: result.errMessage
         });
      }

      return res.status(200).json({
         errCode: 0,
         message: result.message,
         resetToken: result.resetToken,
         expiresIn: result.expiresIn,
         hasEmail: result.hasEmail,
         currentEmail: result.currentEmail,
         targetEmail: result.targetEmail
      });

   } catch (error) {
      console.error('HandleSendEmailOTP error:', error);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Lỗi server!'
      });
   }
};

const handleVerifyEmailOTPAndUpdate = async (req, res) => {
   try {
      const { resetToken, otpCode } = req.body;
      const userId = req.user.id;

      console.log(`📧 Verify email OTP request from user ${userId}`);

      if (!resetToken || !otpCode) {
         return res.status(400).json({
            errCode: 1,
            errMessage: 'Thiếu thông tin xác thực!'
         });
      }

      const result = await authService.verifyEmailOTPAndUpdate(resetToken, otpCode);

      if (result.errCode !== 0) {
         const statusCode =
            result.errCode === 1 ? 403 : // Token invalid/expired
               result.errCode === 2 ? 429 : // Too many attempts
                  result.errCode === 3 ? 400 : // Wrong OTP
                     result.errCode === 4 ? 400 : // Invalid email
                        result.errCode === 5 ? 409 : // Email exists
                           500;

         return res.status(statusCode).json({
            errCode: result.errCode,
            errMessage: result.errMessage,
            attemptsRemaining: result.attemptsRemaining
         });
      }

      return res.status(200).json({
         errCode: 0,
         message: result.message
      });

   } catch (error) {
      console.error('HandleVerifyEmailOTPAndUpdate error:', error);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Lỗi server!'
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
   handleResetPassword,
   handleClearOTP,
   handleRequestChangePassword,
   handleChangePassword,
   handleSendEmailOTP,
   handleVerifyEmailOTPAndUpdate
};
