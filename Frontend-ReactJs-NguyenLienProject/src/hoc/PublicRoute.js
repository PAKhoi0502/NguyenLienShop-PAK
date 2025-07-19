import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PublicRoute = ({ element: Element }) => {
   const { isAuthenticated, roleId } = useAuth();
   const location = useLocation();

   if (isAuthenticated) {
      if (roleId === '1' && location.pathname !== '/admin') {
         return <Navigate to="/admin" replace />;
      }
      if (roleId === '2' && location.pathname !== '/profile') {
         return <Navigate to="/profile" replace />;
      }
      if (location.pathname !== '/') {
         return <Navigate to="/" replace />;
      }
   }

   return <Element />;
};

export default PublicRoute;