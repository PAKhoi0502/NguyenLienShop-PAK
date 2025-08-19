import React from 'react';
import { Navigate } from 'react-router-dom';
import HeaderAdmin from '../components/header/HeaderAdmin';
import FooterAdmin from '../components/footer/FooterAdmin';
import useAuth from '../hooks/useAuth';
import Breadcrumb from '../components/Breadcrumb';

const AdminLayout = ({ children }) => {
   const { isAuthenticated, isAdmin, isLoading } = useAuth();

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
         <FooterAdmin />
      </div>
   );
};

export default AdminLayout;