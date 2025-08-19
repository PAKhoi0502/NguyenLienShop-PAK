import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomToast from '../../../../components/CustomToast';
import { toast } from 'react-toastify';
import { getAllProducts, addProductForCategory, getProductsByCategoryId } from '../../../../services/categoryService';

const AddProduct = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const categoryId = location.state?.categoryId;
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
         toast(<CustomToast type="error" message="Vui lòng chọn ít nhất một sản phẩm" time={new Date()} />);
         return;
      }

      setLoading(true);

      try {
         // Cộng dồn sản phẩm cũ + sản phẩm mới
         const allProductIds = [...existingProductIds, ...selectedProducts];

         const res = await addProductForCategory(categoryId, allProductIds);

         if (res && res.errCode === 0) {
            toast(<CustomToast type="success" message="Thêm sản phẩm thành công" time={new Date()} />);
            navigate(-1);
         } else {
            toast(<CustomToast type="error" message={res?.errMessage || 'Có lỗi xảy ra khi thêm sản phẩm'} time={new Date()} />);
         }
      } catch (error) {
         toast(<CustomToast type="error" message="Có lỗi xảy ra khi xử lý yêu cầu" time={new Date()} />);
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
            </div>
         </div>
      </div>
   );
};

export default AddProduct;
