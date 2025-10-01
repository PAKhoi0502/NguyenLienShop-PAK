import { getProductsByCategoryId } from '../../../../services/categoryService';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AddProduct from './AddProduct';
import DeleteProduct from './DeleteProduct';

const InfoProduct = ({ categoryId: propCategoryId }) => {
   const location = useLocation();
   const navigate = useNavigate();
   const categoryId = propCategoryId || location.state?.categoryId;
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [showAdd, setShowAdd] = useState(false);
   const [showDelete, setShowDelete] = useState(false);

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
            <ul>
               {products.map((prod) => (
                  <li key={prod.id}>
                     <strong>{prod.nameProduct}</strong>
                     {prod.description && <span> - {prod.description}</span>}
                     {prod.price && <span> - Giá: {prod.price} VNĐ</span>}
                     <span> - Trạng thái: {prod.isActive ? 'Hoạt động' : 'Không hoạt động'}</span>
                  </li>
               ))}
            </ul>
         ) : (
            <p>Không có sản phẩm nào</p>
         )}

         <div className="product-actions">
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
               Thêm sản phẩm
            </button>
            <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
               Xóa sản phẩm
            </button>
            <button className="btn-back" onClick={() => navigate(-1)}>
               Quay lại
            </button>
         </div>

         {/* Hiển thị popup hoặc trang thêm/xóa sản phẩm */}
         {showAdd && (
            <div className="modal-bg">
               <div className="modal-content">
                  <AddProduct />
                  <button className="btn btn-secondary" onClick={() => setShowAdd(false)} >Đóng</button>
               </div>
            </div>
         )}
         {showDelete && (
            <div className="modal-bg">
               <div className="modal-content">
                  <DeleteProduct />
                  <button className="btn btn-secondary" onClick={() => setShowDelete(false)} >Đóng</button>
               </div>
            </div>
         )}
      </div>
   );
};

export default InfoProduct;
