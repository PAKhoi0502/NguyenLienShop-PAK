import React from 'react';
import { Navigate } from 'react-router-dom';
import HeaderAdmin from '../components/header/HeaderAdmin';
import FooterAdmin from '../components/footer/FooterAdmin';
import useAuth from '../hooks/useAuth';
import Breadcrumb from '../components/Breadcrumb';

const AdminLayout = ({ children }) => {
   const { isAuthenticated, isAdmin } = useAuth();

   if (!isAuthenticated || !isAdmin) {
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