import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useIntl, FormattedMessage } from 'react-intl';
import { createCategory } from '../../../../services/categoryService.js';
import CustomToast from '../../../../components/CustomToast';
import HintBox from '../../../../components/HintBox';
import './CategoryCreate.scss';

const CategoryCreate = () => {
   const [nameCategory, setNameCategory] = useState('');
   const [description, setDescription] = useState('');
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();
   const intl = useIntl();

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      if (!nameCategory) {
         showToast('error', intl.formatMessage({ id: 'body_admin.category_management.create.missing_fields', defaultMessage: 'Vui lòng nhập tên danh mục.' }));
         setLoading(false);
         return;
      }

      const data = {
         nameCategory,
         description: description || ''
      };

      try {
         const res = await createCategory(data);
         if (res && res.errCode === 0) {
            showToast('success', intl.formatMessage({ id: 'body_admin.category_management.create.success', defaultMessage: 'Tạo danh mục thành công' }));
            navigate('/admin/product-category-management/category-management');
         } else {
            showToast('error', res.errMessage || intl.formatMessage({ id: 'body_admin.category_management.create.error', defaultMessage: 'Không thể tạo danh mục' }));
         }
      } catch (err) {
         showToast('error', intl.formatMessage({ id: 'body_admin.category_management.create.server_error', defaultMessage: 'Lỗi server khi tạo danh mục' }));
      } finally {
         setLoading(false);
      }
   };

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === 'success' ? 'body_admin.category_management.create.create_success_title' : 'body_admin.category_management.create.create_error_title'}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   return (
      <div className="category-create-container">
         <HintBox
            content={
               <div>
                  <p><FormattedMessage id="body_admin.category_management.hint.title" defaultMessage="Hướng dẫn: Điền thông tin danh mục." /></p>
                  <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                     <li><FormattedMessage id="body_admin.category_management.hint.name" defaultMessage="Tên danh mục là bắt buộc." /></li>
                     <li><FormattedMessage id="body_admin.category_management.hint.optional" defaultMessage="Mô tả là tùy chọn." /></li>
                  </ul>
               </div>
            }
         />
         <h1><FormattedMessage id="body_admin.category_management.create.title" defaultMessage="Tạo danh mục mới" /></h1>
         <form onSubmit={handleSubmit} className="category-create-form">
            <div className="form-group">
               <label><FormattedMessage id="body_admin.category_management.create.name" defaultMessage="Tên danh mục:" /> <span style={{ color: 'red' }}>*</span></label>
               <input
                  type="text"
                  value={nameCategory}
                  onChange={(e) => setNameCategory(e.target.value)}
                  required
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="body_admin.category_management.create.description" defaultMessage="Mô tả:" /></label>
               <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
               />
            </div>
            <div className="form-actions">
               <button className="btn-submit" type="submit" disabled={loading}>
                  {loading ? <FormattedMessage id="body_admin.category_management.create.loading" defaultMessage="Đang tạo..." /> : <FormattedMessage id="body_admin.category_management.create.submit" defaultMessage="Tạo danh mục" />}
               </button>
               <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate(-1)}
                  disabled={loading}
               >
                  <FormattedMessage id="body_admin.category_management.create.cancel" defaultMessage="Hủy" />
               </button>
            </div>
         </form>
      </div>
   );
};

export default CategoryCreate;
