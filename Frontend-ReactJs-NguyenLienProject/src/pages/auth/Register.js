import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, checkPhoneExists } from '../../services/authService';
import { toast } from 'react-toastify';
import CustomToast from '../../components/CustomToast';
import { useIntl } from 'react-intl';
import OtpVerification from '../../components/OtpVerification';
import { validateVietnamesePhone } from '../../utils/vietnamesePhoneValidator';
import './Register.scss';

const Register = () => {
   const [step, setStep] = useState(1); // 1: Form, 2: OTP, 3: Success
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

   const validatePhone = () => {
      if (!phoneNumber) {
         return intl.formatMessage({ id: 'register.error_phone_required' });
      }

      // Enhanced Vietnamese phone validation using imported function
      if (!validateVietnamesePhone(phoneNumber)) {
         return intl.formatMessage({ id: 'register.error_phone_invalid' });
      }

      return '';
   };



   const handleOtpVerificationSuccess = async () => {
      console.log('🎉 [OTP SUCCESS] Phone verification completed');

      // Directly submit registration since phone is verified
      console.log('🚀 [OTP SUCCESS] Auto-submitting registration...');

      setLoading(true);
      try {
         const res = await register({ phoneNumber, password, roleId: 2, phoneVerified: true });

         console.log('📝 [REGISTER DEBUG] Response:', res);
         console.log('📝 [REGISTER DEBUG] ErrCode:', res?.errCode);
         console.log('📝 [REGISTER DEBUG] ErrMessage:', res?.errMessage);

         if (res.errCode === 0) {
            toast(
               (props) => (
                  <CustomToast
                     {...props}
                     type="success"
                     titleId="register.success_title"
                     message={intl.formatMessage({ id: "register.success_message" })}
                     time={new Date()}
                  />
               ),
               { closeButton: false, type: "success" }
            );

            // Move to success step
            setStep(3);
            setShouldRedirect(true);
         } else {
            toast(
               (props) => (
                  <CustomToast
                     {...props}
                     type="error"
                     titleId="register.error_title"
                     message={res.errMessage || intl.formatMessage({ id: "register.error_message" })}
                     time={new Date()}
                  />
               ),
               { closeButton: false, type: "error" }
            );
            // Go back to step 1 on error
            setStep(1);
         }
      } catch (error) {
         console.error('Register error:', error);
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title"
                  message={intl.formatMessage({ id: 'register.error_system_error' })}
                  time={new Date()}
               />
            ),
            { closeButton: false, type: "error" }
         );
         // Go back to step 1 on error
         setStep(1);
      } finally {
         setLoading(false);
      }
   };

   const handleOtpCancel = () => {
      setStep(1);
   };

   const handleContinueToOTP = async () => {
      const passwordPattern = /^(?=.*[a-z])(?=.*\d).{6,}$/;

      // Validate ALL form fields before opening OTP verification
      if (!phoneNumber || !password || !confirmPassword) {
         console.log('📝 [Continue Debug] Missing fields');
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title_missing_info"
                  message={intl.formatMessage({ id: 'register.error_missing_all_info' })}
                  time={new Date()}
               />
            ),
            { closeButton: false, type: "error" }
         );
         return;
      }

      // Validate phone number
      const phoneError = validatePhone();
      if (phoneError) {
         console.log('📝 [Continue Debug] Phone validation failed');
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title_invalid_phone"
                  message={intl.formatMessage({ id: 'register.error_invalid_phone' })}
                  time={new Date()}
               />
            ),
            { closeButton: false, type: "error" }
         );
         return;
      }

      // Validate password
      if (!passwordPattern.test(password)) {
         console.log('📝 [Continue Debug] Password validation failed');
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title_invalid_password"
                  message={intl.formatMessage({ id: 'register.error_password_format' })}
                  time={new Date()}
               />
            ),
            { closeButton: false, type: "error" }
         );
         return;
      }

      // Validate password confirmation
      if (password !== confirmPassword) {
         console.log('📝 [Continue Debug] Password mismatch');
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title_invalid_re_password"
                  message={intl.formatMessage({ id: 'register.error_password_mismatch_detail' })}
                  time={new Date()}
               />
            ),
            { closeButton: false, type: "error" }
         );
         return;
      }

      // Check if phone number already exists
      console.log('📱 [REGISTER] Checking if phone exists:', phoneNumber);
      try {
         const phoneCheckResult = await checkPhoneExists(phoneNumber.trim());

         if (phoneCheckResult.exists) {
            console.log('📝 [Continue Debug] Phone already exists');
            toast(
               (props) => (
                  <CustomToast
                     {...props}
                     type="error"
                     titleId="register.error_title"
                     message={intl.formatMessage({ id: 'register.error_phone_exists' })}
                     time={new Date()}
                  />
               ),
               { closeButton: false, type: "error" }
            );
            return;
         }

         // All validation passed - Move to OTP verification step
         console.log('📝 [Continue Debug] Validation passed, proceeding to OTP');
         setStep(2);

      } catch (error) {
         console.error('Phone check error:', error);
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title"
                  message={intl.formatMessage({ id: 'register.error_phone_check_failed' })}
                  time={new Date()}
               />
            ),
            { closeButton: false, type: "error" }
         );
      }
   };

   useEffect(() => {
      if (!shouldRedirect) return;
      const interval = setInterval(() => {
         setCountdown((prev) => {
            if (prev <= 1) {
               clearInterval(interval);
               // Use setTimeout to avoid setState during render warning
               setTimeout(() => {
                  navigate('/login');
               }, 0);
               return 0;
            }
            return prev - 1;
         });
      }, 1000);
      return () => clearInterval(interval);
   }, [shouldRedirect, navigate]);

   return (
      <div className="register-page">
         {step === 1 && (
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

               <button
                  className="btn-verify-phone"
                  onClick={handleContinueToOTP}
                  disabled={loading}
               >
                  {loading
                     ? intl.formatMessage({ id: 'register.loading' })
                     : intl.formatMessage({ id: 'register.verify_phone_button' })}
               </button>

               <div className="redirect-login">
                  <p>
                     {intl.formatMessage({ id: 'register.login_redirect' })}{' '}
                     <a href="/login">{intl.formatMessage({ id: 'register.login_link' })}</a>
                  </p>
               </div>
            </div>
         )}

         {step === 2 && (
            <div className="otp-step">
               <OtpVerification
                  phoneNumber={phoneNumber}
                  onVerificationSuccess={handleOtpVerificationSuccess}
                  onCancel={handleOtpCancel}
                  title={intl.formatMessage({ id: 'register.otp.title' })}
                  description={intl.formatMessage({ id: 'register.otp.description' })}
               />
            </div>
         )}

         {step === 3 && shouldRedirect && countdown > 0 && (
            <div className="register-box">
               <div className="success-message">
                  <div className="success-icon">✅</div>
                  <h2>{intl.formatMessage({ id: 'register.success_title' })}</h2>
                  <p>{intl.formatMessage({ id: 'register.success_message' })}</p>

                  <div className="redirecting">
                     {intl.formatMessage(
                        { id: 'register.redirecting' },
                        { seconds: countdown }
                     )}
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default Register;
