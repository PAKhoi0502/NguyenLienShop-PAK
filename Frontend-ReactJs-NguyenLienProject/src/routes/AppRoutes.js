//src\routes\AppRoutes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/home/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Profile from '../pages/user/Profile';
import Dashboard from '../pages/admin/Dashboard';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import PrivateRoute from '../hoc/PrivateRoute';
import PublicRoute from '../hoc/PublicRoute';
import ErrorBoundary from '../components/ErrorBoundary';
import UserManager from '../components/containerAdmin/usersManager/UserManager';
import UserCreate from '../components/containerAdmin/usersManager/UserCreate';
import AdminCreate from '../components/containerAdmin/usersManager/AdminCreate';
import AdminManager from '../components/containerAdmin/adminsManager/AdminManager';

const AppRoutes = () => (
   <ErrorBoundary>
      <Routes>
         <Route
            path="/"
            element={
               <PublicLayout>
                  <Home />
               </PublicLayout>
            }
         />
         <Route
            path="/login"
            element={
               <PublicLayout>
                  <PublicRoute element={Login} />
               </PublicLayout>
            }
         />
         <Route
            path="/register"
            element={
               <PublicLayout>
                  <PublicRoute element={Register} />
               </PublicLayout>
            }
         />
         <Route
            path="/profile"
            element={
               <PublicLayout>
                  <PrivateRoute element={Profile} role="2" />
               </PublicLayout>
            }
         />
         <Route
            path="/admin"
            element={
               <PrivateRoute
                  role="1"
                  element={() => (
                     <AdminLayout>
                        <Dashboard />
                     </AdminLayout>
                  )}
               />
            }
         />
         <Route
            path="/admin/users-manager"
            element={
               <PrivateRoute
                  role="1"
                  element={() => (
                     <AdminLayout>
                        <UserManager />
                     </AdminLayout>
                  )}
               />
            }
         />
         <Route
            path="/admin/admins-manager"
            element={
               <PrivateRoute
                  role="1"
                  element={() => (
                     <AdminLayout>
                        <AdminManager />
                     </AdminLayout>
                  )}
               />
            }
         />
         <Route
            path="/admin/user-register"
            element={
               <PrivateRoute
                  role="1"
                  element={() => (
                     <AdminLayout>
                        <UserCreate />
                     </AdminLayout>
                  )}
               />
            }
         />
         <Route
            path="/admin/admin-register"
            element={
               <PrivateRoute
                  role="1"
                  element={() => (
                     <AdminLayout>
                        <AdminCreate />
                     </AdminLayout>
                  )}
               />
            }
         />
         <Route
            path="*"
            element={
               <PublicLayout>
                  <div>404 - Không tìm thấy trang</div>
               </PublicLayout>
            }
         />
      </Routes>
   </ErrorBoundary>
);

export default AppRoutes;