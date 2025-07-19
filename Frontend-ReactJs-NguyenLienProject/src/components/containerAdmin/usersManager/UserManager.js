import React, { useState, useEffect } from 'react';
import { getUsers } from '../../../services/adminService';
import { useNavigate } from 'react-router-dom';
import './UserManager.scss';

const UserManager = () => {
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [search, setSearch] = useState('');
   const [filteredUsers, setFilteredUsers] = useState([]);
   const navigate = useNavigate();

   useEffect(() => {
      getUsers()
         .then(response => {
            if (response && response.errCode === 0) {
               const onlyUsers = (response.users || []).filter(user => user.roleId === 2); // Lọc người dùng
               setUsers(onlyUsers);
               setLoading(false);
            } else {
               setError(response?.errMessage || 'Không thể tải danh sách người dùng.');
               setLoading(false);
            }
         })
         .catch(() => {
            setError('Không thể tải danh sách người dùng.');
            setLoading(false);
         });
   }, []);


   useEffect(() => {
      // Lọc danh sách theo từ khóa tìm kiếm (theo tên người dùng, email, fullName)
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
      // Thực hiện logic cập nhật user (show modal, chuyển trang, ...)
   };

   const handleDelete = (user) => {
      // Thực hiện logic xóa user (show xác nhận, ...)
   };

   return (
      <div className="user-manager-container">
         <div className="user-manager-top">
            <h1 className="user-title">Quản lý người dùng</h1>
            <div style={{ display: 'flex', gap: 10 }}>
               <button
                  className="btn-create"
                  onClick={() => navigate('/admin/user-register')}
               >
                  + Tạo người dùng
               </button>
            </div>
         </div>
         <div className="user-search-bar">
            <input
               type="text"
               placeholder="Tìm kiếm theo tên, email hoặc họ tên..."
               value={search}
               onChange={e => setSearch(e.target.value)}
            />
         </div>
         {loading ? (
            <div className="user-loading">Loading...</div>
         ) : error ? (
            <div className="user-error">{error}</div>
         ) : (
            <div className="user-table-wrapper">
               <table className="user-table">
                  <thead>
                     <tr>
                        <th>ID</th>
                        <th>Tên người dùng</th>
                        <th>Họ và tên</th>
                        <th>Email</th>
                        <th className="hide-mobile">Số điện thoại</th>
                        <th className="hide-mobile">Giới tính</th>
                        <th className="hide-mobile">Ngày sinh</th>
                        <th>Vai trò</th>
                        <th>Hành động</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredUsers.length === 0 ? (
                        <tr>
                           <td colSpan={9} style={{ textAlign: 'center', color: '#888' }}>
                              Không có người dùng nào phù hợp.
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
                                    {user.roleId === 1 ? "Quản trị" : "Người dùng"}
                                 </span>
                              </td>
                              <td>
                                 <div className="action-buttons">
                                    <button className="btn-action btn-update" onClick={() => handleUpdate(user)}>
                                       Cập nhật
                                    </button>
                                    <button className="btn-action btn-delete" onClick={() => handleDelete(user)}>
                                       Xóa
                                    </button>
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
