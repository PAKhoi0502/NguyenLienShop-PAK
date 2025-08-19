// src/pages/admin/Dashboard.js

import React from 'react';
import { Link } from 'react-router-dom';

const ProductCategoryDashboard = () => {
   return (
      <div className="dashboard-container">
         <h1 className="dashboard-title">Product Dashboard</h1>
         <div className="dashboard-actions">
            <Link to="/admin/product-category-management/product-management">
               <button className="dashboard-btn">Quản lý sản phẩm</button>
            </Link>
            <Link to="/admin/product-category-management/category-management">
               <button className="dashboard-btn">Quản lý danh mục sản phẩm</button>
            </Link>
         </div>
      </div>
   );
};

export default ProductCategoryDashboard;
