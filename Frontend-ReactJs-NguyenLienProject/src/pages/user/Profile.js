import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from "connected-react-router";

import * as actions from "../../store/actions";
import './Profile.scss';

import { FormattedMessage } from 'react-intl';

class Profile extends Component {
   // constructor(props) {
   //    super(props);
   // }


   render() {
      return (
         <div>Profile</div>
      )
   }
}

const mapStateToProps = state => {
   return {
      lang: state.app.language
   };
};

const mapDispatchToProps = dispatch => {
   return {
      navigate: (path) => dispatch(push(path)),
      adminLoginSuccess: (adminInfo) => dispatch(actions.adminLoginSuccess(adminInfo)),
      adminLoginFail: () => dispatch(actions.adminLoginFail()),
   };
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
