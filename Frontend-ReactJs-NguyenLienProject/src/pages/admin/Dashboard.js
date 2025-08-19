// src/pages/admin/Dashboard.js

import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
   return (
      <div className="dashboard-container">
         <h1 className="dashboard-title">Admin Dashboard</h1>
         <div className="dashboard-actions">
            <Link to="/admin/account-management">
               <button className="dashboard-btn">Quản lý tài khoản</button>
            </Link>
            <Link to="/admin/product-category-management">
               <button className="dashboard-btn">Quản lý sản phẩm và danh mục sản phẩm</button>
            </Link>
            <Link to="/admin/homepage-management">
               <button className="dashboard-btn">Quản lý trang chủ</button>
            </Link>
         </div>
      </div>
   );
};

export default Dashboard;
