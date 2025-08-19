import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PublicRoute = ({ element: Element }) => {
   const { isAuthenticated, roleId } = useAuth();
   const location = useLocation();

   if (isAuthenticated) {
      // ✅ Chỉ redirect khi user truy cập login/register pages
      if (location.pathname === '/login' || location.pathname === '/register') {
         if (roleId === '1') {
            return <Navigate to="/admin" replace />;
         }
         if (roleId === '2') {
            return <Navigate to="/profile" replace />;
         }
         return <Navigate to="/" replace />;
      }
   }

   return <Element />;
};

export default PublicRoute;