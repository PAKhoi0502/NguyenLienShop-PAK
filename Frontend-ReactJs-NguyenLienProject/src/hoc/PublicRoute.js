import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PublicRoute = ({ element: Element }) => {
   const { isLoading } = useAuth();
   // const { isAuthenticated, roleId, isLoading } = useAuth();
   // const location = useLocation();

   // Show loading while checking authentication
   if (isLoading) {
      return <div>Loading...</div>;
   }

   // ✅ TEMPORARY: Allow access to login page even if authenticated
   // This allows users to logout or switch accounts
   // Remove this comment block if you want to prevent authenticated users from accessing login

   // if (isAuthenticated) {
   //    if (location.pathname === '/login' || location.pathname === '/register') {
   //       if (roleId === '1') {
   //          return <Navigate to="/admin" replace />;
   //       }
   //       if (roleId === '2') {
   //          return <Navigate to="/profile" replace />;
   //       }
   //       return <Navigate to="/" replace />;
   //    }
   // }

   return <Element />;
};

export default PublicRoute;