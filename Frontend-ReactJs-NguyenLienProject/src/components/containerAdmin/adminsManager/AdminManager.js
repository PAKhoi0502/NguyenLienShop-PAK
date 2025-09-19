import React, { useState, useEffect } from 'react';
import { getAdmins } from '../../../services/adminService';
import { useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import AdminDelete from './AdminDelete';
import HintBox from '../../HintBox';
import './AdminManager.scss';

const AdminManager = () => {
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [search, setSearch] = useState('');
   const [filteredUsers, setFilteredUsers] = useState([]);
   const navigate = useNavigate();
   const intl = useIntl();

   useEffect(() => {
      getAdmins()
         .then(response => {
            if (response && response.errCode === 0) {
               const onlyAdmins = (response.users || []).filter(user => user.roleId === 1);
               setUsers(onlyAdmins);
               setLoading(false);
            } else {
               setError(response?.errMessage || intl.formatMessage({ id: 'body_admin.account_management.admin_manager.load_error' }));
               setLoading(false);
            }
         })
         .catch(() => {
            setError(intl.formatMessage({ id: 'body_admin.account_management.admin_manager.load_error' }));
            setLoading(false);
         });
   }, [intl]);

   useEffect(() => {
      const lower = search.trim().toLowerCase();
      if (!lower) {
         setFilteredUsers(users);
      } else {
         setFilteredUsers(users.filter(
            user =>
               (user.userName && user.userName.toLowerCase().includes(lower)) ||
               (user.email && user.email.toLowerCase().includes(lower)) ||
               (user.fullName && user.fullName.toLowerCase().includes(lower))
         ));
      }
   }, [search, users]);

   const handleGetAdminProfile = (user) => {
      if (!user?.id) return;
      navigate(`/admin/account-management/admin-management/admin-detail/${user.id}`);
   };

   const handleUpdate = (user) => {
      if (!user?.id) return;
      navigate(`/admin/account-management/admin-management/admin-update/${user.id}`);
   };

   return (
      <div className="admin-manager-container">
         <div className="admin-manager-top">
            <h1 className="admin-title">
               <FormattedMessage id="body_admin.account_management.admin_manager.title" defaultMessage="Quản lý quản trị viên" />
            </h1>
            <div className="admin-actions">
               <button
                  className="btn-create btn-create-admin"
                  onClick={() => navigate('/admin/account-management/admin-management/admin-register')}
               >
                  + <FormattedMessage id="body_admin.account_management.admin_manager.create_button" defaultMessage="Tạo quản trị viên" />
               </button>
            </div>
         </div>
         <div className="admin-search-section">
            <div className="admin-search-bar">
               <input
                  type="text"
                  placeholder={intl.formatMessage({ id: 'body_admin.account_management.admin_manager.search_placeholder' })}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
               />
            </div>
            <HintBox
               theme="user"
               content={
                  <div>
                     <p><FormattedMessage id="body_admin.account_management.admin_manager.hint_title" defaultMessage="Hướng dẫn: Quản lý danh sách quản trị viên, bao gồm tạo, xem thông tin và xóa tài khoản." /></p>
                     <ul>
                        <li><FormattedMessage id="body_admin.account_management.admin_manager.hint_1" defaultMessage="Sử dụng nút 'Tạo quản trị viên' để thêm tài khoản quản trị mới vào hệ thống." /></li>
                        <li><FormattedMessage id="body_admin.account_management.admin_manager.hint_2" defaultMessage="Click vào tên quản trị viên để xem thông tin chi tiết." /></li>
                        <li><FormattedMessage id="body_admin.account_management.admin_manager.hint_3" defaultMessage="Sử dụng chức năng tìm kiếm để lọc theo tên, email hoặc họ tên." /></li>
                        <li><FormattedMessage id="body_admin.account_management.admin_manager.hint_4" defaultMessage="Hãy thận trọng khi xóa tài khoản quản trị viên." /></li>
                     </ul>
                  </div>
               }
            />
         </div>
         {loading ? (
            <div className="admin-loading">
               <FormattedMessage id="body_admin.account_management.admin_manager.loading" defaultMessage="Đang tải..." />
            </div>
         ) : error ? (
            <div className="admin-error">{error}</div>
         ) : (
            <div className="admin-table-wrapper">
               <table className="admin-table">
                  <thead>
                     <tr>
                        <th>ID</th>
                        <th><FormattedMessage id="body_admin.account_management.admin_manager.username" defaultMessage="Tên người dùng" /></th>
                        <th><FormattedMessage id="body_admin.account_management.admin_manager.fullname" defaultMessage="Họ và tên" /></th>
                        <th>Email</th>
                        <th className="hide-mobile"><FormattedMessage id="body_admin.account_management.admin_manager.phone" defaultMessage="Số điện thoại" /></th>
                        <th className="hide-mobile"><FormattedMessage id="body_admin.account_management.admin_manager.gender" defaultMessage="Giới tính" /></th>
                        <th className="hide-mobile"><FormattedMessage id="body_admin.account_management.admin_manager.birthday" defaultMessage="Ngày sinh" /></th>
                        <th><FormattedMessage id="body_admin.account_management.admin_manager.role" defaultMessage="Vai trò" /></th>
                        <th><FormattedMessage id="body_admin.account_management.admin_manager.actions" defaultMessage="Hành động" /></th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredUsers.length === 0 ? (
                        <tr>
                           <td colSpan={9} style={{ textAlign: 'center', color: '#888' }}>
                              <FormattedMessage id="body_admin.account_management.admin_manager.empty" defaultMessage="Không có người dùng nào phù hợp." />
                           </td>
                        </tr>
                     ) : (
                        filteredUsers.map(user => (
                           <tr key={user.id}>
                              <td>{user.id}</td>
                              <td className={user.userName ? "" : "cell-na"}>{user.userName || "N/A"}</td>
                              <td className={user.fullName ? "" : "cell-na"}>{user.fullName || "N/A"}</td>
                              <td className={user.email ? "" : "cell-na"}>{user.email || "N/A"}</td>
                              <td className={user.phoneNumber ? "hide-mobile" : "hide-mobile cell-na"}>{user.phoneNumber || "N/A"}</td>
                              <td className={user.gender ? "hide-mobile" : "hide-mobile cell-na"}>
                                 {user.gender === 'M' && (
                                    <FormattedMessage id="body_admin.account_management.admin_manager.gender_admin.male" defaultMessage="Nam" />
                                 )}
                                 {user.gender === 'F' && (
                                    <FormattedMessage id="body_admin.account_management.admin_manager.gender_admin.female" defaultMessage="Nữ" />
                                 )}
                                 {!['M', 'F'].includes(user.gender) && "N/A"}
                              </td>
                              <td className={user.birthday ? "hide-mobile" : "hide-mobile cell-na"}>{user.birthday || "N/A"}</td>
                              <td>
                                 <span className={user.roleId === 1 ? "role-admin" : "role-user"}>
                                    {user.roleId === 1
                                       ? intl.formatMessage({ id: 'body_admin.account_management.admin_manager.role_admin.admin' })
                                       : intl.formatMessage({ id: 'body_admin.account_management.admin_manager.role_admin.user' })}
                                 </span>
                              </td>
                              <td>
                                 <div className="action-buttons">
                                    <button className="btn-action btn-user-detail" onClick={() => handleGetAdminProfile(user)}>
                                       <FormattedMessage id="body_admin.account_management.admin_manager.detail" defaultMessage="Chi tiết" />
                                    </button>
                                    <button className="btn-action btn-update" onClick={() => handleUpdate(user)}>
                                       <FormattedMessage id="body_admin.account_management.admin_manager.update" defaultMessage="Cập nhật" />
                                    </button>
                                    <AdminDelete user={user} onSuccess={(deletedId) => {
                                       setUsers(prev => prev.filter(u => u.id !== deletedId));
                                    }} />
                                 </div>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         )}
      </div>
   );
};

export default AdminManager;
