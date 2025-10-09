import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useIntl, FormattedMessage } from 'react-intl';
import Swal from 'sweetalert2';
import { getAllBanners, updateBanner } from '../../../../services/bannerService';
import './BannerCreate.scss';

const BannerUpdate = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const intl = useIntl();

   const [banner, setBanner] = useState(null);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      const fetchBanner = async () => {
         try {
            const res = await getAllBanners();
            const found = res.find(item => String(item.id) === String(id));
            if (!found) {
               toast.error(intl.formatMessage({ id: 'body_admin.banner.update.not_found', defaultMessage: 'Không tìm thấy banner' }));
               return navigate('/admin/homepage-management/banner-management');
            }
            setBanner(found);
         } catch (err) {
            console.error(err);
            toast.error(intl.formatMessage({ id: 'body_admin.banner.update.load_error', defaultMessage: 'Lỗi khi tải banner' }));
         }
      };
      fetchBanner();
   }, [id, navigate]);

   const handleChange = (field, value) => {
      setBanner({ ...banner, [field]: value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      // Validation
      if (!banner.title || !banner.title.trim()) {
         toast.error(intl.formatMessage({ id: 'body_admin.banner.update.no_title', defaultMessage: 'Vui lòng nhập tiêu đề banner' }));
         return;
      }

      // Step 1: Initial Confirmation
      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.banner.update.confirm_title_1', defaultMessage: 'Xác nhận cập nhật banner' }),
         html: `<strong>${banner.title || intl.formatMessage({ id: 'body_admin.banner.update.no_title_name', defaultMessage: 'Không có tiêu đề banner' })}</strong><br>ID: ${banner.id}`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.banner.update.confirm_button_1', defaultMessage: 'Tiếp tục' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.banner.update.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmFirst.isConfirmed) return;

      // Step 2: Secondary Confirmation
      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.banner.update.confirm_title_2', defaultMessage: 'Bạn chắc chắn muốn cập nhật?' }),
         text: intl.formatMessage({ id: 'body_admin.banner.update.confirm_text_2', defaultMessage: 'Thông tin banner sẽ được thay đổi!' }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.banner.update.confirm_button_2', defaultMessage: 'Cập nhật' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.banner.update.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmSecond.isConfirmed) return;

      // Step 3: Text confirmation - Type exact phrase
      const confirmText = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.banner.update.security_title', defaultMessage: 'Xác nhận bảo mật' }),
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: #ef4444; font-weight: 600;">
                  ${intl.formatMessage({ id: 'body_admin.banner.update.security_warning', defaultMessage: 'Cảnh báo: Hành động này sẽ cập nhật thông tin banner!' })}
               </p>
               <p style="margin-bottom: 10px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.banner.update.security_confirm_text', defaultMessage: 'Banner cần cập nhật' })}: <strong style="color: #dc2626;">${banner.title || intl.formatMessage({ id: 'body_admin.banner.update.no_title_name', defaultMessage: 'Không có tiêu đề banner' })}</strong>
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.banner.update.security_type_exact', defaultMessage: 'Nhập chính xác cụm từ' })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">${intl.formatMessage({ id: 'body_admin.banner.update.security_phrase', defaultMessage: 'CẬP NHẬT BANNER' })}</code>
               </p>
            </div>
         `,
         input: 'text',
         inputPlaceholder: intl.formatMessage({ id: 'body_admin.banner.update.security_placeholder', defaultMessage: 'Nhập cụm từ xác nhận...' }),
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.banner.update.security_continue', defaultMessage: 'Tiếp tục cập nhật' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.banner.update.cancel_button', defaultMessage: 'Hủy' }),
         inputValidator: (value) => {
            const expectedPhrase = intl.formatMessage({ id: 'body_admin.banner.update.security_phrase', defaultMessage: 'CẬP NHẬT BANNER' });
            if (value !== expectedPhrase) {
               return intl.formatMessage({ id: 'body_admin.banner.update.security_error', defaultMessage: 'Cụm từ không chính xác. Vui lòng nhập đúng cụm từ được yêu cầu.' });
            }
         },
         customClass: {
            popup: 'swal-update-step3',
            input: 'swal-text-input'
         }
      });

      if (!confirmText.isConfirmed) return;

      setLoading(true);

      try {
         const dataToSend = {
            id: banner.id,
            isActive: banner.isActive,
            order: banner.order,
         };

         if (!banner.isActive) {
            dataToSend.title = banner.title || '';
            dataToSend.subtitle = banner.subtitle || '';
            dataToSend.link = banner.link || '';
         }

         const res = await updateBanner(dataToSend);

         if (res && res.errCode === 0) {
            toast.success(intl.formatMessage({ id: 'body_admin.banner.update.success', defaultMessage: 'Cập nhật banner thành công' }));
            navigate('/admin/homepage-management/banner-management');
         } else {
            toast.error(res?.errMessage || intl.formatMessage({ id: 'body_admin.banner.update.error', defaultMessage: 'Không thể cập nhật banner' }));
         }
      } catch (err) {
         console.error(err);
         toast.error(intl.formatMessage({ id: 'body_admin.banner.update.server_error', defaultMessage: 'Lỗi server khi cập nhật banner' }));
      } finally {
         setLoading(false);
      }
   };


   if (!banner) return (
      <div className="banner-detail-loading">
         <FormattedMessage id="body_admin.banner.update.loading_data" defaultMessage="Đang tải dữ liệu..." />
      </div>
   );

   return (
      <div className="banner-create-container">
         <h1><FormattedMessage id="body_admin.banner.update.title" defaultMessage="Cập Nhật Banner" /></h1>
         <form onSubmit={handleSubmit} className="banner-create-form">
            <div className="form-group">
               <label><FormattedMessage id="body_admin.banner.update.image" defaultMessage="Hình ảnh hiện tại:" /></label>
               <img
                  src={`http://localhost:8080${banner.imageUrl}`}
                  alt="banner"
                  style={{ maxWidth: '300px' }}
               />
            </div>

            <div className="form-group">
               <label><FormattedMessage id="body_admin.banner.update.title" defaultMessage="Tiêu đề:" /></label>
               <input
                  type="text"
                  value={banner.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
               />
            </div>

            <div className="form-group">
               <label><FormattedMessage id="body_admin.banner.update.subtitle" defaultMessage="Phụ đề:" /></label>
               <input
                  type="text"
                  value={banner.subtitle || ''}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
               />
            </div>

            <div className="form-group">
               <label><FormattedMessage id="body_admin.banner.update.link" defaultMessage="Link:" /></label>
               <input
                  type="text"
                  value={banner.link || ''}
                  onChange={(e) => handleChange('link', e.target.value)}
               />
            </div>

            <div className="form-actions">
               <button
                  className='btn-submit'
                  type="submit"
                  disabled={loading}
               >
                  {loading ? <FormattedMessage id="body_admin.banner.update.loading" defaultMessage="Đang cập nhật..." /> : <FormattedMessage id="body_admin.banner.update.submit" defaultMessage="Cập Nhật" />}
               </button>
               <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate(-1)}
                  disabled={loading}
               >
                  <FormattedMessage id="body_admin.banner.update.cancel" defaultMessage="Hủy" />
               </button>
            </div>
         </form>
      </div>
   );
};

export default BannerUpdate;