import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { getCategoryById } from '../../../../services/categoryService.js';

const CategoryDetail = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const intl = useIntl();
   const [category, setCategory] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchCategory = async () => {
         try {
            console.log('Fetching category with ID:', id);
            setLoading(true);
            setError(null);

            const res = await getCategoryById(id);
            console.log('API Response:', res);

            if (!res) {
               setError('Không thể kết nối với server');
               return;
            }

            if (res.errCode === 1) {
               setError('ID danh mục không hợp lệ');
               return;
            }

            if (res.errCode === 404) {
               setError('Không tìm thấy thông tin danh mục');
               return;
            }

            if (res.errCode === -1) {
               setError(res.errMessage || 'Lỗi server');
               return;
            }

            if (res.errCode === 0 && res.category) {
               setCategory(res.category);
            } else {
               setError('Không tìm thấy thông tin danh mục');
            }
         } catch (err) {
            console.error('Fetch category error:', err);
            setError('Có lỗi xảy ra khi tải thông tin danh mục');
         } finally {
            setLoading(false);
         }
      };
      if (id) {
         fetchCategory();
      }
   }, [id, navigate]);

   const handleEdit = () => {
      navigate(`/admin/product-category-management/category-management/category-update/${id}`);
   };

   if (loading) {
      return <div className="category-detail-loading">{intl.formatMessage({ id: 'category.detail.loading', defaultMessage: 'Đang tải thông tin danh mục...' })}</div>;
   }

   if (error) {
      return (
         <div className="category-detail-error">
            <div className="error-message">{error}</div>
            <button
               className="btn btn-primary"
               onClick={() => navigate('/admin/product-category-management/category-management')}
            >
               {intl.formatMessage({ id: 'common.backToList', defaultMessage: 'Quay lại danh sách' })}
            </button>
         </div>
      );
   }

   if (!category) {
      return <div className="category-detail-error">{intl.formatMessage({ id: 'category.detail.not_found', defaultMessage: 'Không tìm thấy danh mục' })}</div>;
   }

   return (
      <div className="category-detail-container">
         <h2 className="category-detail-title">
            <FormattedMessage id="category.detail.title" defaultMessage="Thông tin danh mục" />
         </h2>
         <div className="category-detail-content">
            <div><strong>ID:</strong> {category.id}</div>
            <div>
               <strong><FormattedMessage id="category.detail.name" defaultMessage="Tên danh mục" />:</strong> {category.nameCategory || intl.formatMessage({ id: 'category.detail.empty', defaultMessage: 'Không có' })}
            </div>
            <div>
               <strong><FormattedMessage id="category.detail.description" defaultMessage="Mô tả" />:</strong> {category.description || intl.formatMessage({ id: 'category.detail.empty', defaultMessage: 'Không có' })}
            </div>
            <div>
               <strong><FormattedMessage id="category.detail.createdAt" defaultMessage="Ngày tạo" />:</strong> {category.createdAt ? new Date(category.createdAt).toLocaleString() : intl.formatMessage({ id: 'category.detail.empty', defaultMessage: 'Không có' })}
            </div>
            <div>
               <strong><FormattedMessage id="category.detail.updatedAt" defaultMessage="Ngày cập nhật" />:</strong> {category.updatedAt ? new Date(category.updatedAt).toLocaleString() : intl.formatMessage({ id: 'category.detail.empty', defaultMessage: 'Không có' })}
            </div>
         </div>
         <div className="category-detail-actions">
            <button className="btn-edit" onClick={handleEdit}>
               <FormattedMessage id="category.detail.edit_button" defaultMessage="Cập nhật danh mục" />
            </button>
            <button className="btn-back" onClick={() => navigate('/admin/product-category-management/category-management')}>
               <FormattedMessage id="category.detail.back_button" defaultMessage="Quay lại" />
            </button>
         </div>
      </div>
   );
};

export default CategoryDetail;
