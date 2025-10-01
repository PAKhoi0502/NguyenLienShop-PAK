// src/utils/cookieAuth.js
// Cookie-based authentication utilities for HttpOnly cookies

import axios from '../axios';

// Cache để tránh gọi API liên tục
let authCache = null;
let lastCheckTime = 0;
const CACHE_DURATION = 5000; // 5 seconds cache

/**
 * Check authentication status by calling server
 * Replace localStorage token checking
 */
export const checkAuthStatus = async () => {
   try {
      const now = Date.now();

      // Don't check auth if already on login page - return cached result instead
      if (window.location.pathname === '/login') {
         // Return cached result if available, otherwise return unauthenticated
         if (authCache) {
            return authCache;
         }
         const result = {
            isAuthenticated: false,
            user: null,
            roleId: null
         };
         authCache = result;
         lastCheckTime = now;
         return result;
      }

      // Return cached result if still fresh
      if (authCache && (now - lastCheckTime) < CACHE_DURATION) {
         return authCache;
      }

      const response = await axios.get('/api/auth/check'); const result = response.errCode === 0 ? {
         isAuthenticated: true,
         user: response.data,
         roleId: response.data.roleId
      } : {
         isAuthenticated: false,
         user: null,
         roleId: null
      };

      // Update cache
      authCache = result;
      lastCheckTime = now;

      return result;
   } catch (error) {

      const result = {
         isAuthenticated: false,
         user: null,
         roleId: null
      };

      // Cache failed result for shorter duration
      authCache = result;
      lastCheckTime = Date.now();

      return result;
   }
};

/**
 * Get user role from server instead of localStorage
 */
export const getUserRole = async () => {
   try {
      const authStatus = await checkAuthStatus();
      return authStatus.roleId;
   } catch (error) {
      return null;
   }
};

/**
 * Check if user is admin
 */
export const isAdmin = async () => {
   const roleId = await getUserRole();
   return roleId === 1;
};

/**
 * Check if user is regular user
 */
export const isUser = async () => {
   const roleId = await getUserRole();
   return roleId === 2;
};

/**
 * Logout utility that doesn't need to clear localStorage
 * HttpOnly cookies are cleared by server
 */
export const clearAuthState = () => {
   // No localStorage clearing needed for HttpOnly cookies
   // Server handles cookie clearing

   // Clear auth cache
   authCache = null;
   lastCheckTime = 0;

};

/**
 * Clear auth cache manually (useful for debugging)
 */
export const clearAuthCache = () => {
   authCache = null;
   lastCheckTime = 0;
};

/**
 * Migration utility: Remove old localStorage tokens
 */
export const migrateFromLocalStorage = () => {
   const oldToken = localStorage.getItem('token');
   const oldRoleId = localStorage.getItem('roleId');

   if (oldToken || oldRoleId) {
      localStorage.removeItem('token');
      localStorage.removeItem('roleId');
   }
};
