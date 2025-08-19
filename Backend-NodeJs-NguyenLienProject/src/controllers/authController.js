import authService from "../services/authService";
import refreshTokenService from "../services/refreshTokenService";
import tokenManagementService from "../services/tokenManagementService";
import authResponseHelper from "../utils/authResponseHelper";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';dotenv.config();

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

export default {
   handleLogin,
   handleRegister,
   handleLogout,
   handleAuthCheck,
   handleRefreshToken,
   handleGetUserSessions,
   handleLogoutAllDevices
};
