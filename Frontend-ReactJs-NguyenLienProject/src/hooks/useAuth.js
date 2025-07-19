import { useSelector } from 'react-redux';

const useAuth = () => {
   const isLoggedIn = useSelector((state) => state.admin.isLoggedIn);
   const adminInfo = useSelector((state) => state.admin.adminInfo);
   const token = localStorage.getItem('token');
   const roleId = localStorage.getItem('roleId');

   return {
      isAuthenticated: isLoggedIn && !!token,
      roleId,
      isAdmin: roleId === '1',
      isUser: roleId === '2',
      adminInfo,
   };
};

export default useAuth;