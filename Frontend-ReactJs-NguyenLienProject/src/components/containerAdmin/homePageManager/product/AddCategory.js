import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import Swal from 'sweetalert2';
import CustomToast from '../../../../components/CustomToast';
import HintBox from '../../../../components/HintBox';
import { toast } from 'react-toastify';
import { getAllCategories, addCategoryForProduct, getCategoriesByProductId } from '../../../../services/productService';
import './AddCategory.scss';

const AddCategory = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const intl = useIntl();
   const { id } = useParams();
   const productId = id || location.state?.productId;
   const [availableCategories, setAvailableCategories] = useState([]);
   const [existingCategoryIds, setExistingCategoryIds] = useState([]);
   const [selectedCategories, setSelectedCategories] = useState([]);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);

            const allCategoriesRes = await getAllCategories();

            if (allCategoriesRes.errCode !== 0 || !allCategoriesRes.categories) {
               toast(<CustomToast
                  type="error"
                  message={allCategoriesRes?.errMessage || intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.load_categories_error', defaultMessage: 'Không thể tải danh mục' })}
                  time={new Date()}
               />);
               setAvailableCategories([]);
               return;
            }

            const existingCategoriesRes = await getCategoriesByProductId(productId);

            let existingIds = [];
            if (existingCategoriesRes.errCode === 0 && existingCategoriesRes.categories) {
               existingIds = existingCategoriesRes.categories.map(c => c.id);
               setExistingCategoryIds(existingIds);
            }

            const available = allCategoriesRes.categories.filter(
               category => !existingIds.includes(category.id)
            );

            setAvailableCategories(available);

         } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            toast(<CustomToast
               type="error"
               message={intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.load_data_error', defaultMessage: 'Có lỗi xảy ra khi tải dữ liệu' })}
               time={new Date()}
            />);
            setAvailableCategories([]);
         } finally {
            setLoading(false);
         }
      };

      if (productId) {
         fetchData();
      } else {
         toast(<CustomToast
            type="error"
            message={intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.no_product_info', defaultMessage: 'Không tìm thấy thông tin sản phẩm' })}
            time={new Date()}
         />);
         navigate(-1);
      }
   }, [productId, navigate]);

   const handleCheckboxChange = (id) => {
      setSelectedCategories((prev) =>
         prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
      );
   };

   const handleSave = async () => {
      if (!productId || selectedCategories.length === 0) {
         toast(<CustomToast
            type="error"
            message={intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.select_at_least_one', defaultMessage: 'Vui lòng chọn ít nhất một danh mục' })}
            time={new Date()}
         />);
         return;
      }

      // Get selected category names for display
      const selectedCategoryNames = availableCategories
         .filter(cat => selectedCategories.includes(cat.id))
         .map(cat => cat.nameCategory)
         .join(', ');

      // Step 1: Initial Confirmation
      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.confirm_title_1', defaultMessage: 'Xác nhận thêm danh mục vào sản phẩm' }),
         html: `<strong>${intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.confirm_text_1', defaultMessage: 'Danh mục được chọn:' })}</strong> ${selectedCategoryNames}<br><strong>${intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.confirm_text_2', defaultMessage: 'Số lượng:' })}</strong> ${selectedCategories.length} ${intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.confirm_text_3', defaultMessage: 'danh mục' })}`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.confirm_button_1', defaultMessage: 'Tiếp tục' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmFirst.isConfirmed) return;

      // Step 2: Secondary Confirmation
      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.confirm_title_2', defaultMessage: 'Bạn chắc chắn muốn thêm?' }),
         text: intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.confirm_text_3', defaultMessage: 'Các danh mục sẽ được thêm vào sản phẩm này!' }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.confirm_button_2', defaultMessage: 'Thêm' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmSecond.isConfirmed) return;

      // Step 3: Text confirmation - Type exact phrase
      const confirmText = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.security_title', defaultMessage: 'Xác nhận bảo mật' }),
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: #ef4444; font-weight: 600;">
                  ${intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.security_warning', defaultMessage: 'Cảnh báo: Hành động này sẽ thêm danh mục vào sản phẩm!' })}
               </p>
               <p style="margin-bottom: 10px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.security_confirm_text', defaultMessage: 'Danh mục sẽ được thêm' })}: <strong style="color: #dc2626;">${selectedCategoryNames}</strong>
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.security_type_exact', defaultMessage: 'Nhập chính xác cụm từ' })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">${intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.security_phrase', defaultMessage: 'THÊM DANH MỤC VÀO SẢN PHẨM' })}</code>
               </p>
            </div>
         `,
         input: 'text',
         inputPlaceholder: intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.security_placeholder', defaultMessage: 'Nhập cụm từ xác nhận...' }),
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.security_continue', defaultMessage: 'Tiếp tục thêm' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.cancel_button', defaultMessage: 'Hủy' }),
         inputValidator: (value) => {
            const expectedPhrase = intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.security_phrase', defaultMessage: 'THÊM DANH MỤC VÀO SẢN PHẨM' });
            if (value !== expectedPhrase) {
               return intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.security_error', defaultMessage: 'Cụm từ không chính xác. Vui lòng nhập đúng cụm từ được yêu cầu.' });
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
         const allCategoryIds = [...existingCategoryIds, ...selectedCategories];

         const res = await addCategoryForProduct(productId, allCategoryIds);

         if (res && res.errCode === 0) {
            toast(<CustomToast
               type="success"
               message={intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.success', defaultMessage: 'Thêm danh mục thành công' })}
               time={new Date()}
            />);
            navigate(-1);
         } else {
            toast(<CustomToast
               type="error"
               message={res?.errMessage || intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.error', defaultMessage: 'Có lỗi xảy ra khi thêm danh mục' })}
               time={new Date()}
            />);
         }
      } catch (error) {
         console.error('Lỗi khi thêm danh mục:', error);
         toast(<CustomToast
            type="error"
            message={intl.formatMessage({ id: 'body_admin.product_management.add_category_of_product.request_error', defaultMessage: 'Có lỗi xảy ra khi xử lý yêu cầu' })}
            time={new Date()}
         />);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="add-product-category-component admin-page">
         <HintBox
            content={
               <div>
                  <p><FormattedMessage id="body_admin.product_management.add_category_of_product.hint.title" defaultMessage="Hướng dẫn: Chọn danh mục để thêm vào sản phẩm." /></p>
                  <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                     <li><FormattedMessage id="body_admin.product_management.add_category_of_product.hint.select" defaultMessage="Chọn ít nhất một danh mục từ danh sách bên dưới." /></li>
                     <li><FormattedMessage id="body_admin.product_management.add_category_of_product.hint.multiple" defaultMessage="Có thể chọn nhiều danh mục cùng lúc." /></li>
                     <li><FormattedMessage id="body_admin.product_management.add_category_of_product.hint.existing" defaultMessage="Chỉ hiển thị các danh mục chưa được gán cho sản phẩm này." /></li>
                  </ul>
               </div>
            }
         />

         <div className="form-container">
            <h2><FormattedMessage id="body_admin.product_management.add_category_of_product.title" defaultMessage="Thêm danh mục vào sản phẩm" /></h2>

            <div className="category-list">
               {availableCategories.length > 0 ? (
                  availableCategories.map((cat) => (
                     <label
                        key={cat.id}
                        className="category-item"
                     >
                        <input
                           type="checkbox"
                           checked={selectedCategories.includes(cat.id)}
                           onChange={() => handleCheckboxChange(cat.id)}
                        />
                        <span>
                           {cat.nameCategory}
                        </span>
                     </label>
                  ))
               ) : (
                  <p>
                     {loading ?
                        <FormattedMessage id="body_admin.product_management.add_category_of_product.loading" defaultMessage="Đang tải..." /> :
                        <FormattedMessage id="body_admin.product_management.add_category_of_product.no_categories" defaultMessage="Không có danh mục mới để thêm" />
                     }
                  </p>
               )}
            </div>
            <div className="form-actions">
               <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                  {loading ?
                     <FormattedMessage id="body_admin.product_management.add_category_of_product.saving" defaultMessage="Đang lưu..." /> :
                     <FormattedMessage id="body_admin.product_management.add_category_of_product.save" defaultMessage="Lưu" />
                  }
               </button>
               <button className="btn btn-danger" onClick={() => navigate(-1)}>
                  <FormattedMessage id="body_admin.product_management.add_category_of_product.cancel" defaultMessage="Hủy" />
               </button>
            </div>
         </div>
      </div>
   );
};

export default AddCategory;