import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLanguage } from '../../store/reducers/appReducer';
import { FaSearch, FaUser, FaShoppingBag, FaHeart } from 'react-icons/fa';
import './HeaderPublic.scss';
import logo from '../../assets/icon/footer/logo.png';
import { toast } from 'react-toastify';
import CustomToast from '../../components/CustomToast';
import { FormattedMessage } from 'react-intl';
import Announcement from '../containerPublic/Announcement/Announcement';
import LanguageSelect from "../../components/header/LanguageSelect";


const HeaderPublic = forwardRef((props, ref) => {
   const [showAccountMenu, setShowAccountMenu] = useState(false);
   const language = useSelector((state) => state.app.language);
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const isLoggedIn = useSelector((state) => state.admin.isLoggedIn);
   const adminInfo = useSelector((state) => state.admin.adminInfo);
   const accountRef = useRef();

   // Get user initials for avatar
   const getInitials = (name) => {
      if (!name) return 'U';
      const parts = name.trim().split(' ');
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
   };

   // Get avatar URL
   const getAvatarUrl = () => {
      if (adminInfo?.avatar) {
         return `${process.env.REACT_APP_BACKEND_URL}/uploads/${adminInfo.avatar}`;
      }
      return null;
   };

   useEffect(() => {
      const handleClickOutside = (event) => {
         if (accountRef.current && !accountRef.current.contains(event.target)) {
            setShowAccountMenu(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, []);

   return (
      <header ref={ref} className="main-header">
         <Announcement />

         <div className="navbar">
            <div className="navbar-left">
               <div className="logo" onClick={() => navigate('/')}>
                  <img src={logo} alt="Logo" />
               </div>
            </div>

            <div className="navbar-center">
               <ul className="nav-menu">
                  <li>
                     <FormattedMessage id="header_public.menu.new" defaultMessage="Hàng mới" />
                  </li>
                  <li>
                     <FormattedMessage id="header_public.menu.promotion" defaultMessage="Khuyến mãi" />
                  </li>
                  <li className="has-dropdown">
                     <FormattedMessage id="header_public.menu.bagType" defaultMessage="Loại túi" />
                  </li>
                  <li>
                     <FormattedMessage id="header_public.menu.other" defaultMessage="Mặt hàng khác" />
                  </li>
                  <li>
                     <FormattedMessage id="header_public.menu.news" defaultMessage="Tin tức" />
                  </li>
                  <li>
                     <FormattedMessage id="header_public.menu.shopee" defaultMessage="Cửa hàng trên Shopee" />
                  </li>
               </ul>

            </div>

            <div className="navbar-right">
               <FaSearch className="icon" />

               <div className="wishlist-icon">
                  <FaHeart className="icon" />
                  <span className="wishlist-count">0</span>
               </div>

               <div className="cart-icon">
                  <FaShoppingBag className="icon" />
                  <span className="cart-count">0</span>
               </div>
               <div className="account-wrapper" ref={accountRef}>
                  <FaUser className="icon" onClick={() => setShowAccountMenu(!showAccountMenu)} />
                  {showAccountMenu && (
                     <div className="account-dropdown">
                        {isLoggedIn ? (
                           <>
                              {/* User Info Header */}
                              <div className="dropdown-user-header">
                                 <div className="dropdown-user-avatar">
                                    {getAvatarUrl() ? (
                                       <img src={getAvatarUrl()} alt="Avatar" />
                                    ) : (
                                       <span className="dropdown-user-initials">
                                          {getInitials(adminInfo?.userName)}
                                       </span>
                                    )}
                                 </div>
                                 <div className="dropdown-user-info">
                                    <div className="dropdown-user-name">
                                       {adminInfo?.userName || 'User'}
                                    </div>
                                    <div className="dropdown-user-email">
                                       {adminInfo?.email || adminInfo?.phoneNumber || ''}
                                    </div>
                                 </div>
                              </div>

                              {/* Menu Items */}
                              <div
                                 className="dropdown-item"
                                 onClick={() => {
                                    navigate('/profile');
                                    setShowAccountMenu(false);
                                 }}
                              >
                                 <FormattedMessage id="header_public.menu.account_info" defaultMessage="Thông tin tài khoản" />
                              </div>

                              <div
                                 className="dropdown-item"
                                 onClick={() => {
                                    navigate('/order');
                                    setShowAccountMenu(false);
                                 }}
                              >
                                 <FormattedMessage id="header_public.menu.my_orders" defaultMessage="Đơn hàng đã mua" />
                              </div>

                              <div
                                 className="dropdown-item"
                                 onClick={() => {
                                    navigate('/notification');
                                    setShowAccountMenu(false);
                                 }}
                              >
                                 <FormattedMessage id="header_public.menu.notification" defaultMessage="Gian hàng yêu thích" />
                              </div>

                              <div
                                 className="dropdown-item"
                                 onClick={() => {
                                    navigate('/payment-history');
                                    setShowAccountMenu(false);
                                 }}
                              >
                                 <FormattedMessage id="header_public.menu.payment_history" defaultMessage="Lịch sử thanh toán" />
                              </div>

                              <div
                                 className="dropdown-item"
                                 onClick={() => {
                                    navigate('/reseller');
                                    setShowAccountMenu(false);
                                 }}
                              >
                                 <FormattedMessage id="header_public.menu.reseller" defaultMessage="Reseller" />
                              </div>

                              <div
                                 className="dropdown-item"
                                 onClick={() => {
                                    navigate('/settings');
                                    setShowAccountMenu(false);
                                 }}
                              >
                                 <FormattedMessage id="header_public.menu.settings" defaultMessage="Quản lý nội dung" />
                              </div>

                              <div
                                 className="dropdown-item"
                                 onClick={() => {
                                    navigate('/change-password');
                                    setShowAccountMenu(false);
                                 }}
                              >
                                 <FormattedMessage id="header_public.menu.change_password" defaultMessage="Đổi mật khẩu" />
                              </div>

                              {/* Separator */}
                              <div className="dropdown-separator"></div>

                              <div
                                 className="dropdown-item"
                                 onClick={() => {
                                    navigate('/logout');
                                    setShowAccountMenu(false);
                                 }}
                              >
                                 <FormattedMessage id="header_public.menu.logout" defaultMessage="Thoát" />
                              </div>
                           </>
                        ) : (
                           <>
                              <div
                                 className="dropdown-item"
                                 onClick={() => {
                                    navigate('/login');
                                    setShowAccountMenu(false);
                                 }}
                              >
                                 <FormattedMessage id="header_public.menu.login" defaultMessage="Đăng nhập" />
                              </div>
                              <div
                                 className="dropdown-item"
                                 onClick={() => {
                                    navigate('/register');
                                    setShowAccountMenu(false);
                                 }}
                              >
                                 <FormattedMessage id="header_public.menu.register" defaultMessage="Đăng ký" />
                              </div>
                           </>
                        )}
                     </div>
                  )}
               </div>
               <LanguageSelect
                  value={language}
                  onChange={(lang) => {
                     dispatch(setLanguage(lang));
                     toast(
                        (props) => (
                           <CustomToast
                              {...props}
                              type="info"
                              titleId="header_public.language_changed"
                              messageId={`header_public.language_${lang}`}
                              time={new Date()}
                           />
                        ),
                        { closeButton: false, type: "info" }
                     );
                  }}
               />

            </div>
         </div>
      </header>
   );
});

export default HeaderPublic;