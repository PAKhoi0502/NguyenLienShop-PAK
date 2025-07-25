import React, { useState } from 'react';
import { useIntl } from 'react-intl';
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
   const intl = useIntl();

   const handleChange = (e) => {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value });
   };

   const validate = () => {
      if (!form.phoneNumber.trim()) return intl.formatMessage({ id: 'admin.validation.phone_required' });
      if (!/^0\d{9,10}$/.test(form.phoneNumber.trim())) return intl.formatMessage({ id: 'admin.validation.phone_invalid' });
      if (!form.password || form.password.length < 6) return intl.formatMessage({ id: 'admin.validation.password_short' });
      if (!form.confirmPassword) return intl.formatMessage({ id: 'admin.validation.confirm_required' });
      if (form.password !== form.confirmPassword) return intl.formatMessage({ id: 'admin.validation.password_mismatch' });
      return '';
   };

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === "success" ? "admin.create_success_title" : "admin.create_error_title"}
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
         roleId: 1,
      };

      try {
         const res = await createAdmin(submitData);

         if (!res) {
            showToast("error", intl.formatMessage({ id: 'admin.error.no_response' }));
            return;
         }

         if (res.errCode === 0) {
            showToast("success", intl.formatMessage({ id: 'admin.create_success_message' }));
            setTimeout(() => {
               navigate('/admin/account-management/admin-management');
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
            showToast("error", intl.formatMessage({ id: 'admin.error.phone_exists' }));
         } else if (
            res.errMessage &&
            (
               res.errMessage.toLowerCase().includes('missing required fields') ||
               res.errMessage.toLowerCase().includes('thiếu')
            )
         ) {
            showToast("error", intl.formatMessage({ id: 'admin.error.incomplete_info' }));
         } else {
            showToast("error", res.errMessage || intl.formatMessage({ id: 'admin.create_error_message' }));
         }
      } catch (error) {
         console.error('Create error:', error);
         showToast("error", error.errMessage || intl.formatMessage({ id: 'admin.create_error_message' }));
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="user-create-container">
         <h2 className="user-create-title">{intl.formatMessage({ id: 'admin.create_title' })}</h2>
         <form className="user-create-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
               <label>{intl.formatMessage({ id: 'admin.label.phone' })} *</label>
               <input
                  type="text"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder={intl.formatMessage({ id: 'admin.placeholder.phone' })}
                  disabled={loading}
               />
            </div>
            <div className="form-group">
               <label>{intl.formatMessage({ id: 'admin.label.password' })} *</label>
               <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={intl.formatMessage({ id: 'admin.placeholder.password' })}
                  autoComplete="new-password"
                  disabled={loading}
               />
            </div>
            <div className="form-group">
               <label>{intl.formatMessage({ id: 'admin.label.confirm_password' })} *</label>
               <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder={intl.formatMessage({ id: 'admin.placeholder.confirm_password' })}
                  autoComplete="new-password"
                  disabled={loading}
               />
            </div>

            <div className="form-actions">
               <button type="submit" className="btn-submit" disabled={loading}>
                  {loading
                     ? intl.formatMessage({ id: 'admin.creating' })
                     : intl.formatMessage({ id: 'admin.create_button' })}
               </button>
               <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate('/admin/account-management/admin-management')}
                  disabled={loading}
               >
                  {intl.formatMessage({ id: 'admin.cancel' })}
               </button>
            </div>
         </form>
      </div>
   );
};

export default AdminCreate;
