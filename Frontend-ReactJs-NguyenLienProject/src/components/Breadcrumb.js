import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Breadcrumb = ({ topOffset = 100 }) => {
   const location = useLocation();
   const { isLoggedIn, roleId } = useSelector((state) => state.admin);
   const pathnames = location.pathname.split('/').filter(x => x);

   if (location.pathname === '/') return null;

   const getBreadcrumbName = (name, index) => {
      if (name === '') return 'Trang chủ';

      if (name === 'admin') return 'Trang quản lý';

      if (name === 'users-manager') return 'Quản lý tài khoản người dùng';

      if (name === 'admins-manager') return 'Quản lý tài khoản quản trị viên';

      if (!isLoggedIn && index === 0 && pathnames.length === 1) {
         return name === 'login' ? 'Đăng nhập' : name === 'register' ? 'Đăng ký' : name;
      }
      if (isLoggedIn && roleId === 1 && index === 0) {
         return name === 'admin' ? 'Trang quản lý' : name;
      }
      if (index === pathnames.length - 1 && pathnames.includes('profile')) {
         return name === 'update' ? 'Cập nhật thông tin' : name === 'profile' ? 'Thông tin cá nhân' : name;
      }
      return name.charAt(0).toUpperCase() + name.slice(1);
   };

   return (
      <nav className="breadcrumb" style={{ top: `${topOffset}px`, position: 'sticky', zIndex: 999 }}>
         <Link to="/">Trang chủ</Link>
         {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const displayName = getBreadcrumbName(name, index);
            const isLast = index === pathnames.length - 1;

            return (
               <span key={index}>
                  {' / '}
                  {isLast ? (
                     <span className="breadcrumb-active">{displayName}</span>
                  ) : (
                     <Link to={routeTo}>{displayName}</Link>
                  )}
               </span>
            );
         })}
      </nav>
   );
};

export default Breadcrumb;
