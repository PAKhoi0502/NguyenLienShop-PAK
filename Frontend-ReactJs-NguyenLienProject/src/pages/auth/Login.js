import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from "connected-react-router";
import * as actions from "../../store/actions";
import './Login.scss';
import { withRouter } from 'react-router-dom';
import { login } from '../../services/authService';

class Login extends Component {
   state = {
      identifier: '',
      password: '',
      error: '',
      showPassword: false,
      rememberMe: false,
   }

   componentDidMount() {
      this.loadRememberedInfo();
   }

   // ✅ Hàm riêng: đọc dữ liệu từ localStorage
   loadRememberedInfo = () => {
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      const savedIdentifier = localStorage.getItem('savedIdentifier') || '';

      if (rememberMe && savedIdentifier) {
         this.setState({
            identifier: savedIdentifier,
            rememberMe: true,
         });
      }
   }

   // ✅ Hàm riêng: xử lý lưu hoặc xoá Remember Me
   handleRememberMe = () => {
      const { rememberMe, identifier } = this.state;

      if (rememberMe) {
         localStorage.setItem('rememberMe', 'true');
         localStorage.setItem('savedIdentifier', identifier);
      } else {
         localStorage.removeItem('rememberMe');
         localStorage.removeItem('savedIdentifier');
      }
   }

   handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      this.setState({
         [name]: type === 'checkbox' ? checked : value,
         error: ''
      });
   };

   handleLogin = async () => {
      const { identifier, password } = this.state;
      const { location } = this.props;

      if (!identifier || !password) {
         return this.setState({ error: "Vui lòng nhập đầy đủ thông tin" });
      }

      const response = await login({ identifier, password });
      const { errCode, errMessage, token, data: user } = response;

      if (!token) {
         return this.setState({ error: 'Không nhận được token từ server' });
      }

      if (errCode !== 0) {
         return this.setState({ error: errMessage || 'Đăng nhập thất bại!' });
      }

      localStorage.setItem('token', token);
      localStorage.setItem('roleId', user.roleId);

      this.handleRememberMe(); // ✅ gọi hàm riêng để lưu thông tin

      this.props.adminLoginSuccess(user);

      const params = new URLSearchParams(location.search);
      const redirectPath = params.get('redirect') || '/';
      this.props.navigate(redirectPath);
   };

   render() {
      const { identifier, password, error } = this.state;

      return (
         <div className="login-page">
            <div className="login-box">
               <h2>Chào mừng bạn</h2>
               <p className="subtitle">Đăng nhập để tiếp tục</p>

               <input
                  type="text"
                  name="identifier"
                  placeholder="Số điện thoại"
                  value={identifier}
                  onChange={this.handleChange}
               />

               <div className="password-wrapper">
                  <input
                     type={this.state.showPassword ? 'text' : 'password'}
                     name="password"
                     placeholder="Mật khẩu"
                     value={password}
                     onChange={this.handleChange}
                  />
                  <span
                     className="toggle-password"
                     onClick={() => this.setState({ showPassword: !this.state.showPassword })}
                  >
                     <i className={`fa-solid ${this.state.showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                  </span>
               </div>

               <div className="remember-me">
                  <input
                     type="checkbox"
                     name="rememberMe"
                     checked={this.state.rememberMe}
                     onChange={this.handleChange}
                     id="rememberMe"
                  />
                  <label htmlFor="rememberMe">Lưu mật khẩu</label>
               </div>

               {error && <div className="error">{error}</div>}

               <button className="btn-login" onClick={this.handleLogin}>Đăng nhập</button>

               <div className="login-options">
                  <a href="/forgot-password">Quên mật khẩu?</a>
                  <a href="/register">Đăng ký tài khoản</a>
               </div>

               <div className="divider">Hoặc đăng nhập bằng</div>

               <div className="social-login">
                  <button className="btn-social fb">Facebook</button>
                  <button className="btn-social gg">Gmail</button>
               </div>
            </div>
         </div>
      );
   }
}

const mapStateToProps = state => ({
   lang: state.app.language
});

const mapDispatchToProps = dispatch => ({
   navigate: (path) => dispatch(push(path)),
   adminLoginSuccess: (adminInfo) => dispatch(actions.adminLoginSuccess(adminInfo)),
   adminLoginFail: () => dispatch(actions.adminLoginFail()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));
