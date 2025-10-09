import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomToast from '../../../../components/CustomToast';
import { createBanner } from '../../../../services/bannerService';
import { useIntl, FormattedMessage } from 'react-intl';
import HintBox from '../../../../components/HintBox';
import './BannerCreate.scss';


const BannerCreate = () => {
   const [title, setTitle] = useState('');
   const [subtitle, setSubtitle] = useState('');
   const [link, setLink] = useState('');
   const [image, setImage] = useState(null);
   const [imagePreview, setImagePreview] = useState(null);
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();
   const intl = useIntl();

   const handleSubmit = async (e) => {
      e.preventDefault();

      // Validation
      if (!image) {
         showToast("error", intl.formatMessage({
            id: 'body_admin.banner.create.no_image',
            defaultMessage: 'Vui lòng chọn ảnh banner'
         }));
         return;
      }

      if (!title.trim()) {
         showToast("error", intl.formatMessage({
            id: 'body_admin.banner.create.no_title',
            defaultMessage: 'Vui lòng nhập tiêu đề banner'
         }));
         return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append('image', image);
      formData.append('title', title.trim());
      formData.append('subtitle', subtitle.trim());
      formData.append('link', link.trim());
      formData.append('isActive', 0);

      try {
         const res = await createBanner(formData);
         if (res && res.errCode === 0) {
            showToast("success", intl.formatMessage({ id: 'body_admin.banner.create.success' }));
            navigate('/admin/homepage-management/banner-management');
         } else {
            showToast("error", res.errMessage || intl.formatMessage({ id: 'body_admin.banner.create.error' }));
         }
      } catch (err) {
         console.error('Create banner error:', err);
         showToast("error", intl.formatMessage({ id: 'body_admin.banner.create.server_error' }));
      } finally {
         setLoading(false);
      }
   };

   const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         // Validate file type
         const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
         if (!allowedTypes.includes(file.type)) {
            showToast("error", intl.formatMessage({
               id: 'body_admin.banner.create.invalid_file_type',
               defaultMessage: 'Chỉ chấp nhận file ảnh (JPG, PNG, WebP)'
            }));
            return;
         }

         // Validate file size (max 5MB)
         const maxSize = 5 * 1024 * 1024; // 5MB
         if (file.size > maxSize) {
            showToast("error", intl.formatMessage({
               id: 'body_admin.banner.create.file_too_large',
               defaultMessage: 'Kích thước file không được vượt quá 5MB'
            }));
            return;
         }

         setImage(file);

         // Create preview
         const reader = new FileReader();
         reader.onload = (e) => {
            setImagePreview(e.target.result);
         };
         reader.readAsDataURL(file);
      }
   };

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === "success" ? "body_admin.banner.create.create_success_title" : "body_admin.banner.create.create_error_title"}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   return (
      <div className="banner-create-container">
         <HintBox
            content={
               <div>
                  <p><FormattedMessage id="body_admin.banner.hint.title" /></p>
                  <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                     <li><FormattedMessage id="body_admin.banner.hint.desktop1" /></li>
                     <li><FormattedMessage id="body_admin.banner.hint.desktop2" /></li>
                     <li><FormattedMessage id="body_admin.banner.hint.mobile" /></li>
                  </ul>
                  <p><FormattedMessage id="body_admin.banner.hint.empty_title" /></p>
                  <p><FormattedMessage id="body_admin.banner.hint.empty_subtitle" /></p>
                  <p><FormattedMessage id="body_admin.banner.hint.empty_link" /></p>
               </div>
            }
         />

         <h1><FormattedMessage id="body_admin.banner.create.title" defaultMessage="Tạo Banner Mới" /></h1>
         <form onSubmit={handleSubmit} className="banner-create-form">
            <div className="form-group">
               <label>
                  <FormattedMessage id="body_admin.banner.create.image" defaultMessage="Hình ảnh:" />
                  <span>*</span>
               </label>
               <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
               />
               {imagePreview && (
                  <div className="image-preview">
                     <img
                        src={imagePreview}
                        alt="Preview"
                     />
                  </div>
               )}
            </div>

            <div className="form-group">
               <label>
                  <FormattedMessage id="body_admin.banner.create.title_label" defaultMessage="Tiêu đề:" />
                  <span>*</span>
               </label>
               <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={intl.formatMessage({ id: 'body_admin.banner.create.title_placeholder', defaultMessage: 'Nhập tiêu đề banner' })}
                  required
               />
            </div>

            <div className="form-group">
               <label><FormattedMessage id="body_admin.banner.create.subtitle" defaultMessage="Phụ đề:" /></label>
               <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder={intl.formatMessage({ id: 'body_admin.banner.create.subtitle_placeholder', defaultMessage: 'Nhập phụ đề banner (tùy chọn)' })}
               />
            </div>

            <div className="form-group">
               <label><FormattedMessage id="body_admin.banner.create.link" defaultMessage="Liên kết:" /></label>
               <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder={intl.formatMessage({ id: 'body_admin.banner.create.link_placeholder', defaultMessage: 'https://example.com (tùy chọn)' })}
               />
            </div>

            <div className="form-actions">
               <button className="btn-submit" type="submit" disabled={loading}>
                  {loading ? <FormattedMessage id="body_admin.banner.create.loading" defaultMessage="Đang tạo..." /> : <FormattedMessage id="body_admin.banner.create.submit" defaultMessage="Tạo Banner" />}
               </button>
               <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate('/admin/homepage-management/banner-management')}
                  disabled={loading}
               >
                  <FormattedMessage id="body_admin.banner.create.cancel" defaultMessage="Hủy" />
               </button>
            </div>
         </form>
      </div>
   );

};

export default BannerCreate;