import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import * as actions from "../../store/actions";
import './FooterAdmin.scss';
import { dashboardService, adminService } from '../../services';
import { getAnnouncementCount } from '../../services/announcementService';

class Footer extends Component {
   constructor(props) {
      super(props);
      this.state = {
         dashboardStats: {
            totalUsers: 0,
            totalProducts: 0,
            totalOrders: 0
         },
         accountStats: {
            totalAdmins: 0,
            totalUsers: 0,
            totalAccounts: 0,
            activeUsers: 0,
            inactiveUsers: 0
         },
         productStats: {
            totalCategories: 0,
            totalProducts: 0
         },
         homepageStats: {
            totalBanners: 0,
            activeBanners: 0,
            inactiveBanners: 0,
            totalAnnouncements: 0
         },
         announcementStats: {
            totalAnnouncements: 0,
            activeAnnouncements: 0,
            inactiveAnnouncements: 0
         },
         isLoadingProductStats: false,
         isLoadingDashboardStats: false,
         isLoadingAccountStats: false,
         isLoadingHomepageStats: false,
         isLoadingAnnouncementStats: false
      };
   }

   componentDidMount() {
      // Load stats based on statsType
      if (this.props.statsType === 'account') {
         this.loadAccountStats();
      } else if (this.props.statsType === 'dashboard') {
         this.loadDashboardStats();
      } else if (this.props.statsType === 'product') {
         this.loadProductStats();
      } else if (this.props.statsType === 'homepage') {
         this.loadHomepageStats();
      } else if (this.props.statsType === 'banner') {
         this.loadHomepageStats();
      } else if (this.props.statsType === 'announcement') {
         this.loadAnnouncementStats();
      } else if (this.props.statsType === 'admin') {
         this.loadAccountStats();
      } else if (this.props.statsType === 'user') {
         this.loadAccountStats();
      }
   }

   componentDidUpdate(prevProps) {
      // Load stats when statsType changes
      if (this.props.statsType !== prevProps.statsType) {
         if (this.props.statsType === 'account') {
            this.loadAccountStats();
         } else if (this.props.statsType === 'dashboard') {
            this.loadDashboardStats();
         } else if (this.props.statsType === 'product') {
            this.loadProductStats();
         } else if (this.props.statsType === 'homepage') {
            this.loadHomepageStats();
         } else if (this.props.statsType === 'banner') {
            this.loadHomepageStats();
         } else if (this.props.statsType === 'announcement') {
            this.loadAnnouncementStats();
         } else if (this.props.statsType === 'admin') {
            this.loadAccountStats();
         } else if (this.props.statsType === 'user') {
            this.loadAccountStats();
         }
      }
   }

   loadDashboardStats = async () => {
      try {
         this.setState({ isLoadingDashboardStats: true });

         const response = await dashboardService.getDashboardStats();

         if (response.errCode === 0) {
            this.setState({
               dashboardStats: response.data,
               isLoadingDashboardStats: false
            });
         } else {
            console.error('Error loading dashboard stats:', response.errMessage);
            this.setState({ isLoadingDashboardStats: false });
         }
      } catch (error) {
         console.error('Error loading dashboard stats:', error);
         this.setState({ isLoadingDashboardStats: false });
      }
   }

   loadAccountStats = async () => {
      try {
         this.setState({ isLoadingAccountStats: true });

         const response = await dashboardService.getAccountCountStats();

         if (response.errCode === 0) {
            this.setState({
               accountStats: {
                  totalAdmins: response.data.totalAdmins || 0,
                  totalUsers: response.data.totalUsers || 0,
                  totalAccounts: response.data.totalAccounts || 0,
                  activeUsers: 1, // Giữ số mẫu
                  inactiveUsers: 1  // Giữ số mẫu
               },
               isLoadingAccountStats: false
            });
         } else {
            console.error('Error loading account stats:', response.errMessage);
            this.setState({ isLoadingAccountStats: false });
         }
      } catch (error) {
         console.error('Error loading account stats:', error);
         this.setState({ isLoadingAccountStats: false });
      }
   }

   loadProductStats = async () => {
      try {
         this.setState({ isLoadingProductStats: true });

         const response = await dashboardService.getProductCategoryStats();

         if (response.errCode === 0) {
            // Backend trả về dữ liệu dưới dạng: data.products.total và data.categories.total
            const stats = {
               totalCategories: response.data?.categories?.total || 0,
               totalProducts: response.data?.products?.total || 0
            };

            this.setState({
               productStats: stats,
               isLoadingProductStats: false
            });
         } else {
            console.error('Error loading product stats:', response.errMessage);
            this.setState({ isLoadingProductStats: false });
         }
      } catch (error) {
         console.error('Error loading product stats:', error);
         this.setState({ isLoadingProductStats: false });
      }
   }

   loadHomepageStats = async () => {
      try {
         this.setState({ isLoadingHomepageStats: true });

         const response = await dashboardService.getHomepageStats();

         if (response.errCode === 0) {
            this.setState({
               homepageStats: {
                  totalBanners: response.data?.totalBanners || 0,
                  activeBanners: response.data?.activeBanners || 0,
                  inactiveBanners: response.data?.inactiveBanners || 0,
                  totalAnnouncements: response.data?.totalAnnouncements || 0
               },
               isLoadingHomepageStats: false
            });
         } else {
            console.error('Error loading homepage stats:', response.errMessage);
            this.setState({ isLoadingHomepageStats: false });
         }
      } catch (error) {
         console.error('Error loading homepage stats:', error);
         this.setState({ isLoadingHomepageStats: false });
      }
   }

   loadAnnouncementStats = async () => {
      try {
         this.setState({ isLoadingAnnouncementStats: true });

         // Lấy tổng số announcement
         const countResponse = await getAnnouncementCount();

         // Lấy homepage stats để có active/inactive announcements
         const homepageResponse = await dashboardService.getHomepageStats();

         if (countResponse.errCode === 0 && homepageResponse.errCode === 0) {
            const totalAnnouncements = countResponse.count || 0;
            const activeAnnouncements = homepageResponse.data?.activeAnnouncements || 0;
            const inactiveAnnouncements = totalAnnouncements - activeAnnouncements;

            this.setState({
               announcementStats: {
                  totalAnnouncements,
                  activeAnnouncements,
                  inactiveAnnouncements
               },
               isLoadingAnnouncementStats: false
            });
         } else {
            console.error('Error loading announcement stats');
            this.setState({ isLoadingAnnouncementStats: false });
         }
      } catch (error) {
         console.error('Error loading announcement stats:', error);
         this.setState({ isLoadingAnnouncementStats: false });
      }
   }

   getStatsData = () => {
      const { statsType, statsData } = this.props;

      if (statsType === 'dashboard') {
         // Use data from state (loaded via API) or fallback to props
         const { dashboardStats } = this.state;
         const finalStats = statsData || dashboardStats;

         return {
            stats: [
               {
                  value: finalStats.totalUsers || 0,
                  labelId: "footer_admin.dashboard.total_users",
                  defaultMessage: "Tổng người dùng"
               },
               {
                  value: finalStats.totalProducts || 0,
                  labelId: "footer_admin.dashboard.total_products",
                  defaultMessage: "Tổng sản phẩm"
               },
               {
                  value: finalStats.totalOrders || 0,
                  labelId: "footer_admin.dashboard.total_orders",
                  defaultMessage: "Tổng đơn hàng"
               }
            ]
         };
      } else if (statsType === 'account') {
         const { accountStats } = this.state;
         return {
            stats: [
               {
                  value: accountStats.totalAdmins || 0,
                  labelId: "footer_admin.dashboard.account_dashboard.total_admins",
                  defaultMessage: "Tổng Admin"
               },
               {
                  value: accountStats.totalUsers || 0,
                  labelId: "footer_admin.dashboard.account_dashboard.total_users",
                  defaultMessage: "Tổng User"
               },
               {
                  value: accountStats.activeUsers || 0,
                  labelId: "footer_admin.dashboard.account_dashboard.active_users",
                  defaultMessage: "Người dùng đang hoạt động"
               },
               {
                  value: accountStats.totalAccounts || 0,
                  labelId: "footer_admin.dashboard.account_dashboard.total_accounts",
                  defaultMessage: "Tổng tài khoản"
               }
            ]
         };
      } else if (statsType === 'product') {
         // Use data from state (loaded via API) or fallback to props
         const { productStats } = this.state;
         const finalStats = statsData || productStats;

         return {
            stats: [
               {
                  value: finalStats.totalCategories || 0,
                  labelId: "footer_admin.dashboard.product_category_dashboard.total_categories",
                  defaultMessage: "Tổng danh mục"
               },
               {
                  value: finalStats.totalProducts || 0,
                  labelId: "footer_admin.dashboard.product_category_dashboard.total_products",
                  defaultMessage: "Tổng sản phẩm"
               }
            ]
         };
      } else if (statsType === 'homepage') {
         // Use data from state (loaded via API) or fallback to props
         const { homepageStats } = this.state;
         const finalStats = statsData || homepageStats;

         return {
            stats: [
               {
                  value: finalStats.totalBanners || 0,
                  labelId: "footer_admin.dashboard.homepage_dashboard.total_banners",
                  defaultMessage: "Tổng banner"
               },
               {
                  value: finalStats.totalAnnouncements || 0,
                  labelId: "footer_admin.dashboard.homepage_dashboard.total_announcements",
                  defaultMessage: "Tổng thông báo"
               }
            ]
         };
      } else if (statsType === 'banner') {
         // Use data from state (loaded via API) or fallback to props
         const { homepageStats } = this.state;
         const finalStats = statsData || homepageStats;

         return {
            stats: [
               {
                  value: finalStats.totalBanners || 0,
                  labelId: "footer_admin.dashboard.banner_dashboard.total_banners",
                  defaultMessage: "Tổng banner"
               },
               {
                  value: finalStats.activeBanners || 0,
                  labelId: "footer_admin.dashboard.banner_dashboard.active_banners",
                  defaultMessage: "Banner hoạt động"
               },
               {
                  value: finalStats.inactiveBanners || 0,
                  labelId: "footer_admin.dashboard.banner_dashboard.inactive_banners",
                  defaultMessage: "Banner không hoạt động"
               }
            ]
         };
      } else if (statsType === 'admin') {
         // Admin management stats: chỉ hiển thị Tổng quản trị viên và Người dùng hoạt động
         const { accountStats } = this.state;
         return {
            stats: [
               {
                  value: accountStats.totalAdmins || 0,
                  labelId: "footer_admin.dashboard.admin_dashboard.total_admins",
                  defaultMessage: "Tổng quản trị viên"
               },
               {
                  value: accountStats.activeUsers || 0,
                  labelId: "footer_admin.dashboard.admin_dashboard.active_users",
                  defaultMessage: "Người dùng đang hoạt động"
               }
            ]
         };
      } else if (statsType === 'user') {
         // User management stats: chỉ hiển thị Tổng người dùng và Người dùng hoạt động
         const { accountStats } = this.state;
         return {
            stats: [
               {
                  value: accountStats.totalUsers || 0,
                  labelId: "footer_admin.dashboard.user_dashboard.total_users",
                  defaultMessage: "Tổng người dùng"
               },
               {
                  value: accountStats.activeUsers || 0,
                  labelId: "footer_admin.dashboard.user_dashboard.active_users",
                  defaultMessage: "Người dùng hoạt động"
               }
            ]
         };
      } else if (statsType === 'announcement') {
         // Announcement management stats: Tổng thông báo, đang hoạt động, không hoạt động
         const { announcementStats } = this.state;
         return {
            stats: [
               {
                  value: announcementStats.totalAnnouncements || 0,
                  labelId: "footer_admin.dashboard.announcement_dashboard.total_announcements",
                  defaultMessage: "Tổng thông báo"
               },
               {
                  value: announcementStats.activeAnnouncements || 0,
                  labelId: "footer_admin.dashboard.announcement_dashboard.active_announcements",
                  defaultMessage: "Đang hoạt động"
               },
               {
                  value: announcementStats.inactiveAnnouncements || 0,
                  labelId: "footer_admin.dashboard.announcement_dashboard.inactive_announcements",
                  defaultMessage: "Không hoạt động"
               }
            ]
         };
      }

      // Default fallback
      return {
         stats: [
            { value: 0, labelId: "footer_admin.default.total_users", defaultMessage: "Tổng người dùng" },
            { value: 0, labelId: "footer_admin.default.total_products", defaultMessage: "Tổng sản phẩm" },
            { value: 0, labelId: "footer_admin.default.total_orders", defaultMessage: "Tổng đơn hàng" }
         ]
      };
   }

   render() {
      const { stats } = this.getStatsData();
      const { isLoadingDashboardStats, isLoadingAccountStats, isLoadingProductStats, isLoadingHomepageStats, isLoadingAnnouncementStats } = this.state;
      const { statsType } = this.props;

      const showLoading = (statsType === 'dashboard' && isLoadingDashboardStats) ||
         (statsType === 'account' && isLoadingAccountStats) ||
         (statsType === 'product' && isLoadingProductStats) ||
         (statsType === 'homepage' && isLoadingHomepageStats) ||
         (statsType === 'banner' && isLoadingHomepageStats) ||
         (statsType === 'announcement' && isLoadingAnnouncementStats) ||
         (statsType === 'admin' && isLoadingAccountStats) ||
         (statsType === 'user' && isLoadingAccountStats) ||
         this.props.isLoading;

      return (
         <div className="footer-container">
            <div className="footer-stats">
               <div className="stats-grid">
                  {stats.map((stat, index) => (
                     <div className="stat-card" key={index}>
                        <div className="stat-card__value">
                           {showLoading ? (
                              <span style={{ color: '#999' }}>Loading...</span>
                           ) : (
                              stat.value.toLocaleString()
                           )}
                        </div>
                        <div className="stat-card__label">
                           <FormattedMessage
                              id={stat.labelId}
                              defaultMessage={stat.defaultMessage}
                           />
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="footer-info">
               <div className="footer-content">
                  <div className="footer-section">
                     <h4><FormattedMessage id="footer_admin.footer_section.title" defaultMessage="NguyenLien Shop" /></h4>
                     <p><FormattedMessage id="footer_admin.footer_section.description" defaultMessage="Hệ thống quản lý thương mại điện tử" /></p>
                  </div>
                  <div className="footer-section">
                     <h4><FormattedMessage id="footer_admin.footer_section.contact.title" defaultMessage="Liên hệ" /></h4>
                     <p><FormattedMessage id="footer_admin.footer_section.contact.email" defaultMessage="Email: admin@nguyenlienshop.com" /></p>
                     <p><FormattedMessage id="footer_admin.footer_section.contact.phone" defaultMessage="Phone: (84) 123-456-789" /></p>
                  </div>
                  <div className="footer-section">
                     <h4><FormattedMessage id="footer_admin.footer_section.version.title" defaultMessage="Phiên bản" /></h4>
                     <p><FormattedMessage id="footer_admin.footer_section.version.version" defaultMessage="Admin Panel v2.0.1" /></p>
                     <p><FormattedMessage id="footer_admin.footer_section.version.update" defaultMessage="Cập nhật: {new Date().getFullYear()}" /></p>
                  </div>
               </div>

               <div className="footer-bottom">
                  <p><FormattedMessage id="footer_admin.footer_bottom" defaultMessage="&copy; {new Date().getFullYear()} NguyenLien Shop. All rights reserved." /></p>
               </div>
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
      processLogout: () => dispatch(actions.processLogout()),
   };
};

export default connect(mapStateToProps, mapDispatchToProps)(Footer);