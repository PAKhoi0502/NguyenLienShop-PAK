import { getProductsByCategoryId } from '../../../../services/categoryService';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import './InfoProduct.scss';

const InfoProduct = ({ categoryId: propCategoryId }) => {
   const location = useLocation();
   const navigate = useNavigate();
   const intl = useIntl();
   const { id } = useParams();
   const categoryId = propCategoryId || id || location.state?.categoryId;
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const handleProductClick = (productId) => {
      if (!productId) return;

      navigate(`/admin/product-category-management/product-management/product-detail/${productId}`);
   };

   useEffect(() => {
      const fetchProducts = async () => {
         if (!categoryId) {
            setLoading(false);
            setError('Không có ID danh mục');
            return;
         }

         setLoading(true);
         setError(null);

         try {
            const res = await getProductsByCategoryId(categoryId);
            if (res && res.errCode === 0) {
               setProducts(res.products || []);
            } else {
               setError(res?.errMessage || 'Không thể tải sản phẩm');
               setProducts([]);
            }
         } catch (err) {
            setError('Lỗi khi tải sản phẩm');
            setProducts([]);
         } finally {
            setLoading(false);
         }
      };
      fetchProducts();
   }, [categoryId]);

   return (
      <div className="info-product">
         <h3>Sản phẩm trong danh mục</h3>

         {loading ? (
            <p>{intl.formatMessage({ id: 'body_admin.category_management.info_product.loading', defaultMessage: 'Đang tải sản phẩm...' })}</p>
         ) : error ? (
            <p className="error-message">{error}</p>
         ) : products && products.length > 0 ? (
            <ul className="products-list">
               {products.map((prod) => (
                  <li key={prod.id} className="product-item">
                     <div className="product-info">
                        <strong
                           className="product-name-link"
                           onClick={() => handleProductClick(prod.id)}
                           title={intl.formatMessage({
                              id: 'body_admin.category_management.info_product.click_to_detail',
                              defaultMessage: 'Nhấp để xem chi tiết sản phẩm'
                           })}
                        >
                           {prod.nameProduct}
                        </strong>
                        {prod.description && <span className="description"> - {prod.description}</span>}
                        {prod.price && <span className="price"> - Giá: {prod.price.toLocaleString()} VNĐ</span>}
                     </div>
                     <div className="product-status">
                        <span className={`status-badge ${prod.isActive ? 'active' : 'inactive'}`}>
                           {prod.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                     </div>
                  </li>
               ))}
            </ul>
         ) : (
            <p>{intl.formatMessage({ id: 'body_admin.category_management.info_product.no_product', defaultMessage: 'Không có sản phẩm nào' })}</p>
         )}

         <div className="product-actions">
            <button className="btn btn-primary" onClick={() => navigate(`/admin/product-category-management/category-management/info-product/${categoryId}/add-product`, {
               state: { categoryId: categoryId }
            })}>
               <FormattedMessage id="body_admin.category_management.info_product.add_product" defaultMessage="Thêm sản phẩm" />
            </button>
            <button className="btn btn-danger" onClick={() => navigate(`/admin/product-category-management/category-management/info-product/${categoryId}/delete-product`, {
               state: { categoryId: categoryId }
            })}>
               <FormattedMessage id="body_admin.category_management.info_product.delete_product" defaultMessage="Xóa sản phẩm" />
            </button>
            <button className="btn-back" onClick={() => navigate(-1)}>
               <FormattedMessage id="body_admin.category_management.info_product.back" defaultMessage="Quay lại" />
            </button>
         </div>

      </div>
   );
};

export default InfoProduct;
