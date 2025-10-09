import React, { useEffect, useState } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Breadcrumb.scss';

const Breadcrumb = ({ topOffset = 100 }) => {
   const location = useLocation();
   const { isLoggedIn, roleId } = useSelector((state) => state.admin);
   const pathnames = location.pathname
      .split('/')
      .filter(x => x && !/^\d+$/.test(x));

   // Get the actual path segments including IDs for URL reconstruction
   const fullPathSegments = location.pathname.split('/').filter(x => x);

   // Auto-detect if we're in admin area to adjust topOffset
   const isAdminArea = location.pathname.startsWith('/admin');
   const dynamicTopOffset = isAdminArea ? 0 : topOffset;

   if (location.pathname === '/') return null;

   const getBreadcrumbName = (name, index) => {
      if (name === '') return 'Trang chủ';

      if (name === 'admin') return 'Trang quản lý';

      if (name === 'user-management') return 'Quản lý tài khoản người dùng';

      if (name === 'admin-management') return 'Quản lý tài khoản quản trị viên';

      if (name === 'user-detail') return 'Thông tin người dùng';

      if (name === 'user-register') return 'Đăng ký tài khoản người dùng';

      if (name === 'user-update') return 'Chỉnh sửa người dùng';

      if (name === 'admin-register') return 'Đăng ký quản trị viên';

      if (name === 'admin-detail') return 'Thông tin quản trị viên';

      if (name === 'admin-update') return 'Chỉnh sửa quản trị viên';

      if (name === 'account-management') return 'Quản lý tài khoản';

      if (name === 'homepage-management') return 'Quản lý trang chủ';

      if (name === 'banner-management') return 'Quản lý banner';
      if (name === 'banner-create') return 'Tạo banner';
      if (name === 'banner-update') return 'Chỉnh sửa banner';

      if (name === 'product-category-management') return 'Quản lý sản phẩm và danh mục sản phẩm';
      if (name === 'product-management') return 'Quản lý Sản phẩm';
      if (name === 'product-update') return 'Chỉnh sửa sản phẩm';
      if (name === 'product-detail') return 'Chi tiết thông tin sản phẩm';
      if (name === 'forgot-password') return 'Quên mật khẩu';

      if (name === 'product-create') return 'Tạo sản phẩm';
      if (name === 'info-category') return 'Thông tin danh mục sản phẩm';
      if (name === 'add-category') return 'Thêm danh mục sản phẩm';
      if (name === 'delete-category') return 'Xóa danh mục sản phẩm';
      if (name === 'category-create') return 'Tạo danh mục sản phẩm';
      if (name === 'category-update') return 'Chỉnh sửa danh mục sản phẩm';
      if (name === 'category-detail') return 'Chi tiết danh mục sản phẩm';
      if (name === 'info-product') return 'Thông tin sản phẩm';
      if (name === 'category-management') return 'Quản lý danh mục sản phẩm';
      if (name === 'add-product') return 'Thêm sản phẩm';
      if (name === 'delete-product') return 'Xóa sản phẩm';

      if (pathnames.includes('user-detail') && index === pathnames.length - 1) {
         return "Thông tin người dùng";
      }

      if (pathnames.includes('user-update') && index === pathnames.length - 1) {
         return "Chỉnh sửa người dùng";
      }

      if (pathnames.includes('admin-update') && index === pathnames.length - 1) {
         return "Chỉnh sửa quản trị viên";
      }

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
      <nav className="breadcrumb" style={{ top: `${dynamicTopOffset}px`, position: 'sticky', zIndex: 999 }}>
         <Link to="/">Trang chủ</Link>
         {pathnames.map((name, index) => {
            // Handle special cases where we need to include IDs in the URL
            let routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;

            // Special handling for info-product breadcrumb
            if (name === 'info-product' && index < pathnames.length - 1) {
               // If we're on add-product or delete-product, we need to include the category ID
               const categoryId = fullPathSegments.find(segment => /^\d+$/.test(segment));
               if (categoryId) {
                  routeTo = `/admin/product-category-management/category-management/info-product/${categoryId}`;
               }
            }

            // Special handling for info-category breadcrumb
            if (name === 'info-category' && index < pathnames.length - 1) {
               // If we're on add-category or delete-category, we need to include the product ID
               const productId = fullPathSegments.find(segment => /^\d+$/.test(segment));
               if (productId) {
                  routeTo = `/admin/product-category-management/product-management/info-category/${productId}`;
               }
            }

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
