import React from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';
import { getActiveBanners, updateBanner } from '../../../../services/bannerService.js';
import CustomToast from '../../../../components/CustomToast';

const BannerActive = ({ banner, onSuccess }) => {
   const intl = useIntl();

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={intl.formatMessage({
                  id: type === "success"
                     ? "banner.activate.activate_success_title"
                     : "banner.activate.activate_error_title"
               })}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   const handleToggleActive = async () => {
      if (!banner || !banner.id) {
         showToast("error", intl.formatMessage({ id: 'admin.delete.not_found' }));
         return;
      }

      if (banner.isActive) {
         const confirmFirst = await Swal.fire({
            title: intl.formatMessage({ id: 'banner.deactivate.confirm_title_1' }),
            html: `<strong>${banner.title || intl.formatMessage({ id: 'banner.deactivate.no_title' })} (${banner.subtitle || 'N/A'})</strong><br>ID: ${banner.id}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({ id: 'banner.deactivate.confirm_button_1' }),
            cancelButtonText: intl.formatMessage({ id: 'admin.delete.cancel_button' })
         });

         if (!confirmFirst.isConfirmed) return;

         const confirmSecond = await Swal.fire({
            title: intl.formatMessage({ id: 'banner.deactivate.confirm_title_2' }),
            text: intl.formatMessage({ id: 'banner.deactivate.confirm_text_2' }),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({ id: 'banner.deactivate.confirm_button_2' }),
            cancelButtonText: intl.formatMessage({ id: 'admin.delete.cancel_button' })
         });

         if (!confirmSecond.isConfirmed) return;

         try {
            const res = await updateBanner({
               id: banner.id,
               title: banner.title || null,
               subtitle: banner.subtitle || null,
               link: banner.link || null,
               isActive: false,
               order: 0
            });

            if (res.errCode === 0) {
               showToast("success", res.errMessage || intl.formatMessage({ id: 'banner.deactivate.success' }));
               if (typeof onSuccess === 'function') {
                  onSuccess(banner.id, { ...banner, isActive: false, order: 0 });
               }
            } else {
               showToast("error", res.errMessage || intl.formatMessage({ id: 'banner.deactivate.failed' }));
            }
         } catch (error) {
            console.error('Deactivate error:', error);
            showToast("error", error.errMessage || intl.formatMessage({ id: 'banner.deactivate.error' }));
         }
      } else {
         // Xác nhận bật banner và nhập số thứ tự
         const { value: order } = await Swal.fire({
            title: intl.formatMessage({ id: 'banner.activate.confirm_title_1' }),
            html: `<strong>${banner.title || intl.formatMessage({ id: 'banner.activate.no_title' })} (${banner.subtitle || 'N/A'})</strong><br>ID: ${banner.id}<br><br>
                   ${intl.formatMessage({ id: 'banner.activate.order_input' })}`,
            input: 'number',
            inputLabel: intl.formatMessage({ id: 'banner.activate.order_label' }),
            inputPlaceholder: intl.formatMessage({ id: 'banner.activate.order_placeholder' }),
            inputAttributes: { min: 1, step: 1 },
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({ id: 'banner.activate.confirm_button_1' }),
            cancelButtonText: intl.formatMessage({ id: 'admin.delete.cancel_button' }),
            inputValidator: async (value) => {
               if (!value || value <= 0) {
                  return intl.formatMessage({ id: 'banner.activate.order_invalid' });
               }
               try {
                  const activeBanners = await getActiveBanners();
                  if (activeBanners.some(b => b.order === parseInt(value))) {
                     return intl.formatMessage({ id: 'banner.activate.order_duplicate' });
                  }
               } catch (error) {
                  return intl.formatMessage({ id: 'banner.activate.order_error' });
               }
            }
         });

         if (!order) return;

         try {
            const res = await updateBanner({
               id: banner.id,
               title: banner.title || null,
               subtitle: banner.subtitle || null,
               link: banner.link || null,
               isActive: true,
               order: parseInt(order)
            });

            if (res.errCode === 0) {
               showToast("success", res.errMessage || intl.formatMessage({ id: 'banner.activate.success' }));
               if (typeof onSuccess === 'function') {
                  onSuccess(banner.id, { ...banner, isActive: true, order: parseInt(order) });
               }
            } else {
               showToast("error", res.errMessage || intl.formatMessage({ id: 'banner.activate.failed' }));
            }
         } catch (error) {
            console.error('Activate error:', error);
            showToast("error", error.errMessage || intl.formatMessage({ id: 'banner.activate.error' }));
         }
      }
   };

   return (
      <div className="action-buttons">
         <button
            className={`btn-action ${banner.isActive ? 'btn-deactivate' : 'btn-activate'}`}
            onClick={handleToggleActive}
         >
            {banner.isActive
               ? intl.formatMessage({ id: 'banner.deactivate.button' })
               : intl.formatMessage({ id: 'banner.activate.button' })}
         </button>
      </div>
   );
};

export default BannerActive;