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

      // Don't check auth if on public pages - but don't force set false
      const publicPaths = ['/login', '/register', '/forgot-password'];
      const currentPath = window.location.pathname;

      if (publicPaths.some(path => currentPath === path || currentPath.startsWith(path))) {
         // Don't update cookieAuth state, just skip the check
         setIsLoading(false);
         return;
      }

      // Prevent multiple simultaneous checks
      if (isCheckingAuth.current) {
         return;
      }

      // Prevent too frequent checks
      if (now - lastCheckTime.current < MIN_CHECK_INTERVAL) {
         return;
      }

      isCheckingAuth.current = true;
      lastCheckTime.current = now;

      try {
         const authData = await checkAuthStatus();
         setCookieAuth(authData);
      } catch (error) {
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
         checkCookieAuth();
      }
   }, [forceRefresh, checkCookieAuth]);

   // Separate effect to handle Redux/Cookie sync
   useEffect(() => {
      if (!isLoading && cookieAuth !== null) {
         // Give more time after login for cookies to sync - prevent immediate logout
         const recentLoginTime = localStorage.getItem('lastLoginTime');
         const now = Date.now();
         const timeSinceLogin = recentLoginTime ? (now - parseInt(recentLoginTime)) : Infinity;

         // If Redux says logged in but cookie auth fails, and it's not a recent login, clear Redux
         if (isLoggedIn && !cookieAuth.isAuthenticated && timeSinceLogin > 10000) { // Increased to 10 second grace period
            dispatch(processLogout());
         } else if (isLoggedIn && !cookieAuth.isAuthenticated && timeSinceLogin <= 10000) {
         } else if (isLoggedIn && cookieAuth.isAuthenticated) {
         }
      }
   }, [isLoggedIn, cookieAuth, isLoading, dispatch]);

   // Listen for external auth changes
   useEffect(() => {
      const unsubscribe = addAuthListener(() => {
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
   // 2. Cookie auth (persistent across sessions) - ONLY if Redux doesn't explicitly say false
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
   } else if (!isLoggedIn) {
      // 🔧 FIX: If Redux explicitly says not logged in, always return false
      // This prevents cookies from overriding Redux logout state
      isAuthenticated = false;
      effectiveRoleId = null;
      effectiveAdminInfo = null;
   } else if (cookieAuth?.isAuthenticated) {
      // Use cookie auth (persistent sessions) - only if Redux doesn't explicitly say false
      isAuthenticated = true;
      effectiveRoleId = cookieAuth.user?.roleId?.toString();
      effectiveAdminInfo = cookieAuth.user;
   } else if (token && roleId) {
      // Fallback to localStorage (transition period)
      isAuthenticated = true;
      effectiveRoleId = roleId;
      effectiveAdminInfo = adminInfo;
   } else {
      isAuthenticated = false;
      effectiveRoleId = null;
      effectiveAdminInfo = null;
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