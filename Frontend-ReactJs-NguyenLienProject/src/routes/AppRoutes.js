import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';

// HOC
import PrivateRoute from '../hoc/PrivateRoute';
import PublicRoute from '../hoc/PublicRoute';

// Pages - Public
import Home from '../pages/home/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Logout from '../pages/auth/Logout';
import ForgotPassword from '../pages/auth/ForgotPassword';
import AccountPage from '../pages/user/AccountPage';
import UpdateProfile from '../pages/user/UpdateProfile';
import ChangePassword from '../pages/user/ChangePassword';
import NotFoundPage from '../pages/auth/NotFoundPage';

// Pages - Admin Dashboard
import Dashboard from '../pages/admin/Dashboard';
import AccountDashboard from '../pages/admin/AccountDashboard';
import HomepageDashboard from '../pages/admin/HomepageDashboard';
import ProductCategoryDashboard from '../pages/admin/ProductCategoryDashboard';

// Admin - Quản lý người dùng
import UserManager from '../components/containerAdmin/usersManager/UserManager';
import UserCreate from '../components/containerAdmin/usersManager/UserCreate';
import UserUpdate from '../components/containerAdmin/usersManager/UserUpdate';
import UserDetail from '../components/containerAdmin/usersManager/UserDetail';

// Admin - Quản lý admin
import AdminManager from '../components/containerAdmin/adminsManager/AdminManager';
import AdminCreate from '../components/containerAdmin/adminsManager/AdminCreate';
import AdminUpdate from '../components/containerAdmin/adminsManager/AdminUpdate';
import AdminDetail from '../components/containerAdmin/adminsManager/AdminDetail';

// Admin - Quản lý banner
import BannerManager from '../components/containerAdmin/homePageManager/banner/BannerManager';
import BannerCreate from '../components/containerAdmin/homePageManager/banner/BannerCreate';
import BannerUpdate from '../components/containerAdmin/homePageManager/banner/BannerUpdate';
import BannerDetail from '../components/containerAdmin/homePageManager/banner/BannerDetail';

// Admin - Quản lý thông báo
import AnnouncementManager from '../components/containerAdmin/homePageManager/announcement/AnnouncementManager';
import AnnouncementCreate from '../components/containerAdmin/homePageManager/announcement/AnnouncementCreate';
import AnnouncementUpdate from '../components/containerAdmin/homePageManager/announcement/AnnouncementUpdate';
import AnnouncementDetail from '../components/containerAdmin/homePageManager/announcement/AnnouncementDetail';

// Admin - Quản lý voucher
import VoucherManager from '../components/containerAdmin/homePageManager/voucher/VoucherManager';
import VoucherCreate from '../components/containerAdmin/homePageManager/voucher/VoucherCreate';
import VoucherUpdate from '../components/containerAdmin/homePageManager/voucher/VoucherUpdate';
import VoucherDetail from '../components/containerAdmin/homePageManager/voucher/VoucherDetail';


// //Admin - Quản lý product
import { AddCategory, DeleteCategory, InfoCategory, ProductCreate, ProductDetail, ProductManager, ProductUpdate } from '../components/containerAdmin/homePageManager/product/index.js';

// //Admin - Quản lý category
import { CategoryManager, CategoryCreate, CategoryUpdate, CategoryDetail, InfoProduct, AddProduct, DeleteProduct } from '../components/containerAdmin/homePageManager/category/index.js';


// Wrapper
import ErrorBoundary from '../components/ErrorBoundary';



const AppRoutes = () => (
   <ErrorBoundary>
      <Routes>
         {/* --- Public Routes --- */}
         <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
         <Route path="/login" element={<PublicLayout><PublicRoute element={Login} /></PublicLayout>} />
         <Route path="/register" element={<PublicLayout><PublicRoute element={Register} /></PublicLayout>} />
         <Route path="/logout" element={<PublicLayout><PublicRoute element={Logout} /></PublicLayout>} />
         <Route path="/forgot-password" element={<PublicLayout><PublicRoute element={ForgotPassword} /></PublicLayout>} />
         <Route path="/profile" element={<PublicLayout><PrivateRoute element={AccountPage} /></PublicLayout>} />
         <Route path="/profile/update-user" element={<PublicLayout><PrivateRoute element={UpdateProfile} /></PublicLayout>} />
         <Route path="/profile/change-password" element={<PublicLayout><PrivateRoute element={ChangePassword} /></PublicLayout>} />

         {/* --- Admin Dashboard --- */}
         <Route path="/admin" element={<PrivateRoute role="1" element={() => <AdminLayout><Dashboard /></AdminLayout>} />} />
         <Route path="/admin/account-management" element={<PrivateRoute role="1" element={() => <AdminLayout><AccountDashboard /></AdminLayout>} />} />
         <Route path="/admin/homepage-management" element={<PrivateRoute role="1" element={() => <AdminLayout><HomepageDashboard /></AdminLayout>} />} />
         <Route path="/admin/product-category-management" element={<PrivateRoute role="1" element={() => <AdminLayout><ProductCategoryDashboard /></AdminLayout>} />} />

         {/* --- Admin - Quản lý người dùng --- */}
         <Route path="/admin/account-management/user-management" element={<PrivateRoute role="1" element={() => <AdminLayout><UserManager /></AdminLayout>} />} />
         <Route path="/admin/account-management/user-management/user-register" element={<PrivateRoute role="1" element={() => <AdminLayout><UserCreate /></AdminLayout>} />} />
         <Route path="/admin/account-management/user-management/user-update/:id" element={<PrivateRoute role="1" element={() => <AdminLayout><UserUpdate /></AdminLayout>} />} />
         <Route path="/admin/account-management/user-management/user-update" element={<PrivateRoute role="1" element={() => <AdminLayout><UserManager /></AdminLayout>} />} />
         <Route path="/admin/account-management/user-management/user-detail/:id" element={<PrivateRoute role="1" element={() => <AdminLayout><UserDetail /></AdminLayout>} />} />
         <Route path="/admin/account-management/user-management/user-detail" element={<PrivateRoute role="1" element={() => <AdminLayout><UserManager /></AdminLayout>} />} />

         {/* --- Admin - Quản lý admin --- */}
         <Route path="/admin/account-management/admin-management" element={<PrivateRoute role="1" element={() => <AdminLayout><AdminManager /></AdminLayout>} />} />
         <Route path="/admin/account-management/admin-management/admin-register" element={<PrivateRoute role="1" element={() => <AdminLayout><AdminCreate /></AdminLayout>} />} />
         <Route path="/admin/account-management/admin-management/admin-update/:id" element={<PrivateRoute role="1" element={() => <AdminLayout><AdminUpdate /></AdminLayout>} />} />
         <Route path="/admin/account-management/admin-management/admin-update" element={<PrivateRoute role="1" element={() => <AdminLayout><AdminManager /></AdminLayout>} />} />
         <Route path="/admin/account-management/admin-management/admin-detail/:id" element={<PrivateRoute role="1" element={() => <AdminLayout><AdminDetail /></AdminLayout>} />} />
         <Route path="/admin/account-management/admin-management/admin-detail" element={<PrivateRoute role="1" element={() => <AdminLayout><AdminManager /></AdminLayout>} />} />

         {/* --- Admin - Quản lý banner --- */}
         <Route path="/admin/homepage-management/banner-management" element={<PrivateRoute role="1" element={() => <AdminLayout><BannerManager /></AdminLayout>} />} />
         <Route path="/admin/homepage-management/banner-management/banner-create" element={<PrivateRoute role="1" element={() => <AdminLayout><BannerCreate /></AdminLayout>} />} />
         <Route path="/admin/homepage-management/banner-management/banner-update/:id" element={<PrivateRoute role="1" element={() => <AdminLayout><BannerUpdate /></AdminLayout>} />} />
         <Route path="/admin/homepage-management/banner-management/banner-detail/:id" element={<PrivateRoute role="1" element={() => <AdminLayout><BannerDetail /></AdminLayout>} />} />

         {/* --- Admin - Quản lý sản phẩm --- */}
         <Route path="/admin/product-category-management/product-management" element={<PrivateRoute role="1" element={() => <AdminLayout><ProductManager /></AdminLayout>} />} />
         <Route path="/admin/product-category-management/product-management/product-create" element={<PrivateRoute role="1" element={() => <AdminLayout><ProductCreate /></AdminLayout>} />} />
         <Route path="/admin/product-category-management/product-management/product-update/:id" element={<PrivateRoute role="1" element={() => <AdminLayout><ProductUpdate /></AdminLayout>} />} />
         <Route path="/admin/product-category-management/product-management/product-detail/:id" element={<PrivateRoute role="1" element={() => <AdminLayout><ProductDetail /></AdminLayout>} />} />
         <Route path="/admin/product-category-management/product-management/info-category/:id" element={<PrivateRoute role="1" element={() => <AdminLayout><InfoCategory /></AdminLayout>} />} />
         <Route path="/admin/product-category-management/product-management/info-category/:id/add-category" element={<PrivateRoute role="1" element={() => <AdminLayout><AddCategory /></AdminLayout>} />} />
         <Route path="/admin/product-category-management/product-management/info-category/:id/delete-category" element={<PrivateRoute role="1" element={() => <AdminLayout><DeleteCategory /></AdminLayout>} />} />



         {/* --- Admin - Quản lý danh mục sản phẩm --- */}
         <Route path="/admin/product-category-management/category-management" element={<PrivateRoute role="1" element={() => <AdminLayout><CategoryManager /></AdminLayout>} />} />
         <Route path="/admin/product-category-management/category-management/category-create" element={<PrivateRoute role="1" element={() => <AdminLayout><CategoryCreate /></AdminLayout>} />} />
         <Route path="/admin/product-category-management/category-management/category-update/:id" element={<PrivateRoute role="1" element={() => <AdminLayout><CategoryUpdate /></AdminLayout>} />} />
         <Route path="/admin/product-category-management/category-management/category-detail/:id" element={<PrivateRoute role="1" element={() => <AdminLayout><CategoryDetail /></AdminLayout>} />} />
         <Route path="/admin/product-category-management/category-management/info-product/:id" element={<PrivateRoute role="1" element={() => <AdminLayout><InfoProduct /></AdminLayout>} />} />
         <Route path="/admin/product-category-management/category-management/info-product/:id/add-product" element={<PrivateRoute role="1" element={() => <AdminLayout><AddProduct /></AdminLayout>} />} />
         <Route path="/admin/product-category-management/category-management/info-product/:id/delete-product" element={<PrivateRoute role="1" element={() => <AdminLayout><DeleteProduct /></AdminLayout>} />} />


         {/* --- Admin - Quản lý thông báo --- */}
         <Route path="/admin/homepage-management/announcement-management" element={<PrivateRoute role="1" element={() => <AdminLayout><AnnouncementManager /></AdminLayout>} />} />
         <Route path="/admin/homepage-management/announcement-management/announcement-create" element={<PrivateRoute role="1" element={() => <AdminLayout><AnnouncementCreate /></AdminLayout>} />} />
         <Route path="/admin/homepage-management/announcement-management/announcement-update/:id" element={<PrivateRoute role="1" element={() => <AdminLayout><AnnouncementUpdate /></AdminLayout>} />} />
         <Route path="/admin/homepage-management/announcement-management/announcement-detail/:id" element={<PrivateRoute role="1" element={() => <AdminLayout><AnnouncementDetail /></AdminLayout>} />} />

         {/* --- Admin - Quản lý voucher --- */}
         <Route path="/admin/homepage-management/voucher-management" element={<PrivateRoute role="1" element={() => <AdminLayout><VoucherManager /></AdminLayout>} />} />
         <Route path="/admin/homepage-management/voucher-management/voucher-create" element={<PrivateRoute role="1" element={() => <AdminLayout><VoucherCreate /></AdminLayout>} />} />
         <Route path="/admin/homepage-management/voucher-management/voucher-update/:id" element={<PrivateRoute role="1" element={() => <AdminLayout><VoucherUpdate /></AdminLayout>} />} />
         <Route path="/admin/homepage-management/voucher-management/voucher-detail/:id" element={<PrivateRoute role="1" element={() => <AdminLayout><VoucherDetail /></AdminLayout>} />} />

         {/* --- Not Found --- */}
         <Route path="*" element={<NotFoundPage />} />
      </Routes>
   </ErrorBoundary>
);

export default AppRoutes;
