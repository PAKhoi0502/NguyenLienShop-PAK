import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';
import './Banner.scss';

import { getActiveBanners } from '../../../services/hompageService';

const Banner = () => {
   const [bannerList, setBannerList] = useState([]);

   useEffect(() => {
      const fetchBanners = async () => {
         try {
            const res = await getActiveBanners();
            if (res && res.length > 0) {
               setBannerList(res);
            }
         } catch (error) {
            console.error('Lỗi khi tải banner:', error);
         }
      };

      fetchBanners();
   }, []);

   return (
      <div className="banner-container">
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
                        backgroundImage: `url(http://localhost:8080${item.imageUrl})`, // nối đúng path ảnh
                     }}
                  >
                     <div className="banner-overlay">
                        <h2 className="banner-title">{item.title}</h2>
                        <p className="banner-subtitle">{item.subtitle}</p>
                        <button className="banner-btn">Xem ngay</button>
                     </div>
                  </div>
               </SwiperSlide>
            ))}
         </Swiper>
      </div>
   );
};

export default Banner;
