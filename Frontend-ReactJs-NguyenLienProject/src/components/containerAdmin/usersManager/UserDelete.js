import React from 'react';
import Swal from 'sweetalert2';
import { deleteUser, verifyPassword } from '../../../services/adminService';
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';
import CustomToast from '../../../components/CustomToast';

const UserDelete = ({ user, onSuccess }) => {
   const intl = useIntl();

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === "success" ? "user.delete_success_title" : "user.delete_error_title"}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   const handleDelete = async () => {
      if (!user || !user.id) {
         showToast("error", intl.formatMessage({ id: 'user.delete.not_found' }));
         return;
      }

      // Step 1: First confirmation - Show user info
      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({ id: 'user.delete.confirm_title_1' }),
         html: `<strong>${user.fullName || intl.formatMessage({ id: 'user.delete.no_name' })} (${user.userName || 'N/A'})</strong><br>ID: ${user.id}`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'user.delete.confirm_button_1' }),
         cancelButtonText: intl.formatMessage({ id: 'user.delete.cancel_button' }),
         customClass: {
            popup: 'swal-delete-step1'
         }
      });

      if (!confirmFirst.isConfirmed) return;

      // Step 2: Second confirmation - Final warning
      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({ id: 'user.delete.confirm_title_2' }),
         text: intl.formatMessage({ id: 'user.delete.confirm_text_2' }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'user.delete.confirm_button_2' }),
         cancelButtonText: intl.formatMessage({ id: 'user.delete.cancel_button' }),
         customClass: {
            popup: 'swal-delete-step2'
         }
      });

      if (!confirmSecond.isConfirmed) return;

      // Step 3: Text confirmation - Type exact phrase (User specific)
      const confirmText = await Swal.fire({
         title: 'Security Confirmation',
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: #ef4444; font-weight: 600;">
                  ⚠️ This action cannot be undone!
               </p>
               <p style="margin-bottom: 10px; color: #374151;">
                  To confirm deletion of user: <strong style="color: #dc2626;">${user.phoneNumber || user.phone || user.userName || 'User ID: ' + user.id}</strong>
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  Please type exactly: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">I WANT TO DELETE THIS USER</code>
               </p>
            </div>
         `,
         input: 'text',
         inputPlaceholder: 'Type the confirmation phrase...',
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: 'Continue',
         cancelButtonText: 'Cancel',
         inputValidator: (value) => {
            if (value !== 'I WANT TO DELETE THIS USER') {
               return 'Please type the exact phrase: "I WANT TO DELETE THIS USER"';
            }
         },
         customClass: {
            popup: 'swal-delete-step3',
            input: 'swal-text-input'
         }
      });

      if (!confirmText.isConfirmed) return;

      // Step 4: Password verification
      const passwordConfirm = await Swal.fire({
         title: 'Administrator Password Required',
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: #dc2626; font-weight: 600;">
                  🔐 Final Security Check
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  Please enter your administrator password to complete the deletion:
               </p>
            </div>
         `,
         input: 'password',
         inputPlaceholder: 'Enter your password...',
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: 'Delete User',
         cancelButtonText: 'Cancel',
         inputValidator: (value) => {
            if (!value || value.trim() === '') {
               return 'Password is required';
            }
            if (value.length < 6) {
               return 'Password must be at least 6 characters';
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
         // First verify password
         const passwordVerification = await verifyPassword({ password });

         if (passwordVerification.errCode !== 0) {
            showToast("error", passwordVerification.errMessage || 'Invalid password');
            return;
         }

         // Show final loading
         Swal.fire({
            title: 'Deleting User...',
            text: 'Please wait while we process your request.',
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
               title: 'User Deleted Successfully!',
               html: `
                  <div style="text-align: center; margin: 20px 0;">
                     <p style="color: #059669; font-weight: 600; margin-bottom: 10px;">
                        ✅ User has been permanently deleted
                     </p>
                     <p style="color: #374151; font-size: 14px;">
                        Phone: <strong>${user.phoneNumber || user.phone || user.userName || 'N/A'}</strong><br>
                        ID: <strong>${user.id}</strong>
                     </p>
                  </div>
               `,
               icon: 'success',
               confirmButtonText: 'OK',
               customClass: {
                  popup: 'swal-delete-success'
               }
            });

            showToast("success", res.errMessage || intl.formatMessage({ id: 'user.delete.success' }));
            if (typeof onSuccess === 'function') onSuccess(user.id);
         } else {
            showToast("error", res.errMessage || intl.formatMessage({ id: 'user.delete.failed' }));
         }
      } catch (error) {
         Swal.close();
         console.error('Delete error:', error);

         // Enhanced error handling
         let errorMessage = intl.formatMessage({ id: 'user.delete.error' });

         if (error.response?.status === 401) {
            errorMessage = 'Invalid password or session expired';
         } else if (error.response?.status === 403) {
            errorMessage = 'You do not have permission to delete this user';
         } else if (error.response?.status === 404) {
            errorMessage = 'User not found or already deleted';
         } else if (error.errMessage) {
            errorMessage = error.errMessage;
         }

         await Swal.fire({
            title: 'Deletion Failed',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: {
               popup: 'swal-delete-error'
            }
         });

         showToast("error", errorMessage);
      }
   };

   return (
      <button className="btn-action btn-delete" onClick={handleDelete}>
         {intl.formatMessage({ id: 'user.delete.button' })}
      </button>
   );
};

export default UserDelete;
