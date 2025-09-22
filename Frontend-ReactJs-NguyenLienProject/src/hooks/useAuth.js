import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, useCallback, useRef } from 'react';
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

   // Prevent infinite loops with ref
   const isCheckingAuth = useRef(false);
   const lastCheckTime = useRef(0);
   const MIN_CHECK_INTERVAL = 2000; // Minimum 2 seconds between checks

   const checkCookieAuth = useCallback(async () => {
      const now = Date.now();

      // Don't check auth if on login page
      if (window.location.pathname === '/login') {
         console.log('🔧 useAuth: On login page, skipping auth check');
         setCookieAuth({ isAuthenticated: false });
         setIsLoading(false);
         return;
      }

      // Prevent multiple simultaneous checks
      if (isCheckingAuth.current) {
         console.log('🔧 useAuth: Already checking auth, skipping...');
         return;
      }

      // Prevent too frequent checks
      if (now - lastCheckTime.current < MIN_CHECK_INTERVAL) {
         console.log('🔧 useAuth: Too frequent check, skipping...');
         return;
      }

      isCheckingAuth.current = true;
      lastCheckTime.current = now;

      try {
         const authData = await checkAuthStatus();
         setCookieAuth(authData);
      } catch (error) {
         console.log('Cookie auth check failed:', error);
         setCookieAuth({ isAuthenticated: false });
      } finally {
         setIsLoading(false);
         isCheckingAuth.current = false;
      }
   }, []); // Remove dependencies to prevent infinite loop

   useEffect(() => {
      checkCookieAuth();
   }, [checkCookieAuth]); // Initial check only

   // Separate effect for handling force refresh
   useEffect(() => {
      if (forceRefresh > 0) {
         console.log('🔧 useAuth: Force refresh triggered:', forceRefresh);
         checkCookieAuth();
      }
   }, [forceRefresh, checkCookieAuth]);

   // Separate effect to handle Redux/Cookie sync
   useEffect(() => {
      if (!isLoading && cookieAuth !== null) {
         // Give some time after login for cookies to sync - prevent immediate logout
         const recentLoginTime = localStorage.getItem('lastLoginTime');
         const now = Date.now();
         const timeSinceLogin = recentLoginTime ? (now - parseInt(recentLoginTime)) : Infinity;

         // If Redux says logged in but cookie auth fails, and it's not a recent login, clear Redux
         if (isLoggedIn && !cookieAuth.isAuthenticated && timeSinceLogin > 3000) { // 3 second grace period
            console.log('🔧 useAuth: Redux state exists but cookie auth failed after grace period - clearing Redux');
            dispatch(processLogout());
         } else if (isLoggedIn && !cookieAuth.isAuthenticated && timeSinceLogin <= 3000) {
            console.log('🔧 useAuth: Cookie auth failed but within grace period after login - keeping Redux state');
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