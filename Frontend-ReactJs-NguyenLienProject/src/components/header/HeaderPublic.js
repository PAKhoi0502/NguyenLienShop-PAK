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

const HeaderPublic = forwardRef((props, ref) => {
   const [showAccountMenu, setShowAccountMenu] = useState(false);
   const language = useSelector((state) => state.app.language);
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const isLoggedIn = useSelector((state) => state.admin.isLoggedIn);
   const accountRef = useRef();

   const handleChangeLanguage = (e) => {
      const lang = e.target.value;
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
               <div className="wishlist-icon">
                  <FaHeart className="icon" />
                  <span className="wishlist-count">0</span>
               </div>
               <FaSearch className="icon" />

               <div className="account-wrapper" ref={accountRef}>
                  <FaUser className="icon" onClick={() => setShowAccountMenu(!showAccountMenu)} />
                  {showAccountMenu && (
                     <div className="account-dropdown">
                        {isLoggedIn ? (
                           <>
                              <div
                                 className="dropdown-item"
                                 onClick={() => {
                                    navigate('/profile');
                                    setShowAccountMenu(false);
                                 }}
                              >
                                 <FormattedMessage id="header_public.menu.profile" defaultMessage="Thông tin" />

                              </div>
                              <div
                                 className="dropdown-item"
                                 onClick={() => {
                                    navigate('/logout');
                                    setShowAccountMenu(false);
                                 }}
                              >
                                 <FormattedMessage id="header_public.menu.logout" defaultMessage="Đăng xuất" />
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

               <div className="cart-icon">
                  <FaShoppingBag className="icon" />
                  <span className="cart-count">0</span>
               </div>

               <select
                  className="language-select"
                  value={language}
                  onChange={handleChangeLanguage}
               >
                  <option value="vi">VN</option>
                  <option value="en">EN</option>
               </select>


            </div>
         </div>
      </header>
   );
});

export default HeaderPublic;