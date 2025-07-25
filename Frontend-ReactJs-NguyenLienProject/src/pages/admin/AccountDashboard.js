// src/pages/admin/AccountDashboard.js

import React from 'react';
import { Link } from 'react-router-dom';
import './AccountDashboard.scss';

const AccountDashboard = () => {
   return (
      <div className="accountDashboard-container">
         <h1 className="accountDashboard-title">Quản lý tài khoản</h1>
         <div className="accountDashboard-actions">
            <Link to="/admin/account-management/admin-management">
               <button className="accountDashboard-btn">Quản lý tài khoản quản trị viên</button>
            </Link>
            <Link to="/admin/account-management/user-management">
               <button className="accountDashboard-btn">Quản lý tài khoản người dùng</button>
            </Link>
         </div>
      </div>
   );
};

export default AccountDashboard;
