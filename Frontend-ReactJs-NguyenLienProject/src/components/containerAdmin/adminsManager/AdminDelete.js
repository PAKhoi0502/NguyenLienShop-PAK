import React from 'react';
import Swal from 'sweetalert2';
import { deleteUser } from '../../../services/adminService';
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';

const AdminDelete = ({ user, onSuccess }) => {
   const intl = useIntl();

   const handleDelete = async () => {
      if (!user || !user.id) {
         toast.error(intl.formatMessage({ id: 'admin.delete.not_found' }));
         return;
      }

      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({ id: 'admin.delete.confirm_title_1' }),
         html: `<strong>${user.fullName || intl.formatMessage({ id: 'admin.delete.no_name' })} (${user.userName || 'N/A'})</strong><br>ID: ${user.id}`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'admin.delete.confirm_button_1' }),
         cancelButtonText: intl.formatMessage({ id: 'admin.delete.cancel_button' })
      });

      if (!confirmFirst.isConfirmed) return;

      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({ id: 'admin.delete.confirm_title_2' }),
         text: intl.formatMessage({ id: 'admin.delete.confirm_text_2' }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'admin.delete.confirm_button_2' }),
         cancelButtonText: intl.formatMessage({ id: 'admin.delete.cancel_button' })
      });

      if (!confirmSecond.isConfirmed) return;

      try {
         const res = await deleteUser(user.id);

         if (res.errCode === 0) {
            toast.success(res.errMessage || intl.formatMessage({ id: 'admin.delete.success' }));
            if (typeof onSuccess === 'function') onSuccess(user.id);
         } else {
            toast.error(res.errMessage || intl.formatMessage({ id: 'admin.delete.failed' }));
         }
      } catch (error) {
         console.error('Delete error:', error);
         toast.error(error.errMessage || intl.formatMessage({ id: 'admin.delete.error' }));
      }
   };

   return (
      <button className="btn-action btn-delete" onClick={handleDelete}>
         {intl.formatMessage({ id: 'admin.delete.button' })}
      </button>
   );
};

export default AdminDelete;
