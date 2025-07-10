import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as actions from "../../store/actions";
import Navigator from '../Navigator';
import './Footer.scss';

class Footer extends Component {

   render() {
      const { processLogout } = this.props;

      return (
         <div className="footer-container">
            Hello, this is the footer section.
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
