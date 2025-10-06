import { getProductsByCategoryId } from '../../../../services/categoryService';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import AddProduct from './AddProduct';
import DeleteProduct from './DeleteProduct';
import './InfoProduct.scss';

const InfoProduct = ({ categoryId: propCategoryId }) => {
   const location = useLocation();
   const navigate = useNavigate();
   const intl = useIntl();
   const categoryId = propCategoryId || location.state?.categoryId;
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [showAdd, setShowAdd] = useState(false);
   const [showDelete, setShowDelete] = useState(false);

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
   }, [categoryId, showAdd, showDelete]);

   return (
      <div className="info-product">
         <h3>Sản phẩm trong danh mục</h3>

         {loading ? (
            <p>Đang tải sản phẩm...</p>
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
            <p>Không có sản phẩm nào</p>
         )}

         <div className="product-actions">
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
               <FormattedMessage id="body_admin.category_management.info_product.add_product" defaultMessage="Thêm sản phẩm" />
            </button>
            <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
               <FormattedMessage id="body_admin.category_management.info_product.delete_product" defaultMessage="Xóa sản phẩm" />
            </button>
            <button className="btn-back" onClick={() => navigate(-1)}>
               <FormattedMessage id="body_admin.category_management.info_product.back" defaultMessage="Quay lại" />
            </button>
         </div>

         {/* Hiển thị popup hoặc trang thêm/xóa sản phẩm */}
         {showAdd && (
            <div className="modal-bg">
               <div className="modal-content">
                  <AddProduct />
                  <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>
                     <FormattedMessage id="body_admin.category_management.info_product.close" defaultMessage="Đóng" />
                  </button>
               </div>
            </div>
         )}
         {showDelete && (
            <div className="modal-bg">
               <div className="modal-content">
                  <DeleteProduct />
                  <button className="btn btn-secondary" onClick={() => setShowDelete(false)}>
                     <FormattedMessage id="body_admin.category_management.info_product.close" defaultMessage="Đóng" />
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};

export default InfoProduct;
