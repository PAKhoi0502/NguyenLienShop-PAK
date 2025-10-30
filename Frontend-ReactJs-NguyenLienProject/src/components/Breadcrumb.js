import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import './Breadcrumb.scss';

// Breadcrumb message IDs mapping for i18n
const BREADCRUMB_MESSAGE_IDS = {
   'admin': { id: 'breadcrumb.admin', defaultMessage: 'Trang quản lý' },
   'user-management': { id: 'breadcrumb.user-management', defaultMessage: 'Quản lý tài khoản người dùng' },
   'admin-management': { id: 'breadcrumb.admin-management', defaultMessage: 'Quản lý tài khoản quản trị viên' },
   'user-detail': { id: 'breadcrumb.user-detail', defaultMessage: 'Thông tin người dùng' },
   'user-register': { id: 'breadcrumb.user-register', defaultMessage: 'Đăng ký tài khoản người dùng' },
   'user-update': { id: 'breadcrumb.user-update', defaultMessage: 'Chỉnh sửa người dùng' },
   'admin-register': { id: 'breadcrumb.admin-register', defaultMessage: 'Đăng ký quản trị viên' },
   'admin-detail': { id: 'breadcrumb.admin-detail', defaultMessage: 'Thông tin quản trị viên' },
   'admin-update': { id: 'breadcrumb.admin-update', defaultMessage: 'Chỉnh sửa quản trị viên' },
   'account-management': { id: 'breadcrumb.account-management', defaultMessage: 'Quản lý tài khoản' },
   'homepage-management': { id: 'breadcrumb.homepage-management', defaultMessage: 'Quản lý trang chủ' },
   'banner-management': { id: 'breadcrumb.banner-management', defaultMessage: 'Quản lý banner' },
   'banner-create': { id: 'breadcrumb.banner-create', defaultMessage: 'Tạo banner' },
   'banner-update': { id: 'breadcrumb.banner-update', defaultMessage: 'Chỉnh sửa banner' },
   'product-category-management': { id: 'breadcrumb.product-category-management', defaultMessage: 'Quản lý sản phẩm và danh mục sản phẩm' },
   'product-management': { id: 'breadcrumb.product-management', defaultMessage: 'Quản lý Sản phẩm' },
   'product-update': { id: 'breadcrumb.product-update', defaultMessage: 'Chỉnh sửa sản phẩm' },
   'product-detail': { id: 'breadcrumb.product-detail', defaultMessage: 'Chi tiết thông tin sản phẩm' },
   'product-create': { id: 'breadcrumb.product-create', defaultMessage: 'Tạo sản phẩm' },
   'forgot-password': { id: 'breadcrumb.forgot-password', defaultMessage: 'Quên mật khẩu' },
   'info-category': { id: 'breadcrumb.info-category', defaultMessage: 'Thông tin danh mục sản phẩm' },
   'add-category': { id: 'breadcrumb.add-category', defaultMessage: 'Thêm danh mục sản phẩm' },
   'delete-category': { id: 'breadcrumb.delete-category', defaultMessage: 'Xóa danh mục sản phẩm' },
   'category-create': { id: 'breadcrumb.category-create', defaultMessage: 'Tạo danh mục sản phẩm' },
   'category-update': { id: 'breadcrumb.category-update', defaultMessage: 'Chỉnh sửa danh mục sản phẩm' },
   'category-detail': { id: 'breadcrumb.category-detail', defaultMessage: 'Chi tiết danh mục sản phẩm' },
   'info-product': { id: 'breadcrumb.info-product', defaultMessage: 'Thông tin sản phẩm' },
   'category-management': { id: 'breadcrumb.category-management', defaultMessage: 'Quản lý danh mục sản phẩm' },
   'add-product': { id: 'breadcrumb.add-product', defaultMessage: 'Thêm sản phẩm' },
   'delete-product': { id: 'breadcrumb.delete-product', defaultMessage: 'Xóa sản phẩm' },
   'announcement-management': { id: 'breadcrumb.announcement-management', defaultMessage: 'Quản lý thông báo' },
   'announcement-create': { id: 'breadcrumb.announcement-create', defaultMessage: 'Tạo thông báo' },
   'announcement-update': { id: 'breadcrumb.announcement-update', defaultMessage: 'Chỉnh sửa thông báo' },
   'announcement-detail': { id: 'breadcrumb.announcement-detail', defaultMessage: 'Chi tiết thông báo' },
   'login': { id: 'breadcrumb.login', defaultMessage: 'Đăng nhập' },
   'register': { id: 'breadcrumb.register', defaultMessage: 'Đăng ký' },
   'profile': { id: 'breadcrumb.profile', defaultMessage: 'Thông tin cá nhân' },
   'update': { id: 'breadcrumb.update', defaultMessage: 'Cập nhật thông tin' },
   'update-user': { id: 'breadcrumb.update-user', defaultMessage: 'Cập nhật thông tin người dùng' },
   'address-management': { id: 'breadcrumb.address-management', defaultMessage: 'Quản lý địa chỉ' },
   'address-detail': { id: 'breadcrumb.address-detail', defaultMessage: 'Chi tiết địa chỉ' },
   'address-create': { id: 'breadcrumb.address-create', defaultMessage: 'Tạo địa chỉ' },
   'address-update': { id: 'breadcrumb.address-update', defaultMessage: 'Chỉnh sửa địa chỉ' },
   'address-delete': { id: 'breadcrumb.address-delete', defaultMessage: 'Xóa địa chỉ' },
   'address-set-default': { id: 'breadcrumb.address-set-default', defaultMessage: 'Đặt làm địa chỉ mặc định' },
   'address-default': { id: 'breadcrumb.address-default', defaultMessage: 'Địa chỉ mặc định' },
   'address-stats': { id: 'breadcrumb.address-stats', defaultMessage: 'Thống kê địa chỉ' },
   'address-user': { id: 'breadcrumb.address-user', defaultMessage: 'Địa chỉ người dùng' },
   'voucher-management': { id: 'breadcrumb.voucher-management', defaultMessage: 'Quản lý voucher' },
   'voucher-create': { id: 'breadcrumb.voucher-create', defaultMessage: 'Tạo voucher' },
   'voucher-update': { id: 'breadcrumb.voucher-update', defaultMessage: 'Chỉnh sửa voucher' },
   'voucher-detail': { id: 'breadcrumb.voucher-detail', defaultMessage: 'Chi tiết voucher' },
   'voucher-delete': { id: 'breadcrumb.voucher-delete', defaultMessage: 'Xóa voucher' },
   'voucher-set-default': { id: 'breadcrumb.voucher-set-default', defaultMessage: 'Đặt làm voucher mặc định' },
   'voucher-default': { id: 'breadcrumb.voucher-default', defaultMessage: 'Voucher mặc định' },
   'voucher-stats': { id: 'breadcrumb.voucher-stats', defaultMessage: 'Thống kê voucher' },
};

const Breadcrumb = ({ topOffset = 100 }) => {
   const location = useLocation();
   const { isLoggedIn } = useSelector((state) => state.admin);
   const intl = useIntl(); // Hook để format messages

   // Memoize pathname processing to avoid recalculation on every render
   const pathnames = useMemo(() =>
      location.pathname.split('/').filter(x => x && !/^\d+$/.test(x)),
      [location.pathname]
   );

   // Get the actual path segments including IDs for URL reconstruction
   const fullPathSegments = useMemo(() =>
      location.pathname.split('/').filter(x => x),
      [location.pathname]
   );

   // Auto-detect if we're in admin area to adjust topOffset
   const isAdminArea = location.pathname.startsWith('/admin');
   const dynamicTopOffset = isAdminArea ? 0 : topOffset;

   if (location.pathname === '/') return null;

   const getBreadcrumbName = (name, index) => {
      if (name === '') return intl.formatMessage({ id: 'breadcrumb.home', defaultMessage: 'Trang chủ' });

      // Check direct mapping first
      if (BREADCRUMB_MESSAGE_IDS[name]) {
         return intl.formatMessage(BREADCRUMB_MESSAGE_IDS[name]);
      }

      // Special contextual cases
      if (pathnames.includes('user-detail') && index === pathnames.length - 1) {
         return intl.formatMessage({ id: 'breadcrumb.user-detail', defaultMessage: 'Thông tin người dùng' });
      }

      if (pathnames.includes('user-update') && index === pathnames.length - 1) {
         return intl.formatMessage({ id: 'breadcrumb.user-update', defaultMessage: 'Chỉnh sửa người dùng' });
      }

      if (pathnames.includes('admin-update') && index === pathnames.length - 1) {
         return intl.formatMessage({ id: 'breadcrumb.admin-update', defaultMessage: 'Chỉnh sửa quản trị viên' });
      }

      if (!isLoggedIn && index === 0 && pathnames.length === 1) {
         return BREADCRUMB_MESSAGE_IDS[name]
            ? intl.formatMessage(BREADCRUMB_MESSAGE_IDS[name])
            : name;
      }

      if (index === pathnames.length - 1 && pathnames.includes('profile')) {
         return BREADCRUMB_MESSAGE_IDS[name]
            ? intl.formatMessage(BREADCRUMB_MESSAGE_IDS[name])
            : name;
      }

      // Default capitalization
      return name.charAt(0).toUpperCase() + name.slice(1);
   };

   return (
      <nav className="breadcrumb" style={{ top: `${dynamicTopOffset}px`, position: 'sticky', zIndex: 999 }}>
         <Link to="/">{intl.formatMessage({ id: 'breadcrumb.home', defaultMessage: 'Trang chủ' })}</Link>
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
