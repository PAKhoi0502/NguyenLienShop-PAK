import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PublicRoute = ({ element: Element }) => {
   const { isAuthenticated, roleId, isLoading } = useAuth();
   const location = useLocation();

   // Show loading while checking authentication
   if (isLoading) {
      return <div>Loading...</div>;
   }

   // Chỉ cho phép user chưa đăng nhập truy cập các trang auth
   if (isAuthenticated) {
      // Nếu user đã đăng nhập, redirect dựa trên role
      if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password') {
         if (roleId === '1') {
            return <Navigate to="/admin" replace />;
         }
         if (roleId === '2') {
            return <Navigate to="/" replace />;
         }
         return <Navigate to="/" replace />;
      }
   }

   return <Element />;
};

export default PublicRoute;