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
                     ? "product.activate.activate_success_title"
                     : "product.activate.activate_error_title"
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
         showToast("error", intl.formatMessage({ id: 'admin.delete.not_found' }));
         return;
      }

      const isActive = !product.isActive;

      // Sử dụng Swal để xác nhận trước khi bật/tắt sản phẩm
      const confirm = await Swal.fire({
         title: isActive
            ? intl.formatMessage({ id: 'product.activate.confirm_title_1' })
            : intl.formatMessage({ id: 'product.deactivate.confirm_title_1' }),
         html: `<strong>${product.nameProduct || intl.formatMessage({ id: 'product.activate.no_name' })}</strong><br>ID: ${product.id}`,
         icon: isActive ? 'question' : 'warning',
         showCancelButton: true,
         confirmButtonText: isActive
            ? intl.formatMessage({ id: 'product.activate.confirm_button_1' })
            : intl.formatMessage({ id: 'product.deactivate.confirm_button_1' }),
         cancelButtonText: intl.formatMessage({ id: 'admin.delete.cancel_button' })
      });

      if (!confirm.isConfirmed) return;

      try {
         const res = await getActiveProducts(product.id, isActive);

         if (res.errCode === 0) {
            showToast("success", res.message || 'Cập nhật trạng thái sản phẩm thành công');
            if (typeof onSuccess === 'function') {
               onSuccess(product.id, { ...product, isActive });
            }
         } else {
            showToast("error", res.errMessage || 'Lỗi khi cập nhật trạng thái sản phẩm');
         }
      } catch (error) {
         console.error('Lỗi khi gọi API cập nhật trạng thái sản phẩm:', error);
         showToast("error", 'Lỗi khi gọi API');
      }
   };

   return (
      <div className="action-buttons">
         <button
            className={`btn-action ${product.isActive ? 'btn-deactivate' : 'btn-activate'}`}
            onClick={handleToggleActive}
         >
            {product.isActive
               ? intl.formatMessage({ id: 'product.deactivate.button' })
               : intl.formatMessage({ id: 'product.activate.button' })}
         </button>
      </div>
   );
};

export default ProductActive;
