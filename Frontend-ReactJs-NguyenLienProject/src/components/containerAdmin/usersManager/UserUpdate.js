import React, { useState, useEffect } from 'react';
import { getUsers, updateUser } from '../../../services/adminService';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FormattedMessage, useIntl } from 'react-intl';
import CustomToast from '../../../components/CustomToast';

const UserUpdate = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const intl = useIntl();
   const [form, setForm] = useState({
      userName: '',
      fullName: '',
      birthday: '',
      gender: ''
   });
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      const fetchUser = async () => {
         const res = await getUsers(id);
         const user = Array.isArray(res?.users) ? res.users[0] : res?.users;

         if (user?.id) {
            setForm({
               userName: user.userName || '',
               fullName: user.fullName || '',
               birthday: user.birthday || '',
               gender: user.gender || ''
            });
         } else {
            showToast("error", intl.formatMessage({ id: "user.update.error.not_found" }));
            navigate('/admin/account-management/user-management');
         }
      };
      fetchUser();
   }, [id]);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value });
   };

   const validate = () => {
      if (!id) return intl.formatMessage({ id: "user.update.error.missing_id" });
      return '';
   };

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === "success" ? "user.update_success_title" : "user.update_error_title"}
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
         gender: form.gender
      };

      try {
         const res = await updateUser(submitData);
         if (!res) {
            showToast("error", intl.formatMessage({ id: "user.update.error.no_response" }));
            return;
         }
         if (res.errCode === 0) {
            showToast("success", intl.formatMessage({ id: "user.update.success" }));
            setTimeout(() => {
               navigate('/admin/account-management/user-management');
            }, 1200);
         } else {
            showToast("error", res.errMessage || intl.formatMessage({ id: "user.update.error.default" }));
         }
      } catch (error) {
         console.error('Edit error:', error);
         showToast("error", error.errMessage || intl.formatMessage({ id: "user.update.error.default" }));
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="user-create-container">
         <h2 className="user-create-title">
            <FormattedMessage id="user.update.title" defaultMessage="Chỉnh sửa người dùng" />
         </h2>
         <form className="user-create-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
               <label><FormattedMessage id="user.update.username" defaultMessage="Biệt danh" /></label>
               <input
                  type="text"
                  name="userName"
                  value={form.userName}
                  onChange={handleChange}
                  placeholder={intl.formatMessage({ id: "user.update.placeholder.username", defaultMessage: "Nhập biệt danh" })}
                  disabled={loading}
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="user.update.fullname" defaultMessage="Họ tên đầy đủ" /></label>
               <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder={intl.formatMessage({ id: "user.update.placeholder.fullname", defaultMessage: "Nhập họ tên đầy đủ" })}
                  disabled={loading}
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="user.update.birthday" defaultMessage="Ngày sinh" /></label>
               <input
                  type="date"
                  name="birthday"
                  value={form.birthday || ''}
                  onChange={handleChange}
                  disabled={loading}
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="user.update.gender" defaultMessage="Giới tính" /></label>
               <select name="gender" value={form.gender} onChange={handleChange} disabled={loading}>
                  <option value="">{intl.formatMessage({ id: "user.update.select_gender", defaultMessage: "-- Chọn giới tính --" })}</option>
                  <option value="M"><FormattedMessage id="gender.male" defaultMessage="Nam" /></option>
                  <option value="F"><FormattedMessage id="gender.female" defaultMessage="Nữ" /></option>
                  <option value="O"><FormattedMessage id="gender.other" defaultMessage="Khác" /></option>
               </select>
            </div>

            <div className="form-actions">
               <button type="submit" className="btn-submit" disabled={loading}>
                  {loading
                     ? <FormattedMessage id="user.update.saving" defaultMessage="Đang cập nhật..." />
                     : <FormattedMessage id="user.update.save" defaultMessage="Lưu thay đổi" />}
               </button>
               <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate('/admin/account-management/user-management')}
                  disabled={loading}
               >
                  <FormattedMessage id="user.update.cancel" defaultMessage="Hủy" />
               </button>
            </div>
         </form>
      </div>
   );
};

export default UserUpdate;
