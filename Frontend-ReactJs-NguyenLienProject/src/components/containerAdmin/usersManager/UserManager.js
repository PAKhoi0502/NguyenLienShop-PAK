import React, { useState, useEffect } from 'react';
import { getUsers } from '../../../services/adminService';
import { useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import UserDelete from './UserDelete';
import './UserManager.scss';

const UserManager = () => {
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [search, setSearch] = useState('');
   const [filteredUsers, setFilteredUsers] = useState([]);
   const navigate = useNavigate();
   const intl = useIntl();

   useEffect(() => {
      getUsers()
         .then(response => {
            if (response && response.errCode === 0) {
               const onlyUsers = (response.users || []).filter(user => user.roleId === 2);
               setUsers(onlyUsers);
               setLoading(false);
            } else {
               setError(response?.errMessage || intl.formatMessage({ id: 'user.manager.load_error' }));
               setLoading(false);
            }
         })
         .catch(() => {
            setError(intl.formatMessage({ id: 'user.manager.load_error' }));
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

   const handleUpdate = (user) => {
      if (!user?.id) return;
      navigate(`/admin/account-management/user-management/user-update/${user.id}`);
   };

   const handleGetUserProfile = (user) => {
      if (!user?.id) return;
      navigate(`/admin/account-management/user-management/user-detail/${user.id}`);
   };

   return (
      <div className="user-manager-container">
         <div className="user-manager-top">
            <h1 className="user-title">
               <FormattedMessage id="user.manager.title" defaultMessage="Quản lý người dùng" />
            </h1>
            <div style={{ display: 'flex', gap: 10 }}>
               <button
                  className="btn-create"
                  onClick={() => navigate('/admin/account-management/user-management/user-register')}
               >
                  + <FormattedMessage id="user.manager.create_button" defaultMessage="Tạo người dùng" />
               </button>
            </div>
         </div>
         <div className="user-search-bar">
            <input
               type="text"
               placeholder={intl.formatMessage({ id: 'user.manager.search_placeholder' })}
               value={search}
               onChange={e => setSearch(e.target.value)}
            />
         </div>
         {loading ? (
            <div className="user-loading">
               <FormattedMessage id="user.manager.loading" defaultMessage="Đang tải..." />
            </div>
         ) : error ? (
            <div className="user-error">{error}</div>
         ) : (
            <div className="user-table-wrapper">
               <table className="user-table">
                  <thead>
                     <tr>
                        <th>ID</th>
                        <th><FormattedMessage id="user.manager.username" defaultMessage="Tên người dùng" /></th>
                        <th><FormattedMessage id="user.manager.fullname" defaultMessage="Họ và tên" /></th>
                        <th>Email</th>
                        <th className="hide-mobile"><FormattedMessage id="user.manager.phone" defaultMessage="Số điện thoại" /></th>
                        <th className="hide-mobile"><FormattedMessage id="user.manager.gender" defaultMessage="Giới tính" /></th>
                        <th className="hide-mobile"><FormattedMessage id="user.manager.birthday" defaultMessage="Ngày sinh" /></th>
                        <th><FormattedMessage id="user.manager.role" defaultMessage="Vai trò" /></th>
                        <th><FormattedMessage id="user.manager.actions" defaultMessage="Hành động" /></th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredUsers.length === 0 ? (
                        <tr>
                           <td colSpan={9} style={{ textAlign: 'center', color: '#888' }}>
                              <FormattedMessage id="user.manager.empty" defaultMessage="Không có người dùng nào phù hợp." />
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
                              <td className={user.gender ? "hide-mobile" : "hide-mobile cell-na"}>{user.gender || "N/A"}</td>
                              <td className={user.birthday ? "hide-mobile" : "hide-mobile cell-na"}>{user.birthday || "N/A"}</td>
                              <td>
                                 <span className={user.roleId === 1 ? "role-admin" : "role-user"}>
                                    {user.roleId === 1
                                       ? intl.formatMessage({ id: 'role.admin' })
                                       : intl.formatMessage({ id: 'role.user' })}
                                 </span>
                              </td>
                              <td>
                                 <div className="action-buttons">
                                    <button className="btn-action btn-user-detail" onClick={() => handleGetUserProfile(user)}>
                                       <FormattedMessage id="user.manager.detail" defaultMessage="Chi tiết" />
                                    </button>
                                    <button className="btn-action btn-update" onClick={() => handleUpdate(user)}>
                                       <FormattedMessage id="user.manager.update" defaultMessage="Cập nhật" />
                                    </button>
                                    <UserDelete user={user} onSuccess={(deletedId) => {
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

export default UserManager;
