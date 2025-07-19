import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/authService';
import { toast } from 'react-toastify';
import CustomToast from '../../components/CustomToast';
import { useIntl } from 'react-intl';
import './Register.scss';

const Register = () => {
   const [phoneNumber, setPhoneNumber] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [countdown, setCountdown] = useState(3);
   const [shouldRedirect, setShouldRedirect] = useState(false);
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();
   const intl = useIntl();

   const handleChange = (e) => {
      const { name, value } = e.target;
      if (name === 'phoneNumber') setPhoneNumber(value);
      if (name === 'password') setPassword(value);
      if (name === 'confirmPassword') setConfirmPassword(value);
   };

   const handleRegister = async () => {
      const phonePattern = /^0\d{9}$/;
      const passwordPattern = /^(?=.*[a-z])(?=.*\d).{6,}$/;

      if (!phoneNumber || !password || !confirmPassword) {
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title"
                  messageId="register.error_missing_info"
                  time={new Date()}
               />
            ),
            { closeButton: false, type: "error" }
         );
         return;
      }
      if (!phonePattern.test(phoneNumber)) {
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title"
                  messageId="register.error_invalid_phone"
                  time={new Date()}
               />
            ),
            { closeButton: false, type: "error" }
         );
         return;
      }
      if (!passwordPattern.test(password)) {
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title"
                  messageId="register.error_invalid_password"
                  time={new Date()}
               />
            ),
            { closeButton: false, type: "error" }
         );
         return;
      }
      if (password !== confirmPassword) {
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title"
                  messageId="register.error_password_mismatch"
                  time={new Date()}
               />
            ),
            { closeButton: false, type: "error" }
         );
         return;
      }

      setLoading(true);
      try {
         const res = await register({ phoneNumber, password, roleId: 2 });
         if (res.errCode === 0) {
            toast(
               (props) => (
                  <CustomToast
                     {...props}
                     type="success"
                     titleId="register.success_title"
                     messageId="register.success_message"
                     time={new Date()}
                  />
               ),
               { closeButton: false, type: "success" }
            );
            setShouldRedirect(true);
         } else {
            toast(
               (props) => (
                  <CustomToast
                     {...props}
                     type="error"
                     titleId="register.error_title"
                     message={res.errMessage || intl.formatMessage({ id: 'register.error_failed' })}
                     time={new Date()}
                  />
               ),
               { closeButton: false, type: "error" }
            );
         }
      } catch (err) {
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title"
                  message={intl.formatMessage({ id: 'register.error_failed' })}
                  time={new Date()}
               />
            ),
            { closeButton: false, type: "error" }
         );
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (!shouldRedirect) return;
      const interval = setInterval(() => {
         setCountdown((prev) => {
            if (prev <= 1) {
               clearInterval(interval);
               navigate('/login');
               return 0;
            }
            return prev - 1;
         });
      }, 1000);
      return () => clearInterval(interval);
   }, [shouldRedirect, navigate]);

   return (
      <div className="register-page">
         <div className="register-box">
            <h2>{intl.formatMessage({ id: 'register.title' })}</h2>

            <input
               type="text"
               name="phoneNumber"
               placeholder={intl.formatMessage({ id: 'register.phone_placeholder' })}
               value={phoneNumber}
               onChange={handleChange}
               disabled={loading}
            />
            <input
               type="password"
               name="password"
               placeholder={intl.formatMessage({ id: 'register.password_placeholder' })}
               value={password}
               onChange={handleChange}
               disabled={loading}
            />
            <input
               type="password"
               name="confirmPassword"
               placeholder={intl.formatMessage({ id: 'register.confirm_password_placeholder' })}
               value={confirmPassword}
               onChange={handleChange}
               disabled={loading}
            />

            {shouldRedirect && countdown > 0 && (
               <div className="redirecting">
                  {intl.formatMessage(
                     { id: 'register.redirecting' },
                     { seconds: countdown }
                  )}
               </div>
            )}

            <button className="btn-register" onClick={handleRegister} disabled={loading}>
               {loading
                  ? intl.formatMessage({ id: 'register.loading' })
                  : intl.formatMessage({ id: 'register.button' })
               }
            </button>

            <div className="redirect-login">
               <p>
                  {intl.formatMessage({ id: 'register.login_redirect' })}{' '}
                  <a href="/login">{intl.formatMessage({ id: 'register.login_link' })}</a>
               </p>
            </div>
         </div>
      </div>
   );
};

export default Register;
