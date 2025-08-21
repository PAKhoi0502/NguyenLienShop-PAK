import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import * as actions from "../../store/actions";
import Navigator from '../Navigator';
import './FooterAdmin.scss';

class Footer extends Component {

   render() {
      return (
         <div className="footer-container">
            <div className="footer-stats">
               <div className="stats-grid">
                  <div className="stat-card">
                     <div className="stat-card__value">24</div>
                     <div className="stat-card__label">
                        <FormattedMessage id="dashboard.total_users" defaultMessage="Tổng người dùng" />
                     </div>
                  </div>
                  <div className="stat-card">
                     <div className="stat-card__value">156</div>
                     <div className="stat-card__label">
                        <FormattedMessage id="dashboard.total_products" defaultMessage="Tổng sản phẩm" />
                     </div>
                  </div>
                  <div className="stat-card">
                     <div className="stat-card__value">8</div>
                     <div className="stat-card__label">
                        <FormattedMessage id="dashboard.active_banners" defaultMessage="Banner đang hoạt động" />
                     </div>
                  </div>
                  <div className="stat-card">
                     <div className="stat-card__value">42</div>
                     <div className="stat-card__label">
                        <FormattedMessage id="dashboard.total_orders" defaultMessage="Đơn hàng hôm nay" />
                     </div>
                  </div>
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
