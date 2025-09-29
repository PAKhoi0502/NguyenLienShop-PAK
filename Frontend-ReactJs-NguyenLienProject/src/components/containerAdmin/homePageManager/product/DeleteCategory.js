import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import CustomToast from '../../../../components/CustomToast';
import HintBox from '../../../../components/HintBox';
import { toast } from 'react-toastify';
import { getCategoriesByProductId, deleteCategoryForProduct } from '../../../../services/productService';
import './DeleteCategory.scss';

const DeleteCategory = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const intl = useIntl();
   const productId = location.state?.productId;
   const [categories, setCategories] = useState([]);
   const [selectedCategories, setSelectedCategories] = useState([]);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      const fetchCategories = async () => {
         try {
            const res = await getCategoriesByProductId(productId);
            if (res && res.errCode === 0 && Array.isArray(res.categories)) {
               setCategories(res.categories);
            } else {
               toast(<CustomToast type="error" message={res?.errMessage || intl.formatMessage({ id: 'body_admin.product_management.delete_category_of_product.load_categories_error', defaultMessage: 'Không thể tải danh mục' })} time={new Date()} />);
            }
         } catch (error) {
            console.error('Lỗi khi tải danh mục:', error);
            toast(<CustomToast type="error" message={intl.formatMessage({ id: 'body_admin.product_management.delete_category_of_product.load_data_error', defaultMessage: 'Có lỗi xảy ra khi tải danh mục' })} time={new Date()} />);
         }
      };
      if (productId) fetchCategories();
   }, [productId]);

   const handleCheckboxChange = (id) => {
      setSelectedCategories((prev) =>
         prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
      );
   };

   const handleDelete = async () => {
      if (!productId || selectedCategories.length === 0) {
         toast(<CustomToast type="error" message={intl.formatMessage({ id: 'body_admin.product_management.delete_category_of_product.select_at_least_one', defaultMessage: 'Vui lòng chọn ít nhất một danh mục để xóa' })} time={new Date()} />);
         return;
      }
      setLoading(true);
      try {
         const res = await deleteCategoryForProduct(productId, selectedCategories);
         if (res && res.errCode === 0) {
            toast(<CustomToast type="success" message={intl.formatMessage({ id: 'body_admin.product_management.delete_category_of_product.success', defaultMessage: 'Xóa danh mục khỏi sản phẩm thành công' })} time={new Date()} />);
            navigate(-1);
         } else {
            toast(<CustomToast type="error" message={res?.errMessage || intl.formatMessage({ id: 'body_admin.product_management.delete_category_of_product.error', defaultMessage: 'Có lỗi xảy ra khi xóa danh mục' })} time={new Date()} />);
         }
      } catch (error) {
         console.error('Lỗi khi xóa danh mục:', error);
         toast(<CustomToast type="error" message={intl.formatMessage({ id: 'body_admin.product_management.delete_category_of_product.request_error', defaultMessage: 'Có lỗi xảy ra khi xử lý yêu cầu' })} time={new Date()} />);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="add-product-category admin-page">
         <HintBox
            content={
               <div>
                  <p><FormattedMessage id="body_admin.product_management.delete_category_of_product.hint.title" defaultMessage="Hướng dẫn: Chọn danh mục để xóa khỏi sản phẩm." /></p>
                  <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                     <li><FormattedMessage id="body_admin.product_management.delete_category_of_product.hint.select" defaultMessage="Chọn ít nhất một danh mục từ danh sách bên dưới." /></li>
                     <li><FormattedMessage id="body_admin.product_management.delete_category_of_product.hint.multiple" defaultMessage="Có thể chọn nhiều danh mục cùng lúc." /></li>
                     <li><FormattedMessage id="body_admin.product_management.delete_category_of_product.hint.warning" defaultMessage="Chỉ hiển thị các danh mục đã được gán cho sản phẩm này." /></li>
                  </ul>
               </div>
            }
         />

         <div className="form-container">
            <h2><FormattedMessage id="body_admin.product_management.delete_category_of_product.title" defaultMessage="Xóa danh mục khỏi sản phẩm" /></h2>
            <div className="category-list">
               {categories.length > 0 ? (
                  categories.map((cat) => (
                     <label key={cat.id} className="category-item">
                        <input
                           type="checkbox"
                           checked={selectedCategories.includes(cat.id)}
                           onChange={() => handleCheckboxChange(cat.id)}
                        />
                        <span>{cat.nameCategory}</span>
                     </label>
                  ))
               ) : (
                  <p><FormattedMessage id="body_admin.product_management.delete_category_of_product.no_categories" defaultMessage="Không có danh mục nào được tìm thấy" /></p>
               )}
            </div>
            <div className="form-actions">
               <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                  {loading ?
                     <FormattedMessage id="body_admin.product_management.delete_category_of_product.deleting" defaultMessage="Đang xóa..." /> :
                     <FormattedMessage id="body_admin.product_management.delete_category_of_product.delete" defaultMessage="Xóa" />
                  }
               </button>
               <button className="btn btn-primary" onClick={() => navigate(-1)}>
                  <FormattedMessage id="body_admin.product_management.delete_category_of_product.cancel" defaultMessage="Hủy" />
               </button>
            </div>
         </div>
      </div>
   );
};

export default DeleteCategory;
