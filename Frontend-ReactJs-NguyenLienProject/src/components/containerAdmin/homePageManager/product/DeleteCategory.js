import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomToast from '../../../../components/CustomToast';
import { toast } from 'react-toastify';
import { getCategoriesByProductId, deleteCategoryForProduct } from '../../../../services/productService';
import './DeleteCategory.scss';

const DeleteCategory = () => {
   const navigate = useNavigate();
   const location = useLocation();
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
               toast(<CustomToast type="error" message={res?.errMessage || 'Không thể tải danh mục'} time={new Date()} />);
            }
         } catch (error) {
            console.error('Lỗi khi tải danh mục:', error);
            toast(<CustomToast type="error" message="Có lỗi xảy ra khi tải danh mục" time={new Date()} />);
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
         toast(<CustomToast type="error" message="Vui lòng chọn ít nhất một danh mục để xóa" time={new Date()} />);
         return;
      }
      setLoading(true);
      try {
         const res = await deleteCategoryForProduct(productId, selectedCategories);
         if (res && res.errCode === 0) {
            toast(<CustomToast type="success" message="Xóa danh mục khỏi sản phẩm thành công" time={new Date()} />);
            navigate(-1);
         } else {
            toast(<CustomToast type="error" message={res?.errMessage || 'Có lỗi xảy ra khi xóa danh mục'} time={new Date()} />);
         }
      } catch (error) {
         console.error('Lỗi khi xóa danh mục:', error);
         toast(<CustomToast type="error" message="Có lỗi xảy ra khi xử lý yêu cầu" time={new Date()} />);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="add-product-category admin-page">
         <div className="form-container">
            <h2>Xóa danh mục khỏi sản phẩm</h2>
            <div className="category-list">
               {categories.length > 0 ? (
                  categories.map((cat) => (
                     <label key={cat.id} className="category-item">
                        <input
                           type="checkbox"
                           checked={selectedCategories.includes(cat.id)}
                           onChange={() => handleCheckboxChange(cat.id)}
                        />
                        {cat.nameCategory}
                     </label>
                  ))
               ) : (
                  <p>Không có danh mục nào được tìm thấy</p>
               )}
            </div>
            <div className="form-actions">
               <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                  {loading ? 'Đang xóa...' : 'Xóa'}
               </button>
            </div>
         </div>
      </div>
   );
};

export default DeleteCategory;
