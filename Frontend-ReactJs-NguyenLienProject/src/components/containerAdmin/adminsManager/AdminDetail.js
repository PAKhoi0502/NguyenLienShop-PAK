import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { getAdmins } from '../../../services/adminService';
import AdminDelete from './AdminDelete';
import './AdminDetail.scss';

const AdminDetail = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const intl = useIntl();
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchUser = async () => {
         const res = await getAdmins(id);
         const data = res?.data || res;
         const userData = Array.isArray(data.users) ? data.users[0] : data.users;

         if (userData?.id) {
            setUser(userData);
         } else {
            navigate('/admin/account-management/admin-management');
         }
         setLoading(false);
      };
      fetchUser();
   }, [id, navigate]);

   const handleEdit = () => {
      navigate(`/admin/account-management/admin-management/admin-update/${id}`);
   };

   const handleDeleteSuccess = (userId) => {
      // Navigate back to admin management after successful deletion
      navigate('/admin/account-management/admin-management');
   };

   if (loading) return (
      <div className="admin-detail-loading">
         <FormattedMessage id="body_admin.account_management.admin_manager.detail_admin.loading" defaultMessage="Đang tải dữ liệu..." />
      </div>
   )
   if (!user) return (
      <div className="admin-detail-error">
         <FormattedMessage id="body_admin.account_management.admin_manager.detail_admin.not_found" defaultMessage="Không tìm thấy quản trị viên" />
      </div>
   );

   return (
      <div className="admin-detail-container">
         <h2 className="admin-detail-title">
            <FormattedMessage id="body_admin.account_management.admin_manager.detail_admin.title" defaultMessage="Thông tin quản trị viên" />
         </h2>
         <div className="admin-detail-content">
            <div><strong>ID:</strong> {user.id}</div>
            <div><strong><FormattedMessage id="body_admin.account_management.admin_manager.detail_admin.nickname" defaultMessage="Biệt danh" />:</strong> <span className={user.userName ? "" : "cell-na"}>{user.userName || "N/A"}</span></div>
            <div><strong><FormattedMessage id="body_admin.account_management.admin_manager.detail_admin.fullname" defaultMessage="Họ tên" />:</strong> <span className={user.fullName ? "" : "cell-na"}>{user.fullName || "N/A"}</span></div>
            <div><strong><FormattedMessage id="body_admin.account_management.admin_manager.detail_admin.email" defaultMessage="Email" />:</strong> <em><FormattedMessage id="body_admin.account_management.admin_manager.detail_admin.hidden_field" /></em></div>
            <div><strong><FormattedMessage id="body_admin.account_management.admin_manager.detail_admin.phone" defaultMessage="Số điện thoại" />:</strong> <em><FormattedMessage id="body_admin.account_management.admin_manager.detail_admin.hidden_field" /></em></div>
            <div><strong><FormattedMessage id="body_admin.account_management.admin_manager.detail_admin.birthday" defaultMessage="Ngày sinh" />:</strong> <span className={user.birthday ? "" : "cell-na"}>{user.birthday || "N/A"}</span></div>
            <div><strong><FormattedMessage id="body_admin.account_management.admin_manager.detail_admin.gender" defaultMessage="Giới tính" />:</strong> <span className={user.gender ? "" : "cell-na"}>{
               user.gender === 'M'
                  ? intl.formatMessage({ id: 'body_admin.account_management.admin_manager.gender_admin.male', defaultMessage: 'Nam' })
                  : user.gender === 'F'
                     ? intl.formatMessage({ id: 'body_admin.account_management.admin_manager.gender_admin.female', defaultMessage: 'Nữ' })
                     : user.gender === 'O'
                        ? intl.formatMessage({ id: 'body_admin.account_management.admin_manager.gender_admin.other', defaultMessage: 'Khác' })
                        : "N/A"
            }</span></div>
            <div><strong><FormattedMessage id="body_admin.account_management.admin_manager.detail_admin.role" defaultMessage="Vai trò" />:</strong> {
               user.roleId === 1
                  ? intl.formatMessage({ id: 'body_admin.account_management.admin_manager.role_admin.admin', defaultMessage: 'Quản trị viên' })
                  : intl.formatMessage({ id: 'body_admin.account_management.admin_manager.role_admin.user', defaultMessage: 'Người dùng' })
            }</div>
         </div>

         <div className="action-buttons">
            <button className="btn-action btn-update" onClick={handleEdit}>
               <span className="btn-text">
                  <FormattedMessage id="body_admin.account_management.admin_manager.detail_admin.edit_button" defaultMessage="Cập nhật thông tin" />
               </span>
               <span className="btn-icon-update">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
               </span>
            </button>
            <AdminDelete user={user} onSuccess={handleDeleteSuccess} />
            <button className="btn-action btn-back" onClick={() => navigate(-1)}>
               <span className="btn-text">
                  <FormattedMessage id="body_admin.account_management.admin_manager.detail_admin.back_button" defaultMessage="Quay lại" />
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

export default AdminDetail;
