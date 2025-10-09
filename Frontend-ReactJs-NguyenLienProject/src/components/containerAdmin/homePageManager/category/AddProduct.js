import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import Swal from 'sweetalert2';
import CustomToast from '../../../../components/CustomToast';
import { toast } from 'react-toastify';
import { getAllProducts, addProductForCategory, getProductsByCategoryId } from '../../../../services/categoryService';
import './AddProduct.scss';

const AddProduct = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const intl = useIntl();
   const { id } = useParams();
   const categoryId = id || location.state?.categoryId;
   const [availableProducts, setAvailableProducts] = useState([]);
   const [existingProductIds, setExistingProductIds] = useState([]);
   const [selectedProducts, setSelectedProducts] = useState([]);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);

            // Lấy tất cả sản phẩm
            const allProductsRes = await getAllProducts();

            if (allProductsRes.errCode !== 0 || !allProductsRes.products) {
               toast(<CustomToast
                  type="error"
                  message={allProductsRes?.errMessage || 'Không thể tải sản phẩm'}
                  time={new Date()}
               />);
               setAvailableProducts([]);
               return;
            }

            // Lấy sản phẩm hiện có của danh mục (để lọc)
            const existingProductsRes = await getProductsByCategoryId(categoryId);

            let existingIds = [];
            if (existingProductsRes.errCode === 0 && existingProductsRes.products) {
               existingIds = existingProductsRes.products.map(p => p.id);
               setExistingProductIds(existingIds); // Lưu để dùng trong handleSave
            }

            // Lọc ra các sản phẩm chưa có trong danh mục
            const available = allProductsRes.products.filter(
               product => !existingIds.includes(product.id)
            );

            setAvailableProducts(available);

         } catch (error) {
            toast(<CustomToast
               type="error"
               message="Có lỗi xảy ra khi tải dữ liệu"
               time={new Date()}
            />);
            setAvailableProducts([]);
         } finally {
            setLoading(false);
         }
      };

      if (categoryId) {
         fetchData();
      } else {
         toast(<CustomToast
            type="error"
            message="Không tìm thấy thông tin danh mục"
            time={new Date()}
         />);
         navigate(-1);
      }
   }, [categoryId, navigate]);

   const handleCheckboxChange = (id) => {
      setSelectedProducts((prev) =>
         prev.includes(id) ? prev.filter((prodId) => prodId !== id) : [...prev, id]
      );
   };

   const handleSave = async () => {
      if (!categoryId || selectedProducts.length === 0) {
         toast(<CustomToast type="error" message={intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.select_at_least_one', defaultMessage: 'Vui lòng chọn ít nhất một sản phẩm' })} time={new Date()} />);
         return;
      }

      // Get selected product names for display
      const selectedProductNames = availableProducts
         .filter(prod => selectedProducts.includes(prod.id))
         .map(prod => prod.nameProduct)
         .join(', ');

      // Step 1: Initial Confirmation
      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.confirm_title_1', defaultMessage: 'Xác nhận thêm sản phẩm vào danh mục' }),
         html: `<strong>Sản phẩm được chọn:</strong> ${selectedProductNames}<br><strong>Số lượng:</strong> ${selectedProducts.length} sản phẩm`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.confirm_button_1', defaultMessage: 'Tiếp tục' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmFirst.isConfirmed) return;

      // Step 2: Secondary Confirmation
      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.confirm_title_2', defaultMessage: 'Bạn chắc chắn muốn thêm?' }),
         text: intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.confirm_text_2', defaultMessage: 'Các sản phẩm sẽ được thêm vào danh mục này!' }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.confirm_button_2', defaultMessage: 'Thêm' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmSecond.isConfirmed) return;

      // Step 3: Text confirmation - Type exact phrase
      const confirmText = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.security_title', defaultMessage: 'Xác nhận bảo mật' }),
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: #ef4444; font-weight: 600;">
                  ${intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.security_warning', defaultMessage: 'Cảnh báo: Hành động này sẽ thêm sản phẩm vào danh mục!' })}
               </p>
               <p style="margin-bottom: 10px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.security_confirm_text', defaultMessage: 'Sản phẩm sẽ được thêm' })}: <strong style="color: #dc2626;">${selectedProductNames}</strong>
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.security_type_exact', defaultMessage: 'Nhập chính xác cụm từ' })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">${intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.security_phrase', defaultMessage: 'THÊM SẢN PHẨM VÀO DANH MỤC' })}</code>
               </p>
            </div>
         `,
         input: 'text',
         inputPlaceholder: intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.security_placeholder', defaultMessage: 'Nhập cụm từ xác nhận...' }),
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.security_continue', defaultMessage: 'Tiếp tục thêm' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.cancel_button', defaultMessage: 'Hủy' }),
         inputValidator: (value) => {
            const expectedPhrase = intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.security_phrase', defaultMessage: 'THÊM SẢN PHẨM VÀO DANH MỤC' });
            if (value !== expectedPhrase) {
               return intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.security_error', defaultMessage: 'Cụm từ không chính xác. Vui lòng nhập đúng cụm từ được yêu cầu.' });
            }
         },
         customClass: {
            popup: 'swal-add-step3',
            input: 'swal-text-input'
         }
      });

      if (!confirmText.isConfirmed) return;

      setLoading(true);

      try {
         // Cộng dồn sản phẩm cũ + sản phẩm mới
         const allProductIds = [...existingProductIds, ...selectedProducts];

         const res = await addProductForCategory(categoryId, allProductIds);

         if (res && res.errCode === 0) {
            toast(<CustomToast type="success" message={intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.success', defaultMessage: 'Thêm sản phẩm thành công' })} time={new Date()} />);
            navigate(-1);
         } else {
            toast(<CustomToast type="error" message={res?.errMessage || intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.error', defaultMessage: 'Có lỗi xảy ra khi thêm sản phẩm' })} time={new Date()} />);
         }
      } catch (error) {
         toast(<CustomToast type="error" message={intl.formatMessage({ id: 'body_admin.category_management.add_product_to_category.request_error', defaultMessage: 'Có lỗi xảy ra khi xử lý yêu cầu' })} time={new Date()} />);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="add-category-product admin-page">
         <div className="form-container">
            <h2>Thêm sản phẩm vào danh mục</h2>

            <div className="product-list">
               {availableProducts.length > 0 ? (
                  availableProducts.map((prod) => (
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
                  <p>{loading ? 'Đang tải...' : 'Không có sản phẩm mới để thêm'}</p>
               )}
            </div>
            <div className="form-actions">
               <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu'}
               </button>
               <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                  <FormattedMessage id="body_admin.category_management.add_product_to_category.cancel" defaultMessage="Hủy" />
               </button>
            </div>
         </div>
      </div>
   );
};

export default AddProduct;
