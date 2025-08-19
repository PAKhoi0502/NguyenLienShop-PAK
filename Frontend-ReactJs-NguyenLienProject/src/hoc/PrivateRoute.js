import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PrivateRoute = ({ element: Element, role }) => {
   const { isAuthenticated, roleId, isLoading } = useAuth();
   const location = useLocation();

   // Show loading while checking authentication
   if (isLoading) {
      return <div>Loading...</div>;
   }

   if (!isAuthenticated) {
      return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
   }

   if (role && roleId !== role) {
      return <Navigate to="/" replace />;
   }

   return <Element />;
};

export default PrivateRoute;