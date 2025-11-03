import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import './Dashboard.scss';

class Dashboard extends Component {

   render() {
      const dashboardCards = [
         {
            id: 'account',
            titleId: 'dashboard.account_management',
            title: '1.Quản lý tài khoản',
            descriptionId: 'dashboard.account_description',
            description: 'Quản lý người dùng và quản trị viên',
            icon: 'users',
            link: '/admin/account-management',
            color: 'blue'
         },
         {
            id: 'product',
            titleId: 'dashboard.product_management',
            title: '2.Quản lý sản phẩm',
            descriptionId: 'dashboard.product_description',
            description: 'Quản lý sản phẩm và danh mục',
            icon: 'package',
            link: '/admin/product-category-management',
            color: 'green'
         },
         {
            id: 'homepage',
            titleId: 'dashboard.homepage_management',
            title: '3.Quản lý trang chủ',
            descriptionId: 'dashboard.homepage_description',
            description: 'Quản lý banner và nội dung trang chủ',
            icon: 'home',
            link: '/admin/homepage-management',
            color: 'purple'
         }
      ];

      const renderIcon = (iconName) => {
         const icons = {
            users: (
               <svg className="dashboard-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
               </svg>
            ),
            package: (
               <svg className="dashboard-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
               </svg>
            ),
            home: (
               <svg className="dashboard-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
               </svg>
            )
         };
         return icons[iconName] || icons.users;
      };

      return (
         <div className="dashboard">
            <div className="dashboard__header">
               <h1 className="dashboard__title">
                  <FormattedMessage id="dashboard.title" defaultMessage="Admin Dashboard" />
               </h1>
               <p className="dashboard__subtitle">
                  <FormattedMessage id="dashboard.subtitle" defaultMessage="Chào mừng bạn đến với bảng điều khiển quản trị" />
               </p>
            </div>

            <div className="dashboard__grid">
               {dashboardCards.map(card => (
                  <Link key={card.id} to={card.link} className="dashboard-card">
                     <div className={`dashboard-card__content dashboard-card--${card.color}`}>
                        <div className="dashboard-card__header">
                           <div className="dashboard-card__icon-wrapper">
                              {renderIcon(card.icon)}
                           </div>
                           <h3 className="dashboard-card__title">
                              <FormattedMessage id={card.titleId} defaultMessage={card.title} />
                           </h3>
                        </div>
                        <p className="dashboard-card__description">
                           <FormattedMessage id={card.descriptionId} defaultMessage={card.description} />
                        </p>
                        <div className="dashboard-card__arrow">
                           <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                           </svg>
                        </div>
                     </div>
                  </Link>
               ))}
            </div>
         </div>
      );
   }
}

const mapStateToProps = state => {
   return {
      isLoggedIn: state.admin.isLoggedIn
   };
};

const mapDispatchToProps = dispatch => {
   return {
      // Thêm các action cần thiết nếu có
   };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);