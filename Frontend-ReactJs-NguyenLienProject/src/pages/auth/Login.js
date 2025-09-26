import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { adminLoginSuccess, adminLoginFail } from '../../store/reducers/adminReducer';
import { login } from '../../services/authService';
import CustomToast from '../../components/CustomToast';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.scss';

const Login = () => {
   const [identifier, setIdentifier] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [rememberMe, setRememberMe] = useState(false);
   const [loading, setLoading] = useState(false);

   const dispatch = useDispatch();
   const navigate = useNavigate();
   const location = useLocation();
   const intl = useIntl(); useEffect(() => {
      const rememberMeStored = localStorage.getItem('rememberMe') === 'true';
      const savedIdentifier = localStorage.getItem('savedIdentifier') || '';
      if (rememberMeStored && savedIdentifier) {
         setIdentifier(savedIdentifier);
         setRememberMe(true);
      }

      // Check for logout success parameter and show toast
      const params = new URLSearchParams(location.search);
      const logoutSuccess = params.get('logoutSuccess');
      
      if (logoutSuccess === 'true') {
         // Show logout success toast
         toast(
            <CustomToast
               type="success"
               titleId="logout.success"
               messageId="logout.success_message"
               time={new Date()}
            />,
            { closeButton: false, type: "success" }
         );
         
         // Clean up URL by removing the parameter
         const newUrl = new URL(window.location);
         newUrl.searchParams.delete('logoutSuccess');
         window.history.replaceState({}, '', newUrl);
      }
   }, [location.search]);

   const handleChange = (e) => {
      const { name, value, checked } = e.target;
      if (name === 'rememberMe') setRememberMe(checked);
      else if (name === 'identifier') setIdentifier(value);
      else if (name === 'password') setPassword(value);
   };

   const handleLogin = async () => {
      if (!identifier || !password) {
         toast(
            <CustomToast
               type="error"
               titleId="login.failed"
               message={intl.formatMessage({ id: 'login.missing_info' })}
               time={new Date()}
            />,
            { closeButton: false, type: "error" }
         );
         return;
      }

      setLoading(true);

      // ✅ Clear any existing auth state before new login
      dispatch(adminLoginFail()); // Clear Redux state
      localStorage.removeItem('token');
      localStorage.removeItem('roleId');

      try {
         const response = await login({ identifier, password, rememberMe });
         if (response.errCode !== 0) {
            toast(
               <CustomToast
                  type="error"
                  titleId="login.failed"
                  message={response.errMessage || intl.formatMessage({ id: 'login.failed' })}
                  time={new Date()}
               />,
               { closeButton: false, type: "error" }
            );
            dispatch(adminLoginFail());
            return;
         }

         if (!response.token) {
            toast(
               <CustomToast
                  type="error"
                  titleId="login.failed"
                  message={intl.formatMessage({ id: 'login.no_token' })}
                  time={new Date()}
               />,
               { closeButton: false, type: "error" }
            );
            return;
         }

         const { data: user } = response;

         // 🍪 HttpOnly cookies are set by server, no localStorage needed
         // Remove token and roleId from localStorage for security

         // 🔧 Only save rememberMe and identifier for user convenience
         if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('savedIdentifier', identifier);
         } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('savedIdentifier');
         }
         dispatch(adminLoginSuccess(user));

         // 🔧 Set login timestamp for useAuth grace period
         localStorage.setItem('lastLoginTime', Date.now().toString());


         toast(
            <CustomToast
               type="success"
               titleId="login.success"
               message={intl.formatMessage({ id: 'login.success' })}
               time={new Date()}
            />,
            { closeButton: false, type: "success" }
         );

         // ✅ Redirect based on user role
         const params = new URLSearchParams(location.search);
         const redirectPath = params.get('redirect');

         let targetPath;
         if (redirectPath) {
            targetPath = redirectPath;
         } else {
            // Default redirect based on role
            targetPath = user.roleId === 1 ? '/admin' : '/';
         }

         // ✅ Navigate immediately after successful login
         navigate(targetPath, { replace: true });
      } catch (err) {
         toast(
            <CustomToast
               type="error"
               titleId="login.failed"
               message={intl.formatMessage({ id: 'login.failed' })}
               time={new Date()}
            />,
            { closeButton: false, type: "error" }
         );
         dispatch(adminLoginFail());
      } finally {
         setLoading(false);
      }
   };

   // 🔧 Handle form submission (Enter key support)
   const handleSubmit = (e) => {
      e.preventDefault(); // Prevent page reload
      console.log('🔧 Form submitted via Enter key or button click');
      if (!loading) {
         handleLogin();
      }
   };

   return (
      <div className="login-page">
         <div className="login-box">
            <h2>{intl.formatMessage({ id: 'login.title' })}</h2>
            <p className="subtitle">{intl.formatMessage({ id: 'login.subtitle' })}</p>

            <form onSubmit={handleSubmit}>
               <input
                  type="text"
                  name="identifier"
                  placeholder={intl.formatMessage({ id: 'login.identifier_placeholder' })}
                  value={identifier}
                  onChange={handleChange}
                  disabled={loading}
               />

               <div className="password-wrapper">
                  <input
                     type={showPassword ? 'text' : 'password'}
                     name="password"
                     placeholder={intl.formatMessage({ id: 'login.password_placeholder' })}
                     value={password}
                     onChange={handleChange}
                     disabled={loading}
                  />
                  <span
                     className="toggle-password"
                     onClick={() => !loading && setShowPassword(!showPassword)}
                  >
                     <i className={`fa-solid ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                  </span>
               </div>

               <div className="remember-me">
                  <input
                     type="checkbox"
                     name="rememberMe"
                     checked={rememberMe}
                     onChange={handleChange}
                     id="rememberMe"
                     disabled={loading}
                  />
                  <label htmlFor="rememberMe">
                     {intl.formatMessage({ id: 'login.remember' })}
                  </label>
               </div>

               <button type="submit" className="btn-login" disabled={loading}>
                  {loading
                     ? intl.formatMessage({ id: 'login.loading' })
                     : intl.formatMessage({ id: 'login.button' })
                  }
               </button>
            </form>

            <div className="login-options">
               <a href="/forgot-password">{intl.formatMessage({ id: 'login.forgot' })}</a>
               <a href="/register">{intl.formatMessage({ id: 'login.register' })}</a>
            </div>

            <div className="divider">{intl.formatMessage({ id: 'login.or' })}</div>

            <div className="social-login">
               <button className="btn-social fb" disabled={loading}>Facebook</button>
               <button className="btn-social gg" disabled={loading}>Gmail</button>
            </div>
         </div>
      </div>
   );
};

export default Login;
