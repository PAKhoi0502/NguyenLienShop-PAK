import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { getAccountCountStats } from '../../services/dashboardService';
import './AccountDashboard.scss';

const AccountDashboard = () => {

   const [accountStats, setAccountStats] = useState({
      totalAdmins: 0,
      totalUsers: 0,
      totalAccounts: 0
   });
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchAccountStats = async () => {
         try {
            setLoading(true);
            const result = await getAccountCountStats();

            if (result.errCode === 0) {
               setAccountStats(result.data);
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
      fetchAccountStats();
   }, []);

   const accountManagementOptions = [
      {
         id: 'admin-management',
         titleId: 'dashboard.account_dashboard.admin_management',
         title: 'Quản lý tài khoản quản trị viên',
         descriptionId: 'dashboard.account_dashboard.admin_description',
         description: 'Tạo, chỉnh sửa và quản lý tài khoản admin',
         icon: 'shield',
         link: '/admin/account-management/admin-management',
         color: 'blue',
         stats: { total: accountStats.totalAdmins, active: accountStats.totalAdmins }
      },
      {
         id: 'user-management',
         titleId: 'dashboard.account_dashboard.user_management',
         title: 'Quản lý tài khoản người dùng',
         descriptionId: 'dashboard.account_dashboard.user_description',
         description: 'Tạo, chỉnh sửa và quản lý tài khoản người dùng',
         icon: 'users',
         link: '/admin/account-management/user-management',
         color: 'blue',
         stats: { total: accountStats.totalUsers, active: accountStats.totalUsers }
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

   if (loading) {
      return (
         <div className="account-dashboard__loading">
            <p>Đang tải dữ liệu...</p>
         </div>
      );
   }

   return (
      <div className="account-dashboard">
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
                  <span className="quick-stat__number">{accountStats.totalAccounts || (accountStats.totalAdmins + accountStats.totalUsers)}</span>
                  <span className="quick-stat__label"><FormattedMessage id="dashboard.account_dashboard.total_accounts" defaultMessage="Tổng tài khoản" /></span>
               </div>
            </div>

         </div>

         <div className="account-dashboard__content">
            {accountManagementOptions.map(option => (
               <Link key={option.id} to={option.link} className="dashboard-card">
                  <div className={`dashboard-card__content`}>

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


                     <div className="dashboard-card__stats">
                        <div className="stat-item">
                           <span className="stat-number">{option.stats.total}</span>
                           <span className="stat-label">
                              <FormattedMessage
                                 id="dashboard.dashboard_product_category.stats.total"
                                 defaultMessage="Tổng"
                              />
                           </span>
                        </div>
                        <div className="stat-item">
                           <span className="stat-number">{option.stats.active}</span>
                           <span className="stat-label">
                              <FormattedMessage
                                 id="dashboard.dashboard_product_category.stats.active"
                                 defaultMessage="Hoạt động"
                              />
                           </span>
                        </div>
                     </div>

                     <div className="dashboard-card__action">
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

export default AccountDashboard;
