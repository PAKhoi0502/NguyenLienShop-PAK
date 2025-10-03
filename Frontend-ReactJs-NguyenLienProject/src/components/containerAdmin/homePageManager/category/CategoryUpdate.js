import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useIntl, FormattedMessage } from 'react-intl';
import { getCategoryById, updateCategory } from '../../../../services/categoryService.js';
import CustomToast from '../../../../components/CustomToast';
import HintBox from '../../../../components/HintBox';
import './CategoryUpdate.scss';

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
               titleId={type === 'success' ? 'body_admin.category_management.update_category.success_title' : 'body_admin.category_management.update_category.error_title'}
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
            const errorMessage = res.errMessage || intl.formatMessage({ id: 'body_admin.category_management.update_category.fetch_error', defaultMessage: 'Không thể tải thông tin danh mục' });
            showToast('error', errorMessage);
            navigate(-1);
         }
      } catch (err) {
         const errorMessage = err.response?.data?.errMessage || intl.formatMessage({ id: 'body_admin.category_management.update_category.server_error', defaultMessage: 'Lỗi server khi tải danh mục' });
         showToast('error', errorMessage);
         navigate(-1);
      } finally {
         setFetching(false);
      }
   };

   useEffect(() => {
      if (id) {
         fetchCategory();
      }
   }, [id]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      if (!nameCategory) {
         showToast('error', intl.formatMessage({ id: 'body_admin.category_management.update_category.missing_fields', defaultMessage: 'Vui lòng nhập tên danh mục' }));
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
            showToast('success', intl.formatMessage({ id: 'body_admin.category_management.update_category.success', defaultMessage: 'Cập nhật danh mục thành công' }));
            navigate(-1);
         } else {
            showToast('error', res.errMessage || intl.formatMessage({ id: 'body_admin.category_management.update_category.error', defaultMessage: 'Không thể cập nhật danh mục' }));
         }
      } catch (err) {
         showToast('error', intl.formatMessage({ id: 'body_admin.category_management.update_category.server_error', defaultMessage: 'Lỗi server khi cập nhật danh mục' }));
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="category-update-container">
         <HintBox
            content={
               <div>
                  <p><FormattedMessage id="body_admin.category_management.update_category.hint.title" defaultMessage="Hướng dẫn: Cập nhật thông tin danh mục." /></p>
                  <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                     <li><FormattedMessage id="body_admin.category_management.update_category.hint.name" defaultMessage="Tên danh mục là bắt buộc." /></li>
                     <li><FormattedMessage id="body_admin.category_management.update_category.hint.optional" defaultMessage="Mô tả là tùy chọn." /></li>
                  </ul>
               </div>
            }
         />
         <h1><FormattedMessage id="body_admin.category_management.update_category.title" defaultMessage="Cập nhật danh mục" /></h1>
         {fetching ? (
            <p className="category-loading"><FormattedMessage id="body_admin.category_management.update_category.loading" defaultMessage="Đang tải thông tin danh mục..." /></p>
         ) : (
            <form onSubmit={handleSubmit} className="category-update-form">
               <div className="form-group">
                  <label><FormattedMessage id="body_admin.category_management.update_category.name" defaultMessage="Tên danh mục:" /> <span style={{ color: 'red' }}>*</span></label>
                  <input
                     type="text"
                     value={nameCategory}
                     onChange={(e) => setNameCategory(e.target.value)}
                     required
                  />
               </div>
               <div className="form-group">
                  <label><FormattedMessage id="body_admin.category_management.update_category.description" defaultMessage="Mô tả:" /></label>
                  <textarea
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                  />
               </div>
               <div className="form-actions">
                  <button className="btn-submit" type="submit" disabled={loading}>
                     {loading ? <FormattedMessage id="body_admin.category_management.update_category.loading_submit" defaultMessage="Đang cập nhật..." /> : <FormattedMessage id="body_admin.category_management.update_category.submit" defaultMessage="Cập nhật danh mục" />}
                  </button>
                  <button
                     type="button"
                     className="btn-cancel"
                     onClick={() => navigate(-1)}
                     disabled={loading}
                  >
                     <FormattedMessage id="body_admin.category_management.update_category.cancel" defaultMessage="Hủy" />
                  </button>
               </div>
            </form>
         )}
      </div>
   );
};

export default CategoryUpdate;
