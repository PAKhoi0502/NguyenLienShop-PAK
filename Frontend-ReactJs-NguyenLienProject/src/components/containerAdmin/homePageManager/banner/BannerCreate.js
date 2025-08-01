import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomToast from '../../../../components/CustomToast';
import { createBanner } from '../../../../services/hompageService';
import { useIntl, FormattedMessage } from 'react-intl';
import HintBox from '../../../../components/HintBox';
import './BannerCreate.scss';


const BannerCreate = () => {
   const [title, setTitle] = useState('');
   const [subtitle, setSubtitle] = useState('');
   const [link, setLink] = useState('');
   const [image, setImage] = useState(null);
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();
   const intl = useIntl();

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      const formData = new FormData();
      formData.append('image', image);
      formData.append('title', title);
      formData.append('subtitle', subtitle);
      formData.append('link', link);
      formData.append('isActive', 0);

      try {
         const res = await createBanner(formData);
         if (res && res.errCode === 0) {
            showToast("success", intl.formatMessage({ id: 'banner.create.success' }));
            navigate('/admin/homepage-management/banner-management');
         } else {
            showToast("error", res.errMessage || intl.formatMessage({ id: 'banner.create.error' }));
         }
      } catch (err) {
         console.error('Create banner error:', err);
         showToast("error", intl.formatMessage({ id: 'banner.create.server_error' }));
      } finally {
         setLoading(false);
      }
   };

   const handleImageChange = (e) => {
      setImage(e.target.files[0]);
   };

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === "success" ? "banner.create.create_success_title" : "banner.create.create_error_title"}
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
                  <p><FormattedMessage id="banner.hint.title" /></p>
                  <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                     <li><FormattedMessage id="banner.hint.desktop1" /></li>
                     <li><FormattedMessage id="banner.hint.desktop2" /></li>
                     <li><FormattedMessage id="banner.hint.mobile" /></li>
                  </ul>
                  <p><FormattedMessage id="banner.hint.empty_title" /></p>
                  <p><FormattedMessage id="banner.hint.empty_subtitle" /></p>
                  <p><FormattedMessage id="banner.hint.empty_link" /></p>
               </div>
            }
         />


         <h1><FormattedMessage id="banner.create.title" defaultMessage="Create New Banner" /></h1>
         <form onSubmit={handleSubmit} className="banner-create-form">
            <div className="form-group">
               <label><FormattedMessage id="banner.create.image" defaultMessage="Image:" /></label>
               <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="banner.create.title_label" defaultMessage="Title:" /></label>
               <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="banner.create.subtitle" defaultMessage="Subtitle:" /></label>
               <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="banner.create.link" defaultMessage="Link:" /></label>
               <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
               />
            </div>
            <div className="form-actions">
               <button className="btn-submit" type="submit" disabled={loading}>
                  {loading ? <FormattedMessage id="banner.create.loading" defaultMessage="Creating..." /> : <FormattedMessage id="banner.create.submit" defaultMessage="Create Banner" />}
               </button>
               <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate('/admin/homepage-management/banner-management')}
                  disabled={loading}
               >
                  <FormattedMessage id="banner.create.cancel" defaultMessage="Cancel" />
               </button>
            </div>
         </form>
      </div>

   );

};

export default BannerCreate;