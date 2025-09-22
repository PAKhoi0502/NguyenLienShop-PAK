import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { createUser } from '../../../services/adminService';
import { checkPhoneExists } from '../../../services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomToast from '../../../components/CustomToast';
import OtpVerification from '../../../components/OtpVerification';
import { validateVietnamesePhone } from '../../../utils/vietnamesePhoneValidator';
import './UserCreate.scss';

const initialForm = {
   phoneNumber: '',
   password: '',
   confirmPassword: '',
};

const UserCreate = () => {
   const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
   const [form, setForm] = useState(initialForm);
   const [loading, setLoading] = useState(false);
   const [phoneVerified, setPhoneVerified] = useState(false);
   const [userCreated, setUserCreated] = useState(false); // Track if user is already created
   const navigate = useNavigate();
   const intl = useIntl();

   const handleChange = (e) => {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value });
   };

   const validatePhone = () => {
      if (!form.phoneNumber.trim()) {
         return intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.validate.phone_required' });
      }

      // Enhanced Vietnamese phone validation
      if (!validateVietnamesePhone(form.phoneNumber.trim())) {
         return intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.validate.phone_invalid' });
      }

      return '';
   };

   const validate = () => {
      const phoneError = validatePhone();
      if (phoneError) {
         return phoneError;
      }

      if (!form.password || form.password.length < 6) {
         return intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.validate.password_short' });
      }
      if (!form.confirmPassword) {
         return intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.validate.confirm_required' });
      }
      if (form.password !== form.confirmPassword) {
         return intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.validate.password_mismatch' });
      }
      return '';
   };

   const handleContinueToOTP = async () => {
      // Validate ALL form fields before opening OTP verification
      const errMsg = validate();
      if (errMsg) {
         showToast("error", errMsg);
         return;
      }

      try {
         const phoneCheckResult = await checkPhoneExists(form.phoneNumber.trim());

         // Handle undefined or null response
         if (!phoneCheckResult) {
            showToast("error", intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.error.phone_check_failed' }));
            return;
         }

         // Handle backend server connection issues
         if (phoneCheckResult.errCode === -2 || phoneCheckResult.errCode === -3 ||
            phoneCheckResult.errCode === -4 || phoneCheckResult.errCode === -5) {
            showToast("error", intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.error.backend_connection' }));
            return;
         }

         // Handle other API errors
         if (phoneCheckResult.errCode !== 0 && phoneCheckResult.errCode !== undefined) {
            showToast("error", phoneCheckResult.errMessage || intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.error.phone_check_failed' }));
            return;
         }

         // Check if phone exists
         if (phoneCheckResult.exists === true) {
            showToast("error", intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.error.phone_already_used' }));
            return;
         }

         setStep(2);

      } catch (error) {
         showToast("error", intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.error.phone_check_failed' }));
      }
   };

   const handleOtpVerificationSuccess = async () => {
      setPhoneVerified(true);
      setStep(1);

      // Prevent duplicate creation
      if (userCreated) {
         return;
      }

      setUserCreated(true);

      // Directly submit since we know phone is verified
      const errMsg = validate();
      if (errMsg) {
         showToast("error", errMsg);
         return;
      }

      setLoading(true);

      const submitData = {
         phoneNumber: form.phoneNumber.trim(),
         password: form.password,
         roleId: 2,
         phoneVerified: true,
      };

      try {
         const res = await createUser(submitData);

         if (!res) {
            showToast("error", intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.create_error_message' }));
         } else if (res.errCode === 0) {
            showToast("success", intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.success_message' }));

            // Reset form state
            setForm({ phoneNumber: '', password: '', confirmPassword: '' });
            setPhoneVerified(false);
            setUserCreated(false);

            // Auto navigate back to user management after showing success message
            setTimeout(() => {
               navigate('/admin/account-management/user-management');
            }, 2000);
         } else {
            showToast("error", res.errMessage || intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.create_error_message' }));
         }
      } catch (error) {
         showToast("error", error.message || intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.create_error_message' }));
      } finally {
         setLoading(false);
      }
   };

   const handleOtpCancel = () => {
      setStep(1);
      setPhoneVerified(false);
   };

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === "success" ? "body_admin.account_management.user_manager.create.create_success_title" : "body_admin.account_management.user_manager.create.create_error_title"}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      // Prevent duplicate submissions if user already created
      if (userCreated) {
         return;
      }

      if (!phoneVerified) {
         showToast("error", intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.phone_verification_required' }));
         return;
      }

      // This path shouldn't be reached since phone verification is required
      showToast("error", intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.phone_verification_required' }));
   };

   return (
      <div className="user-create-container">
         {step === 2 && (
            <OtpVerification
               phoneNumber={form.phoneNumber}
               onVerificationSuccess={handleOtpVerificationSuccess}
               onCancel={handleOtpCancel}
               title={intl.formatMessage({ id: 'body_admin.account_management.user_manager.otp.user_create_title' })}
               description={intl.formatMessage({ id: 'body_admin.account_management.user_manager.otp.user_create_description' })}
            />
         )}

         {step === 1 && (
            <>
               <h2 className="user-create-title">{intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.title' })}</h2>
               <form className="user-create-form" onSubmit={handleSubmit} autoComplete="off">
                  <div className="form-group">
                     <label>{intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.phone' })}</label>
                     <input
                        type="text"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        placeholder={intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.phone_placeholder' })}
                        disabled={loading || phoneVerified}
                        className={phoneVerified ? 'verified' : ''}
                     />
                     {phoneVerified && (
                        <div className="verification-badge">
                           {intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.phone_verified_badge' })}
                        </div>
                     )}
                  </div>
                  <div className="form-group">
                     <label>{intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.password' })}</label>
                     <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder={intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.password_placeholder' })}
                        autoComplete="new-password"
                        disabled={loading}
                     />
                  </div>
                  <div className="form-group">
                     <label>{intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.confirm_password' })}</label>
                     <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder={intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.confirm_password_placeholder' })}
                        autoComplete="new-password"
                        disabled={loading}
                     />
                  </div>

                  <div className="form-actions">
                     {!phoneVerified ? (
                        <button
                           type="button"
                           className="btn-verify-phone"
                           onClick={handleContinueToOTP}
                           disabled={loading || !form.phoneNumber || !form.password || !form.confirmPassword}
                        >
                           {loading ? intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.processing' }) : intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.verify_phone_button' })}
                        </button>
                     ) : (
                        <button type="button" className="btn-submit" disabled={loading} onClick={() => {
                           if (userCreated) {
                              // User already created, navigate to user management
                              navigate('/admin/account-management/user-management');
                           } else {
                              // This shouldn't happen since phone needs to be verified first
                              showToast("error", intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.phone_verification_required' }));
                           }
                        }}>
                           {loading
                              ? intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.creating' })
                              : userCreated
                                 ? intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.back_to_list' })
                                 : intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.create_button' })}
                        </button>
                     )}

                     <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => navigate('/admin/account-management/user-management')}
                        disabled={loading}
                     >
                        {intl.formatMessage({ id: 'body_admin.account_management.user_manager.create.cancel_button' })}
                     </button>
                  </div>
               </form>
            </>
         )}
      </div>
   );
};

export default UserCreate;
