import React, { useState, useEffect } from 'react';
import { getAdmins, updateAdmin } from '../../../services/adminService';
import { useNavigate, useParams } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
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

      // Step 1: Initial Confirmation
      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.confirm_title_1', defaultMessage: 'Xác nhận cập nhật quản trị viên' }),
         html: `<strong>${form.userName || intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.no_username', defaultMessage: 'Không có tên quản trị viên' })}</strong><br>ID: ${id}`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.confirm_button_1', defaultMessage: 'Tiếp tục' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmFirst.isConfirmed) return;

      // Step 2: Secondary Confirmation
      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.confirm_title_2', defaultMessage: 'Bạn chắc chắn muốn cập nhật?' }),
         text: intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.confirm_text_2', defaultMessage: 'Thông tin quản trị viên sẽ được thay đổi!' }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.confirm_button_2', defaultMessage: 'Cập nhật' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmSecond.isConfirmed) return;

      // Step 3: Text confirmation - Type exact phrase
      const confirmText = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.security_title', defaultMessage: 'Xác nhận bảo mật' }),
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: #ef4444; font-weight: 600;">
                  ${intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.security_warning', defaultMessage: 'Cảnh báo: Hành động này sẽ cập nhật thông tin quản trị viên!' })}
               </p>
               <p style="margin-bottom: 10px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.security_confirm_text', defaultMessage: 'Quản trị viên cần cập nhật' })}: <strong style="color: #dc2626;">${form.userName || intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.no_username', defaultMessage: 'Không có tên quản trị viên' })}</strong>
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.security_type_exact', defaultMessage: 'Nhập chính xác cụm từ' })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">${intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.security_phrase', defaultMessage: 'CẬP NHẬT QUẢN TRỊ VIÊN' })}</code>
               </p>
            </div>
         `,
         input: 'text',
         inputPlaceholder: intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.security_placeholder', defaultMessage: 'Nhập cụm từ xác nhận...' }),
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.security_continue', defaultMessage: 'Tiếp tục cập nhật' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.cancel_button', defaultMessage: 'Hủy' }),
         inputValidator: (value) => {
            const expectedPhrase = intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.security_phrase', defaultMessage: 'CẬP NHẬT QUẢN TRỊ VIÊN' });
            if (value !== expectedPhrase) {
               return intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.security_error', defaultMessage: 'Cụm từ không chính xác. Vui lòng nhập đúng cụm từ được yêu cầu.' });
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

            <div className="action-buttons">
               <button type="submit" className="btn-action btn-submit" disabled={loading}>
                  <span className='btn-text'>
                     {loading
                        ? <FormattedMessage id="body_admin.account_management.admin_manager.update_admin.updating" defaultMessage="Đang cập nhật..." />
                        : <FormattedMessage id="body_admin.account_management.admin_manager.update_admin.submit" defaultMessage="Lưu thay đổi" />}
                  </span>
                  <span className='btn-icon-submit'>
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                     </svg>
                  </span>
               </button>
               <button
                  type="button"
                  className="btn-action btn-cancel"
                  onClick={() => navigate(-1)}
                  disabled={loading}
               >
                  <span className='btn-text'>
                     {intl.formatMessage({ id: 'body_admin.account_management.admin_manager.update_admin.cancel' })}
                  </span>
                  <span className='btn-icon-cancel'>
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                     </svg>
                  </span>
               </button>
            </div>
         </form>
      </div>
   );
};

export default AdminUpdate;
