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
   const intl = useIntl();

   useEffect(() => {
      const rememberMeStored = localStorage.getItem('rememberMe') === 'true';
      const savedIdentifier = localStorage.getItem('savedIdentifier') || '';
      if (rememberMeStored && savedIdentifier) {
         setIdentifier(savedIdentifier);
         setRememberMe(true);
      }
   }, []);

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
      try {
         const response = await login({ identifier, password });
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

         const { token, data: user } = response;
         localStorage.setItem('token', token);
         localStorage.setItem('roleId', user.roleId);
         if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('savedIdentifier', identifier);
         } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('savedIdentifier');
         }
         dispatch(adminLoginSuccess(user));
         toast(
            <CustomToast
               type="success"
               titleId="login.success"
               message={intl.formatMessage({ id: 'login.success' })}
               time={new Date()}
            />,
            { closeButton: false, type: "success" }
         );
         const params = new URLSearchParams(location.search);
         const redirectPath = params.get('redirect') || '/';
         setTimeout(() => {
            navigate(redirectPath);
         }, 800);
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

   return (
      <div className="login-page">
         <div className="login-box">
            <h2>{intl.formatMessage({ id: 'login.title' })}</h2>
            <p className="subtitle">{intl.formatMessage({ id: 'login.subtitle' })}</p>

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

            <button className="btn-login" onClick={handleLogin} disabled={loading}>
               {loading
                  ? intl.formatMessage({ id: 'login.loading' })
                  : intl.formatMessage({ id: 'login.button' })
               }
            </button>

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
