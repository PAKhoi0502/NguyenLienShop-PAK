// src/utils/authResponseHelper.js
// Centralized auth response utilities

import cookieHelper from './cookieHelper';
import sendResponse from './sendResponse';

/**
 * 🎯 Send successful login response with cookies
 */
const sendLoginSuccessResponse = (res, { user, accessToken, refreshToken, rememberMe }) => {
   // Set auth cookies
   cookieHelper.setAuthCookies(res, { accessToken, refreshToken }, rememberMe);

   // Get expiration info
   const { accessTokenSeconds } = cookieHelper.getTokenExpirationInfo(rememberMe);

   return sendResponse(res, {
      message: 'Đăng nhập thành công',
      token: accessToken, // For backward compatibility
      expiresIn: accessTokenSeconds,
      rememberMe: rememberMe,
      data: user
   });
};

/**
 * 🔄 Send successful token refresh response with cookies
 */
const sendTokenRefreshSuccessResponse = (res, { user, accessToken, refreshToken }) => {
   // Set new auth cookies
   cookieHelper.setAccessTokenCookie(res, accessToken, false); // Refresh always uses 30min
   cookieHelper.setRefreshTokenCookie(res, refreshToken);

   return sendResponse(res, {
      status: 200,
      errCode: 0,
      message: 'Token refreshed successfully',
      token: accessToken, // For backward compatibility
      expiresIn: 1800, // 30 minutes
      data: {
         id: user.id,
         roleId: user.roleId
      }
   });
};

/**
 * 🚫 Send logout success response and clear cookies
 */
const sendLogoutSuccessResponse = (res) => {
   // Clear auth cookies
   cookieHelper.clearAuthCookies(res);

   return sendResponse(res, {
      status: 200,
      errCode: 0,
      message: 'Đăng xuất thành công',
   });
};

/**
 * ❌ Send auth error response
 */
const sendAuthErrorResponse = (res, { status = 401, errCode = 1, message = 'Authentication failed' }) => {
   return sendResponse(res, {
      status,
      errCode,
      message,
   });
};

/**
 * 💥 Send server error response
 */
const sendServerErrorResponse = (res, message = 'Server error', error = null) => {
   if (error) {
      console.error('❌ Server error:', error);
   }

   return sendResponse(res, {
      status: 500,
      errCode: -1,
      message,
   });
};

/**
 * ✅ Send auth check success response
 */
const sendAuthCheckSuccessResponse = (res, user) => {
   return sendResponse(res, {
      status: 200,
      errCode: 0,
      message: 'Authenticated',
      data: {
         id: user.id,
         roleId: user.roleId,
         isAuthenticated: true
      }
   });
};

const authResponseHelper = {
   sendLoginSuccessResponse,
   sendTokenRefreshSuccessResponse,
   sendLogoutSuccessResponse,
   sendAuthErrorResponse,
   sendServerErrorResponse,
   sendAuthCheckSuccessResponse
};

export default authResponseHelper;
