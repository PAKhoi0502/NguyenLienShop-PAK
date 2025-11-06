import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { createAdmin } from '../../../services/adminService';
import { checkPhoneExists } from '../../../services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomToast from '../../../components/CustomToast';
import OtpVerification from '../../../components/OtpVerification';
import { validateVietnamesePhone } from '../../../utils/vietnamesePhoneValidator';
import './AdminCreate.scss';

const AdminCreate = () => {
   const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification, 3: Success
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

      if (name === 'phoneNumber') {
         // Strict phone input validation - only allow digits and basic formatting
         const cleanValue = value.replace(/[^\d]/g, ''); // Remove all non-digits

         // Limit to 10 digits max and must start with 0
         if (cleanValue.length === 0 || (cleanValue[0] === '0' && cleanValue.length <= 10)) {
            setPhoneNumber(cleanValue);
         }
         // If input starts with non-0 or exceeds 10 digits, ignore the input
         return;
      }

      if (name === 'password') setPassword(value);
      if (name === 'confirmPassword') setConfirmPassword(value);
   };

   const validatePhone = () => {
      if (!phoneNumber) {
         return intl.formatMessage({ id: 'body_admin.account_management.admin_manager.validation.phone_required' });
      }

      // Strict validation: must be exactly digits only
      if (!/^\d+$/.test(phoneNumber)) {
         return intl.formatMessage({ id: 'body_admin.account_management.admin_manager.validation.phone_digits_only' });
      }

      // Must be exactly 10 digits
      if (phoneNumber.length !== 10) {
         return intl.formatMessage({ id: 'body_admin.account_management.admin_manager.validation.phone_length' });
      }

      // Must start with 0
      if (!phoneNumber.startsWith('0')) {
         return intl.formatMessage({ id: 'body_admin.account_management.admin_manager.validation.phone_start_zero' });
      }

      // Enhanced Vietnamese phone validation using imported function
      if (!validateVietnamesePhone(phoneNumber)) {
         return intl.formatMessage({ id: 'body_admin.account_management.admin_manager.validation.phone_invalid' });
      }

      return '';
   };

   const handleContinueToOTP = async () => {
      // Validate ALL form fields before opening OTP verification
      if (!phoneNumber || !password || !confirmPassword) {
         showToast("error", intl.formatMessage({ id: 'body_admin.account_management.admin_manager.error.missing_all_info' }));
         return;
      }

      // Validate phone number
      const phoneError = validatePhone();
      if (phoneError) {
         showToast("error", phoneError);
         return;
      }

      const passwordPattern = /^(?=.*[a-z])(?=.*\d).{6,}$/;

      // Validate password
      if (!passwordPattern.test(password)) {
         showToast("error", intl.formatMessage({ id: 'body_admin.account_management.admin_manager.error.password_format' }));
         return;
      }

      // Validate password confirmation
      if (password !== confirmPassword) {
         showToast("error", intl.formatMessage({ id: 'body_admin.account_management.admin_manager.error.password_mismatch' }));
         return;
      }

      try {
         const phoneCheckResult = await checkPhoneExists(phoneNumber.trim());

         // Handle undefined or null response
         if (!phoneCheckResult) {
            showToast("error", intl.formatMessage({ id: 'body_admin.account_management.admin_manager.error.phone_check_failed' }));
            return;
         }

         // Handle backend server connection issues
         if (phoneCheckResult.errCode === -2 || phoneCheckResult.errCode === -3 ||
            phoneCheckResult.errCode === -4 || phoneCheckResult.errCode === -5) {
            showToast("error", intl.formatMessage({ id: 'body_admin.account_management.admin_manager.error.backend_connection' }));
            return;
         }

         // Handle other API errors
         if (phoneCheckResult.errCode !== 0 && phoneCheckResult.errCode !== undefined) {
            showToast("error", phoneCheckResult.errMessage || intl.formatMessage({ id: 'body_admin.account_management.admin_manager.error.phone_check_failed' }));
            return;
         }

         // Check if phone exists
         if (phoneCheckResult.exists === true) {
            showToast("error", intl.formatMessage({ id: 'body_admin.account_management.admin_manager.error.phone_already_used' }));
            return;
         }

         setStep(2);

      } catch (error) {
         showToast("error", intl.formatMessage({ id: 'body_admin.account_management.admin_manager.error.phone_check_failed' }));
      }
   };

   const handleOtpVerificationSuccess = async () => {

      // Directly submit registration since phone is verified

      setLoading(true);
      setStep(1); // Return to step 1 but process creation

      try {
         const res = await createAdmin({
            phoneNumber: phoneNumber.trim(),
            password: password,
            roleId: 1,
            phoneVerified: true,
         });


         if (res.errCode === 0) {
            showToast("success", intl.formatMessage({ id: 'body_admin.account_management.admin_manager.create_success_message' }));

            // Move to success step
            setStep(3);
            setShouldRedirect(true);
         } else {
            showToast("error", res.errMessage || intl.formatMessage({ id: 'body_admin.account_management.admin_manager.create_error_message' }));
            // Go back to step 1 on error
            setStep(1);
         }
      } catch (error) {
         console.error('Create admin error:', error);
         showToast("error", error.message || intl.formatMessage({ id: 'body_admin.account_management.admin_manager.create_error_message' }));
         // Go back to step 1 on error
         setStep(1);
      } finally {
         setLoading(false);
      }
   };

   const handleOtpCancel = () => {
      setStep(1);
   };

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === "success" ? "body_admin.account_management.admin_manager.create_success_title" : "body_admin.account_management.admin_manager.create_fail_title"}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      // This should not be reached in the new flow
   };

   // Countdown effect for success redirect
   useEffect(() => {
      if (!shouldRedirect) return;
      const interval = setInterval(() => {
         setCountdown((prev) => {
            if (prev <= 1) {
               clearInterval(interval);
               // Use setTimeout to avoid setState during render warning
               setTimeout(() => {
                  navigate('/admin/account-management/admin-management');
               }, 0);
               return 0;
            }
            return prev - 1;
         });
      }, 1000);
      return () => clearInterval(interval);
   }, [shouldRedirect, navigate]);

   return (
      <div className="admin-create-container">
         {step === 2 && (
            <OtpVerification
               phoneNumber={phoneNumber}
               onVerificationSuccess={handleOtpVerificationSuccess}
               onCancel={handleOtpCancel}
               title={intl.formatMessage({ id: 'body_admin.account_management.admin_manager.otp.admin_create_title' })}
               description={intl.formatMessage({ id: 'body_admin.account_management.admin_manager.otp.admin_create_description' })}
            />
         )}

         {step === 1 && (
            <>
               <h2 className="admin-create-title">{intl.formatMessage({ id: 'body_admin.account_management.admin_manager.create_title' })}</h2>
               <form className="admin-create-form" onSubmit={handleSubmit} autoComplete="off">
                  <div className="form-group">
                     <label>{intl.formatMessage({ id: 'body_admin.account_management.admin_manager.label.phone' })} *</label>
                     <input
                        type="text"
                        name="phoneNumber"
                        value={phoneNumber}
                        onChange={handleChange}
                        placeholder={intl.formatMessage({ id: 'body_admin.account_management.admin_manager.placeholder.phone' })}
                        disabled={loading}
                     />
                  </div>
                  <div className="form-group">
                     <label>{intl.formatMessage({ id: 'body_admin.account_management.admin_manager.label.password' })} *</label>
                     <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={handleChange}
                        placeholder={intl.formatMessage({ id: 'body_admin.account_management.admin_manager.placeholder.password' })}
                        autoComplete="new-password"
                        disabled={loading}
                     />
                  </div>
                  <div className="form-group">
                     <label>{intl.formatMessage({ id: 'body_admin.account_management.admin_manager.label.confirm_password' })} *</label>
                     <input
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleChange}
                        placeholder={intl.formatMessage({ id: 'body_admin.account_management.admin_manager.placeholder.confirm_password' })}
                        autoComplete="new-password"
                        disabled={loading}
                     />
                  </div>

                  <div className="action-buttons">
                     <button
                        type="button"
                        className="btn-action btn-verify-phone"
                        onClick={handleContinueToOTP}
                        disabled={loading}
                     >
                        <span className='btn-text'>
                           {loading ? intl.formatMessage({ id: 'body_admin.account_management.admin_manager.processing' }) : intl.formatMessage({ id: 'body_admin.account_management.admin_manager.verify_phone_button' })}
                        </span>
                        <span className='btn-icon-verify-phone'>
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                           </svg>
                        </span>
                     </button>

                     <button
                        type="button"
                        className="btn-action btn-cancel"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                     >
                        <span className='btn-text'>
                           {intl.formatMessage({ id: 'body_admin.account_management.admin_manager.cancel_button' })}
                        </span>
                        <span className='btn-icon-cancel'>
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                           </svg>
                        </span>
                     </button>
                  </div>
               </form>
            </>
         )}

         {step === 3 && shouldRedirect && countdown > 0 && (
            <div className="admin-create-success">
               <div className="success-message">
                  <div className="success-icon">✅</div>
                  <h2>{intl.formatMessage({ id: 'body_admin.account_management.admin_manager.create_success_title' })}</h2>
                  <p>{intl.formatMessage({ id: 'body_admin.account_management.admin_manager.create_success_message' })}</p>

                  <div className="redirecting">
                     {intl.formatMessage(
                        { id: 'body_admin.account_management.admin_manager.redirecting' },
                        { seconds: countdown }
                     )}
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default AdminCreate;
