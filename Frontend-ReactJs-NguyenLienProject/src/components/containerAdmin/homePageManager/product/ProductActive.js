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
            className={`btn-action ${product.isActive ? 'btn-deactivate' : 'btn-activate'}`}
            onClick={handleToggleActive}
         >
            {product.isActive
               ? intl.formatMessage({ id: 'body_admin.product_management.activate_product.deactivate_button' })
               : intl.formatMessage({ id: 'body_admin.product_management.activate_product.activate_button' })}
         </button>
      </div>
   );
};

export default ProductActive;
