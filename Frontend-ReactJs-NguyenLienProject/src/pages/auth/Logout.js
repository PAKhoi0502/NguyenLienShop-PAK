import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { processLogout } from '../../store/reducers/adminReducer';
import { logout } from '../../services/authService';
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';
import CustomToast from '../../components/CustomToast';

const Logout = () => {
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const intl = useIntl();
   const hasLoggedOut = useRef(false);

   useEffect(() => {
      const handleLogout = async () => {
         // Prevent double execution - ENHANCED CHECK
         if (hasLoggedOut.current) {
            return;
         }

         hasLoggedOut.current = true;

         try {
            // Call logout API to blacklist token
            const response = await logout();

            if (response.errCode === 0 || response.errCode === undefined) {

               // Show success toast BEFORE navigate
               toast(
                  <CustomToast
                     type="success"
                     titleId="logout.success"
                     message={intl.formatMessage({ id: 'logout.success', defaultMessage: 'Đăng xuất thành công!' })}
                     time={new Date()}
                  />,
                  { closeButton: false, type: "success" }
               );

               // Clear Redux state
               dispatch(processLogout());

               // Delay navigate to allow toast to show
               setTimeout(() => {
                  navigate('/login', { replace: true });
               }, 2200); // Slightly longer than toast autoClose
            } else {
               console.warn('⚠️ Logout API error:', response.errMessage);
               handleLogoutError(response.errMessage);
            }
         } catch (error) {
            console.error('❌ Logout API call failed:', error);
            handleLogoutError();
         }
      };

      const handleLogoutError = (errorMessage) => {
         toast(
            <CustomToast
               type="error"
               titleId="logout.failed_title"
               message={errorMessage || intl.formatMessage({ id: 'logout.error' })}
               time={new Date()}
            />,
            { closeButton: false, type: "error" }
         );

         // Even if API fails, still logout and navigate
         dispatch(processLogout());
         setTimeout(() => {
            navigate('/login', { replace: true });
         }, 1500);
      };

      handleLogout();

      // Cleanup function - DON'T reset hasLoggedOut here
      return () => {
         // Keep hasLoggedOut.current = true to prevent re-execution
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []); // Intentionally empty to prevent re-execution

   return (
      <div className="logout-page" style={{ padding: '20px', textAlign: 'center' }}>
         <p>{intl.formatMessage({ id: 'logout.loading', defaultMessage: 'Đang đăng xuất...' })}</p>
      </div>
   );
};

export default Logout;