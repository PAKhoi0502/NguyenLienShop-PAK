import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';
import { checkAuthStatus } from '../utils/cookieAuth';
import { addAuthListener } from '../utils/authContext';
import { processLogout } from '../store/reducers/adminReducer';
import { getRefreshTokenStatus } from '../services/refreshTokenService';

const useAuth = () => {
   const dispatch = useDispatch();
   const isLoggedIn = useSelector((state) => state.admin.isLoggedIn);
   const adminInfo = useSelector((state) => state.admin.adminInfo);
   const [cookieAuth, setCookieAuth] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [forceRefresh, setForceRefresh] = useState(0);
   const [refreshTokenInfo, setRefreshTokenInfo] = useState(null);

   const checkCookieAuth = useCallback(async () => {
      try {
         const authData = await checkAuthStatus();
         setCookieAuth(authData);
         // console.log('🔧 useAuth: Cookie auth check result:', authData);
      } catch (error) {
         console.log('Cookie auth check failed:', error);
         setCookieAuth({ isAuthenticated: false });
      } finally {
         setIsLoading(false);
      }
   }, []); // Remove dependencies to prevent infinite loop

   useEffect(() => {
      checkCookieAuth();
   }, [checkCookieAuth, forceRefresh]); // Only re-run on forceRefresh

   // Separate effect to handle Redux/Cookie sync
   useEffect(() => {
      if (!isLoading && cookieAuth !== null) {
         // If Redux says logged in but cookie auth fails, clear Redux
         if (isLoggedIn && !cookieAuth.isAuthenticated) {
            console.log('🔧 useAuth: Redux state exists but cookie auth failed - clearing Redux');
            dispatch(processLogout());
         }
      }
   }, [isLoggedIn, cookieAuth, isLoading, dispatch]);

   // Listen for external auth changes
   useEffect(() => {
      const unsubscribe = addAuthListener(() => {
         // console.log('🔧 useAuth: Received auth change notification');
         setForceRefresh(prev => prev + 1);
      });
      return unsubscribe;
   }, []); // Include checkCookieAuth in dependencies

   // 🔄 Get refresh token status for debugging
   useEffect(() => {
      if (!isLoading) {
         const tokenStatus = getRefreshTokenStatus();
         setRefreshTokenInfo(tokenStatus);
      }
   }, [isLoading, forceRefresh]);

   // Legacy localStorage support (for transition period)
   const token = localStorage.getItem('token');
   const roleId = localStorage.getItem('roleId');

   // Priority logic:
   // 1. Redux state (immediate after login) - ALWAYS PRIORITIZE THIS
   // 2. Cookie auth (persistent across sessions)  
   // 3. localStorage (fallback during transition)

   let isAuthenticated, effectiveRoleId, effectiveAdminInfo;

   if (isLoading) {
      // Still loading cookie auth - wait before making decisions
      isAuthenticated = false;
      effectiveRoleId = null;
      effectiveAdminInfo = null;
   } else if (isLoggedIn && adminInfo && adminInfo.roleId) {
      // Use Redux state (immediate after login)
      isAuthenticated = true;
      effectiveRoleId = adminInfo.roleId?.toString();
      effectiveAdminInfo = adminInfo;
      // console.log('🔧 useAuth: Using Redux state', { isLoggedIn, adminInfo });
   } else if (cookieAuth?.isAuthenticated) {
      // Use cookie auth (persistent sessions)
      isAuthenticated = true;
      effectiveRoleId = cookieAuth.user?.roleId?.toString();
      effectiveAdminInfo = cookieAuth.user;
      // console.log('🔧 useAuth: Using cookie auth', { cookieAuth });
   } else if (token && roleId) {
      // Fallback to localStorage (transition period)
      isAuthenticated = true;
      effectiveRoleId = roleId;
      effectiveAdminInfo = adminInfo;
      // console.log('🔧 useAuth: Using localStorage fallback', { token: !!token, roleId });
   } else {
      isAuthenticated = false;
      effectiveRoleId = null;
      effectiveAdminInfo = null;
      // console.log('🔧 useAuth: No authentication found');
   }

   return {
      isAuthenticated,
      roleId: effectiveRoleId,
      isAdmin: effectiveRoleId === '1',
      isUser: effectiveRoleId === '2',
      adminInfo: effectiveAdminInfo,
      isLoading,
      refreshTokenInfo, // For debugging refresh token status
   };
};

export default useAuth;