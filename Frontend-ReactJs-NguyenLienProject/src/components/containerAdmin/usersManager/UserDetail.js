import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUsers } from '../../../services/adminService';
import { FormattedMessage, useIntl } from 'react-intl';
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
            <div><strong><FormattedMessage id="body_admin.account_management.user_manager.detail_user.username" defaultMessage="Biệt danh" />:</strong> {user.userName || intl.formatMessage({ id: 'body_admin.account_management.user_manager.detail_user.missing', defaultMessage: 'Chưa có' })}</div>
            <div><strong><FormattedMessage id="body_admin.account_management.user_manager.detail_user.fullname" defaultMessage="Họ tên" />:</strong> {user.fullName || intl.formatMessage({ id: 'body_admin.account_management.user_manager.detail_user.missing' })}</div>
            <div><strong><FormattedMessage id="body_admin.account_management.user_manager.detail_user.email" defaultMessage="Email" />:</strong> <em><FormattedMessage id="body_admin.account_management.user_manager.detail_user.hidden" defaultMessage="(Ẩn - cập nhật ở trang khác)" /></em></div>
            <div><strong><FormattedMessage id="body_admin.account_management.user_manager.detail_user.phone" defaultMessage="Số điện thoại" />:</strong> <em><FormattedMessage id="body_admin.account_management.user_manager.detail_user.hidden" /></em></div>
            <div><strong><FormattedMessage id="body_admin.account_management.user_manager.detail_user.birthday" defaultMessage="Ngày sinh" />:</strong> {user.birthday || intl.formatMessage({ id: 'body_admin.account_management.user_manager.detail_user.missing' })}</div>
            <div><strong><FormattedMessage id="body_admin.account_management.user_manager.detail_user.gender" defaultMessage="Giới tính" />:</strong> {
               user.gender === 'M'
                  ? intl.formatMessage({ id: 'body_admin.account_management.user_manager.gender_user.male', defaultMessage: 'Nam' })
                  : user.gender === 'F'
                     ? intl.formatMessage({ id: 'body_admin.account_management.user_manager.gender_user.female', defaultMessage: 'Nữ' })
                     : user.gender === 'O'
                        ? intl.formatMessage({ id: 'body_admin.account_management.user_manager.gender_user.other', defaultMessage: 'Khác' })
                        : intl.formatMessage({ id: 'body_admin.account_management.user_manager.gender_user.unknown', defaultMessage: 'Chưa chọn' })
            }</div>
            <div><strong><FormattedMessage id="body_admin.account_management.user_manager.detail_user.role" defaultMessage="Vai trò" />:</strong> {
               user.roleId === 1
                  ? intl.formatMessage({ id: 'body_admin.account_management.user_manager.role_user.admin', defaultMessage: 'Quản trị viên' })
                  : intl.formatMessage({ id: 'body_admin.account_management.user_manager.role_user.user', defaultMessage: 'Người dùng' })
            }</div>
         </div>

         <div className="user-detail-actions">
            <button className="btn-edit" onClick={handleEdit}>
               <FormattedMessage id="body_admin.account_management.user_manager.detail_user.edit_button" defaultMessage="Cập nhật thông tin" />
            </button>
            <button className="btn-back" onClick={() => navigate('/admin/account-management/user-management')}>
               <FormattedMessage id="body_admin.account_management.user_manager.detail_user.back_button" defaultMessage="Quay lại" />
            </button>
         </div>
      </div>
   );
};

export default UserDetail;
