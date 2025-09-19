import React from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { deleteProduct } from '../../../../services/productService.js';
import CustomToast from '../../../../components/CustomToast';

const ProductDelete = ({ product }) => {
   const intl = useIntl();
   const navigate = useNavigate();

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === 'success' ? 'product.delete.success_title' : 'product.delete.error_title'}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   const handleDelete = async () => {
      if (!product || !product.id) {
         showToast('error', intl.formatMessage({ id: 'product.delete.not_found', defaultMessage: 'Sản phẩm không được tìm thấy' }));
         return;
      }

      if (product.isActive) {
         showToast('error', intl.formatMessage({ id: 'product.delete.blocked_active', defaultMessage: 'Không thể xóa sản phẩm đang hoạt động' }));
         return;
      }

      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({ id: 'product.delete.confirm_title_1', defaultMessage: 'Xác nhận xóa sản phẩm' }),
         html: `<strong>${product.nameProduct || intl.formatMessage({ id: 'product.delete.no_name', defaultMessage: 'Không có tên sản phẩm' })}</strong><br>ID: ${product.id}`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'product.delete.confirm_button_1', defaultMessage: 'Tiếp tục' }),
         cancelButtonText: intl.formatMessage({ id: 'admin.delete.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmFirst.isConfirmed) return;

      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({ id: 'product.delete.confirm_title_2', defaultMessage: 'Bạn chắc chắn muốn xóa?' }),
         text: intl.formatMessage({ id: 'product.delete.confirm_text_2', defaultMessage: 'Hành động này không thể hoàn tác!' }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'product.delete.confirm_button_2', defaultMessage: 'Xóa' }),
         cancelButtonText: intl.formatMessage({ id: 'admin.delete.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmSecond.isConfirmed) return;

      try {
         const res = await deleteProduct(product.id);

         if (res.errCode === 0) {
            showToast('success', res.errMessage || intl.formatMessage({ id: 'product.delete.success', defaultMessage: 'Xóa sản phẩm thành công' }));
            setTimeout(() => navigate(0), 1500);
         } else {
            showToast('error', res.errMessage || intl.formatMessage({ id: 'product.delete.failed', defaultMessage: 'Xóa sản phẩm thất bại' }));
         }
      } catch (error) {
         console.error('Delete product error:', error.response?.data, error.response?.status);
         showToast('error', error.response?.data?.errMessage || intl.formatMessage({ id: 'product.delete.error', defaultMessage: 'Lỗi khi xóa sản phẩm' }));
      }
   };

   return (
      <button className="btn-action btn-delete" onClick={handleDelete}>
         {intl.formatMessage({ id: 'body_admin.product_management.delete_button', defaultMessage: 'Xóa' })}
      </button>
   );
};

export default ProductDelete;