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
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     strokeWidth={1.5}
                     stroke="currentColor"
                     className="btn-icon"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                     />
                  </svg>
                  <FormattedMessage id="body_admin.account_management.admin_manager.create_button" defaultMessage="Tạo quản trị viên" />
               </button>
            </div>
         </div>

         <div className="admin-search-section">

            <div className="admin-hint-box">
               <HintBox
                  theme="user"
                  content={
                     <div>
                        <h1><FormattedMessage id="hint_box.admin_manager.title" defaultMessage="Admin Manager" /></h1>
                        <p><FormattedMessage id="hint_box.admin_manager.subtitle" defaultMessage="Đây là trang dùng để quản lý tài khoản quản trị viên" /></p>
                        <ul className="hint-list"> <FormattedMessage id="hint_box.admin_manager.overview_ul" defaultMessage="Giới thiệu" />
                           <li className="hint-item"><FormattedMessage id="hint_box.admin_manager.overview_li_1" defaultMessage="Đây là trang dùng để quản lý tài khoản quản trị viên." /></li>
                           <li className="hint-item"><FormattedMessage id="hint_box.admin_manager.overview_li_2" defaultMessage="Có đầy đủ các chức năng tạo, chỉnh sửa, xóa tài khoản." /></li>
                        </ul>
                        <ul className="hint-list"> <FormattedMessage id="hint_box.admin_manager.user_guide_ul" defaultMessage="Hướng dẫn sử dụng" />
                           <li className="hint-item"><FormattedMessage id="hint_box.admin_manager.user_guide_li_1" defaultMessage="Nút tạo tài khoản dùng để tạo tài khoản quản trị viên." /></li>
                           <li className="hint-item"><FormattedMessage id="hint_box.admin_manager.user_guide_li_2" defaultMessage="Nút tìm kiếm dùng để tìm kiếm tài khoản quản trị viên." /></li>
                           <li className="hint-item"><FormattedMessage id="hint_box.admin_manager.user_guide_li_3" defaultMessage="Nút chi tiết dùng để xem thông tin chi tiết tài khoản quản trị viên." /></li>
                           <li className="hint-item"><FormattedMessage id="hint_box.admin_manager.user_guide_li_4" defaultMessage="Nút cập nhật dùng để cập nhật thông tin tài khoản quản trị viên." /></li>
                           <li className="hint-item"><FormattedMessage id="hint_box.admin_manager.user_guide_li_5" defaultMessage="Nút xóa dùng để xóa tài khoản quản trị viên." /></li>
                        </ul>
                        <ul className="hint-list"> <FormattedMessage id="hint_box.admin_manager.note_title" defaultMessage="Lưu ý" />
                           <li className="hint-item"><FormattedMessage id="hint_box.admin_manager.note_li_1" defaultMessage="Hãy thận trọng khi xóa tài khoản quản trị viên vì sẽ xóa tài khoản vĩnh viễn mà không thể hoàn tác." /></li>
                           <li className="hint-item"><FormattedMessage id="hint_box.admin_manager.note_li_2" defaultMessage="Chỉnh sửa thông tin tài khoản cần có quyền hạn hoặc có sự thông báo và được chấp nhận từ quản trị viên." /></li>
                        </ul>
                     </div>
                  }
               />
            </div>

            <div className="admin-search-bar">
               <input
                  type="text"
                  placeholder={intl.formatMessage({ id: 'body_admin.account_management.admin_manager.search_placeholder' })}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
               />
            </div>

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
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>ID</th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.account_management.admin_manager.username" defaultMessage="Tên người dùng" /></th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>Email</th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }} className="hide-mobile"><FormattedMessage id="body_admin.account_management.admin_manager.phone" defaultMessage="Số điện thoại" /></th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.account_management.admin_manager.role" defaultMessage="Vai trò" /></th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.account_management.admin_manager.actions" defaultMessage="Hành động" /></th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredUsers.length === 0 ? (
                        <tr>
                           <td colSpan={6}>
                              <FormattedMessage id="body_admin.account_management.admin_manager.empty" defaultMessage="Không có người dùng nào phù hợp." />
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
                                       onClick={() => handleGetAdminProfile(user)}
                                    >
                                       {user.phoneNumber}
                                    </span>
                                 ) : (
                                    "N/A"
                                 )}
                              </td>

                              <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                 <span className="role-admin">
                                    {intl.formatMessage({ id: 'role.admin' })}
                                 </span>
                              </td>
                              <td>
                                 <div className="action-buttons">

                                    <button className="btn-action btn-detail" onClick={() => handleGetAdminProfile(user)}>
                                       <span className="btn-text">
                                          <FormattedMessage id="body_admin.account_management.admin_manager.detail" defaultMessage="Chi tiết" />
                                       </span>
                                       <span className="btn-icon-detail">
                                          <svg
                                             xmlns="http://www.w3.org/2000/svg"
                                             fill="none"
                                             viewBox="0 0 24 24"
                                             strokeWidth="1.5"
                                             stroke="currentColor"
                                          >
                                             <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 
            12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                                             />
                                          </svg>
                                       </span>
                                    </button>

                                    <button className="btn-action btn-update" onClick={() => handleUpdate(user)}>
                                       <span className="btn-text">
                                          <FormattedMessage id="body_admin.account_management.admin_manager.update" defaultMessage="Cập nhật" />
                                       </span>
                                       <span className="btn-icon-update">
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                             <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                          </svg>
                                       </span>
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
