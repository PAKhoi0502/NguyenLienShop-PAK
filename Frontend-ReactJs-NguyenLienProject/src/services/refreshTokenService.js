// src/services/refreshTokenService.js
// Frontend service for handling refresh token logic

import axios from '../axios';

/**
 * 🔄 Refresh access token using refresh token
 */
export const refreshAccessToken = async () => {
   try {
      const response = await axios.post('/api/auth/refresh');

      if (response.errCode === 0) {
         return {
            success: true,
            accessToken: response.token,
            expiresIn: response.expiresIn,
            data: response.data
         };
      } else {
         return {
            success: false,
            error: response.errMessage || 'Failed to refresh token'
         };
      }
   } catch (error) {
      console.error('❌ Refresh token error:', error);
      return {
         success: false,
         error: error.response?.data?.errMessage || 'Network error during token refresh'
      };
   }
};

/**
 * 🔍 Check if we should attempt to refresh token
 */
export const shouldRefreshToken = (error) => {
   // Check if error is 401 (Unauthorized) and not a refresh token error
   // ✅ Also exclude login endpoints from auto-refresh
   const isUnauthorized = error.response?.status === 401;
   const isRefreshEndpoint = error.config?.url?.includes('/api/auth/refresh');
   const isLoginEndpoint = error.config?.url?.includes('/api/auth/login');
   const isOnLoginPage = window.location.pathname === '/login';

   // Don't refresh tokens for login endpoints, refresh endpoints, or when on login page
   return isUnauthorized && !isRefreshEndpoint && !isLoginEndpoint && !isOnLoginPage;
};

/**
 * 🎯 Handle token refresh and retry original request
 */
export const handleTokenRefreshAndRetry = async (originalRequest) => {
   try {
      // Prevent infinite loops
      if (originalRequest._retry) {
         // Clean up retry flag and reject to stop the loop
         delete originalRequest._retry;
         return Promise.reject(new Error('Token refresh loop prevented'));
      }

      // Check if already redirecting to prevent multiple redirects
      if (window.location.pathname === '/login') {
         return Promise.reject(new Error('Already on login page'));
      }

      originalRequest._retry = true;

      // Attempt to refresh token
      const refreshResult = await refreshAccessToken();

      if (refreshResult.success) {
         // Clean up retry flag on successful refresh
         delete originalRequest._retry;
         // Retry the original request
         return axios(originalRequest);
      } else {
         // Clean up retry flag
         delete originalRequest._retry;

         // Prevent multiple redirects using a flag
         if (!window.isRedirectingToLogin) {
            window.isRedirectingToLogin = true;
            setTimeout(() => {
               window.location.href = '/login';
            }, 100);
         }

         return Promise.reject(refreshResult.error);
      }
   } catch (error) {
      console.error('❌ Error during token refresh and retry:', error);

      // Prevent multiple redirects
      if (!window.isRedirectingToLogin) {
         window.isRedirectingToLogin = true;
         setTimeout(() => {
            window.location.href = '/login';
         }, 100);
      }

      return Promise.reject(error);
   }
};

/**
 * 📊 Get refresh token status (for debugging)
 */
export const getRefreshTokenStatus = () => {
   // Since refresh token is HttpOnly, we can't access it directly
   // We can only know its status through API calls
   return {
      note: 'Refresh token is HttpOnly cookie - status only known through API calls',
      lastRefreshAttempt: localStorage.getItem('lastRefreshAttempt'),
      refreshFailureCount: localStorage.getItem('refreshFailureCount') || '0'
   };
};

/**
 * 🧹 Clear refresh token related localStorage (for debugging)
 */
export const clearRefreshTokenData = () => {
   localStorage.removeItem('lastRefreshAttempt');
   localStorage.removeItem('refreshFailureCount');
};

const refreshTokenService = {
   refreshAccessToken,
   shouldRefreshToken,
   handleTokenRefreshAndRetry,
   getRefreshTokenStatus,
   clearRefreshTokenData
};

export default refreshTokenService;
