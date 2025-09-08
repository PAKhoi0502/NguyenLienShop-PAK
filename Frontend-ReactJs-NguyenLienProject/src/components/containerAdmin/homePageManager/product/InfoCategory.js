import { getCategoriesByProductId, getProductById } from '../../../../services/productService';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AddCategory from './AddCategory';
import DeleteCategory from './DeleteCategory';
import './InfoCategory.scss';

const InfoCategory = ({ productId: propProductId }) => {
   const location = useLocation();
   const navigate = useNavigate();
   const productId = propProductId || location.state?.productId;
   const [categories, setCategories] = useState([]);
   const [product, setProduct] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [showAdd, setShowAdd] = useState(false);
   const [showDelete, setShowDelete] = useState(false);

   useEffect(() => {
      const fetchData = async () => {
         if (!productId) {
            setLoading(false);
            setError('Không có ID sản phẩm');
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
               setError(categoriesRes?.errMessage || 'Không thể tải danh mục');
               setCategories([]);
            }
         } catch (err) {
            setError('Lỗi khi tải dữ liệu');
            setCategories([]);
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, [productId, showAdd, showDelete]); // reload khi thêm/xóa

   return (
      <div className="info-category">
         <h3 className="info-category__title">
            Danh mục của{' '}
            <span className="product-name-highlight">
               {product?.nameProduct || 'sản phẩm'}
            </span>
         </h3>

         {loading ? (
            <p>Đang tải danh mục...</p>
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
            <p>Không có danh mục nào</p>
         )}

         <div className="category-actions">
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
               Thêm danh mục
            </button>
            <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
               Xóa danh mục
            </button>
            <button className="btn-back" onClick={() => navigate('/admin/product-category-management/product-management')}>
               Quay lại
            </button>
         </div>

         {/* Hiển thị popup hoặc trang thêm/xóa danh mục */}
         {showAdd && (
            <div className="modal-bg">
               <div className="modal-content">
                  <AddCategory />
                  <button className="btn btn-secondary" onClick={() => setShowAdd(false)} >Đóng</button>
               </div>
            </div>
         )}
         {showDelete && (
            <div className="modal-bg">
               <div className="modal-content">
                  <DeleteCategory />
                  <button className="btn btn-secondary" onClick={() => setShowDelete(false)} >Đóng</button>
               </div>
            </div>
         )}
      </div>
   );
};

export default InfoCategory;