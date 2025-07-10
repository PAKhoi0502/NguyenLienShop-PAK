import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from '../../axios';
import './Register.scss';
import { push } from "connected-react-router";

class Register extends Component {
   state = {
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      error: '',
      success: '',
      countdown: 3
   };

   handleChange = (e) => {
      this.setState({
         [e.target.name]: e.target.value,
         error: '',
         success: ''
      });
   };

   handleRegister = async () => {
      const phonePattern = /^0\d{9}$/;
      const passwordPattern = /^(?=.*[a-z])(?=.*\d).{6,}$/;
      const { phoneNumber, password, confirmPassword, fullName } = this.state;

      if (!phoneNumber) {
         return this.setState({ error: 'Cần nhập số điện thoại!' });
      }
      if (!phonePattern.test(phoneNumber)) {
         return this.setState({ error: 'Số điện thoại không hợp lệ!' });
      }

      if (!password) {
         return this.setState({ error: 'Cần nhập mật khẩu!' });
      }

      if (!passwordPattern.test(password)) {
         return this.setState({
            error: 'Mật khẩu phải có ít nhất 6 ký tự, gồm ít nhất 1 chữ thường và 1 số!'
         });
      }

      if (!password || !confirmPassword || password !== confirmPassword) {
         return this.setState({ error: 'Mật khẩu không khớp!' });
      }

      try {
         const res = await axios.post('/api/register', {
            phoneNumber,
            password,
            fullName,
            roleId: 2,
         });

         if (res.errCode === 0) {
            this.setState({
               success: 'Đăng ký thành công!',
               error: '',
               countdown: 3
            });

            this.countdownInterval = setInterval(() => {
               this.setState(prevState => {
                  if (prevState.countdown <= 1) {
                     clearInterval(this.countdownInterval);
                     this.props.navigate('/login');
                     return null; // không cần cập nhật state nữa
                  }
                  return { countdown: prevState.countdown - 1 };
               });
            }, 1000);
         }
         else {
            this.setState({ error: res.errMessage || 'Đăng ký thất bại!' });
         }
      } catch (err) {
         this.setState({
            error: err.response?.data?.message || err.errorMessage || 'Lỗi máy chủ. Vui lòng thử lại sau!'
         });
      }



   };
   componentWillUnmount() {
      if (this.countdownInterval) {
         clearInterval(this.countdownInterval);
      }
   }
   render() {
      const { phoneNumber, password, confirmPassword, error, success, countdown } = this.state;

      return (
         <div className="register-page">
            <div className="register-box">
               <h2>Tạo tài khoản</h2>

               <input type="text" name="phoneNumber" placeholder="Số điện thoại" value={phoneNumber} onChange={this.handleChange} />
               <input type="password" name="password" placeholder="Mật khẩu" value={password} onChange={this.handleChange} />
               <input type="password" name="confirmPassword" placeholder="Nhập lại mật khẩu" value={confirmPassword} onChange={this.handleChange} />

               {error && <div className="error">{error}</div>}
               {success && <div className="success">{success}</div>}
               {success && countdown > 0 && (
                  <div className="redirecting">
                     Đang chuyển đến trang đăng nhập trong {countdown} giây...
                  </div>
               )}
               <button className="btn-register" onClick={this.handleRegister}>Đăng ký</button>

               <div className="redirect-login">
                  <p>Đã có tài khoản? <a href="/login">Đăng nhập</a></p>
               </div>
            </div>
         </div>
      );
   }
}

const mapDispatchToProps = dispatch => ({
   navigate: (path) => dispatch(push(path))
});

export default connect(null, mapDispatchToProps)(Register);
