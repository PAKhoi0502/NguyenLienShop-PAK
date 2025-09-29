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
               titleId={type === 'success' ? 'body_admin.product_management.delete_product.success_title' : 'body_admin.product_management.delete_product.error_title'}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   const handleDelete = async () => {
      if (!product || !product.id) {
         showToast('error', intl.formatMessage({ id: 'body_admin.product_management.delete_product.not_found', defaultMessage: 'Sản phẩm không được tìm thấy' }));
         return;
      }

      if (product.isActive) {
         showToast('error', intl.formatMessage({ id: 'body_admin.product_management.delete_product.blocked_active', defaultMessage: 'Không thể xóa sản phẩm đang hoạt động' }));
         return;
      }

      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.product_management.delete_product.confirm_title_1', defaultMessage: 'Xác nhận xóa sản phẩm' }),
         html: `<strong>${product.nameProduct || intl.formatMessage({ id: 'body_admin.product_management.delete_product.no_name', defaultMessage: 'Không có tên sản phẩm' })}</strong><br>ID: ${product.id}`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.product_management.delete_product.confirm_button_1', defaultMessage: 'Tiếp tục' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.product_management.delete_product.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmFirst.isConfirmed) return;

      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.product_management.delete_product.confirm_title_2', defaultMessage: 'Bạn chắc chắn muốn xóa?' }),
         text: intl.formatMessage({ id: 'body_admin.product_management.delete_product.confirm_text_2', defaultMessage: 'Hành động này không thể hoàn tác!' }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.product_management.delete_product.confirm_button_2', defaultMessage: 'Xóa' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.product_management.delete_product.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmSecond.isConfirmed) return;

      // Step 3: Text confirmation - Type exact phrase (Product specific)
      const confirmText = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.product_management.delete_product.security_title', defaultMessage: 'Xác nhận bảo mật' }),
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: #ef4444; font-weight: 600;">
                  ${intl.formatMessage({ id: 'body_admin.product_management.delete_product.security_warning', defaultMessage: 'Cảnh báo: Hành động này sẽ xóa vĩnh viễn sản phẩm!' })}
               </p>
               <p style="margin-bottom: 10px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.product_management.delete_product.security_confirm_text', defaultMessage: 'Sản phẩm cần xóa' })}: <strong style="color: #dc2626;">${product.nameProduct || intl.formatMessage({ id: 'body_admin.product_management.delete_product.no_name', defaultMessage: 'Không có tên sản phẩm' })}</strong>
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.product_management.delete_product.security_type_exact', defaultMessage: 'Nhập chính xác cụm từ' })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">${intl.formatMessage({ id: 'body_admin.product_management.delete_product.security_phrase', defaultMessage: 'XÓA SẢN PHẨM' })}</code>
               </p>
            </div>
         `,
         input: 'text',
         inputPlaceholder: intl.formatMessage({ id: 'body_admin.product_management.delete_product.security_placeholder', defaultMessage: 'Nhập cụm từ xác nhận...' }),
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.product_management.delete_product.security_continue', defaultMessage: 'Tiếp tục xóa' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.product_management.delete_product.cancel_button', defaultMessage: 'Hủy' }),
         inputValidator: (value) => {
            const expectedPhrase = intl.formatMessage({ id: 'body_admin.product_management.delete_product.security_phrase', defaultMessage: 'XÓA SẢN PHẨM' });
            if (value !== expectedPhrase) {
               return intl.formatMessage({ id: 'body_admin.product_management.delete_product.security_error', defaultMessage: 'Cụm từ không chính xác. Vui lòng nhập đúng cụm từ được yêu cầu.' });
            }
         },
         customClass: {
            popup: 'swal-delete-step3',
            input: 'swal-text-input'
         }
      });

      if (!confirmText.isConfirmed) return;

      try {
         const res = await deleteProduct(product.id);

         if (res.errCode === 0) {
            showToast('success', res.errMessage || intl.formatMessage({ id: 'body_admin.product_management.delete_product.success', defaultMessage: 'Xóa sản phẩm thành công' }));
            setTimeout(() => navigate(0), 1500);
         } else {
            showToast('error', res.errMessage || intl.formatMessage({ id: 'body_admin.product_management.delete_product.failed', defaultMessage: 'Xóa sản phẩm thất bại' }));
         }
      } catch (error) {
         console.error('Delete product error:', error.response?.data, error.response?.status);
         showToast('error', error.response?.data?.errMessage || intl.formatMessage({ id: 'body_admin.product_management.delete_product .error', defaultMessage: 'Lỗi khi xóa sản phẩm' }));
      }
   };

   return (
      <button className="btn-action btn-delete" onClick={handleDelete}>
         {intl.formatMessage({ id: 'body_admin.product_management.delete_product.delete_button', defaultMessage: 'Xóa' })}
      </button>
   );
};

export default ProductDelete;