import React, { useState } from 'react';
import { createAdmin } from '../../../services/adminService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomToast from '../../../components/CustomToast';
import './AdminCreate.scss';

const initialForm = {
   phoneNumber: '',
   password: '',
   confirmPassword: '',
};

const AdminCreate = () => {
   const [form, setForm] = useState(initialForm);
   const [loading, setLoading] = useState(false);

   const navigate = useNavigate();

   const handleChange = (e) => {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value });
   };

   const validate = () => {
      if (!form.phoneNumber.trim()) return "Vui lòng nhập số điện thoại.";
      if (!/^0\d{9,10}$/.test(form.phoneNumber.trim())) return "Số điện thoại không hợp lệ.";
      if (!form.password || form.password.length < 6) return "Mật khẩu tối thiểu 6 ký tự.";
      if (!form.confirmPassword) return "Vui lòng nhập lại mật khẩu.";
      if (form.password !== form.confirmPassword) return "Mật khẩu xác nhận không khớp.";
      return '';
   };

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === "success" ? "user.create_success_title" : "user.create_error_title"}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      const errMsg = validate();
      if (errMsg) {
         showToast("error", errMsg);
         return;
      }
      setLoading(true);

      const submitData = {
         phoneNumber: form.phoneNumber.trim(),
         password: form.password,
      };

      const res = await createAdmin(submitData);

      setLoading(false);

      if (!res) {
         showToast("error", "Không nhận được phản hồi từ server!");
         return;
      }
      if (res.errCode === 0) {
         showToast("success", "Tạo tài khoản quản trị viên thành công!");
         setTimeout(() => {
            navigate('/admin/users-manager');
         }, 1200);
      } else if (
         res.errCode === 1 &&
         res.errMessage &&
         (
            res.errMessage.toLowerCase().includes('tồn tại') ||
            res.errMessage.toLowerCase().includes('exist')
         ) &&
         (
            res.errMessage.toLowerCase().includes('số điện thoại') ||
            res.errMessage.toLowerCase().includes('phone')
         )
      ) {
         showToast("error", "Số điện thoại đã tồn tại!");
      } else if (
         res.errMessage &&
         (
            res.errMessage.toLowerCase().includes('missing required fields')
            || res.errMessage.toLowerCase().includes('thiếu')
         )
      ) {
         showToast("error", "Bạn chưa nhập đủ thông tin.");
      } else {
         showToast("error", res.errMessage || 'Tạo tài khoản thất bại.');
      }
   };

   return (
      <div className="user-create-container">
         <h2 className="user-create-title">Tạo tài khoản Quản trị viên</h2>
         <form className="user-create-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
               <label>Số điện thoại *</label>
               <input
                  type="text"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  disabled={loading}
               />
            </div>
            <div className="form-group">
               <label>Mật khẩu *</label>
               <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  autoComplete="new-password"
                  disabled={loading}
               />
            </div>
            <div className="form-group">
               <label>Xác nhận mật khẩu *</label>
               <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  autoComplete="new-password"
                  disabled={loading}
               />
            </div>

            <div className="form-actions">
               <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
               </button>
               <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate('/admin/users-manager')}
                  disabled={loading}
               >
                  Hủy
               </button>
            </div>
         </form>
      </div>
   );
};

export default AdminCreate;
