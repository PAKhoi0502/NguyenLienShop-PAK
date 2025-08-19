import React from 'react';
import { Navigate } from 'react-router-dom';
import HeaderAdmin from '../components/header/HeaderAdmin';
import FooterAdmin from '../components/footer/FooterAdmin';
import useAuth from '../hooks/useAuth';
import Breadcrumb from '../components/Breadcrumb';

const AdminLayout = ({ children }) => {
   const { isAuthenticated } = useAuth();

   // ✅ Check both token and roleId from localStorage for more reliable auth check
   const token = localStorage.getItem('token');
   const storedRoleId = localStorage.getItem('roleId');

   if (!isAuthenticated || !token || storedRoleId !== '1') {
      console.log('AdminLayout: Unauthorized access', { isAuthenticated, token: !!token, roleId: storedRoleId });
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