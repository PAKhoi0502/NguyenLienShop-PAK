import React, { forwardRef } from 'react';
import './FooterPublic.scss';
import { FormattedMessage, useIntl } from 'react-intl';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import logo from '../../assets/icon/footer/logo.png';
import facebook from '../../assets/icon/footer/facebook_icon.svg';
import youtube from '../../assets/icon/footer/youtube_icon.svg';
import instagram from '../../assets/icon/footer/instagram_icon.svg';
import messenger from '../../assets/icon/footer/messenger_icon.svg';
import zalo from '../../assets/icon/footer/zalo_icon.svg';
import tiktok from '../../assets/icon/footer/tiktok_icon.svg';
import visa from '../../assets/icon/footer/visa-logo.png';
import momo from '../../assets/icon/footer/momo.svg';
import zaloPay from '../../assets/icon/footer/zalo-pay-icon.png';
import cod from '../../assets/icon/footer/cod-icon.png';
import confirm1 from '../../assets/icon/footer/confirm-1.png';
import confirm2 from '../../assets/icon/footer/confirm-2.png';

const FooterPublic = forwardRef((props, ref) => {
   const intl = useIntl();

   return (
      <footer ref={ref} className="footer">
         <div className="newsletter-row">
            <div className="newsletter-inner">
               <div className="logo">
                  <img src={logo} alt="Logo" />
               </div>
               <div className="newsletter-form">
                  <h4>
                     <FormattedMessage id="footer_public.newsletter_title" defaultMessage="ĐĂNG KÝ NHẬN TIN" />
                  </h4>
                  <div className="form-inputs">
                     <input
                        type="email"
                        placeholder={intl.formatMessage({ id: 'footer_public.email_placeholder', defaultMessage: 'Nhập email của bạn' })}
                     />
                     <button>
                        <FormattedMessage id="footer_public.newsletter_button" defaultMessage="Đăng ký" />
                     </button>
                  </div>
               </div>
            </div>
         </div>

         <div className="footer-content">
            <div className="footer-col">
               <h5>
                  <FormattedMessage id="footer_public.intro_title" defaultMessage="GIỚI THIỆU" />
               </h5>
               <p>
                  <FormattedMessage id="footer_public.company" defaultMessage="Công ty TNHH Lưới Nông Sản Việt" />
               </p>
               <p><FaMapMarkerAlt /> <FormattedMessage id="footer_public.address" defaultMessage="Châu Thành, Tiền Giang" /></p>
               <p><FaPhone /> 0979 502 094</p>
               <p><FaEnvelope /> nguyenlienshop@nguyenlien.com</p>
               <h5><FormattedMessage id="footer_public.purchase_feedback" defaultMessage="MUA HÀNG - GÓP Ý" /></h5>
               <p>Hotline: 0979502094</p>
               <p>E-mail: sales@nguyenlien.vn</p>
               <p>Website: nguyenlienshop.vn</p>
               <p>Zalo: NGUYENLIEN SHOP</p>
            </div>

            <div className="footer-col">
               <h5><FormattedMessage id="footer_public.info_title" defaultMessage="THÔNG TIN" /></h5>
               <ul>
                  <li><FormattedMessage id="footer_public.info.rules" defaultMessage="Quy định chung" /></li>
                  <li><FormattedMessage id="footer_public.info.installment" defaultMessage="Mua hàng trả góp" /></li>
                  <li><FormattedMessage id="footer_public.info.warranty" defaultMessage="Quy định bảo hành" /></li>
                  <li><FormattedMessage id="footer_public.info.deposit" defaultMessage="Quy định đặt cọc" /></li>
                  <li><FormattedMessage id="footer_public.info.order_guide" defaultMessage="Hướng dẫn đặt hàng" /></li>
                  <li><FormattedMessage id="footer_public.info.return_policy" defaultMessage="Chính sách đổi trả" /></li>
                  <li><FormattedMessage id="footer_public.info.privacy_policy" defaultMessage="Chính sách bảo mật" /></li>
                  <li><FormattedMessage id="footer_public.info.shipping_policy" defaultMessage="Chính sách vận chuyển" /></li>
                  <li><FormattedMessage id="footer_public.info.product_return" defaultMessage="Chính sách đổi/trả hàng" /></li>
               </ul>
            </div>

            <div className="footer-col">
               <h5><FormattedMessage id="footer_public.address_title" defaultMessage="ĐỊA CHỈ" /></h5>

               <ul>
                  <li><FormattedMessage id="footer_public.address_hcm" defaultMessage="TP. HCM - 123 Trần Văn Đang" /></li>
                  <li><FormattedMessage id="footer_public.address_dalat" defaultMessage="Đà Lạt - 77 Tăng Bạt Hổ" /></li>
                  <li><FormattedMessage id="footer_public.address_cantho" defaultMessage="Cần Thơ - 90 Nguyễn Trãi" /></li>
               </ul>
               <h5><FormattedMessage id="footer_public.working_time_title" defaultMessage="THỜI GIAN LÀM VIỆC" /></h5>
               <ul>
                  <li><FormattedMessage id="footer_public.working_time_week" defaultMessage="Các ngày trong tuần (T2 - T7) : 9h - 20h" /></li>
                  <li><FormattedMessage id="footer_public.working_time_sunday" defaultMessage="Chủ nhật và ngày lễ: 9h - 19h" /></li>
               </ul>
            </div>

            <div className="footer-col">
               <h5><FormattedMessage id="footer_public.social_title" defaultMessage="KẾT NỐI VỚI CHÚNG TÔI" /></h5>
               <div className="social-icons">
                  <img src={facebook} alt="Facebook" />
                  <img src={messenger} alt="Messenger" />
                  <img src={youtube} alt="YouTube" />
                  <img src={instagram} alt="Instagram" />
                  <img src={zalo} alt="Zalo" />
                  <img src={tiktok} alt="TikTok" />
               </div>
               <div className="payments">
                  <h5><FormattedMessage id="footer_public.payments_title" defaultMessage="PHƯƠNG THỨC THANH TOÁN" /></h5>
                  <img src={visa} alt="Visa" />
                  <img src={momo} alt="Momo" />
                  <img src={zaloPay} alt="Zalo Pay" />
                  <img src={cod} alt="COD" />
               </div>
               <div className="confirm">
                  <h5><FormattedMessage id="footer_public.confirm_title" defaultMessage="UY TÍN - BẢO MẬT" /></h5>
                  <img src={confirm1} alt="confirm" />
                  <img src={confirm2} alt="confirm" />
               </div>
            </div>
         </div>

         <div className="footer-bottom">
            <p><FormattedMessage id="footer_public.bottom" defaultMessage="© 2025 Lưới Nông Sản Việt. All rights reserved." /></p>
         </div>
      </footer>
   );
});

export default FooterPublic;