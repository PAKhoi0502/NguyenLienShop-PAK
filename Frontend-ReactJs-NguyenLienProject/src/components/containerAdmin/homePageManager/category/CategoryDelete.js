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
               titleId={type === 'success' ? 'category.delete.success_title' : 'category.delete.error_title'}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   const handleDelete = async () => {
      if (!category || !category.id) {
         showToast('error', intl.formatMessage({ id: 'category.delete.not_found', defaultMessage: 'Danh mục không được tìm thấy' }));
         return;
      }

      if (category.isActive) {
         showToast('error', intl.formatMessage({ id: 'category.delete.blocked_active', defaultMessage: 'Không thể xóa danh mục đang hoạt động' }));
         return;
      }

      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({ id: 'category.delete.confirm_title_1', defaultMessage: 'Xác nhận xóa danh mục' }),
         html: `<strong>${category.nameCategory || intl.formatMessage({ id: 'category.delete.no_name', defaultMessage: 'Không có tên danh mục' })}</strong><br>ID: ${category.id}`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'category.delete.confirm_button_1', defaultMessage: 'Tiếp tục' }),
         cancelButtonText: intl.formatMessage({ id: 'admin.delete.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmFirst.isConfirmed) return;

      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({ id: 'category.delete.confirm_title_2', defaultMessage: 'Bạn chắc chắn muốn xóa?' }),
         text: intl.formatMessage({ id: 'category.delete.confirm_text_2', defaultMessage: 'Hành động này không thể hoàn tác!' }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'category.delete.confirm_button_2', defaultMessage: 'Xóa' }),
         cancelButtonText: intl.formatMessage({ id: 'admin.delete.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmSecond.isConfirmed) return;

      try {
         const res = await deleteCategory(category.id);
         if (res.errCode === 0) {
            showToast('success', res.errMessage || intl.formatMessage({ id: 'category.delete.success', defaultMessage: 'Xóa danh mục thành công' }));
            setTimeout(() => navigate(0), 1500);
         } else {
            showToast('error', res.errMessage || intl.formatMessage({ id: 'category.delete.failed', defaultMessage: 'Xóa danh mục thất bại' }));
         }
      } catch (error) {
         showToast('error', error.response?.data?.errMessage || intl.formatMessage({ id: 'category.delete.error', defaultMessage: 'Lỗi khi xóa danh mục' }));
      }
   };

   return (
      <button className="btn-action btn-delete" onClick={handleDelete}>
         {intl.formatMessage({ id: 'category.delete.button', defaultMessage: 'Xóa' })}
      </button>
   );
};

export default CategoryDelete;
