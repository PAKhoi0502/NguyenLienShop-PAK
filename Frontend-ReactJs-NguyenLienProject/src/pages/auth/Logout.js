// src/pages/auth/Logout.js
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import * as actions from '../../store/actions';
import { logout } from '../../services/authService';
import toast from 'react-hot-toast';

const Logout = () => {
   const dispatch = useDispatch();
   const history = useHistory();

   useEffect(() => {
      const handleLogout = async () => {
         try {
            // ✅ Gọi API logout để blacklist token
            const response = await logout();

            if (response.errCode === 0 || response.errCode === undefined) {
               console.log('✅ Token blacklisted successfully');
               toast.success('Đăng xuất thành công');
            } else {
               console.warn('⚠️ Logout API error:', response.errMessage);
               // Vẫn logout ở frontend ngay cả khi API failed
            }
         } catch (error) {
            console.error('❌ Logout API call failed:', error);
            // Vẫn logout ở frontend ngay cả khi API failed
         } finally {
            // 🍪 HttpOnly cookies are cleared by server
            // 🔧 Keep rememberMe and savedIdentifier for better UX
            // Don't clear these on logout - user might want to login again quickly

            dispatch(actions.processLogout());
            history.push('/login');
         }
      };

      handleLogout();
   }, [dispatch, history]);

   return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
         <p>Đang đăng xuất...</p>
      </div>
   );
};

export default Logout;
