import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import ToastUtil from '../utils/ToastUtil';
import { checkAuth } from '../services/authService';
import {
   refreshAccessToken,
   getRefreshTokenStatus,
   clearRefreshTokenData
} from '../services/refreshTokenService';
// import { checkAuthStatus } from '../utils/cookieAuth';

const AuthDebug = () => {
   const [isCollapsed, setIsCollapsed] = useState(false);
   const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 10 });
   const [isDragging, setIsDragging] = useState(false);
   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
   const [cookieTestResult, setCookieTestResult] = useState(null);
   const [isTestingCookie, setIsTestingCookie] = useState(false);
   const [refreshTokenResult, setRefreshTokenResult] = useState(null);
   const [isTestingRefresh, setIsTestingRefresh] = useState(false);
   const dragRef = useRef(null);

   const location = useLocation();

   // Simple auth state without external hooks to avoid circular imports
   const reduxState = useSelector(state => state.admin);

   // 🍪 Cookie-based auth - tokens no longer in localStorage
   const token = localStorage.getItem('token'); // Should be null after migration
   const storedRoleId = localStorage.getItem('roleId'); // Should be null after migration
   const rememberMe = localStorage.getItem('rememberMe');

   // Handle mouse events for dragging
   useEffect(() => {
      const handleMouseMove = (e) => {
         if (!isDragging) return;

         const newX = e.clientX - dragStart.x;
         const newY = e.clientY - dragStart.y;

         // Keep within window bounds
         const maxX = window.innerWidth - 300;
         const maxY = window.innerHeight - 400;

         setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY))
         });
      };

      const handleMouseUp = () => {
         setIsDragging(false);
      };

      if (isDragging) {
         document.addEventListener('mousemove', handleMouseMove);
         document.addEventListener('mouseup', handleMouseUp);
      }

      return () => {
         document.removeEventListener('mousemove', handleMouseMove);
         document.removeEventListener('mouseup', handleMouseUp);
      };
   }, [isDragging, dragStart]);

   const handleMouseDown = (e) => {
      setIsDragging(true);
      setDragStart({
         x: e.clientX - position.x,
         y: e.clientY - position.y
      });
   };

   // 🍪 Cookie Test Functions
   const testCookieAuth = async () => {
      setIsTestingCookie(true);
      try {
         const result = await checkAuth();
         console.log('🍪 Cookie Auth Test Result:', result);
         setCookieTestResult(result);

         if (result.errCode === 0) {
            ToastUtil.success('Cookie Test', 'Authentication successful!');
         } else {
            ToastUtil.error('Cookie Test', 'Authentication failed');
         }
      } catch (error) {
         console.error('Cookie auth test error:', error);
         setCookieTestResult({ errCode: -1, message: 'Test failed' });
         ToastUtil.error('Cookie Test', 'Test failed with error');
      } finally {
         setIsTestingCookie(false);
      }
   };

   const clearAllStorage = () => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.removeItem('persist:root');

      ToastUtil.success('Storage Cleared', 'All storage cleared! Refreshing...');
      setTimeout(() => {
         window.location.reload();
      }, 1000);
   };

   // 🔄 Refresh Token Test Functions
   const testRefreshToken = async () => {
      setIsTestingRefresh(true);
      try {
         const result = await refreshAccessToken();
         console.log('🔄 Refresh Token Test Result:', result);
         setRefreshTokenResult(result);

         if (result.success) {
            ToastUtil.success('Refresh Test', 'Token refreshed successfully!');
         } else {
            ToastUtil.error('Refresh Test', 'Token refresh failed');
         }
      } catch (error) {
         console.error('Refresh token test error:', error);
         setRefreshTokenResult({ success: false, error: 'Test failed' });
         ToastUtil.error('Refresh Test', 'Test failed with error');
      } finally {
         setIsTestingRefresh(false);
      }
   };

   const showRefreshTokenStatus = () => {
      const status = getRefreshTokenStatus();
      console.log('🔄 Refresh Token Status:', status);
      ToastUtil.info('Refresh Token Info', 'Check console for details');
   };

   const clearRefreshTokenDebugData = () => {
      clearRefreshTokenData();
      ToastUtil.success('Debug Data Cleared', 'Refresh token debug data cleared');
   };

   if (isCollapsed) {
      return (
         <div
            ref={dragRef}
            style={{
               position: 'fixed',
               left: position.x,
               top: position.y,
               background: 'rgba(0,0,0,0.8)',
               color: 'white',
               padding: '5px 10px',
               borderRadius: '5px',
               fontSize: '12px',
               zIndex: 9998, // Lower than toast (10000+)
               cursor: isDragging ? 'grabbing' : 'grab',
               userSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
            onClick={() => setIsCollapsed(false)}
         >
            🔍 Debug (Drag to move)
         </div>
      );
   }

   return (
      <div
         ref={dragRef}
         style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            background: 'rgba(0,0,0,0.9)',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '11px',
            zIndex: 9998, // Lower than toast (10000+)
            maxWidth: '300px',
            fontFamily: 'monospace',
            border: '2px solid #333',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
         }}
      >
         {/* Header with separate drag handle and close button */}
         <div
            style={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               marginBottom: '10px'
            }}
         >
            {/* Drag Handle */}
            <div
               style={{
                  flex: 1,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  padding: '2px 8px 2px 2px',
                  borderRadius: '4px',
                  background: isDragging ? 'rgba(255,255,255,0.1)' : 'transparent'
               }}
               onMouseDown={handleMouseDown}
            >
               <h4 style={{ margin: 0, color: '#00ff88' }}>🔍 DEV Debug Panel {isDragging ? '(Moving...)' : '(Drag to move)'}</h4>
            </div>

            {/* Close Button - Separate from drag area */}
            <button
               onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCollapsed(true);
               }}
               onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
               }}
               style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
               }}
               title="Collapse panel"
               onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
               }}
               onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
               }}
            >
               ✕
            </button>
         </div>

         {/* Auth Status */}
         <div style={{ marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
            <strong style={{ color: '#ffaa00' }}>🔐 Authentication:</strong>
            <div>token: {token ? '✅ Present' : '❌ Missing'}</div>
            <div>roleId (localStorage): {storedRoleId || '⚪ None'}</div>
            <div>isAdmin: {storedRoleId === '1' ? '✅ True' : '❌ False'}</div>
         </div>

         {/* 🍪 Cookie Test Section */}
         <div style={{ marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
            <strong style={{ color: '#ffaa00' }}>🍪 Cookie Authentication:</strong>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px' }}>
               <button
                  onClick={testCookieAuth}
                  disabled={isTestingCookie}
                  style={{
                     ...buttonStyle,
                     backgroundColor: isTestingCookie ? '#666' : '#28a745',
                     cursor: isTestingCookie ? 'not-allowed' : 'pointer'
                  }}
               >
                  {isTestingCookie ? '⏳' : '🔬'} Test Cookie
               </button>
               <button
                  onClick={clearAllStorage}
                  style={{
                     ...buttonStyle,
                     backgroundColor: '#dc3545'
                  }}
               >
                  🧹 Clear All
               </button>
            </div>
            {cookieTestResult && (
               <div style={{
                  marginTop: '4px',
                  padding: '4px',
                  backgroundColor: cookieTestResult.errCode === 0 ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)',
                  borderRadius: '3px',
                  fontSize: '11px'
               }}>
                  <div>{cookieTestResult.errCode === 0 ? '✅' : '❌'} {cookieTestResult.message}</div>
                  {cookieTestResult.data && (
                     <div>User ID: {cookieTestResult.data.id} | Role: {cookieTestResult.data.roleId}</div>
                  )}
               </div>
            )}
         </div>

         {/* 🔄 Refresh Token Test Section */}
         <div style={{ marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
            <strong style={{ color: '#ffaa00' }}>🔄 Refresh Token:</strong>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px' }}>
               <button
                  onClick={testRefreshToken}
                  disabled={isTestingRefresh}
                  style={{
                     ...buttonStyle,
                     backgroundColor: isTestingRefresh ? '#666' : '#007bff',
                     cursor: isTestingRefresh ? 'not-allowed' : 'pointer'
                  }}
               >
                  {isTestingRefresh ? '⏳' : '🔄'} Test Refresh
               </button>
               <button
                  onClick={showRefreshTokenStatus}
                  style={{
                     ...buttonStyle,
                     backgroundColor: '#17a2b8'
                  }}
               >
                  📊 Status
               </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px', marginTop: '4px' }}>
               <button
                  onClick={clearRefreshTokenDebugData}
                  style={{
                     ...buttonStyle,
                     backgroundColor: '#ffc107',
                     color: '#212529'
                  }}
               >
                  🧹 Clear Debug Data
               </button>
            </div>
            {refreshTokenResult && (
               <div style={{
                  marginTop: '4px',
                  padding: '4px',
                  backgroundColor: refreshTokenResult.success ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)',
                  borderRadius: '3px',
                  fontSize: '11px'
               }}>
                  <div>{refreshTokenResult.success ? '✅' : '❌'} {refreshTokenResult.success ? 'Token refreshed' : refreshTokenResult.error}</div>
                  {refreshTokenResult.data && (
                     <div>User ID: {refreshTokenResult.data.id} | Role: {refreshTokenResult.data.roleId}</div>
                  )}
               </div>
            )}
         </div>

         {/* Redux State */}
         <div style={{ marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
            <strong style={{ color: '#ffaa00' }}>🔄 Redux State:</strong>
            <div>isLoggedIn: {reduxState.isLoggedIn ? '✅ True' : '❌ False'}</div>
            <div>adminInfo: {reduxState.adminInfo ? '✅ Present' : '❌ Null'}</div>
            <div>error: {reduxState.error ? '⚠️ ' + reduxState.error : '✅ None'}</div>
         </div>

         {/* Current Route */}
         <div style={{ marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
            <strong style={{ color: '#ffaa00' }}>🗺️ Navigation:</strong>
            <div>Current Path: <span style={{ color: '#00ff88' }}>{location.pathname}</span></div>
            <div>Search: {location.search || '⚪ None'}</div>
         </div>

         {/* LocalStorage Info */}
         <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#ffaa00' }}>💾 Storage:</strong>
            <div>Remember Me: {rememberMe ? '✅ Yes' : '❌ No'}</div>
            <div>Token Length: {token ? token.length + ' chars' : '0'}</div>
         </div>

         {/* Quick Actions */}
         <div style={{ marginTop: '10px', paddingTop: '5px', borderTop: '1px solid #333' }}>
            <strong style={{ color: '#ffaa00' }}>⚡ Quick Actions:</strong>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', marginTop: '5px' }}>
               <button
                  onClick={() => {
                     console.log('🔍 Debug Info:', {
                        auth: { token: !!token, roleId: storedRoleId },
                        redux: reduxState,
                        location: location
                     });
                  }}
                  style={{
                     background: '#4444ff',
                     color: 'white',
                     border: 'none',
                     padding: '2px 6px',
                     borderRadius: '3px',
                     fontSize: '9px',
                     cursor: 'pointer'
                  }}
               >
                  📋 Log Debug Info
               </button>
               <button
                  onClick={() => {
                     // Dismiss all toasts
                     toast.dismiss();
                  }}
                  style={{
                     background: '#dc3545',
                     color: 'white',
                     border: 'none',
                     padding: '2px 6px',
                     borderRadius: '3px',
                     fontSize: '9px',
                     cursor: 'pointer'
                  }}
               >
                  🗑️ Clear Toasts
               </button>
            </div>
         </div>
      </div>
   );
};

// Button style for position controls
const buttonStyle = {
   background: '#666',
   color: 'white',
   border: 'none',
   padding: '2px 4px',
   borderRadius: '2px',
   fontSize: '9px',
   cursor: 'pointer'
};

export default AuthDebug;
