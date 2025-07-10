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
         console.log("Missing login details:", { identifier, password });
         return this.setState({ error: "Vui lòng nhập đầy đủ thông tin" });
      }

      console.log("Attempting login with identifier:", identifier);

      // Gửi yêu cầu login đến API
      const res = await login({ identifier, password });
      console.log("Response from login API:", res);

      // Kiểm tra cấu trúc phản hồi API
      const { errCode, errMessage, token, data: user } = res;

      console.log("Token from API:", token);  // Kiểm tra token

      if (!token) {
         console.log("Token không có trong phản hồi API");
         return this.setState({ error: 'Không nhận được token từ server' });
      }

      // Kiểm tra nếu có lỗi trong quá trình đăng nhập
      if (errCode !== 0) {
         console.log("Login failed with error code:", errCode);
         console.log("Error message from API:", errMessage);
         return this.setState({ error: errMessage || 'Đăng nhập thất bại!' });
      }

      // Nếu đăng nhập thành công, lưu token và roleId vào localStorage
      console.log("Login successful, storing token...");
      localStorage.setItem('token', token);  // Lưu token vào localStorage
      localStorage.setItem('roleId', user.roleId);  // Lưu roleId vào localStorage

      console.log("Token stored in localStorage:", localStorage.getItem('token'));

      // Dispatch hành động login thành công
      this.props.adminLoginSuccess(user);

      // Xử lý chuyển hướng sau khi đăng nhập
      const params = new URLSearchParams(location.search);
      const redirectPath = params.get('redirect') || '/';
      console.log("Redirecting to:", redirectPath);

      this.props.navigate(redirectPath);  // Chuyển hướng người dùng
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
