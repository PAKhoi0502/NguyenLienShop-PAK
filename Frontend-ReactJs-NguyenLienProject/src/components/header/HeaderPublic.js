import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import * as actions from '../../store/actions';
import { FaSearch, FaUser, FaShoppingBag, FaHeart, FaTimes } from 'react-icons/fa';
import './HeaderPublic.scss';
import logo from '../../assets/icon/footer/logo.png';

const HeaderPublic = () => {
   const [hideBanner, setHideBanner] = useState(false);
   const [showBanner, setShowBanner] = useState(true);
   const [showAccountMenu, setShowAccountMenu] = useState(false);

   const dispatch = useDispatch();
   const history = useHistory();
   const isLoggedIn = useSelector(state => state.admin.isLoggedIn);
   const accountRef = useRef();

   const handleCloseBanner = () => {
      setHideBanner(true);
      setTimeout(() => setShowBanner(false), 400);
   };

   const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('roleId');
      dispatch(actions.processLogout());
      history.push('/login');
   };



   const notifications = [
      'SALE UP 25% – Áp dụng từ hôm nay',
      'MUA 10 TẶNG 1 – Dành cho khách thân thiết',
      'Miễn phí vận chuyển toàn quốc'
   ];

   // Đóng menu khi click ra ngoài
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
      <header className="main-header">
         {showBanner && (
            <div className={`top-banner ${hideBanner ? 'hide' : ''}`}>
               <div className="banner-marquee-wrapper">
                  <div className="banner-marquee">
                     {notifications.map((text, index) => (
                        <span key={index} className="marquee-item">
                           🔔 {text}
                        </span>
                     ))}
                  </div>
               </div>
               <button className="close-btn" onClick={handleCloseBanner}>
                  <FaTimes />
               </button>
            </div>
         )}

         <div className="navbar">
            <div className="navbar-left">
               <div className="logo" onClick={() => history.push('/')}>
                  <img src={logo} alt="Logo" />
               </div>
            </div>

            <div className="navbar-center">
               <ul className="nav-menu">
                  <li>Hàng mới</li>
                  <li>Khuyến mãi</li>
                  <li className="has-dropdown">Loại túi</li>
                  <li>Mặt hàng khác</li>
                  <li>Tin tức</li>
                  <li>Cửa hàng trên Shopee</li>
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
                              <div className="dropdown-item" onClick={() => { history.push('/profile'); setShowAccountMenu(false); }}>Tài khoản</div>
                              <div className="dropdown-item" onClick={handleLogout}>Đăng xuất</div>
                           </>
                        ) : (
                           <>
                              <div className="dropdown-item" onClick={() => { history.push('/login'); setShowAccountMenu(false); }}>Đăng nhập</div>
                              <div className="dropdown-item" onClick={() => { history.push('/register'); setShowAccountMenu(false); }}>Đăng ký</div>
                           </>
                        )}
                     </div>
                  )}
               </div>

               <div className="cart-icon">
                  <FaShoppingBag className="icon" />
                  <span className="cart-count">0</span>
               </div>

               <select className="language-select">
                  <option>VN</option>
                  <option>EN</option>
               </select>
            </div>
         </div>
      </header>
   );
};

export default HeaderPublic;
