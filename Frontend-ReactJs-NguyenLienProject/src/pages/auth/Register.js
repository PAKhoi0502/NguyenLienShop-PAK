import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, checkPhoneExists } from '../../services/authService';
import { toast } from 'react-toastify';
import CustomToast from '../../components/CustomToast';
import { useIntl, FormattedMessage } from 'react-intl';
import OtpVerification from '../../components/OtpVerification';
import { validateVietnamesePhone } from '../../utils/vietnamesePhoneValidator';
import './Register.scss';

const Register = () => {
   const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
   const [phoneNumber, setPhoneNumber] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [countdown, setCountdown] = useState(3);
   const [shouldRedirect, setShouldRedirect] = useState(false);
   const [loading, setLoading] = useState(false);
   const [phoneVerified, setPhoneVerified] = useState(false);
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
         return "Vui lòng nhập số điện thoại";
      }

      // Enhanced Vietnamese phone validation using imported function
      if (!validateVietnamesePhone(phoneNumber)) {
         return "Số điện thoại không hợp lệ";
      }

      return '';
   };

   const handleContinueToOTP = async () => {
      const passwordPattern = /^(?=.*[a-z])(?=.*\d).{6,}$/;

      // Validate ALL form fields before opening OTP verification
      if (!phoneNumber || !password || !confirmPassword) {
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title"
                  message="Vui lòng nhập đầy đủ thông tin"
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
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title"
                  message={phoneError}
                  time={new Date()}
               />
            ),
            { closeButton: false, type: "error" }
         );
         return;
      }

      // Validate password
      if (!passwordPattern.test(password)) {
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title"
                  message="Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ thường và số"
                  time={new Date()}
               />
            ),
            { closeButton: false, type: "error" }
         );
         return;
      }

      // Validate password confirmation
      if (password !== confirmPassword) {
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title"
                  message="Mật khẩu xác nhận không khớp"
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
            toast(
               (props) => (
                  <CustomToast
                     {...props}
                     type="error"
                     titleId="register.error_title"
                     message="Số điện thoại này đã được sử dụng để đăng ký. Vui lòng sử dụng số khác."
                     time={new Date()}
                  />
               ),
               { closeButton: false, type: "error" }
            );
            return;
         }

         // All validation passed - Move to OTP verification step
         console.log('📱 [REGISTER] Phone available, opening OTP verification');
         console.log('📱 [REGISTER] Phone:', phoneNumber);
         setStep(2);

      } catch (error) {
         console.error('Phone check error:', error);
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title"
                  message="Không thể kiểm tra số điện thoại. Vui lòng thử lại."
                  time={new Date()}
               />
            ),
            { closeButton: false, type: "error" }
         );
      }
   };

   const handleOtpVerificationSuccess = async () => {
      console.log('🎉 [OTP SUCCESS] Phone verification completed');
      setPhoneVerified(true);
      setStep(1); // Go back to form

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
            navigate('/login');
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
         }
      } catch (error) {
         console.error('Register error:', error);
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title"
                  message="Lỗi hệ thống! Vui lòng thử lại."
                  time={new Date()}
               />
            ),
            { closeButton: false, type: "error" }
         );
      } finally {
         setLoading(false);
      }
   };

   const handleOtpCancel = () => {
      setStep(1);
      setPhoneVerified(false);
   };

   const handleRegister = async () => {
      console.log('📝 [REGISTER START] phoneVerified:', phoneVerified);

      if (!phoneVerified) {
         toast(
            (props) => (
               <CustomToast
                  {...props}
                  type="error"
                  titleId="register.error_title"
                  message="Vui lòng xác thực số điện thoại trước khi đăng ký"
                  time={new Date()}
               />
            ),
            { closeButton: false, type: "error" }
         );
         return;
      }

      // Form already validated before OTP verification
      setLoading(true);
      try {
         const res = await register({ phoneNumber, password, roleId: 2, phoneVerified: phoneVerified });

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
                     messageId="register.success_message"
                     time={new Date()}
                  />
               ),
               { closeButton: false, type: "success" }
            );
            setShouldRedirect(true);
         } else {
            // Check for specific error cases
            let errorMessage;

            if (
               res.errCode === 1 &&
               res.errMessage &&
               (
                  res.errMessage.toLowerCase().includes('tồn tại') ||
                  res.errMessage.toLowerCase().includes('exist')
               ) &&
               (
                  res.errMessage.toLowerCase().includes('số điện thoại') ||
                  res.errMessage.toLowerCase().includes('phone')
               )
            ) {
               console.log('📱 [REGISTER] Phone exists error detected');
               errorMessage = "Số điện thoại này đã được sử dụng để đăng ký. Vui lòng sử dụng số khác.";
            } else if (
               res.errMessage &&
               (
                  res.errMessage.toLowerCase().includes('missing') ||
                  res.errMessage.toLowerCase().includes('thiếu')
               )
            ) {
               console.log('📋 [REGISTER] Missing fields error detected');
               errorMessage = "Vui lòng nhập đủ thông tin cần thiết.";
            } else {
               console.log('🔄 [REGISTER] Generic error - ErrCode:', res.errCode, 'Message:', res.errMessage);
               errorMessage = res.errMessage || intl.formatMessage({ id: 'register.error_failed' });
            }

            toast(
               (props) => (
                  <CustomToast
                     {...props}
                     type="error"
                     titleId="register.error_title"
                     message={errorMessage}
                     time={new Date()}
                  />
               ),
               { closeButton: false, type: "error" }
            );
         }
      } catch (err) {
         console.error('❌ [REGISTER ERROR]:', err);
         console.log('❌ [REGISTER DEBUG] Error object:', {
            message: err.message,
            errMessage: err.errMessage,
            response: err.response?.data
         });

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
         {step === 2 && (
            <OtpVerification
               phoneNumber={phoneNumber}
               onVerificationSuccess={handleOtpVerificationSuccess}
               onCancel={handleOtpCancel}
               title={intl.formatMessage({ id: 'otp.register_title' })}
               description={intl.formatMessage({ id: 'otp.register_description' })}
            />
         )}

         {step === 1 && (
            <div className="register-box">
               <h2>{intl.formatMessage({ id: 'register.title' })}</h2>

               <input
                  type="text"
                  name="phoneNumber"
                  placeholder={intl.formatMessage({ id: 'register.phone_placeholder' })}
                  value={phoneNumber}
                  onChange={handleChange}
                  disabled={loading || phoneVerified}
                  className={phoneVerified ? 'verified' : ''}
               />
               {phoneVerified && (
                  <div className="verification-badge">
                     ✅ Số điện thoại đã được xác thực
                  </div>
               )}

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

               {!phoneVerified ? (
                  <button
                     className="btn-verify-phone"
                     onClick={handleContinueToOTP}
                     disabled={loading || !phoneNumber || !password || !confirmPassword}
                  >
                     {loading
                        ? intl.formatMessage({ id: 'register.loading' })
                        : "Xác thực số điện thoại"}
                  </button>
               ) : (
                  <button className="btn-register" onClick={handleRegister} disabled={loading}>
                     {loading
                        ? intl.formatMessage({ id: 'register.loading' })
                        : intl.formatMessage({ id: 'register.button' })}
                  </button>
               )}

               <div className="redirect-login">
                  <p>
                     {intl.formatMessage({ id: 'register.login_redirect' })}{' '}
                     <a href="/login">{intl.formatMessage({ id: 'register.login_link' })}</a>
                  </p>
               </div>
            </div>
         )}
      </div>
   );
};

export default Register;
