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

         <div className="admin-detail-actions">
            <button className="btn-edit" onClick={handleEdit}>
               <FormattedMessage id="body_admin.account_management.admin_manager.detail_admin.edit_button" defaultMessage="Cập nhật thông tin" />
            </button>
            <AdminDelete user={user} onSuccess={handleDeleteSuccess} className="btn-delete" />
            <button className="btn-back" onClick={() => navigate(-1)}>
               <FormattedMessage id="body_admin.account_management.admin_manager.detail_admin.back_button" defaultMessage="Quay lại" />
            </button>
         </div>
      </div>
   );
};

export default AdminDetail;
