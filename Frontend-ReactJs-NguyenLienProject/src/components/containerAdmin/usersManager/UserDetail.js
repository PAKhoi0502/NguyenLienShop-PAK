import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUsers } from '../../../services/adminService';
import { FormattedMessage, useIntl } from 'react-intl';
import UserDelete from './UserDelete';
import './UserDetail.scss';

const UserDetail = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   const intl = useIntl();

   useEffect(() => {
      const fetchUser = async () => {
         const res = await getUsers(id);
         const data = res?.data || res;
         const userData = Array.isArray(data.users) ? data.users[0] : data.users;

         if (userData?.id) {
            setUser(userData);
         } else {
            navigate('/admin/account-management/user-management');
         }
         setLoading(false);
      };
      fetchUser();
   }, [id, navigate]);

   const handleEdit = () => {
      navigate(`/admin/account-management/user-management/user-update/${id}`);
   };

   const handleDeleteSuccess = (userId) => {
      // Navigate back to user management after successful deletion
      navigate('/admin/account-management/user-management');
   };

   if (loading) return (
      <div className="user-detail-loading">
         <FormattedMessage id="body_admin.account_management.user_manager.detail_user.loading" defaultMessage="Đang tải dữ liệu..." />
      </div>
   );
   if (!user) return (
      <div className="user-detail-error">
         <FormattedMessage id="body_admin.account_management.user_manager.detail_user.not_found" defaultMessage="Không tìm thấy người dùng" />
      </div>
   );

   return (
      <div className="user-detail-container">
         <h2 className="user-detail-title">
            <FormattedMessage id="body_admin.account_management.user_manager.detail_user.title" defaultMessage="Thông tin người dùng" />
         </h2>
         <div className="user-detail-content">
            <div><strong>ID:</strong> {user.id}</div>
            <div><strong><FormattedMessage id="body_admin.account_management.user_manager.detail_user.username" defaultMessage="Biệt danh" />:</strong> <span className={user.userName ? "" : "cell-na"}>{user.userName || "N/A"}</span></div>
            <div><strong><FormattedMessage id="body_admin.account_management.user_manager.detail_user.fullname" defaultMessage="Họ tên" />:</strong> <span className={user.fullName ? "" : "cell-na"}>{user.fullName || "N/A"}</span></div>
            <div><strong><FormattedMessage id="body_admin.account_management.user_manager.detail_user.email" defaultMessage="Email" />:</strong> <em><FormattedMessage id="body_admin.account_management.user_manager.detail_user.hidden" defaultMessage="(Ẩn - cập nhật ở trang khác)" /></em></div>
            <div><strong><FormattedMessage id="body_admin.account_management.user_manager.detail_user.phone" defaultMessage="Số điện thoại" />:</strong> <em><FormattedMessage id="body_admin.account_management.user_manager.detail_user.hidden" /></em></div>
            <div><strong><FormattedMessage id="body_admin.account_management.user_manager.detail_user.birthday" defaultMessage="Ngày sinh" />:</strong> <span className={user.birthday ? "" : "cell-na"}>{user.birthday || "N/A"}</span></div>
            <div><strong><FormattedMessage id="body_admin.account_management.user_manager.detail_user.gender" defaultMessage="Giới tính" />:</strong> <span className={user.gender ? "" : "cell-na"}>{
               user.gender === 'M'
                  ? intl.formatMessage({ id: 'body_admin.account_management.user_manager.gender_user.male', defaultMessage: 'Nam' })
                  : user.gender === 'F'
                     ? intl.formatMessage({ id: 'body_admin.account_management.user_manager.gender_user.female', defaultMessage: 'Nữ' })
                     : user.gender === 'O'
                        ? intl.formatMessage({ id: 'body_admin.account_management.user_manager.gender_user.other', defaultMessage: 'Khác' })
                        : "N/A"
            }</span></div>
            <div><strong><FormattedMessage id="body_admin.account_management.user_manager.detail_user.role" defaultMessage="Vai trò" />:</strong> {
               user.roleId === 1
                  ? intl.formatMessage({ id: 'body_admin.account_management.user_manager.role_user.admin', defaultMessage: 'Quản trị viên' })
                  : intl.formatMessage({ id: 'body_admin.account_management.user_manager.role_user.user', defaultMessage: 'Người dùng' })
            }</div>
         </div>

         <div className="action-buttons">
            <button className="btn-action btn-update" onClick={handleEdit}>
               <span className="btn-text">
                  <FormattedMessage id="body_admin.account_management.user_manager.detail_user.edit_button" defaultMessage="Cập nhật thông tin" />
               </span>
               <span className="btn-icon-update">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
               </span>
            </button>
            <UserDelete user={user} onSuccess={handleDeleteSuccess} className="btn-action btn-delete">
               <span className="btn-text">
                  <FormattedMessage id="body_admin.account_management.user_manager.detail_user.delete_button" defaultMessage="Xóa người dùng" />
               </span>
               <span className="btn-icon-delete">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
               </span>
            </UserDelete>
            <button className="btn-action btn-back" onClick={() => navigate(-1)}>
               <span className="btn-text">
                  <FormattedMessage id="body_admin.account_management.user_manager.detail_user.back_button" defaultMessage="Quay lại" />
               </span>
               <span className="btn-icon-back">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>

               </span>
            </button>
         </div>
      </div>
   );
};

export default UserDetail;
