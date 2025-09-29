import { getCategoriesByProductId, getProductById } from '../../../../services/productService';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import HintBox from '../../../../components/HintBox';
import './InfoCategory.scss';

const InfoCategory = ({ productId: propProductId }) => {
   const location = useLocation();
   const navigate = useNavigate();
   const intl = useIntl();
   const productId = propProductId || location.state?.productId;
   const [categories, setCategories] = useState([]);
   const [product, setProduct] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchData = async () => {
         if (!productId) {
            setLoading(false);
            setError(intl.formatMessage({ id: 'body_admin.product_management.info_category_of_product.no_product_id', defaultMessage: 'Không có ID sản phẩm' }));
            return;
         }

         setLoading(true);
         setError(null);

         try {
            // Fetch product info
            const productRes = await getProductById(productId);
            if (productRes && productRes.errCode === 0) {
               setProduct(productRes.product);
            }

            // Fetch categories
            const categoriesRes = await getCategoriesByProductId(productId);
            if (categoriesRes && categoriesRes.errCode === 0) {
               setCategories(categoriesRes.categories || []);
            } else {
               setError(categoriesRes?.errMessage || intl.formatMessage({ id: 'body_admin.product_management.info_category_of_product.load_categories_error', defaultMessage: 'Không thể tải danh mục' }));
               setCategories([]);
            }
         } catch (err) {
            setError(intl.formatMessage({ id: 'body_admin.product_management.info_category_of_product.load_data_error', defaultMessage: 'Lỗi khi tải dữ liệu' }));
            setCategories([]);
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, [productId]); // reload khi productId thay đổi

   return (
      <div className="info-category">
         <HintBox
            content={
               <div>
                  <p><FormattedMessage id="body_admin.product_management.info_category_of_product.hint.title" defaultMessage="Hướng dẫn: Quản lý danh mục của sản phẩm." /></p>
                  <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                     <li><FormattedMessage id="body_admin.product_management.info_category_of_product.hint.view" defaultMessage="Xem danh sách các danh mục hiện tại của sản phẩm." /></li>
                     <li><FormattedMessage id="body_admin.product_management.info_category_of_product.hint.add" defaultMessage="Thêm danh mục mới vào sản phẩm." /></li>
                     <li><FormattedMessage id="body_admin.product_management.info_category_of_product.hint.delete" defaultMessage="Xóa danh mục khỏi sản phẩm." /></li>
                  </ul>
               </div>
            }
         />

         <h3 className="info-category__title">
            <FormattedMessage
               id="body_admin.product_management.info_category_of_product.title"
               defaultMessage="Thông tin danh mục sản phẩm"
            />
         </h3>

         {product?.nameProduct && (
            <div className="product-name-section">
               <span className="product-name-highlight">
                  {product.nameProduct}
               </span>
            </div>
         )}

         {loading ? (
            <p><FormattedMessage id="body_admin.product_management.info_category_of_product.loading" defaultMessage="Đang tải danh mục..." /></p>
         ) : error ? (
            <p className="error-message">{error}</p>
         ) : categories && categories.length > 0 ? (
            <ul>
               {categories.map((cat) => (
                  <li key={cat.id}>
                     <strong>{cat.nameCategory}</strong>
                     {cat.description && <span> - {cat.description}</span>}
                  </li>
               ))}
            </ul>
         ) : (
            <p><FormattedMessage id="body_admin.product_management.info_category_of_product.no_categories" defaultMessage="Không có danh mục nào" /></p>
         )}

         <div className="category-actions">
            <button
               className="btn btn-primary"
               onClick={() => navigate(`/admin/product-category-management/product-management/add-category/${productId}`, {
                  state: { productId: productId }
               })}
            >
               <FormattedMessage id="body_admin.product_management.info_category_of_product.add_category" defaultMessage="Thêm danh mục" />
            </button>
            <button
               className="btn btn-danger"
               onClick={() => navigate(`/admin/product-category-management/product-management/delete-category/${productId}`, {
                  state: { productId: productId }
               })}
            >
               <FormattedMessage id="body_admin.product_management.info_category_of_product.delete_category" defaultMessage="Xóa danh mục" />
            </button>
            <button className="btn-back" onClick={() => navigate('/admin/product-category-management/product-management')}>
               <FormattedMessage id="body_admin.product_management.info_category_of_product.back" defaultMessage="Quay lại" />
            </button>
         </div>

      </div>
   );
};

export default InfoCategory;