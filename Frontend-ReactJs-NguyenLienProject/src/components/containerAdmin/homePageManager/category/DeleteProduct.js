import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import Swal from 'sweetalert2';
import CustomToast from '../../../../components/CustomToast';
import { toast } from 'react-toastify';
import { getProductsByCategoryId, deleteProductForCategory } from '../../../../services/categoryService';
import './DeleteProduct.scss';

const DeleteProduct = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const intl = useIntl();
   const { id } = useParams();
   const categoryId = id || location.state?.categoryId;
   const [products, setProducts] = useState([]);
   const [selectedProducts, setSelectedProducts] = useState([]);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            const res = await getProductsByCategoryId(categoryId);
            if (res && res.errCode === 0 && Array.isArray(res.products)) {
               setProducts(res.products);
            } else {
               toast(<CustomToast type="error" message={res?.errMessage || 'Không thể tải sản phẩm'} time={new Date()} />);
            }
         } catch (error) {
            console.error('Lỗi khi tải sản phẩm:', error);
            toast(<CustomToast type="error" message="Có lỗi xảy ra khi tải sản phẩm" time={new Date()} />);
         }
      };
      if (categoryId) fetchProducts();
   }, [categoryId]);

   const handleCheckboxChange = (id) => {
      setSelectedProducts((prev) =>
         prev.includes(id) ? prev.filter((prodId) => prodId !== id) : [...prev, id]
      );
   };

   const handleDelete = async () => {
      if (!categoryId || selectedProducts.length === 0) {
         toast(<CustomToast type="error" message={intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.select_at_least_one', defaultMessage: 'Vui lòng chọn ít nhất một sản phẩm để xóa' })} time={new Date()} />);
         return;
      }

      // Get selected product names for display
      const selectedProductNames = products
         .filter(prod => selectedProducts.includes(prod.id))
         .map(prod => prod.nameProduct)
         .join(', ');

      // Step 1: Initial Confirmation
      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.confirm_title_1', defaultMessage: 'Xác nhận xóa sản phẩm khỏi danh mục' }),
         html: `<strong>Sản phẩm được chọn:</strong> ${selectedProductNames}<br><strong>Số lượng:</strong> ${selectedProducts.length} sản phẩm`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.confirm_button_1', defaultMessage: 'Tiếp tục' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmFirst.isConfirmed) return;

      // Step 2: Secondary Confirmation
      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.confirm_title_2', defaultMessage: 'Bạn chắc chắn muốn xóa?' }),
         text: intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.confirm_text_2', defaultMessage: 'Các sản phẩm sẽ được gỡ bỏ khỏi danh mục này!' }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.confirm_button_2', defaultMessage: 'Xóa' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmSecond.isConfirmed) return;

      // Step 3: Text confirmation - Type exact phrase
      const confirmText = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.security_title', defaultMessage: 'Xác nhận bảo mật' }),
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: #ef4444; font-weight: 600;">
                  ${intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.security_warning', defaultMessage: 'Cảnh báo: Hành động này sẽ gỡ bỏ sản phẩm khỏi danh mục!' })}
               </p>
               <p style="margin-bottom: 10px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.security_confirm_text', defaultMessage: 'Sản phẩm sẽ được xóa' })}: <strong style="color: #dc2626;">${selectedProductNames}</strong>
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.security_type_exact', defaultMessage: 'Nhập chính xác cụm từ' })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">${intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.security_phrase', defaultMessage: 'XÓA SẢN PHẨM KHỎI DANH MỤC' })}</code>
               </p>
            </div>
         `,
         input: 'text',
         inputPlaceholder: intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.security_placeholder', defaultMessage: 'Nhập cụm từ xác nhận...' }),
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.security_continue', defaultMessage: 'Tiếp tục xóa' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.cancel_button', defaultMessage: 'Hủy' }),
         inputValidator: (value) => {
            const expectedPhrase = intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.security_phrase', defaultMessage: 'XÓA SẢN PHẨM KHỎI DANH MỤC' });
            if (value !== expectedPhrase) {
               return intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.security_error', defaultMessage: 'Cụm từ không chính xác. Vui lòng nhập đúng cụm từ được yêu cầu.' });
            }
         },
         customClass: {
            popup: 'swal-delete-step3',
            input: 'swal-text-input'
         }
      });

      if (!confirmText.isConfirmed) return;

      setLoading(true);
      try {
         const res = await deleteProductForCategory(categoryId, selectedProducts);
         if (res && res.errCode === 0) {
            toast(<CustomToast type="success" message={intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.success', defaultMessage: 'Xóa sản phẩm khỏi danh mục thành công' })} time={new Date()} />);
            navigate(-1);
         } else {
            toast(<CustomToast type="error" message={res?.errMessage || intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.error', defaultMessage: 'Có lỗi xảy ra khi xóa sản phẩm' })} time={new Date()} />);
         }
      } catch (error) {
         console.error('Lỗi khi xóa sản phẩm:', error);
         toast(<CustomToast type="error" message={intl.formatMessage({ id: 'body_admin.category_management.delete_product_from_category.request_error', defaultMessage: 'Có lỗi xảy ra khi xử lý yêu cầu' })} time={new Date()} />);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="delete-category-product admin-page">
         <div className="form-container">
            <h2>Xóa sản phẩm khỏi danh mục</h2>
            <div className="product-list">
               {products.length > 0 ? (
                  products.map((prod) => (
                     <label key={prod.id} className="product-item">
                        <input
                           type="checkbox"
                           checked={selectedProducts.includes(prod.id)}
                           onChange={() => handleCheckboxChange(prod.id)}
                        />
                        {prod.nameProduct}
                     </label>
                  ))
               ) : (
                  <p>Không có sản phẩm nào được tìm thấy</p>
               )}
            </div>
            <div className="form-actions">
               <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                  {loading ? 'Đang xóa...' : 'Xóa'}
               </button>
               <button className="btn btn-primary" onClick={() => navigate(-1)}>
                  <FormattedMessage id="body_admin.category_management.delete_product_from_category.cancel" defaultMessage="Hủy" />
               </button>
            </div>
         </div>
      </div>
   );
};

export default DeleteProduct;
