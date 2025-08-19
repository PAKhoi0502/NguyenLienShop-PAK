// src/pages/admin/HomepageDashboard.js

import React from 'react';
import { Link } from 'react-router-dom';

const HomepageDashboard = () => {
   return (
      <div className="homepageDashboard-container">
         <h1 className="homepageDashboard-title">Quản lý giao diện trang chủ</h1>
         <div className="homepageDashboard-actions">
            <Link to="/admin/homepage-management/banner-management">
               <button className="homepageDashboard-btn">Quản lý banner</button>
            </Link>
         </div>
      </div>
   );
};

export default HomepageDashboard;
