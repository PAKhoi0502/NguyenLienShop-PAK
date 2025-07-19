// src/pages/admin/Dashboard.js

import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.scss';

const Dashboard = () => {
   return (
      <div className="dashboard-container">
         <h1 className="dashboard-title">Admin Dashboard</h1>
         <div className="dashboard-actions">
            <Link to="/admin/admins-manager">
               <button className="dashboard-btn">Quản lý tài khoản quản trị viên</button>
            </Link>
            <Link to="/admin/users-manager">
               <button className="dashboard-btn">Quản lý tài khoản người dùng</button>
            </Link>
            {/* Thêm nút khác như sau: */}
            <Link to="/admin/products-manager">
               <button className="dashboard-btn">Quản lý sản phẩm</button>
            </Link>
            {/* Thêm các nút quản lý khác ở đây */}
         </div>
      </div>
   );
};

export default Dashboard;
