import React from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { deleteCategory } from '../../../../services/categoryService.js';
import CustomToast from '../../../../components/CustomToast';

const CategoryDelete = ({ category }) => {
   const intl = useIntl();
   const navigate = useNavigate();

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === 'success' ? 'body_admin.category_management.delete.success_title' : 'body_admin.category_management.delete.error_title'}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   const handleDelete = async () => {
      if (!category || !category.id) {
         showToast('error', intl.formatMessage({ id: 'body_admin.category_management.delete.not_found', defaultMessage: 'Danh mục không được tìm thấy' }));
         return;
      }

      if (category.isActive) {
         showToast('error', intl.formatMessage({ id: 'body_admin.category_management.delete.blocked_active', defaultMessage: 'Không thể xóa danh mục đang hoạt động' }));
         return;
      }

      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.category_management.delete.confirm_title_1', defaultMessage: 'Xác nhận xóa danh mục' }),
         html: `<strong>${category.nameCategory || intl.formatMessage({ id: 'body_admin.category_management.delete.no_name', defaultMessage: 'Không có tên danh mục' })}</strong><br>ID: ${category.id}`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.category_management.delete.confirm_button_1', defaultMessage: 'Tiếp tục' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.category_management.delete.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmFirst.isConfirmed) return;

      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.category_management.delete.confirm_title_2', defaultMessage: 'Bạn chắc chắn muốn xóa?' }),
         text: intl.formatMessage({ id: 'body_admin.category_management.delete.confirm_text_2', defaultMessage: 'Hành động này không thể hoàn tác!' }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.category_management.delete.confirm_button_2', defaultMessage: 'Xóa' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.category_management.delete.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmSecond.isConfirmed) return;

      // Step 3: Text confirmation - Type exact phrase (Category specific)
      const confirmText = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.category_management.delete.security_title', defaultMessage: 'Xác nhận bảo mật' }),
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: #ef4444; font-weight: 600;">
                  ${intl.formatMessage({ id: 'body_admin.category_management.delete.security_warning', defaultMessage: 'Cảnh báo: Hành động này sẽ xóa vĩnh viễn danh mục!' })}
               </p>
               <p style="margin-bottom: 10px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.category_management.delete.security_confirm_text', defaultMessage: 'Danh mục cần xóa' })}: <strong style="color: #dc2626;">${category.nameCategory || intl.formatMessage({ id: 'body_admin.category_management.delete.no_name', defaultMessage: 'Không có tên danh mục' })}</strong>
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.category_management.delete.security_type_exact', defaultMessage: 'Nhập chính xác cụm từ' })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">${intl.formatMessage({ id: 'body_admin.category_management.delete.security_phrase', defaultMessage: 'XÓA DANH MỤC' })}</code>
               </p>
            </div>
         `,
         input: 'text',
         inputPlaceholder: intl.formatMessage({ id: 'body_admin.category_management.delete.security_placeholder', defaultMessage: 'Nhập cụm từ xác nhận...' }),
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.category_management.delete.security_continue', defaultMessage: 'Tiếp tục xóa' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.category_management.delete.cancel_button', defaultMessage: 'Hủy' }),
         inputValidator: (value) => {
            const expectedPhrase = intl.formatMessage({ id: 'body_admin.category_management.delete.security_phrase', defaultMessage: 'XÓA DANH MỤC' });
            if (value !== expectedPhrase) {
               return intl.formatMessage({ id: 'body_admin.category_management.delete.security_error', defaultMessage: 'Cụm từ không chính xác. Vui lòng nhập đúng cụm từ được yêu cầu.' });
            }
         },
         customClass: {
            popup: 'swal-delete-step3',
            input: 'swal-text-input'
         }
      });

      if (!confirmText.isConfirmed) return;

      try {
         const res = await deleteCategory(category.id);
         if (res.errCode === 0) {
            showToast('success', res.errMessage || intl.formatMessage({ id: 'body_admin.category_management.delete.success', defaultMessage: 'Xóa danh mục thành công' }));
            setTimeout(() => navigate(0), 1500);
         } else {
            showToast('error', res.errMessage || intl.formatMessage({ id: 'body_admin.category_management.delete.failed', defaultMessage: 'Xóa danh mục thất bại' }));
         }
      } catch (error) {
         showToast('error', error.response?.data?.errMessage || intl.formatMessage({ id: 'body_admin.category_management.delete.error', defaultMessage: 'Lỗi khi xóa danh mục' }));
      }
   };

   return (
      <button className="btn-action btn-delete" onClick={handleDelete}>
         {intl.formatMessage({ id: 'body_admin.category_management.delete.button', defaultMessage: 'Xóa' })}
      </button>
   );
};

export default CategoryDelete;
