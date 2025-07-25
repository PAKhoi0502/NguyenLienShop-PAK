import React, { useState } from 'react';
import { createUser } from '../../../services/adminService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomToast from '../../../components/CustomToast';
import { useIntl, FormattedMessage } from 'react-intl';
import './UserCreate.scss';

const initialForm = {
   phoneNumber: '',
   password: '',
   confirmPassword: '',
};

const UserCreate = () => {
   const [form, setForm] = useState(initialForm);
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();
   const intl = useIntl();

   const handleChange = (e) => {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value });
   };

   const validate = () => {
      if (!form.phoneNumber.trim()) return intl.formatMessage({ id: 'user.create.validate.phone_required' });
      if (!/^0\d{9,10}$/.test(form.phoneNumber.trim())) return intl.formatMessage({ id: 'user.create.validate.phone_invalid' });
      if (!form.password || form.password.length < 6) return intl.formatMessage({ id: 'user.create.validate.password_short' });
      if (!form.confirmPassword) return intl.formatMessage({ id: 'user.create.validate.confirm_required' });
      if (form.password !== form.confirmPassword) return intl.formatMessage({ id: 'user.create.validate.password_mismatch' });
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
         roleId: 2,
      };
      try {
         const res = await createUser(submitData);

         if (!res) {
            showToast("error", intl.formatMessage({ id: 'user.create.error.no_response' }));
            return;
         }
         if (res.errCode === 0) {
            showToast("success", intl.formatMessage({ id: 'user.create.success_message' }));
            setTimeout(() => {
               navigate('/admin/account-management/user-management');
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
            showToast("error", intl.formatMessage({ id: 'user.create.error.phone_exists' }));
         } else if (
            res.errMessage &&
            (
               res.errMessage.toLowerCase().includes('missing required fields') ||
               res.errMessage.toLowerCase().includes('thiếu')
            )
         ) {
            showToast("error", intl.formatMessage({ id: 'user.create.error.incomplete' }));
         } else {
            showToast("error", res.errMessage || intl.formatMessage({ id: 'user.create.error.generic' }));
         }
      } catch (error) {
         console.error('Create error:', error);
         showToast("error", error.errMessage || intl.formatMessage({ id: 'user.create.error.generic' }));
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="user-create-container">
         <h2 className="user-create-title">
            <FormattedMessage id="user.create.title" defaultMessage="Tạo tài khoản người dùng" />
         </h2>
         <form className="user-create-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
               <label><FormattedMessage id="user.create.phone" /></label>
               <input
                  type="text"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder={intl.formatMessage({ id: 'user.create.phone_placeholder' })}
                  disabled={loading}
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="user.create.password" /></label>
               <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={intl.formatMessage({ id: 'user.create.password_placeholder' })}
                  autoComplete="new-password"
                  disabled={loading}
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="user.create.confirm_password" /></label>
               <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder={intl.formatMessage({ id: 'user.create.confirm_password_placeholder' })}
                  autoComplete="new-password"
                  disabled={loading}
               />
            </div>

            <div className="form-actions">
               <button type="submit" className="btn-submit" disabled={loading}>
                  {loading
                     ? intl.formatMessage({ id: 'user.create.creating' })
                     : intl.formatMessage({ id: 'user.create.submit' })}
               </button>
               <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate('/admin/account-management/user-management')}
                  disabled={loading}
               >
                  <FormattedMessage id="user.create.cancel" defaultMessage="Hủy" />
               </button>
            </div>
         </form>
      </div>
   );
};

export default UserCreate;
