import React, { useEffect, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { publicBanner } from '../../../services/bannerService.js';
import CustomToast from '../../CustomToast.js';
import './Banner.scss';

const Banner = () => {
   const [bannerList, setBannerList] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const intl = useIntl();

   const fetchActiveBanners = useCallback(async () => {
      try {
         setLoading(true);
         const res = await publicBanner();
         if (res && res.length > 0) {
            setBannerList(res);
         } else {
            setBannerList([]);
            setError(intl.formatMessage({ id: 'body_public.banner.no_active_banners', defaultMessage: 'Không có banner đang kích hoạt' }));
         }
      } catch (error) {
         console.error('Lỗi khi tải banner:', error);
         const errorMessage = error?.response?.status === 403
            ? intl.formatMessage({ id: 'body_public.banner.access_denied', defaultMessage: 'Không có quyền truy cập banner' })
            : intl.formatMessage({ id: 'body_public.banner.load_error', defaultMessage: 'Không thể tải danh sách banner' });
         setError(errorMessage);
         toast.error(
            <CustomToast
               type="error"
               titleId="body_public.banner.load_error_title"
               message={errorMessage}
               time={new Date()}
            />,
            { closeButton: false }
         );
      } finally {
         setLoading(false);
      }
   }, [intl]);

   useEffect(() => {
      fetchActiveBanners();
   }, [fetchActiveBanners]);

   if (loading) {
      return (
         <div className="banner-container">
            <div className="banner-loading">
               {intl.formatMessage({ id: 'body_public.banner.loading', defaultMessage: 'Đang tải banner...' })}
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="banner-container">
            <div className="banner-error">
               {error}
            </div>
         </div>
      );
   }

   return (
      <div className="banner-container">
         {bannerList.length === 0 ? (
            <div className="banner-empty">
               <p>{intl.formatMessage({ id: 'body_public.banner.no_active_banners', defaultMessage: 'Không có banner đang kích hoạt' })}</p>
            </div>
         ) : (
            <Swiper
               modules={[Autoplay]}
               autoplay={{ delay: 4000 }}
               loop={true}
               spaceBetween={0}
               slidesPerView={1}
            >
               {bannerList.map((item) => (
                  <SwiperSlide key={item.id}>
                     <div
                        className="banner-slide"
                        style={{
                           backgroundImage: `url(http://localhost:8080${item.imageUrl})`
                        }}
                        onClick={() => {
                           if (item.link) {
                              window.open(item.link, '_blank');
                           }
                        }}
                     >
                     </div>
                  </SwiperSlide>
               ))}
            </Swiper>
         )}
      </div>
   );
};

export default Banner;