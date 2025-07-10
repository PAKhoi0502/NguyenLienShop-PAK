import React from 'react';
import './FooterPublic.scss';
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

const FooterPublic = () => {
   return (
      <footer className="footer">



         {/* Đăng ký nhận tin */}
         <div className="newsletter-row">
            <div className="newsletter-inner">
               <div className="logo">
                  <img src={logo} alt="Logo" />
               </div>
               <div className="newsletter-form">
                  <h4>ĐĂNG KÝ NHẬN TIN</h4>
                  <div className="form-inputs">
                     <input type="email" placeholder="Nhập email của bạn" />
                     <button>Đăng ký</button>
                  </div>
               </div>
            </div>
         </div>



         {/* Nội dung chính 4 cột */}
         <div className="footer-content">

            {/* Giới thiệu */}
            <div className="footer-col">
               <h5>GIỚI THIỆU</h5>
               <p>Công ty TNHH Lưới Nông Sản Việt</p>
               <p><FaMapMarkerAlt /> 123 Trồng Trọt, TP.HCM</p>
               <p><FaPhone /> 0989 888 888</p>
               <p><FaEnvelope /> lienhe@luoiviet.com</p>
               <h5>MUA HÀNG - GÓP Ý</h5>
               <p>Hotline: 0979502094</p>
               <p>E-mail: sales@nguyenlien.vn</p>
               <p>Website: nguyenlienshop.vn</p>
               <p>Gọi qua Zalo: NGUYENLIEN SHOP</p>
            </div>

            {/* Chính sách */}
            <div className="footer-col">
               <h5>THÔNG TIN</h5>
               <ul>
                  <li>Quy định chung</li>
                  <li>Mua hàng trả góp</li>
                  <li>Quy định bảo hành</li>
                  <li>Quy định đặt cọc</li>
                  <li>Hướng dẫn đặt hàng</li>
                  <li>Chính sách đổi trả</li>
                  <li>Chính sách bảo mật</li>
                  <li>Chính sách vận chuyển</li>
                  <li>Chính sách đổi/trả hàng</li>
               </ul>
            </div>

            {/* Hệ thống cửa hàng */}
            <div className="footer-col">
               <h5>ĐỊA CHỈ</h5>
               <ul>
                  <li>TP. HCM - 123 Trần Văn Đang</li>
                  <li>Đà Lạt - 77 Tăng Bạt Hổ</li>
                  <li>Cần Thơ - 90 Nguyễn Trãi</li>
               </ul>
               <h5>THỜI GIAN LÀM VIỆC</h5>
               <ul>
                  <li>Các ngày trong tuần (T2 - T7) : 9h - 20h</li>
                  <li>Chủ nhật và ngày lễ: 9h - 19h</li>
               </ul>
            </div>

            {/* Kết nối */}
            <div className="footer-col">
               <h5>KẾT NỐI VỚI CHÚNG TÔI</h5>
               <div className="social-icons">
                  <img src={facebook} alt="Facebook" />
                  <img src={messenger} alt="Messenger" />
                  <img src={youtube} alt="YouTube" />
                  <img src={instagram} alt="Instagram" />
                  <img src={zalo} alt="Zalo" />
                  <img src={tiktok} alt="TikTok" />
               </div>
               <div className="payments">
                  <h5>PHƯƠNG THỨC THANH TOÁN</h5>
                  <img src={visa} alt="Visa" />
                  <img src={momo} alt="Momo" />
                  <img src={zaloPay} alt="Zalo Pay" />
                  <img src={cod} alt="COD" />
               </div>
               <div className="confirm">
                  <h5>UY TÍN - BẢO MẬT</h5>
                  <img src={confirm1} alt="confirm" />
                  <img src={confirm2} alt="confirm" />
               </div>
            </div>
         </div>

         {/* Bản quyền */}
         <div className="footer-bottom">
            <p>© 2025 Lưới Nông Sản Việt. All rights reserved.</p>
         </div>
      </footer>
   );
};

export default FooterPublic;
