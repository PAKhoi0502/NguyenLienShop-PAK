import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const AuthDebug = () => {
   const [isCollapsed, setIsCollapsed] = useState(false);
   const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 10 });
   const [isDragging, setIsDragging] = useState(false);
   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
   const dragRef = useRef(null);

   const location = useLocation();

   // Simple auth state without external hooks to avoid circular imports
   const reduxState = useSelector(state => state.admin);
   const token = localStorage.getItem('token');
   const storedRoleId = localStorage.getItem('roleId');
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

   // Quick position presets
   const moveToCorner = (corner) => {
      switch (corner) {
         case 'top-right':
            setPosition({ x: window.innerWidth - 320, y: 10 });
            break;
         case 'top-left':
            setPosition({ x: 10, y: 10 });
            break;
         case 'bottom-right':
            setPosition({ x: window.innerWidth - 320, y: window.innerHeight - 400 });
            break;
         case 'bottom-left':
            setPosition({ x: 10, y: window.innerHeight - 400 });
            break;
         default:
            break;
      }
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

         {/* Position Controls */}
         <div style={{ marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
            <strong style={{ color: '#ffaa00' }}>📍 Quick Position:</strong>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', marginTop: '3px' }}>
               <button onClick={() => moveToCorner('top-left')} style={buttonStyle}>↖ Top-Left</button>
               <button onClick={() => moveToCorner('top-right')} style={buttonStyle}>↗ Top-Right</button>
               <button onClick={() => moveToCorner('bottom-left')} style={buttonStyle}>↙ Bottom-Left</button>
               <button onClick={() => moveToCorner('bottom-right')} style={buttonStyle}>↘ Bottom-Right</button>
            </div>
         </div>

         {/* Auth Status */}
         <div style={{ marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
            <strong style={{ color: '#ffaa00' }}>🔐 Authentication:</strong>
            <div>token: {token ? '✅ Present' : '❌ Missing'}</div>
            <div>roleId (localStorage): {storedRoleId || '⚪ None'}</div>
            <div>isAdmin: {storedRoleId === '1' ? '✅ True' : '❌ False'}</div>
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
                     localStorage.clear();
                     window.location.reload();
                  }}
                  style={{
                     background: '#ff4444',
                     color: 'white',
                     border: 'none',
                     padding: '2px 6px',
                     borderRadius: '3px',
                     fontSize: '9px',
                     cursor: 'pointer'
                  }}
               >
                  Clear Storage
               </button>
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
                  Log to Console
               </button>
               <button
                  onClick={() => {
                     // Test react-hot-toast với duration khác nhau
                     toast.success('🎉 Success Toast (4s auto-close)', { duration: 4000 });
                     toast.error('❌ Error Toast (5s auto-close)', { duration: 5000 });
                     toast('ℹ️ Info Toast (3s auto-close)', { duration: 3000 });
                     toast.loading('⏳ Loading Toast (manual dismiss)', { duration: Infinity });
                  }}
                  style={{
                     background: '#28a745',
                     color: 'white',
                     border: 'none',
                     padding: '2px 6px',
                     borderRadius: '3px',
                     fontSize: '9px',
                     cursor: 'pointer'
                  }}
               >
                  🕒 Test Auto-Close
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
                     cursor: 'pointer',
                     marginLeft: '2px'
                  }}
               >
                  🗑️ Clear All
               </button>
               <button
                  onClick={() => {
                     // Refresh current page
                     window.location.reload();
                  }}
                  style={{
                     background: '#17a2b8',
                     color: 'white',
                     border: 'none',
                     padding: '2px 6px',
                     borderRadius: '3px',
                     fontSize: '9px',
                     cursor: 'pointer'
                  }}
               >
                  Refresh
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
