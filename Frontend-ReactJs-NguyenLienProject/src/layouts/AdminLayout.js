import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import HeaderAdmin from '../components/header/HeaderAdmin';
import FooterAdmin from '../components/footer/FooterAdmin';
import useAuth from '../hooks/useAuth';
import Breadcrumb from '../components/Breadcrumb';
import './AdminLayout.scss';

const AdminLayout = ({ children }) => {
   const { isAuthenticated, isAdmin, isLoading } = useAuth();
   const location = useLocation();

   // Determine footer stats type based on current route
   const getStatsType = () => {
      const path = location.pathname;
      if (path.includes('dashboard') || path === '/admin') {
         return 'dashboard';
      } else if (path.includes('account-management')) {
         return 'account';
      } else if (path.includes('product-category-management')) {
         return 'product';
      } else if (path.includes('homepage-management')) {
         return 'homepage';
      }
      return 'dashboard'; // default
   };

   // console.log('🔧 AdminLayout render:', { isAuthenticated, isAdmin, isLoading });

   // Show loading while checking authentication
   if (isLoading) {
      return (
         <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '16px'
         }}>
            Loading authentication...
         </div>
      );
   }

   if (!isAuthenticated || !isAdmin) {
      console.log('AdminLayout: Unauthorized access', { isAuthenticated, isAdmin });
      return <Navigate to="/" replace />;
   }

   return (
      <div className="admin-layout">
         <HeaderAdmin />
         <Breadcrumb />
         <div className="admin-body">
            <main className="admin-content">{children}</main>
         </div>
         <FooterAdmin statsType={getStatsType()} />
      </div>
   );
};

export default AdminLayout;