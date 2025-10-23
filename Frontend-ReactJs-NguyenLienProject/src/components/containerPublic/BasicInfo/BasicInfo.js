import React from 'react';
import './BasicInfo.scss';
import { FaTruck, FaExchangeAlt, FaHandsHelping, FaMoneyCheckAlt, FaCommentDots } from 'react-icons/fa';
import { FormattedMessage } from 'react-intl';

const infoList = [
   {
      icon: <FaTruck />,
      title: <FormattedMessage id="body_public.basic_info.free_shipping.title" defaultMessage="Miễn phí vận chuyển" />,
      highlight: <FormattedMessage id="body_public.basic_info.free_shipping.highlight" defaultMessage="*Đơn từ 300K" />,
   },
   {
      icon: <FaExchangeAlt />,
      title: <FormattedMessage id="body_public.basic_info.home_exchange.title" defaultMessage="Đổi hàng tận nhà" />,
      highlight: <FormattedMessage id="body_public.basic_info.home_exchange.highlight" defaultMessage="*Trong vòng 15 ngày" />,
   },
   {
      icon: <FaHandsHelping />,
      title: <FormattedMessage id="body_public.basic_info.direct_product.title" defaultMessage="Sản phẩm không qua trung gian" />,
      highlight: <FormattedMessage id="body_public.basic_info.direct_product.highlight" defaultMessage="*Do cô chú nông dân chính tay làm nên sản phẩm" />,
   },
   {
      icon: <FaMoneyCheckAlt />,
      title: <FormattedMessage id="body_public.basic_info.payment.title" defaultMessage="Thanh toán đa dạng" />,
      highlight: <FormattedMessage id="body_public.basic_info.payment.highlight" defaultMessage="*Tiền mặt - Ví điện tử - Quét mã QR" />,
   },
   {
      icon: <FaCommentDots />,
      title: <FormattedMessage id="body_public.basic_info.contact.title" defaultMessage="Zalo: Tên - xxx.xxx.xxx" />,
      highlight: <FormattedMessage id="body_public.basic_info.contact.highlight" defaultMessage="*Được tư vấn trực tiếp bởi chủ cửa hàng và chủ xưởng sản xuất" />,
   },
];

const BasicInfo = () => {
   return (
      <div className="basic-info">
         <div className="section-title"><FormattedMessage id="body_public.basic_info.title" defaultMessage="Yên tâm mua sắm với" /></div>
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
