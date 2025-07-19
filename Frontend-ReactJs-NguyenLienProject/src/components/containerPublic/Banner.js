import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';

import './Banner.scss';

const bannerImages = [
   {
      id: 1,
      url: '/images/banner1.jpg',
      title: 'Sản phẩm chất lượng từ nông dân',
      subtitle: 'Hàng nội địa chính tay cô chú làm nên',
   },
   {
      id: 2,
      url: '/images/banner2.jpg',
      title: 'Bao trái cây đa dạng kích thước',
      subtitle: 'Phù hợp cho mọi loại trái',
   },
   {
      id: 3,
      url: '/images/banner3.jpg',
      title: 'Giao hàng nhanh toàn quốc',
      subtitle: 'Thanh toán linh hoạt, tiện lợi',
   },
];

const Banner = () => {
   return (
      <div className="banner-container">
         <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 4000 }}
            loop={true}
            spaceBetween={0}
            slidesPerView={1}
         >
            {bannerImages.map((item) => (
               <SwiperSlide key={item.id}>
                  <div
                     className="banner-slide"
                     style={{
                        backgroundImage: `url(${item.url})`,
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
