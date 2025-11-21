import React from 'react';
import Swal from 'sweetalert2';
import { deleteUser } from '../../../services/adminService';
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';
import CustomToast from '../../../components/CustomToast';
import { showSecurityConfirmation } from '../../../components/common/SecurityConfirmation';
import { showPasswordVerification } from '../../../components/common/PasswordVerification';

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

   // Xử lý password verification và delete sử dụng component PasswordVerification
   const handlePasswordVerificationAndDelete = async () => {
      const result = await showPasswordVerification({
         intl,
         titleId: 'body_admin.account_management.user_manager.delete.password_title',
         securityCheckId: 'body_admin.account_management.user_manager.delete.password_security_check',
         instructionId: 'body_admin.account_management.user_manager.delete.password_instruction',
         placeholderId: 'body_admin.account_management.user_manager.delete.password_placeholder',
         buttonId: 'body_admin.account_management.user_manager.delete.password_button',
         cancelId: 'body_admin.account_management.user_manager.delete.cancel_button',
         requiredId: 'body_admin.account_management.user_manager.delete.password_required',
         minLengthId: 'body_admin.account_management.user_manager.delete.password_min_length',
         error401Id: 'body_admin.account_management.user_manager.delete.error.invalid_password',
         attemptsRemainingId: 'body_admin.account_management.user_manager.delete.error.attempts_left',
         lastAttemptId: 'body_admin.account_management.user_manager.delete.error.last_attempt',
         tryAgainId: 'body_admin.account_management.user_manager.delete.try_again',
         okId: 'body_admin.account_management.user_manager.delete.ok',
         maxAttemptsExceededId: 'body_admin.account_management.user_manager.delete.error.max_attempts',
      });

      if (result.cancelled) return;

      if (!result.success) {
         showToast("error", result.error || intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.max_attempts' }));
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

      try {
         // Proceed with deletion
         const res = await deleteUser(user.id);
         Swal.close();

         if (res.errCode === 0) {
            // Success notification
            await Swal.fire({
               title: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.success_title_delete' }),
               html: `
                  <div class="delete-step5">
                     <p class="delete-step5__success">
                        ✅ ${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.permanently_deleted' })}
                     </p>
                     <div class="delete-step5__info">
                        <p class="delete-step5__info-line">
                           <strong>${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.phone_label' })}:</strong> <span class="delete-step5__info-value">${user.phoneNumber || user.phone || intl.formatMessage({ id: 'common.not_available' })}</span>
                        </p>
                        <p class="delete-step5__info-line">
                           <strong>${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.id_label' })}:</strong> <span class="delete-step5__info-value">${user.id}</span>
                        </p>
                     </div>
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

         if (error.response?.status === 400) {
            errorMessage = intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.bad_request' });
         } else if (error.response?.status === 401) {
            errorMessage = intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.session_expired' });
         } else if (error.response?.status === 403) {
            errorMessage = intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.permission_denied' });
         } else if (error.response?.status === 404) {
            errorMessage = intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.user_not_found' });
         } else if (error.response?.status === 500) {
            errorMessage = intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.server' });
         } else if (!error.response) {
            errorMessage = intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.error.network' });
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

   const handleDelete = async () => {
      if (!user || !user.id) {
         showToast("error", intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.not_found' }));
         return;
      }

      // Step 1: First confirmation - Show user info
      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.confirm_title_1' }),
         html: `<strong><span>${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.id_label' })}:</span> ${user.id}</strong><strong><span>${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.phone_label' })}:</span> ${user.phoneNumber || user.phone || intl.formatMessage({ id: 'common.not_available' })}</strong><strong><span>${intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.username_label' })}:</span> ${user.userName || intl.formatMessage({ id: 'common.not_available' })}</strong>`,
         text: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.confirm_text_1' }),
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.confirm_button_1' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.cancel_button' })
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
      });

      if (!confirmSecond.isConfirmed) return;

      // Step 3: Text confirmation - Type exact phrase (sử dụng utility function)
      const confirmValue = user.phoneNumber || user.phone || user.userName || intl.formatMessage({ id: 'common.user_id_prefix' }) + ' ' + user.id;
      const confirmText = await showSecurityConfirmation({
         intl,
         titleId: 'body_admin.account_management.user_manager.delete.security_title',
         warningId: 'body_admin.account_management.user_manager.delete.security_warning',
         confirmTextId: 'body_admin.account_management.user_manager.delete.security_confirm_text',
         confirmValue: confirmValue,
         noValueId: 'common.not_available',
         typeExactId: 'body_admin.account_management.user_manager.delete.security_type_exact',
         phraseId: 'body_admin.account_management.user_manager.delete.security_phrase',
         placeholderId: 'body_admin.account_management.user_manager.delete.security_placeholder',
         continueId: 'body_admin.account_management.user_manager.delete.security_continue',
         cancelId: 'body_admin.account_management.user_manager.delete.cancel_button',
         errorId: 'body_admin.account_management.user_manager.delete.security_error',
         copiedId: 'body_admin.account_management.user_manager.delete.security_copied',
         copyButtonId: 'body_admin.account_management.user_manager.delete.security_copy_button',
      });

      if (!confirmText.isConfirmed) return;

      // Step 4: Password verification - Sử dụng component PasswordVerification
      await handlePasswordVerificationAndDelete();
   };

   return (
      <button className="btn-action btn-delete" onClick={handleDelete}>
         <span className="btn-text">
            {intl.formatMessage({ id: 'body_admin.account_management.user_manager.delete.button' })}
         </span>
         <span className='btn-icon-delete'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
         </span>
      </button>
   );
};

export default UserDelete;
