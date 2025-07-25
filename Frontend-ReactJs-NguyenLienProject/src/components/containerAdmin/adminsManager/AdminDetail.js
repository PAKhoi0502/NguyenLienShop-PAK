import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { getAdmins } from '../../../services/adminService';
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
   }, [id]);

   const handleEdit = () => {
      navigate(`/admin/account-management/admin-management/admin-update/${id}`);
   };

   if (loading) return <div className="admin-detail-loading">{intl.formatMessage({ id: 'admin.detail.loading' })}</div>;
   if (!user) return <div className="admin-detail-error">{intl.formatMessage({ id: 'admin.detail.not_found' })}</div>;

   return (
      <div className="admin-detail-container">
         <h2 className="admin-detail-title">
            <FormattedMessage id="admin.detail.title" defaultMessage="Thông tin quản trị viên" />
         </h2>
         <div className="admin-detail-content">
            <div><strong>ID:</strong> {user.id}</div>
            <div><strong><FormattedMessage id="admin.detail.nickname" defaultMessage="Biệt danh" />:</strong> {user.userName || intl.formatMessage({ id: 'admin.detail.empty' })}</div>
            <div><strong><FormattedMessage id="admin.detail.fullname" defaultMessage="Họ tên" />:</strong> {user.fullName || intl.formatMessage({ id: 'admin.detail.empty' })}</div>
            <div><strong><FormattedMessage id="admin.detail.email" defaultMessage="Email" />:</strong> <em><FormattedMessage id="admin.detail.hidden_field" /></em></div>
            <div><strong><FormattedMessage id="admin.detail.phone" defaultMessage="Số điện thoại" />:</strong> <em><FormattedMessage id="admin.detail.hidden_field" /></em></div>
            <div><strong><FormattedMessage id="admin.detail.birthday" defaultMessage="Ngày sinh" />:</strong> {user.birthday || intl.formatMessage({ id: 'admin.detail.empty' })}</div>
            <div><strong><FormattedMessage id="admin.detail.gender" defaultMessage="Giới tính" />:</strong> {
               user.gender === 'M'
                  ? intl.formatMessage({ id: 'gender.male' })
                  : user.gender === 'F'
                     ? intl.formatMessage({ id: 'gender.female' })
                     : user.gender === 'O'
                        ? intl.formatMessage({ id: 'gender.other' })
                        : intl.formatMessage({ id: 'gender.unselected' })
            }</div>
            <div><strong><FormattedMessage id="admin.detail.role" defaultMessage="Vai trò" />:</strong> {
               user.roleId === 1
                  ? intl.formatMessage({ id: 'role.admin' })
                  : intl.formatMessage({ id: 'role.user' })
            }</div>
         </div>

         <div className="admin-detail-actions">
            <button className="btn-edit" onClick={handleEdit}>
               <FormattedMessage id="admin.detail.edit_button" defaultMessage="Cập nhật thông tin" />
            </button>
            <button className="btn-back" onClick={() => navigate('/admin/account-management/admin-management')}>
               <FormattedMessage id="admin.detail.back_button" defaultMessage="Quay lại" />
            </button>
         </div>
      </div>
   );
};

export default AdminDetail;
