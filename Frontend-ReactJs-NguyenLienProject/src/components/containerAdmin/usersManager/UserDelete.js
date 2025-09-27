import React from 'react';
import Swal from 'sweetalert2';
import { deleteUser, verifyPassword } from '../../../services/adminService';
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';
import CustomToast from '../../../components/CustomToast';

const UserDelete = ({ user, onSuccess }) => {
   const intl = useIntl();

   const showToast = (type, message) => {
      const messageToShow = message || intl.formatMessage({
         id: type === "success"
            ? "body_admin.account_management.user_manager.delete.delete_success_message"
            : "body_admin.account_management.user_manager.delete.delete_error_message"
      });

      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === "success" ? "body_admin.account_management.user_manager.delete.success_title_delete" : "body_admin.account_management.user_manager.delete.error"}
               message={messageToShow}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   const handleDelete = async (passwordAttempts = 0) => {
      // Đảm bảo passwordAttempts là số
      const attempts = typeof passwordAttempts === 'number' ? passwordAttempts : 0;

      console.log(`UserDelete - Starting with ${attempts} previous attempts`);

      if (!user || !user.id) {
         showToast("error", intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.not_found' }));
         return;
      }

      // Check if password attempts exceeded (tối đa 3 lần thử)
      if (attempts >= 2) { // >= 2 vì đây là lần thứ 3
         showToast("error", intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.max_attempts' }));
         return;
      }

      // Step 1: First confirmation - Show user info
      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.confirm_title_1' }),
         html: `<strong>${user.fullName || intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.no_name' })} (${user.userName || 'N/A'})</strong><br>ID: ${user.id}`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.confirm_button_1' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.cancel_button' }),
         customClass: {
            popup: 'swal-delete-step1'
         }
      });

      if (!confirmFirst.isConfirmed) return;

      // Step 2: Second confirmation - Final warning
      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.confirm_title_2' }),
         text: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.confirm_text_2' }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.confirm_button_2' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.cancel_button' }),
         customClass: {
            popup: 'swal-delete-step2'
         }
      });

      if (!confirmSecond.isConfirmed) return;

      // Step 3: Text confirmation - Type exact phrase (User specific)
      const confirmText = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.security_title' }),
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: #ef4444; font-weight: 600;">
                  ${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.security_warning' })}
               </p>
               <p style="margin-bottom: 10px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.security_confirm_text' })}: <strong style="color: #dc2626;">${user.phoneNumber || user.phone || user.userName || 'User ID: ' + user.id}</strong>
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.security_type_exact' })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.security_phrase' })}</code>
               </p>
            </div>
         `,
         input: 'text',
         inputPlaceholder: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.security_placeholder' }),
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.security_continue' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.cancel_button' }),
         inputValidator: (value) => {
            const expectedPhrase = intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.security_phrase' });
            if (value !== expectedPhrase) {
               return intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.security_error' });
            }
         },
         customClass: {
            popup: 'swal-delete-step3',
            input: 'swal-text-input'
         }
      });

      if (!confirmText.isConfirmed) return;

      // Step 4: Password verification
      // Đảm bảo attempts là số
      const safeAttempts = typeof passwordAttempts === 'number' ? passwordAttempts : 0;

      const passwordTitle = safeAttempts > 0 ?
         `${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.password_title' })} - ${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.attempt_count' }, { current: safeAttempts + 1 })}` :
         intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.password_title' });

      const passwordConfirm = await Swal.fire({
         title: passwordTitle,
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: #dc2626; font-weight: 600;">
                  ${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.password_security_check' })}
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.password_instruction' })}
               </p>
            </div>
         `,
         input: 'password',
         inputPlaceholder: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.password_placeholder' }),
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.password_button' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.cancel_button' }),
         inputValidator: (value) => {
            if (!value || value.trim() === '') {
               return intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.password_required' });
            }
            if (value.length < 6) {
               return intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.password_min_length' });
            }
         },
         customClass: {
            popup: 'swal-delete-step4',
            input: 'swal-password-input',
            confirmButton: 'swal-delete-final-btn'
         }
      });

      if (!passwordConfirm.isConfirmed) return;

      const password = passwordConfirm.value;

      try {
         // First verify password with custom headers to prevent retry loop
         const passwordVerification = await verifyPassword({
            password
         }, {
            headers: {
               'X-Prevent-Retry': 'true' // Prevent axios interceptor from retrying on 401
            }
         });

         if (passwordVerification.errCode !== 0) {
            // Đảm bảo passwordAttempts là số
            const attempts = typeof passwordAttempts === 'number' ? passwordAttempts : 0;

            // Lần 0: còn 2 lần (tổng 3)
            // Lần 1: còn 1 lần (tổng 3) 
            // Lần 2: không còn lần nào (tổng 3)
            const remainingAttempts = 2 - attempts; // Trực tiếp tính: còn lại = 2 - (lần đã thử)

            console.log(`UserDelete - Sai lần thứ: ${attempts}/2, Còn lại: ${remainingAttempts} lần`);

            // If password is wrong, show error with remaining attempts info
            await Swal.fire({
               title: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error' }),
               html: `
                  <div style="text-align: center; margin: 15px 0;">
                     <p style="color: #dc2626; font-weight: 600; margin-bottom: 10px;">
                        ${passwordVerification.errMessage || intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.invalid_password' })}
                     </p>
                     ${remainingAttempts > 0 ?
                     `<p style="color: #f59e0b; font-size: 14px;">
                           <strong>${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.attempts_left' }, { remaining: remainingAttempts })}</strong>
                        </p>` :
                     `<p style="color: #dc2626; font-size: 14px; font-weight: 600;">
                           <strong>${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.last_attempt' })}</strong>
                        </p>`
                  }
                  </div>
               `,
               icon: 'error',
               confirmButtonText: remainingAttempts > 0 ?
                  intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.try_again' }) :
                  intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.ok' })
            });

            // Recursively call handleDelete with incremented attempts counter
            if (remainingAttempts > 0) {
               // Đảm bảo truyền số và tăng đúng
               const nextAttempt = (typeof passwordAttempts === 'number' ? passwordAttempts : 0) + 1;
               setTimeout(() => handleDelete(nextAttempt), 100);
            } else {
               // Max attempts reached
               showToast("error", intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.failed' }));
            }
            return;
         }

         // Show final loading
         Swal.fire({
            title: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.loading_title' }),
            text: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.loading_text' }),
            icon: 'info',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
               Swal.showLoading();
            }
         });

         // Proceed with deletion
         const res = await deleteUser(user.id);
         Swal.close();

         if (res.errCode === 0) {
            // Success notification
            await Swal.fire({
               title: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.success_title_delete' }),
               html: `
                  <div style="text-align: center; margin: 20px 0;">
                     <p style="color: #059669; font-weight: 600; margin-bottom: 10px;">
                        ${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.permanently_deleted' })}
                     </p>
                     <p style="color: #374151; font-size: 14px;">
                        ${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.phone_label' })} <strong>${user.phoneNumber || user.phone || user.userName || intl.formatMessage({ id: 'common.not_available' })}</strong><br>
                        ${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.id_label' })} <strong>${user.id}</strong>
                     </p>
                  </div>
               `,
               icon: 'success',
               confirmButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.ok' }),
               customClass: {
                  popup: 'swal-delete-success'
               }
            });

            showToast("success", res.errMessage || intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.success' }));
            if (typeof onSuccess === 'function') onSuccess(user.id);
         } else {
            showToast("error", res.errMessage || intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.failed' }));
         }
      } catch (error) {
         Swal.close();
         console.error('Delete error:', error);

         // Enhanced error handling
         let errorMessage = intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.server' });

         if (error.response?.status === 401) {
            errorMessage = intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.session_expired' });
         } else if (error.response?.status === 403) {
            errorMessage = intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.permission_denied' });
         } else if (error.response?.status === 404) {
            errorMessage = intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.user_not_found' });
         } else if (error.errMessage) {
            errorMessage = error.errMessage;
         }

         await Swal.fire({
            title: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.deletion_failed' }),
            text: errorMessage,
            icon: 'error',
            confirmButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.ok' }),
            customClass: {
               popup: 'swal-delete-error'
            }
         });

         showToast("error", errorMessage);
      }
   };

   return (
      <button className="btn-action btn-delete" onClick={handleDelete}>
         {intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.button' })}
      </button>
   );
};

export default UserDelete;
