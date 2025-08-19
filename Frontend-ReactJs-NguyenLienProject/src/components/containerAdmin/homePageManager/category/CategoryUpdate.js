import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useIntl, FormattedMessage } from 'react-intl';
import { getCategoryById, updateCategory } from '../../../../services/categoryService.js';
import CustomToast from '../../../../components/CustomToast';
import HintBox from '../../../../components/HintBox';

const CategoryUpdate = () => {
   const [nameCategory, setNameCategory] = useState('');
   const [description, setDescription] = useState('');
   const [loading, setLoading] = useState(false);
   const [fetching, setFetching] = useState(true);
   const navigate = useNavigate();
   const { id } = useParams();
   const intl = useIntl();

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === 'success' ? 'category.update.success_title' : 'category.update.error_title'}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   const fetchCategory = async () => {
      try {
         const res = await getCategoryById(id);
         if (res && res.errCode === 0 && res.category) {
            const { nameCategory, description } = res.category;
            setNameCategory(nameCategory || '');
            setDescription(description || '');
         } else {
            const errorMessage = res.errMessage || intl.formatMessage({ id: 'category.update.fetch_error', defaultMessage: 'Không thể tải thông tin danh mục' });
            showToast('error', errorMessage);
            navigate('/admin/product-category-management/category-management');
         }
      } catch (err) {
         const errorMessage = err.response?.data?.errMessage || intl.formatMessage({ id: 'category.update.server_error', defaultMessage: 'Lỗi server khi tải danh mục' });
         showToast('error', errorMessage);
         navigate('/admin/product-category-management/category-management');
      } finally {
         setFetching(false);
      }
   };

   useEffect(() => {
      fetchCategory();
   }, [id]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
         showToast('error', intl.formatMessage({ id: 'category.update.no_token', defaultMessage: 'Vui lòng đăng nhập lại' }));
         navigate('/login');
         setLoading(false);
         return;
      }

      if (!nameCategory) {
         showToast('error', intl.formatMessage({ id: 'category.update.missing_fields', defaultMessage: 'Vui lòng nhập tên danh mục' }));
         setLoading(false);
         return;
      }

      const data = {
         id,
         nameCategory,
         description: description || ''
      };

      try {
         const res = await updateCategory(data);
         if (res && res.errCode === 0) {
            showToast('success', intl.formatMessage({ id: 'category.update.success', defaultMessage: 'Cập nhật danh mục thành công' }));
            navigate('/admin/product-category-management/category-management');
         } else {
            showToast('error', res.errMessage || intl.formatMessage({ id: 'category.update.error', defaultMessage: 'Không thể cập nhật danh mục' }));
         }
      } catch (err) {
         showToast('error', intl.formatMessage({ id: 'category.update.server_error', defaultMessage: 'Lỗi server khi cập nhật danh mục' }));
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="category-update-container">
         <HintBox
            content={
               <div>
                  <p><FormattedMessage id="category.hint.title" defaultMessage="Hướng dẫn: Cập nhật thông tin danh mục." /></p>
                  <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                     <li><FormattedMessage id="category.hint.name" defaultMessage="Tên danh mục là bắt buộc." /></li>
                     <li><FormattedMessage id="category.hint.optional" defaultMessage="Mô tả là tùy chọn." /></li>
                  </ul>
               </div>
            }
         />
         <h1><FormattedMessage id="category.update.title" defaultMessage="Cập nhật danh mục" /></h1>
         {fetching ? (
            <p className="category-loading"><FormattedMessage id="category.update.loading" defaultMessage="Đang tải thông tin danh mục..." /></p>
         ) : (
            <form onSubmit={handleSubmit} className="category-update-form">
               <div className="form-group">
                  <label><FormattedMessage id="category.update.name" defaultMessage="Tên danh mục:" /> <span style={{ color: 'red' }}>*</span></label>
                  <input
                     type="text"
                     value={nameCategory}
                     onChange={(e) => setNameCategory(e.target.value)}
                     required
                  />
               </div>
               <div className="form-group">
                  <label><FormattedMessage id="category.update.description" defaultMessage="Mô tả:" /></label>
                  <textarea
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                  />
               </div>
               <div className="form-actions">
                  <button className="btn-submit" type="submit" disabled={loading}>
                     {loading ? <FormattedMessage id="category.update.loading_submit" defaultMessage="Đang cập nhật..." /> : <FormattedMessage id="category.update.submit" defaultMessage="Cập nhật danh mục" />}
                  </button>
                  <button
                     type="button"
                     className="btn-cancel"
                     onClick={() => navigate('/admin/product-category-management/category-management')}
                     disabled={loading}
                  >
                     <FormattedMessage id="category.update.cancel" defaultMessage="Hủy" />
                  </button>
               </div>
            </form>
         )}
      </div>
   );
};

export default CategoryUpdate;
