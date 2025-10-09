import React, { useState, useEffect } from 'react';
import { getUsers } from '../../../services/adminService';
import { useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import UserDelete from './UserDelete';
import HintBox from '../../HintBox';
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
               setError(response?.errMessage || intl.formatMessage({ id: 'body_admin.account_management.user_manager.load_error' }));
               setLoading(false);
            }
         })
         .catch(() => {
            setError(intl.formatMessage({ id: 'body_admin.account_management.user_manager.load_error' }));
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
               <FormattedMessage id="body_admin.account_management.user_manager.title" defaultMessage="Quản lý người dùng" />
            </h1>
            <div style={{ display: 'flex', gap: 10 }}>
               <button
                  className="btn-create"
                  onClick={() => navigate('/admin/account-management/user-management/user-register')}
               >
                  + <FormattedMessage id="body_admin.account_management.user_manager.create_button" defaultMessage="Tạo người dùng" />
               </button>
            </div>
         </div>
         <div className="user-search-section">
            <div className="user-search-bar">
               <input
                  type="text"
                  placeholder={intl.formatMessage({ id: 'body_admin.account_management.user_manager.search_placeholder' })}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
               />
            </div>
            <HintBox
               theme="user"
               content={
                  <div>
                     <p><FormattedMessage id="body_admin.account_management.user_manager.hint_title" defaultMessage="Hướng dẫn: Quản lý danh sách người dùng, bao gồm tạo, xem thông tin và xóa tài khoản." /></p>
                     <ul>
                        <li><FormattedMessage id="body_admin.account_management.user_manager.hint_1" defaultMessage="Sử dụng nút 'Tạo người dùng' để thêm tài khoản người dùng mới vào hệ thống." /></li>
                        <li><FormattedMessage id="body_admin.account_management.user_manager.hint_2" defaultMessage="Click vào tên người dùng để xem thông tin chi tiết." /></li>
                        <li><FormattedMessage id="body_admin.account_management.user_manager.hint_3" defaultMessage="Sử dụng chức năng tìm kiếm để lọc theo tên, email hoặc họ tên." /></li>
                        <li><FormattedMessage id="body_admin.account_management.user_manager.hint_4" defaultMessage="Hãy thận trọng khi xóa tài khoản người dùng." /></li>
                        <li><FormattedMessage id="body_admin.account_management.user_manager.hint_5" defaultMessage="Có thể cập nhật thông tin hoặc xóa tài khoản người dùng khi cần thiết." /></li>
                     </ul>
                  </div>
               }
            />
         </div>
         {loading ? (
            <div className="user-loading">
               <FormattedMessage id="body_admin.account_management.user_manager.loading" defaultMessage="Đang tải..." />
            </div>
         ) : error ? (
            <div className="user-error">{error}</div>
         ) : (
            <div className="user-table-wrapper">
               <table className="user-table">
                  <thead>
                     <tr>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>ID</th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.account_management.user_manager.username" defaultMessage="Tên người dùng" /></th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>Email</th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }} className="hide-mobile"><FormattedMessage id="body_admin.account_management.user_manager.phone" defaultMessage="Số điện thoại" /></th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.account_management.user_manager.role" defaultMessage="Vai trò" /></th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.account_management.user_manager.actions" defaultMessage="Hành động" /></th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredUsers.length === 0 ? (
                        <tr>
                           <td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>
                              <FormattedMessage id="body_admin.account_management.user_manager.empty" defaultMessage="Không có người dùng nào phù hợp." />
                           </td>
                        </tr>
                     ) : (
                        filteredUsers.map(user => (
                           <tr key={user.id}>
                              <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{user.id}</td>
                              <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }} className={user.userName ? "" : "cell-na"}>{user.userName || "N/A"}</td>
                              <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }} className={user.email ? "" : "cell-na"}>{user.email || "N/A"}</td>
                              <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }} className={user.phoneNumber ? "hide-mobile phone-number-cell" : "hide-mobile cell-na"}>
                                 {user.phoneNumber ? (
                                    <span
                                       style={{ cursor: 'pointer' }}
                                       onClick={() => handleGetUserProfile(user)}
                                       title="Click để xem chi tiết"
                                    >
                                       {user.phoneNumber}
                                    </span>
                                 ) : (
                                    "N/A"
                                 )}
                              </td>
                              <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                 <span className={user.roleId === 1 ? "role-admin" : "role-user"}>
                                    {user.roleId === 1
                                       ? intl.formatMessage({ id: 'body_admin.account_management.user_manager.role.admin' })
                                       : intl.formatMessage({ id: 'body_admin.account_management.user_manager.role_user.user' })}
                                 </span>
                              </td>
                              <td>
                                 <div className="action-buttons">
                                    <button className="btn-action btn-user-detail" onClick={() => handleGetUserProfile(user)}>
                                       <FormattedMessage id="body_admin.account_management.user_manager.detail" defaultMessage="Chi tiết" />
                                    </button>
                                    <button className="btn-action btn-update" onClick={() => handleUpdate(user)}>
                                       <FormattedMessage id="body_admin.account_management.user_manager.update" defaultMessage="Cập nhật" />
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
