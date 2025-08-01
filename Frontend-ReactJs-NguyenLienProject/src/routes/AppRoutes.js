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
import Profile from '../pages/user/Profile';
import NotFoundPage from '../pages/auth/NotFoundPage';

// Pages - Admin Dashboard
import Dashboard from '../pages/admin/Dashboard';
import AccountDashboard from '../pages/admin/AccountDashboard';
import HomepageDashboard from '../pages/admin/HomepageDashboard';

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

// Wrapper
import ErrorBoundary from '../components/ErrorBoundary';

const AppRoutes = () => (
   <ErrorBoundary>
      <Routes>
         {/* --- Public Routes --- */}
         <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
         <Route path="/login" element={<PublicLayout><PublicRoute element={Login} /></PublicLayout>} />
         <Route path="/register" element={<PublicLayout><PublicRoute element={Register} /></PublicLayout>} />
         <Route path="/profile" element={<PublicLayout><PrivateRoute element={Profile} role="2" /></PublicLayout>} />

         {/* --- Admin Dashboard --- */}
         <Route path="/admin" element={<PrivateRoute role="1" element={() => <AdminLayout><Dashboard /></AdminLayout>} />} />
         <Route path="/admin/account-management" element={<PrivateRoute role="1" element={() => <AdminLayout><AccountDashboard /></AdminLayout>} />} />
         <Route path="/admin/homepage-management" element={<PrivateRoute role="1" element={() => <AdminLayout><HomepageDashboard /></AdminLayout>} />} />

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
         {/* --- Not Found --- */}
         <Route path="*" element={<NotFoundPage />} />
      </Routes>
   </ErrorBoundary>
);

export default AppRoutes;
