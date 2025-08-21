import React, { useState, useEffect } from 'react';
import { getAdmins, updateAdmin } from '../../../services/adminService';
import { useNavigate, useParams } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import CustomToast from '../../../components/CustomToast';
import './AdminUpdate.scss';

const AdminUpdate = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const intl = useIntl();

   const [form, setForm] = useState({
      userName: '',
      fullName: '',
      birthday: '',
      gender: '',
      roleId: '1'
   });
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      const fetchAdmin = async () => {
         const res = await getAdmins(id);
         const admin = Array.isArray(res?.users) ? res.users[0] : res?.users;

         if (admin?.id) {
            setForm({
               userName: admin.userName || '',
               fullName: admin.fullName || '',
               birthday: admin.birthday || '',
               gender: admin.gender || '',
               roleId: admin.roleId?.toString() || '1'
            });
         } else {
            showToast("error", intl.formatMessage({ id: 'admin.update.not_found' }));
            navigate('/admin/account-management/admin-management');
         }
      };
      fetchAdmin();
   }, [id, intl, navigate]);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value });
   };

   const validate = () => {
      if (!id) return intl.formatMessage({ id: 'admin.update.missing_id' });
      return '';
   };

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === "success" ? "admin.update_success_title" : "admin.update_error_title"}
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
         id,
         userName: form.userName?.trim(),
         fullName: form.fullName?.trim(),
         birthday: form.birthday,
         gender: form.gender,
         roleId: parseInt(form.roleId)
      };

      try {
         const res = await updateAdmin(submitData);

         if (!res) {
            showToast("error", intl.formatMessage({ id: 'admin.update.no_response' }));
            return;
         }
         if (res.errCode === 0) {
            showToast("success", intl.formatMessage({ id: 'admin.update.success_message' }));
            setTimeout(() => {
               navigate('/admin/account-management/admin-management');
            }, 1200);
         } else {
            showToast("error", res.errMessage || intl.formatMessage({ id: 'admin.update.failed' }));
         }
      } catch (error) {
         console.error('Edit error:', error);
         showToast("error", error.errMessage || intl.formatMessage({ id: 'admin.update.failed' }));
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="admin-update-container">
         <h2 className="admin-update-title">
            <FormattedMessage id="admin.update.title" defaultMessage="Chỉnh sửa quản trị viên" />
         </h2>
         <form className="admin-update-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
               <label><FormattedMessage id="admin.update.username" defaultMessage="Biệt danh" /></label>
               <input
                  type="text"
                  name="userName"
                  value={form.userName}
                  onChange={handleChange}
                  placeholder={intl.formatMessage({ id: 'admin.update.username_placeholder' })}
                  disabled={loading}
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="admin.update.fullname" defaultMessage="Họ tên đầy đủ" /></label>
               <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder={intl.formatMessage({ id: 'admin.update.fullname_placeholder' })}
                  disabled={loading}
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="admin.update.birthday" defaultMessage="Ngày sinh" /></label>
               <input
                  type="date"
                  name="birthday"
                  value={form.birthday || ''}
                  onChange={handleChange}
                  disabled={loading}
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="admin.update.gender" defaultMessage="Giới tính" /></label>
               <select name="gender" value={form.gender} onChange={handleChange} disabled={loading}>
                  <option value="">{intl.formatMessage({ id: 'admin.update.select_gender' })}</option>
                  <option value="M"><FormattedMessage id="gender.male" defaultMessage="Nam" /></option>
                  <option value="F"><FormattedMessage id="gender.female" defaultMessage="Nữ" /></option>
                  <option value="O"><FormattedMessage id="gender.other" defaultMessage="Khác" /></option>
               </select>
            </div>
            <div className="form-group">
               <label><FormattedMessage id="admin.update.role" defaultMessage="Vai trò" /></label>
               <select name="roleId" value={form.roleId} onChange={handleChange} disabled={loading}>
                  <option value="1"><FormattedMessage id="role.admin" defaultMessage="Admin" /></option>
                  <option value="2"><FormattedMessage id="role.user" defaultMessage="Người dùng" /></option>
               </select>
            </div>

            <div className="form-actions">
               <button type="submit" className="btn-submit" disabled={loading}>
                  {loading
                     ? intl.formatMessage({ id: 'admin.update.updating' })
                     : intl.formatMessage({ id: 'admin.update.submit' })}
               </button>
               <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate('/admin/account-management/admin-management')}
                  disabled={loading}
               >
                  <FormattedMessage id="admin.update.cancel" defaultMessage="Hủy" />
               </button>
            </div>
         </form>
      </div>
   );
};

export default AdminUpdate;
