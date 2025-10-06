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
   const [age, setAge] = useState(null);

   // Calculate age from birthday
   const calculateAge = (birthday) => {
      if (!birthday) return null;
      const today = new Date();
      const birthDate = new Date(birthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
         age--;
      }
      return age;
   };

   // Format birthday for display
   const formatBirthdayDisplay = (birthday) => {
      if (!birthday) return '';
      const date = new Date(birthday);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return intl.locale === 'vi'
         ? `${day}/${month}/${year}`
         : `${month}/${day}/${year}`;
   };

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

            // Calculate initial age if birthday exists
            if (admin.birthday) {
               setAge(calculateAge(admin.birthday));
            }
         } else {
            showToast("error", intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.not_found' }));
            navigate('/admin/account-management/admin-management');
         }
      };
      fetchAdmin();
   }, [id, intl, navigate]);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value });

      // Calculate age when birthday changes
      if (name === 'birthday') {
         setAge(calculateAge(value));
      }
   };

   const validate = () => {
      if (!id) return intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.missing_id' });

      // Validate userName
      if (!form.userName || form.userName.trim().length === 0) {
         return intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.error.username_required', defaultMessage: 'Biệt danh là bắt buộc.' });
      }

      if (form.userName.trim().length <= 6) {
         return intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.error.username_too_short', defaultMessage: 'Biệt danh phải có ít nhất 6 ký tự.' });
      }

      // Check for special characters (only allow letters, numbers, underscore, hyphen)
      const specialCharRegex = /[^a-zA-Z0-9_-]/;
      if (specialCharRegex.test(form.userName.trim())) {
         return intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.error.username_special_chars', defaultMessage: 'Biệt danh không được chứa ký tự đặc biệt.' });
      }

      return '';
   };

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === "success" ? "body_admin.account_management.admin_manager.update_success_title" : "body_admin.account_management.admin_manager.update_error_title"}
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
            showToast("error", intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.no_response' }));
            return;
         }
         if (res.errCode === 0) {
            showToast("success", intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.success_message' }));
            setTimeout(() => {
               navigate('/admin/account-management/admin-management');
            }, 1200);
         } else {
            showToast("error", res.errMessage || intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.failed' }));
         }
      } catch (error) {
         console.error('Edit error:', error);
         showToast("error", error.errMessage || intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.failed' }));
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="admin-update-container">
         <h2 className="admin-update-title">
            <FormattedMessage id="body_admin.account_management.admin_manager.update_admin.title" defaultMessage="Chỉnh sửa quản trị viên" />
         </h2>
         <form className="admin-update-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
               <label><FormattedMessage id="body_admin.account_management.admin_manager.update_admin.username" defaultMessage="Biệt danh" /></label>
               <input
                  type="text"
                  name="userName"
                  value={form.userName}
                  onChange={handleChange}
                  placeholder={intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.username_placeholder', defaultMessage: 'Nhập biệt danh (trên 6 ký tự, không ký tự đặc biệt)' })}
                  disabled={loading}
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="body_admin.account_management.admin_manager.update_admin.fullname" defaultMessage="Họ tên đầy đủ" /></label>
               <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder={intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.fullname_placeholder' })}
                  disabled={loading}
               />
            </div>
            <div className="form-group birthday-group">
               <label className="birthday-label">
                  <span className="birthday-icon">🎂</span>
                  <FormattedMessage id="body_admin.account_management.admin_manager.update_admin.birthday" defaultMessage="Ngày sinh" />
               </label>
               <div className="birthday-input-container">
                  <input
                     type="date"
                     name="birthday"
                     value={form.birthday || ''}
                     onChange={handleChange}
                     disabled={loading}
                     className="birthday-input"
                     placeholder={intl.formatMessage({
                        id: 'body_admin.account_management.admin_manager.update_admin.birthday_placeholder',
                        defaultMessage: 'Chọn ngày sinh của bạn'
                     })}
                  />
                  {form.birthday && age !== null && (
                     <div className="age-display">
                        <span className="age-icon">🎉</span>
                        <span className="age-text">
                           {age} {intl.formatMessage({
                              id: 'body_admin.account_management.admin_manager.update_admin.years_old',
                              defaultMessage: 'tuổi'
                           })}
                        </span>
                     </div>
                  )}
                  {form.birthday && (
                     <div className="birthday-display">
                        <span className="birthday-formatted">
                           📅 {formatBirthdayDisplay(form.birthday)}
                        </span>
                     </div>
                  )}
               </div>
            </div>
            <div className="form-group">
               <label><FormattedMessage id="body_admin.account_management.admin_manager.update_admin.gender" defaultMessage="Giới tính" /></label>
               <select name="gender" value={form.gender} onChange={handleChange} disabled={loading}>
                  <option value="">{intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.select_gender' })}</option>
                  <option value="M"><FormattedMessage id="body_admin.account_management.admin_manager.gender_admin.male" defaultMessage="Nam" /></option>
                  <option value="F"><FormattedMessage id="body_admin.account_management.admin_manager.gender_admin.female" defaultMessage="Nữ" /></option>
                  <option value="O"><FormattedMessage id="body_admin.account_management.admin_manager.gender_admin.other" defaultMessage="Khác" /></option>
               </select>
            </div>
            <div className="form-group">
               <label><FormattedMessage id="body_admin.account_management.admin_manager.update_admin.role" defaultMessage="Vai trò" /></label>
               <select name="roleId" value={form.roleId} onChange={handleChange} disabled={loading}>
                  <option value="1"><FormattedMessage id="body_admin.account_management.admin_manager.role_admin.admin" defaultMessage="Admin" /></option>
                  <option value="2"><FormattedMessage id="body_admin.account_management.admin_manager.role_admin.user" defaultMessage="Người dùng" /></option>
               </select>
            </div>

            <div className="form-actions">
               <button type="submit" className="btn-submit" disabled={loading}>
                  {loading
                     ? intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.updating' })
                     : intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.submit' })}
               </button>
               <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate(-1)}
                  disabled={loading}
               >
                  <FormattedMessage id="body_admin.account_management.admin_manager.update_admin.cancel" defaultMessage="Hủy" />
               </button>
            </div>
         </form>
      </div>
   );
};

export default AdminUpdate;
