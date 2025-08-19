import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomToast from '../../../../components/CustomToast';
import { toast } from 'react-toastify';
import { getProductsByCategoryId, deleteProductForCategory } from '../../../../services/categoryService';

const DeleteProduct = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const categoryId = location.state?.categoryId;
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
         toast(<CustomToast type="error" message="Vui lòng chọn ít nhất một sản phẩm để xóa" time={new Date()} />);
         return;
      }
      setLoading(true);
      try {
         const res = await deleteProductForCategory(categoryId, selectedProducts);
         if (res && res.errCode === 0) {
            toast(<CustomToast type="success" message="Xóa sản phẩm khỏi danh mục thành công" time={new Date()} />);
            navigate(-1);
         } else {
            toast(<CustomToast type="error" message={res?.errMessage || 'Có lỗi xảy ra khi xóa sản phẩm'} time={new Date()} />);
         }
      } catch (error) {
         console.error('Lỗi khi xóa sản phẩm:', error);
         toast(<CustomToast type="error" message="Có lỗi xảy ra khi xử lý yêu cầu" time={new Date()} />);
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
            </div>
         </div>
      </div>
   );
};

export default DeleteProduct;
