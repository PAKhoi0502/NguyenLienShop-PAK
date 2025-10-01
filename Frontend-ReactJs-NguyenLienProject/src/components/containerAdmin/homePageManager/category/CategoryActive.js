import React from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';
import { getActiveCategories } from '../../../../services/categoryService.js';
import CustomToast from '../../../../components/CustomToast';

const CategoryActive = ({ category, onSuccess }) => {
   const intl = useIntl();

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={intl.formatMessage({
                  id: type === "success"
                     ? "body_admin.category_management.activate.activate_success_title"
                     : "body_admin.category_management.activate.activate_error_title"
               })}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   const handleToggleActive = async () => {
      if (!category || !category.id) {
         showToast("error", intl.formatMessage({ id: 'body_admin.category_management.delete.not_found' }));
         return;
      }

      const isActive = !category.isActive;

      const confirm = await Swal.fire({
         title: isActive
            ? intl.formatMessage({ id: 'body_admin.category_management.activate.confirm_title_1', defaultMessage: 'Bật hiển thị danh mục?' })
            : intl.formatMessage({ id: 'body_admin.category_management.deactivate.confirm_title_1', defaultMessage: 'Ẩn danh mục?' }),
         html: `<strong>${category.nameCategory || intl.formatMessage({ id: 'body_admin.category_management.activate.no_name', defaultMessage: 'Không có tên danh mục' })}</strong><br>ID: ${category.id}`,
         icon: isActive ? 'question' : 'warning',
         showCancelButton: true,
         confirmButtonText: isActive
            ? intl.formatMessage({ id: 'body_admin.category_management.activate.confirm_button_1', defaultMessage: 'Bật hiển thị' })
            : intl.formatMessage({ id: 'body_admin.category_management.deactivate.confirm_button_1', defaultMessage: 'Ẩn danh mục' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.category_management.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirm.isConfirmed) return;

      try {
         const res = await getActiveCategories(category.id, isActive);

         if (res.errCode === 0) {
            showToast("success", res.message || intl.formatMessage({ id: 'body_admin.category_management.activate.success', defaultMessage: 'Cập nhật trạng thái danh mục thành công' }));
            if (typeof onSuccess === 'function') {
               onSuccess(category.id, { ...category, isActive });
            }
         } else {
            showToast("error", res.errMessage || intl.formatMessage({ id: 'body_admin.category_management.activate.error', defaultMessage: 'Lỗi khi cập nhật trạng thái danh mục' }));
         }
      } catch (error) {
         console.error('Lỗi khi gọi API cập nhật trạng thái danh mục:', error);
         showToast("error", intl.formatMessage({ id: 'body_admin.category_management.activate.error', defaultMessage: 'Lỗi khi gọi API' }));
      }
   };

   return (
      <div className="action-buttons">
         <button
            className={`btn-action ${category.isActive ? 'btn-deactivate' : 'btn-activate'}`}
            onClick={handleToggleActive}
         >
            {category.isActive
               ? intl.formatMessage({ id: 'body_admin.category_management.deactivate.button', defaultMessage: 'Ẩn' })
               : intl.formatMessage({ id: 'body_admin.category_management.activate.button', defaultMessage: 'Hiển thị' })}
         </button>
      </div>
   );
};

export default CategoryActive;
