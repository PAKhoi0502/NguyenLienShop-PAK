import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { getHomepageStats } from '../../services/dashboardService';
import './HomepageDashboard.scss';

const HomepageDashboard = () => {
   const [homepageStats, setHomepageStats] = useState({
      totalBanners: 0,
      activeBanners: 0,
      totalAnnouncements: 0,
      activeAnnouncements: 0,
      inactiveAnnouncements: 0,
      totalVouchers: 0,
      activeVouchers: 0
   });
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      fetchHomepageStats();
   }, []);

   const fetchHomepageStats = async () => {
      try {
         setLoading(true);
         const response = await getHomepageStats();

         if (response && response.errCode === 0 && response.data) {
            const { totalBanners, activeBanners, totalAnnouncements, activeAnnouncements, inactiveAnnouncements, totalVouchers, activeVouchers } = response.data;
            setHomepageStats({
               totalBanners: totalBanners || 0,
               activeBanners: activeBanners || 0,
               totalAnnouncements: totalAnnouncements || 0,
               activeAnnouncements: activeAnnouncements || 0,
               inactiveAnnouncements: inactiveAnnouncements || 0,
               totalVouchers: totalVouchers || 0,
               activeVouchers: activeVouchers || 0
            });
            setError(null);
         } else {
            console.error('❌ API response error:', response);
            setError(response?.errMessage || 'Không thể lấy thống kê homepage');
         }
      } catch (error) {
         console.error('❌ Error fetching homepage stats:', error);
         setError('Lỗi kết nối server');
      } finally {
         setLoading(false);
      }
   };

   const homepageManagementOptions = [
      {
         id: 'banner-management',
         titleId: 'dashboard.homepage_dashboard.banner_management',
         title: 'Quản lý banner',
         descriptionId: 'dashboard.homepage_dashboard.banner_description',
         description: 'Tạo, chỉnh sửa và quản lý banner hiển thị trên trang chủ',
         icon: 'image',
         link: '/admin/homepage-management/banner-management',
         color: 'purple',
         stats: { total: homepageStats.totalBanners, active: homepageStats.activeBanners }
      },
      {
         id: 'announcement-management',
         titleId: 'dashboard.homepage_dashboard.announcement_management',
         title: 'Quản lý thông báo',
         descriptionId: 'dashboard.homepage_dashboard.announcement_description',
         description: 'Tạo, chỉnh sửa và quản lý thông báo hiển thị trên trang chủ',
         icon: 'announcement',
         link: '/admin/homepage-management/announcement-management',
         color: 'gray',
         stats: { total: homepageStats.totalAnnouncements, active: homepageStats.activeAnnouncements }
      },
      {
         id: 'voucher-management',
         titleId: 'dashboard.homepage_dashboard.voucher_management',
         title: 'Quản lý Voucher',
         descriptionId: 'dashboard.homepage_dashboard.voucher_description',
         description: 'Tạo, chỉnh sửa và quản lý mã giảm giá, voucher khuyến mãi',
         icon: 'voucher',
         link: '/admin/homepage-management/voucher-management',
         color: 'green',
         stats: { total: homepageStats.totalVouchers, active: homepageStats.activeVouchers }
      },
      {
         id: 'homepage-settings',
         titleId: 'dashboard.homepage_dashboard.homepage_settings',
         title: 'Cài đặt trang chủ',
         descriptionId: 'dashboard.homepage_dashboard.homepage_settings_description',
         description: 'Cấu hình các thiết lập chung cho trang chủ',
         icon: 'settings',
         link: '/admin/homepage-management/settings',
         color: 'blue',
         stats: { total: 1, active: 1 }
      }
   ];

   const renderIcon = (iconName) => {
      const icons = {
         image: (
            <svg className="option-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
         ),
         announcement: (
            <svg className="option-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
         ),
         voucher: (
            <svg className="option-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
         ),
         settings: (
            <svg className="option-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
         )
      };
      return icons[iconName] || icons.image;
   };

   return (
      <div className="homepage-dashboard">
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

         <div className="homepage-dashboard__header">
            <div className="header-content">
               <h1 className="homepage-dashboard__title">
                  <FormattedMessage id="dashboard.homepage_dashboard.title" defaultMessage="Quản lý giao diện trang chủ" />
               </h1>
               <p className="homepage-dashboard__subtitle">
                  <FormattedMessage id="dashboard.homepage_dashboard.subtitle" defaultMessage="Quản lý các thành phần giao diện hiển thị trên trang chủ" />
               </p>
            </div>
            <div className="header-stats">
               <div className="quick-stat">
                  <span className="quick-stat__number">
                     {loading ? '...' : homepageStats.totalBanners}
                  </span>
                  <span className="quick-stat__label">
                     <FormattedMessage id="dashboard.homepage_dashboard.total_banners" defaultMessage="Tổng banner" />
                  </span>
               </div>
               <div className="quick-stat">
                  <span className="quick-stat__number">
                     {loading ? '...' : homepageStats.totalAnnouncements}
                  </span>
                  <span className="quick-stat__label">
                     <FormattedMessage id="dashboard.homepage_dashboard.total_announcements" defaultMessage="Tổng thông báo" />
                  </span>
               </div>
               <div className="quick-stat">
                  <span className="quick-stat__number">
                     {loading ? '...' : homepageStats.totalVouchers}
                  </span>
                  <span className="quick-stat__label">
                     <FormattedMessage id="dashboard.homepage_dashboard.total_vouchers" defaultMessage="Tổng voucher" />
                  </span>
               </div>
            </div>
         </div>

         <div className="homepage-dashboard__content">
            {homepageManagementOptions.map(option => (
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
                                 <FormattedMessage id="dashboard.homepage_dashboard.stats.total" defaultMessage="Tổng" />
                              </span>
                           </div>
                           <div className="stat-item">
                              <span className="stat-number">{option.stats.active}</span>
                              <span className="stat-label">
                                 <FormattedMessage id="dashboard.homepage_dashboard.stats.active" defaultMessage="Hoạt động" />
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
                           <FormattedMessage id="dashboard.homepage_dashboard.action.manage" defaultMessage="Quản lý" />
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

export default HomepageDashboard;
