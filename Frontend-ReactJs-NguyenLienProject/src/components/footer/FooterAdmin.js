import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import * as actions from "../../store/actions";
import './FooterAdmin.scss';
import { dashboardService } from '../../services';

class Footer extends Component {
   constructor(props) {
      super(props);
      this.state = {
         dashboardStats: {
            totalUsers: 0,
            totalProducts: 0,
            totalBanners: 0,
            totalOrders: 0
         },
         accountStats: {
            totalAdmins: 0,
            totalCustomers: 0,
            activeUsers: 0,
            inactiveUsers: 0
         },
         isLoadingDashboardStats: false,
         isLoadingAccountStats: false
      };
   }

   componentDidMount() {
      // Load stats based on statsType
      if (this.props.statsType === 'account') {
         this.loadAccountStats();
      } else if (this.props.statsType === 'dashboard') {
         this.loadDashboardStats();
      }
   }

   componentDidUpdate(prevProps) {
      // Load stats when statsType changes
      if (this.props.statsType !== prevProps.statsType) {
         if (this.props.statsType === 'account') {
            this.loadAccountStats();
         } else if (this.props.statsType === 'dashboard') {
            this.loadDashboardStats();
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

         const response = await dashboardService.getAccountStats();

         if (response.errCode === 0) {
            this.setState({
               accountStats: response.data,
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
                  value: finalStats.totalBanners || 0,
                  labelId: "footer_admin.dashboard.total_banners",
                  defaultMessage: "Tổng banner"
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
                  labelId: "footer_admin.account.total_admins",
                  defaultMessage: "Tổng Admin"
               },
               {
                  value: accountStats.totalCustomers || 0,
                  labelId: "footer_admin.account.total_customers",
                  defaultMessage: "Tổng Customer"
               },
               {
                  value: accountStats.activeUsers || 0,
                  labelId: "footer_admin.account.active_users",
                  defaultMessage: "Người dùng hoạt động"
               },
               {
                  value: accountStats.inactiveUsers || 0,
                  labelId: "footer_admin.account.inactive_users",
                  defaultMessage: "Người dùng không hoạt động"
               }
            ]
         };
      }

      // Default fallback
      return {
         stats: [
            { value: 0, labelId: "footer_admin.default.total_users", defaultMessage: "Tổng người dùng" },
            { value: 0, labelId: "footer_admin.default.total_products", defaultMessage: "Tổng sản phẩm" },
            { value: 0, labelId: "footer_admin.default.total_banners", defaultMessage: "Tổng banner" },
            { value: 0, labelId: "footer_admin.default.total_orders", defaultMessage: "Tổng đơn hàng" }
         ]
      };
   }

   render() {
      const { stats } = this.getStatsData();
      const { isLoadingDashboardStats, isLoadingAccountStats } = this.state;
      const { statsType } = this.props;

      const showLoading = (statsType === 'dashboard' && isLoadingDashboardStats) ||
         (statsType === 'account' && isLoadingAccountStats) ||
         this.props.isLoading; return (
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
                        <h4>NguyenLien Shop</h4>
                        <p>Hệ thống quản lý thương mại điện tử</p>
                     </div>
                     <div className="footer-section">
                        <h4>Liên hệ</h4>
                        <p>Email: admin@nguyenlienshop.com</p>
                        <p>Phone: (84) 123-456-789</p>
                     </div>
                     <div className="footer-section">
                        <h4>Phiên bản</h4>
                        <p>Admin Panel v2.0.1</p>
                        <p>Cập nhật: {new Date().getFullYear()}</p>
                     </div>
                  </div>

                  <div className="footer-bottom">
                     <p>&copy; {new Date().getFullYear()} NguyenLien Shop. All rights reserved.</p>
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