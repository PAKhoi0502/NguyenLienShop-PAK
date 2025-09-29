import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { getProductCategoryStats } from '../../services/dashboardService';
import './ProductCategoryDashboard.scss';

const ProductCategoryDashboard = () => {
   // State để lưu stats thực từ API
   const [stats, setStats] = useState({
      products: { total: 0, active: 0 },
      categories: { total: 0, active: 0 },
      summary: { totalItems: 0, activeItems: 0 }
   });
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   // Fetch stats từ API
   useEffect(() => {
      const fetchStats = async () => {
         try {
            setLoading(true);
            const result = await getProductCategoryStats();

            if (result.errCode === 0) {
               setStats(result.data);
               setError(null);
            } else {
               setError(result.errMessage || 'Không thể lấy dữ liệu thống kê');
            }
         } catch (err) {
            console.error('Error fetching stats:', err);
            setError('Lỗi kết nối server');
         } finally {
            setLoading(false);
         }
      };

      fetchStats();
   }, []);

   const productManagementOptions = [
      {
         id: 'product-management',
         titleId: 'dashboard.dashboard_product_category.product_management.title',
         title: 'Quản lý sản phẩm',
         descriptionId: 'dashboard.dashboard_product_category.product_management.description',
         description: 'Tạo, chỉnh sửa và quản lý thông tin sản phẩm',
         icon: 'package',
         link: '/admin/product-category-management/product-management',
         color: 'green',
         stats: { total: stats.products.total, active: stats.products.active }
      },
      {
         id: 'category-management',
         titleId: 'dashboard.dashboard_product_category.category_management.title',
         title: 'Quản lý danh mục sản phẩm',
         descriptionId: 'dashboard.dashboard_product_category.category_management.description',
         description: 'Tạo, chỉnh sửa và quản lý danh mục sản phẩm',
         icon: 'folder',
         link: '/admin/product-category-management/category-management',
         color: 'orange',
         stats: { total: stats.categories.total, active: stats.categories.active }
      }
   ];

   const renderIcon = (iconName) => {
      const icons = {
         package: (
            <svg className="option-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
         ),
         folder: (
            <svg className="option-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
         )
      };
      return icons[iconName] || icons.package;
   };

   return (
      <div className="product-dashboard">
         {error && (
            <div className="error-message" style={{
               backgroundColor: '#fee',
               color: '#c33',
               padding: '10px',
               marginBottom: '20px',
               borderRadius: '4px',
               border: '1px solid #fcc'
            }}>
               ⚠️ {error}
            </div>
         )}

         <div className="product-dashboard__header">
            <div className="header-content">
               <h1 className="product-dashboard__title">
                  <FormattedMessage id="dashboard.dashboard_product_category.title" defaultMessage="Quản lý sản phẩm & danh mục" />
               </h1>
               <p className="product-dashboard__subtitle">
                  <FormattedMessage id="dashboard.dashboard_product_category.subtitle" defaultMessage="Quản lý toàn bộ sản phẩm và danh mục sản phẩm của hệ thống" />
               </p>
            </div>
            <div className="header-stats">
               <div className="quick-stat">
                  <span className="quick-stat__number">
                     {loading ? '...' : stats.summary.totalItems}
                  </span>
                  <span className="quick-stat__label">
                     <FormattedMessage id="dashboard.dashboard_product_category.total_items" defaultMessage="Tổng sản phẩm và danh mục" />
                  </span>
               </div>
            </div>
         </div>

         <div className="product-dashboard__content">
            {productManagementOptions.map(option => (
               <Link key={option.id} to={option.link} className="option-card">
                  <div className={`option-card__container option-card--${option.color}`}>
                     <div className="option-card__header">
                        <div className="option-card__icon-wrapper">
                           {renderIcon(option.icon)}
                        </div>
                        <div className="option-card__stats">
                           <div className="stat-item">
                              <span className="stat-number">{option.stats.total}</span>
                              <span className="stat-label">
                                 <FormattedMessage id="dashboard.dashboard_product_category.stats.total" defaultMessage="Tổng" />
                              </span>
                           </div>
                           <div className="stat-item">
                              <span className="stat-number">{option.stats.active}</span>
                              <span className="stat-label">
                                 <FormattedMessage id="dashboard.dashboard_product_category.stats.active" defaultMessage="Hoạt động" />
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="option-card__content">
                        <h3 className="option-card__title">
                           <FormattedMessage id={option.titleId} defaultMessage={option.title} />
                        </h3>
                        <p className="option-card__description">
                           <FormattedMessage id={option.descriptionId} defaultMessage={option.description} />
                        </p>
                     </div>

                     <div className="option-card__action">
                        <span className="action-text">
                           <FormattedMessage id="dashboard.dashboard_product_category.action.manage" defaultMessage="Quản lý" />
                        </span>
                        <svg className="action-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                     </div>
                  </div>
               </Link>
            ))}
         </div>
      </div>
   );
};

export default ProductCategoryDashboard;
