import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomToast from '../../../../components/CustomToast';
import { toast } from 'react-toastify';
import { getAllCategories, addCategoryForProduct, getCategoriesByProductId } from '../../../../services/productService';
import './AddCategory.scss';

const AddCategory = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const productId = location.state?.productId;
   const [availableCategories, setAvailableCategories] = useState([]);
   const [existingCategoryIds, setExistingCategoryIds] = useState([]);
   const [selectedCategories, setSelectedCategories] = useState([]);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);

            const allCategoriesRes = await getAllCategories();
            console.log('Kết quả lấy tất cả danh mục:', allCategoriesRes);

            if (allCategoriesRes.errCode !== 0 || !allCategoriesRes.categories) {
               toast(<CustomToast
                  type="error"
                  message={allCategoriesRes?.errMessage || 'Không thể tải danh mục'}
                  time={new Date()}
               />);
               setAvailableCategories([]);
               return;
            }

            const existingCategoriesRes = await getCategoriesByProductId(productId);
            console.log('Kết quả lấy danh mục hiện có:', existingCategoriesRes);

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
               message="Có lỗi xảy ra khi tải dữ liệu"
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
            message="Không tìm thấy thông tin sản phẩm"
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
         toast(<CustomToast type="error" message="Vui lòng chọn ít nhất một danh mục" time={new Date()} />);
         return;
      }

      setLoading(true);

      try {
         const allCategoryIds = [...existingCategoryIds, ...selectedCategories];
         console.log('Danh mục cũ:', existingCategoryIds);
         console.log('Danh mục mới:', selectedCategories);
         console.log('Tổng danh mục gửi lên:', allCategoryIds);

         const res = await addCategoryForProduct(productId, allCategoryIds);

         if (res && res.errCode === 0) {
            toast(<CustomToast type="success" message="Thêm danh mục thành công" time={new Date()} />);
            navigate(-1);
         } else {
            toast(<CustomToast type="error" message={res?.errMessage || 'Có lỗi xảy ra khi thêm danh mục'} time={new Date()} />);
         }
      } catch (error) {
         console.error('Lỗi khi thêm danh mục:', error);
         toast(<CustomToast type="error" message="Có lỗi xảy ra khi xử lý yêu cầu" time={new Date()} />);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="add-product-category admin-page">
         <div className="form-container">
            <h2>Thêm danh mục vào sản phẩm</h2>

            <div
               className="category-list"
               style={{
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '12px',
                  padding: '8px'
               }}
            >
               {availableCategories.length > 0 ? (
                  availableCategories.map((cat) => (
                     <label
                        key={cat.id}
                        className="category-item"
                        style={{
                           background: '#ffffff',
                           border: '1px solid #fed7aa',
                           borderRadius: '12px',
                           display: 'flex',
                           alignItems: 'center',
                           padding: '16px',
                           marginBottom: '8px',
                           cursor: 'pointer'
                        }}
                     >
                        <input
                           type="checkbox"
                           checked={selectedCategories.includes(cat.id)}
                           onChange={() => handleCheckboxChange(cat.id)}
                           style={{
                              width: '18px',
                              height: '18px',
                              marginRight: '12px',
                              accentColor: '#ea580c',
                              cursor: 'pointer'
                           }}
                        />
                        <span style={{
                           color: '#ea580c',
                           fontWeight: '500',
                           fontSize: '14px'
                        }}>
                           {cat.nameCategory}
                        </span>
                     </label>
                  ))
               ) : (
                  <p>{loading ? 'Đang tải...' : 'Không có danh mục mới để thêm'}</p>
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

export default AddCategory;