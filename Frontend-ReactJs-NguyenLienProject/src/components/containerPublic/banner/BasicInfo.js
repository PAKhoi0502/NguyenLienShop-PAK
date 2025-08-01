import React from 'react';
import './BasicInfo.scss';
import { FaTruck, FaExchangeAlt, FaHandsHelping, FaMoneyCheckAlt, FaCommentDots } from 'react-icons/fa';

const infoList = [
   {
      icon: <FaTruck />,
      title: 'Miễn phí vận chuyển',
      highlight: '*Đơn từ 300K',
   },
   {
      icon: <FaExchangeAlt />,
      title: 'Đổi hàng tận nhà',
      highlight: '*Trong vòng 15 ngày',
   },
   {
      icon: <FaHandsHelping />,
      title: 'Sản phẩm không qua trung gian',
      highlight: '*Do cô chú nông dân chính tay làm nên sản phẩm',
   },
   {
      icon: <FaMoneyCheckAlt />,
      title: 'Thanh toán đa dạng',
      highlight: '*Tiền mặt - Ví điện tử - Quét mã QR',
   },
   {
      icon: <FaCommentDots />,
      title: 'Zalo: Tên - xxx.xxx.xxx',
      highlight: '*Được tư vấn trực tiếp bởi chủ cửa hàng và chủ xưởng sản xuất',
   },
];

const BasicInfo = () => {
   return (
      <div className="basic-info">
         <div className="section-title">Yên tâm mua sắm với</div>
         <div className="info-list">
            {infoList.map((item, index) => (
               <div className="info-item" key={index}>
                  <div className="icon">{item.icon}</div>
                  <div className="content">
                     <div className="title">{item.title}</div>
                     <div className="highlight">{item.highlight}</div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

export default BasicInfo;
