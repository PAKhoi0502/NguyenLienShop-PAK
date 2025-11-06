import React from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';
import { getActiveProducts } from '../../../../services/productService.js';
import CustomToast from '../../../../components/CustomToast';

const ProductActive = ({ product, onSuccess }) => {
   const intl = useIntl();

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={intl.formatMessage({
                  id: type === "success"
                     ? "body_admin.product_management.activate_product.activate_success_title"
                     : "body_admin.product_management.activate_product.activate_error_title"
               })}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   const handleToggleActive = async () => {
      if (!product || !product.id) {
         showToast("error", intl.formatMessage({ id: 'body_admin.product_management.activate_product.not_found', defaultMessage: 'Không tìm thấy sản phẩm' }));
         return;
      }

      const isActive = !product.isActive;

      // Sử dụng Swal để xác nhận trước khi bật/tắt sản phẩm
      const confirm = await Swal.fire({
         title: isActive
            ? intl.formatMessage({ id: 'body_admin.product_management.activate_product.confirm_activate_title', defaultMessage: 'Bạn có chắc muốn kích hoạt sản phẩm này?' })
            : intl.formatMessage({ id: 'body_admin.product_management.activate_product.confirm_deactivate_title', defaultMessage: 'Bạn có chắc muốn vô hiệu hóa sản phẩm này?' }),
         html: `<strong>${product.nameProduct || intl.formatMessage({ id: 'body_admin.product_management.activate_product.no_name', defaultMessage: 'Không có tên' })}</strong><br>ID: ${product.id}`,
         icon: isActive ? 'question' : 'warning',
         showCancelButton: true,
         confirmButtonText: isActive
            ? intl.formatMessage({ id: 'body_admin.product_management.activate_product.confirm_activate_button', defaultMessage: 'Có, kích hoạt nó' })
            : intl.formatMessage({ id: 'body_admin.product_management.activate_product.confirm_deactivate_button', defaultMessage: 'Có, vô hiệu hóa nó' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.product_management.activate_product.cancel_button', defaultMessage: 'Hủy' }),
         confirmButtonColor: isActive ? '#22c55e' : '#ef4444',
         cancelButtonColor: '#6b7280'
      });

      if (!confirm.isConfirmed) return;

      try {
         const res = await getActiveProducts(product.id, isActive);

         if (res.errCode === 0) {
            const successMessage = isActive
               ? intl.formatMessage({ id: 'body_admin.product_management.activate_product.activate_success', defaultMessage: 'Kích hoạt sản phẩm thành công' })
               : intl.formatMessage({ id: 'body_admin.product_management.activate_product.deactivate_success', defaultMessage: 'Vô hiệu hóa sản phẩm thành công' });
            showToast("success", res.message || successMessage);
            if (typeof onSuccess === 'function') {
               onSuccess(product.id, { ...product, isActive });
            }
         } else {
            showToast("error", res.errMessage || intl.formatMessage({ id: 'body_admin.product_management.activate_product.error', defaultMessage: 'Có lỗi xảy ra khi cập nhật trạng thái sản phẩm' }));
         }
      } catch (error) {
         console.error('Lỗi khi gọi API cập nhật trạng thái sản phẩm:', error);
         showToast("error", intl.formatMessage({ id: 'body_admin.product_management.activate_product.error', defaultMessage: 'Có lỗi xảy ra khi cập nhật trạng thái sản phẩm' }));
      }
   };

   return (
      <div className="action-buttons">
         <button
            className={`btn-action btn-active ${product.isActive ? 'btn-deactivate' : 'btn-activate'}`}
            onClick={handleToggleActive}
         >
            <span className="btn-text">
               {product.isActive
                  ? intl.formatMessage({ id: 'body_admin.product_management.activate_product.deactivate_button' })
                  : intl.formatMessage({ id: 'body_admin.product_management.activate_product.activate_button' })}
            </span>
            <span className="btn-icon-active">
               {product.isActive
                  ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="btn-icon-activate">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>

                  : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="btn-icon-deactivate">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>

               }
            </span>
         </button>
      </div>
   );
};

export default ProductActive;
