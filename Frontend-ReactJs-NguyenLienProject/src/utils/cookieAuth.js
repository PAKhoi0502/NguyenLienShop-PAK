// src/utils/cookieAuth.js
// Cookie-based authentication utilities for HttpOnly cookies

import axios from '../axios';

/**
 * Check authentication status by calling server
 * Replace localStorage token checking
 */
export const checkAuthStatus = async () => {
   try {
      const response = await axios.get('/api/auth/check');

      if (response.errCode === 0) {
         return {
            isAuthenticated: true,
            user: response.data,
            roleId: response.data.roleId
         };
      }

      return {
         isAuthenticated: false,
         user: null,
         roleId: null
      };
   } catch (error) {
      console.log('🍪 Auth check failed:', error.message);
      return {
         isAuthenticated: false,
         user: null,
         roleId: null
      };
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
   console.log('🍪 Auth state cleared (cookies handled by server)');
};

/**
 * Migration utility: Remove old localStorage tokens
 */
export const migrateFromLocalStorage = () => {
   const oldToken = localStorage.getItem('token');
   const oldRoleId = localStorage.getItem('roleId');

   if (oldToken || oldRoleId) {
      console.log('🔄 Migrating from localStorage to HttpOnly cookies...');
      localStorage.removeItem('token');
      localStorage.removeItem('roleId');
      console.log('✅ localStorage tokens removed');
   }
};
