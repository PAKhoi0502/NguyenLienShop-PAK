import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import './ProductCategoryDashboard.scss';

const ProductCategoryDashboard = () => {
   const productManagementOptions = [
      {
         id: 'product-management',
         titleId: 'product.product_management',
         title: 'Quản lý sản phẩm',
         descriptionId: 'product.product_description',
         description: 'Tạo, chỉnh sửa và quản lý thông tin sản phẩm',
         icon: 'package',
         link: '/admin/product-category-management/product-management',
         color: 'green',
         stats: { total: 156, active: 142 }
      },
      {
         id: 'category-management',
         titleId: 'product.category_management',
         title: 'Quản lý danh mục sản phẩm',
         descriptionId: 'product.category_description',
         description: 'Tạo, chỉnh sửa và quản lý danh mục sản phẩm',
         icon: 'folder',
         link: '/admin/product-category-management/category-management',
         color: 'orange',
         stats: { total: 28, active: 26 }
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
         <div className="product-dashboard__header">
            <div className="header-content">
               <h1 className="product-dashboard__title">
                  <FormattedMessage id="product.dashboard.title" defaultMessage="Quản lý sản phẩm & danh mục" />
               </h1>
               <p className="product-dashboard__subtitle">
                  <FormattedMessage id="product.dashboard.subtitle" defaultMessage="Quản lý toàn bộ sản phẩm và danh mục sản phẩm của hệ thống" />
               </p>
            </div>
            <div className="header-stats">
               <div className="quick-stat">
                  <span className="quick-stat__number">184</span>
                  <span className="quick-stat__label">Tổng items</span>
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
                              <span className="stat-label">Tổng</span>
                           </div>
                           <div className="stat-item">
                              <span className="stat-number">{option.stats.active}</span>
                              <span className="stat-label">Hoạt động</span>
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
                        <span className="action-text">Quản lý</span>
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
