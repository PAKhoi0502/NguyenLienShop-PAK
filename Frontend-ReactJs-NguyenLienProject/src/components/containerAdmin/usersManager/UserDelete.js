import React from 'react';
import Swal from 'sweetalert2';
import { deleteUser } from '../../../services/adminService';
import { toast } from 'react-toastify';
import { FormattedMessage, useIntl } from 'react-intl';

const UserDelete = ({ user, onSuccess }) => {
   const intl = useIntl();

   const handleDelete = async () => {
      if (!user || !user.id) {
         toast.error(intl.formatMessage({ id: 'user.delete.error.not_found' }));
         return;
      }

      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({ id: 'user.delete.confirm_title' }),
         html: `<strong>${user.fullName || intl.formatMessage({ id: 'user.delete.no_name' })} (${user.userName || 'N/A'})</strong><br>ID: ${user.id}`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'common.confirm' }),
         cancelButtonText: intl.formatMessage({ id: 'common.cancel' })
      });

      if (!confirmFirst.isConfirmed) return;

      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({ id: 'user.delete.confirm_title_final' }),
         text: intl.formatMessage({ id: 'user.delete.confirm_text_final' }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'user.delete.confirm_delete_now' }),
         cancelButtonText: intl.formatMessage({ id: 'common.no' })
      });

      if (!confirmSecond.isConfirmed) return;

      try {
         const res = await deleteUser(user.id);

         if (res.errCode === 0) {
            toast.success(res.errMessage || intl.formatMessage({ id: 'user.delete.success' }));
            if (typeof onSuccess === 'function') onSuccess(user.id);
         } else {
            toast.error(res.errMessage || intl.formatMessage({ id: 'user.delete.error.cannot_delete' }));
         }
      } catch (error) {
         console.error('Delete error:', error);
         toast.error(error.errMessage || intl.formatMessage({ id: 'user.delete.error.server' }));
      }
   };

   return (
      <button className="btn-action btn-delete" onClick={handleDelete}>
         <FormattedMessage id="common.delete" defaultMessage="Xóa" />
      </button>
   );
};

export default UserDelete;
