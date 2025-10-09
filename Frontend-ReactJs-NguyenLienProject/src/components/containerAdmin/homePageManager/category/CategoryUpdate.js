import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useIntl, FormattedMessage } from 'react-intl';
import Swal from 'sweetalert2';
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

      if (!nameCategory) {
         showToast('error', intl.formatMessage({ id: 'body_admin.category_management.update_category.missing_fields', defaultMessage: 'Vui lòng nhập tên danh mục' }));
         return;
      }

      // Step 1: Initial Confirmation
      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.category_management.update_category.confirm_title_1', defaultMessage: 'Xác nhận cập nhật danh mục' }),
         html: `<strong>${nameCategory || intl.formatMessage({ id: 'body_admin.category_management.update_category.no_category_name', defaultMessage: 'Không có tên danh mục' })}</strong><br>ID: ${id}`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.category_management.update_category.confirm_button_1', defaultMessage: 'Tiếp tục' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.category_management.update_category.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmFirst.isConfirmed) return;

      // Step 2: Secondary Confirmation
      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.category_management.update_category.confirm_title_2', defaultMessage: 'Bạn chắc chắn muốn cập nhật?' }),
         text: intl.formatMessage({ id: 'body_admin.category_management.update_category.confirm_text_2', defaultMessage: 'Thông tin danh mục sẽ được thay đổi!' }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.category_management.update_category.confirm_button_2', defaultMessage: 'Cập nhật' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.category_management.update_category.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmSecond.isConfirmed) return;

      // Step 3: Text confirmation - Type exact phrase
      const confirmText = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.category_management.update_category.security_title', defaultMessage: 'Xác nhận bảo mật' }),
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: #ef4444; font-weight: 600;">
                  ${intl.formatMessage({ id: 'body_admin.category_management.update_category.security_warning', defaultMessage: 'Cảnh báo: Hành động này sẽ cập nhật thông tin danh mục!' })}
               </p>
               <p style="margin-bottom: 10px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.category_management.update_category.security_confirm_text', defaultMessage: 'Danh mục cần cập nhật' })}: <strong style="color: #dc2626;">${nameCategory || intl.formatMessage({ id: 'body_admin.category_management.update_category.no_category_name', defaultMessage: 'Không có tên danh mục' })}</strong>
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.category_management.update_category.security_type_exact', defaultMessage: 'Nhập chính xác cụm từ' })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">${intl.formatMessage({ id: 'body_admin.category_management.update_category.security_phrase', defaultMessage: 'CẬP NHẬT DANH MỤC' })}</code>
               </p>
            </div>
         `,
         input: 'text',
         inputPlaceholder: intl.formatMessage({ id: 'body_admin.category_management.update_category.security_placeholder', defaultMessage: 'Nhập cụm từ xác nhận...' }),
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.category_management.update_category.security_continue', defaultMessage: 'Tiếp tục cập nhật' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.category_management.update_category.cancel_button', defaultMessage: 'Hủy' }),
         inputValidator: (value) => {
            const expectedPhrase = intl.formatMessage({ id: 'body_admin.category_management.update_category.security_phrase', defaultMessage: 'CẬP NHẬT DANH MỤC' });
            if (value !== expectedPhrase) {
               return intl.formatMessage({ id: 'body_admin.category_management.update_category.security_error', defaultMessage: 'Cụm từ không chính xác. Vui lòng nhập đúng cụm từ được yêu cầu.' });
            }
         },
         customClass: {
            popup: 'swal-update-step3',
            input: 'swal-text-input'
         }
      });

      if (!confirmText.isConfirmed) return;

      setLoading(true);

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
