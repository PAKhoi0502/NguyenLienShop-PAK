import React, { useState, useEffect } from 'react';
import { getUsers, updateUser } from '../../../services/adminService';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FormattedMessage, useIntl } from 'react-intl';
import Swal from 'sweetalert2';
import CustomToast from '../../../components/CustomToast';
import './UserUpdate.scss';

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
            showToast("error", intl.formatMessage({ id: "body_admin.account_management.user_manager.update_user.error.not_found" }));
            navigate('/admin/account-management/user-management');
         }
      };
      fetchUser();
   }, [id, intl, navigate]);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value });
   };

   const validate = () => {
      if (!id) return intl.formatMessage({ id: "body_admin.account_management.user_manager.update_user.error.missing_id" });

      // Validate userName
      if (!form.userName || form.userName.trim().length === 0) {
         return intl.formatMessage({ id: "body_admin.account_management.user_manager.update_user.error.username_required", defaultMessage: "Biệt danh là bắt buộc." });
      }

      if (form.userName.trim().length <= 6) {
         return intl.formatMessage({ id: "body_admin.account_management.user_manager.update_user.error.username_too_short", defaultMessage: "Biệt danh phải có ít nhất 6 ký tự." });
      }

      // Check for special characters (only allow letters, numbers, underscore, hyphen)
      const specialCharRegex = /[^a-zA-Z0-9_-]/;
      if (specialCharRegex.test(form.userName.trim())) {
         return intl.formatMessage({ id: "body_admin.account_management.user_manager.update_user.error.username_special_chars", defaultMessage: "Biệt danh không được chứa ký tự đặc biệt." });
      }

      return '';
   };

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === "success" ? "body_admin.account_management.user_manager.update_user.success_title" : "body_admin.account_management.user_manager.update_user.error_title"}
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

      // Step 1: Initial Confirmation
      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.confirm_title_1', defaultMessage: 'Xác nhận cập nhật người dùng' }),
         html: `<strong>${form.userName || intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.no_username', defaultMessage: 'Không có tên người dùng' })}</strong><br>ID: ${id}`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.confirm_button_1', defaultMessage: 'Tiếp tục' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmFirst.isConfirmed) return;

      // Step 2: Secondary Confirmation
      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.confirm_title_2', defaultMessage: 'Bạn chắc chắn muốn cập nhật?' }),
         text: intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.confirm_text_2', defaultMessage: 'Thông tin người dùng sẽ được thay đổi!' }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.confirm_button_2', defaultMessage: 'Cập nhật' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmSecond.isConfirmed) return;

      // Step 3: Text confirmation - Type exact phrase
      const confirmText = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.security_title', defaultMessage: 'Xác nhận bảo mật' }),
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: #ef4444; font-weight: 600;">
                  ${intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.security_warning', defaultMessage: 'Cảnh báo: Hành động này sẽ cập nhật thông tin người dùng!' })}
               </p>
               <p style="margin-bottom: 10px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.security_confirm_text', defaultMessage: 'Người dùng cần cập nhật' })}: <strong style="color: #dc2626;">${form.userName || intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.no_username', defaultMessage: 'Không có tên người dùng' })}</strong>
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.security_type_exact', defaultMessage: 'Nhập chính xác cụm từ' })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">${intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.security_phrase', defaultMessage: 'CẬP NHẬT NGƯỜI DÙNG' })}</code>
               </p>
            </div>
         `,
         input: 'text',
         inputPlaceholder: intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.security_placeholder', defaultMessage: 'Nhập cụm từ xác nhận...' }),
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.security_continue', defaultMessage: 'Tiếp tục cập nhật' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.cancel_button', defaultMessage: 'Hủy' }),
         inputValidator: (value) => {
            const expectedPhrase = intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.security_phrase', defaultMessage: 'CẬP NHẬT NGƯỜI DÙNG' });
            if (value !== expectedPhrase) {
               return intl.formatMessage({ id: 'body_admin.account_management.user_manager.update_user.security_error', defaultMessage: 'Cụm từ không chính xác. Vui lòng nhập đúng cụm từ được yêu cầu.' });
            }
         },
         customClass: {
            popup: 'swal-update-step3',
            input: 'swal-text-input'
         }
      });

      if (!confirmText.isConfirmed) return;

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
            showToast("error", intl.formatMessage({ id: "body_admin.account_management.user_manager.update_user.error.no_response" }));
            return;
         }
         if (res.errCode === 0) {
            showToast("success", intl.formatMessage({ id: "body_admin.account_management.user_manager.update_user.success" }));
            setTimeout(() => {
               navigate('/admin/account-management/user-management');
            }, 1200);
         } else {
            showToast("error", res.errMessage || intl.formatMessage({ id: "body_admin.account_management.user_manager.update_user.error.default" }));
         }
      } catch (error) {
         console.error('Edit error:', error);
         showToast("error", error.errMessage || intl.formatMessage({ id: "body_admin.account_management.user_manager.update_user.error.default" }));
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="user-create-container">
         <h2 className="user-create-title">
            <FormattedMessage id="body_admin.account_management.user_manager.update_user.title" defaultMessage="Chỉnh sửa người dùng" />
         </h2>
         <form className="user-create-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
               <label><FormattedMessage id="body_admin.account_management.user_manager.update_user.username" defaultMessage="Biệt danh" /></label>
               <input
                  type="text"
                  name="userName"
                  value={form.userName}
                  onChange={handleChange}
                  placeholder={intl.formatMessage({ id: "body_admin.account_management.user_manager.update_user.placeholder.username", defaultMessage: "Nhập biệt danh (trên 6 ký tự, không ký tự đặc biệt)" })}
                  disabled={loading}
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="body_admin.account_management.user_manager.update_user.fullname" defaultMessage="Họ tên đầy đủ" /></label>
               <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder={intl.formatMessage({ id: "body_admin.account_management.user_manager.update_user.placeholder.fullname", defaultMessage: "Nhập họ tên đầy đủ" })}
                  disabled={loading}
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="body_admin.account_management.user_manager.update_user.birthday" defaultMessage="Ngày sinh" /></label>
               <input
                  type="date"
                  name="birthday"
                  value={form.birthday || ''}
                  onChange={handleChange}
                  disabled={loading}
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="body_admin.account_management.user_manager.update_user.gender" defaultMessage="Giới tính" /></label>
               <select name="gender" value={form.gender} onChange={handleChange} disabled={loading}>
                  <option value="">{intl.formatMessage({ id: "body_admin.account_management.user_manager.update_user.select_gender", defaultMessage: "-- Chọn giới tính --" })}</option>
                  <option value="M"><FormattedMessage id="body_admin.account_management.user_manager.gender_user.male" defaultMessage="Nam" /></option>
                  <option value="F"><FormattedMessage id="body_admin.account_management.user_manager.gender_user.female" defaultMessage="Nữ" /></option>
                  <option value="O"><FormattedMessage id="body_admin.account_management.user_manager.gender_user.other" defaultMessage="Khác" /></option>
               </select>
            </div>

            <div className="form-actions">
               <button type="submit" className="btn-submit" disabled={loading}>
                  {loading
                     ? <FormattedMessage id="body_admin.account_management.user_manager.update_user.saving" defaultMessage="Đang cập nhật..." />
                     : <FormattedMessage id="body_admin.account_management.user_manager.update_user.save" defaultMessage="Lưu thay đổi" />}
               </button>
               <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate(-1)}
                  disabled={loading}
               >
                  <FormattedMessage id="body_admin.account_management.user_manager.update_user.cancel" defaultMessage="Hủy" />
               </button>
            </div>
         </form>
      </div>
   );
};

export default UserUpdate;
