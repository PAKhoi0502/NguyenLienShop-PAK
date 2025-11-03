import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { getAccountCountStats } from '../../services/dashboardService';
import './AccountDashboard.scss';

const AccountDashboard = () => {
   const [accountStats, setAccountStats] = useState({
      totalAdmins: 0,
      totalUsers: 0
   });

   useEffect(() => {
      fetchAccountStats();
   }, []);

   const fetchAccountStats = async () => {
      try {
         // Gọi API mới để lấy số lượng admin và user
         const response = await getAccountCountStats();

         if (response && response.errCode === 0 && response.data) {
            const { totalAdmins, totalUsers } = response.data;

            console.log('� Final Stats:', { totalAdmins, totalUsers });

            setAccountStats({
               totalAdmins: totalAdmins || 0,
               totalUsers: totalUsers || 0
            });
         } else {
            console.error('❌ API response error:', response);
            setAccountStats({
               totalAdmins: 0,
               totalUsers: 0
            });
         }
      } catch (error) {
         console.error('❌ Error fetching account stats:', error);
         // Giữ số liệu mặc định nếu có lỗi
         setAccountStats({
            totalAdmins: 0,
            totalUsers: 0
         });
      }
   };

   const accountManagementOptions = [
      {
         id: 'admin-management',
         titleId: 'dashboard.account_dashboard.admin_management',
         title: 'Quản lý tài khoản quản trị viên',
         descriptionId: 'dashboard.account_dashboard.admin_description',
         description: 'Tạo, chỉnh sửa và quản lý tài khoản admin',
         icon: 'shield',
         link: '/admin/account-management/admin-management',
         color: 'blue'
      },
      {
         id: 'user-management',
         titleId: 'dashboard.account_dashboard.user_management',
         title: 'Quản lý tài khoản người dùng',
         descriptionId: 'dashboard.account_dashboard.user_description',
         description: 'Tạo, chỉnh sửa và quản lý tài khoản người dùng',
         icon: 'users',
         link: '/admin/account-management/user-management',
         color: 'blue'
      }
   ];

   const renderIcon = (iconName) => {
      const icons = {
         shield: (
            <svg className="dashboard-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
         ),
         users: (
            <svg className="dashboard-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
         )
      };
      return icons[iconName] || icons.users;
   };

   return (
      <div className="account-dashboard">
         <div className="account-dashboard__header">
            <div className="header-content">
               <h1 className="account-dashboard__title">
                  <FormattedMessage id="dashboard.account_dashboard.title" defaultMessage="Quản lý tài khoản" />
               </h1>
               <p className="account-dashboard__subtitle">
                  <FormattedMessage id="dashboard.account_dashboard.subtitle" defaultMessage="Quản lý tài khoản quản trị viên và người dùng hệ thống" />
               </p>
            </div>
            <div className="header-stats">
               <div className="quick-stat">
                  <span className="quick-stat__number">{accountStats.totalAdmins + accountStats.totalUsers}</span>
                  <span className="quick-stat__label"><FormattedMessage id="dashboard.account_dashboard.total_accounts" defaultMessage="Tổng tài khoản" /></span>
               </div>
            </div>
         </div>

         <div className="account-dashboard__content">
            {accountManagementOptions.map(option => (
               <Link key={option.id} to={option.link} className="dashboard-card">
                  <div className={`dashboard-card__content dashboard-card--${option.color}`}>
                     <div className="dashboard-card__header">
                        <div className="dashboard-card__icon-wrapper">
                           {renderIcon(option.icon)}
                        </div>
                        <h3 className="dashboard-card__title">
                           <FormattedMessage id={option.titleId} defaultMessage={option.title} />
                        </h3>
                     </div>
                     <p className="dashboard-card__description">
                        <FormattedMessage id={option.descriptionId} defaultMessage={option.description} />
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
};

export default AccountDashboard;
