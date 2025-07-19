import adminService from "../services/adminService.js";
import dotenv from 'dotenv';
dotenv.config();

//users management
let handleCreateUserForAdmin = async (req, res) => {
   console.log('=== BODY NHẬN TỪ FE ===', req.body);
   const data = req.body;

   if (!data.phoneNumber || !data.password) {
      return res.status(400).json({
         errCode: 1,
         errMessage: 'Missing required fields: phoneNumber, password'
      });
   }

   try {
      // Gán roleId = 2 (User) mặc định
      const newData = { ...data, roleId: 2 };
      const result = await adminService.createUserForAdmin(newData);

      return res.status(result.errCode === 0 ? 200 : 400).json({
         errCode: result.errCode,
         errMessage: result.errMessage || result.message
      });

   } catch (error) {
      console.error('Register For Admin Error:', error);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Internal server error'
      });
   }
};
let handleCreateAdminForAdmin = async (req, res) => {
   console.log('=== BODY NHẬN TỪ FE ===', req.body);
   const data = req.body;

   if (!data.phoneNumber || !data.password) {
      return res.status(400).json({
         errCode: 1,
         errMessage: 'Missing required fields: phoneNumber, password'
      });
   }

   try {
      // Gán roleId = 1 (Admin) mặc định
      const newData = { ...data, roleId: 1 };
      const result = await adminService.createAdminForAdmin(newData);

      return res.status(result.errCode === 0 ? 200 : 400).json({
         errCode: result.errCode,
         errMessage: result.errMessage || result.message
      });

   } catch (error) {
      console.error('Register Admin Error:', error);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Internal server error'
      });
   }
};
let handleGetAllUsers = async (req, res) => {
   console.log('Request received:', req.query.id, 'Token:', req.headers.authorization, 'User:', req.user);
   try {
      const id = req.query.id;
      if (!id) {
         return res.status(400).json({
            errCode: 1,
            errMessage: "Thiếu tham số id",
            users: []
         });
      }
      const users = await adminService.getAllUsers(id === 'ALL' ? 'ALL' : id);
      console.log('Users fetched:', users);
      const plainUsers = Array.isArray(users)
         ? users.map(user => user.get({ plain: true }))
         : users ? [users.get({ plain: true })] : [];
      console.log('Response being sent:', { errCode: 0, errMessage: "Ok", users: plainUsers });
      return res.status(200).json({
         errCode: 0,
         errMessage: "Ok",
         users: plainUsers
      });
   } catch (error) {
      console.error("Get Users Error:", error);
      return res.status(500).json({
         errCode: -1,
         errMessage: "Lỗi từ server",
         users: []
      });
   }
};
let handleGetAllAdmins = async (req, res) => {
   console.log('Request for admins:', req.query.id);
   try {
      const id = req.query.id;
      if (!id) {
         return res.status(400).json({
            errCode: 1,
            errMessage: "Thiếu tham số id",
            users: []
         });
      }

      const admins = await adminService.getAllAdmins(id === 'ALL' ? 'ALL' : id);
      const plainAdmins = Array.isArray(admins)
         ? admins.map(admin => admin.get({ plain: true }))
         : admins ? [admins.get({ plain: true })] : [];

      return res.status(200).json({
         errCode: 0,
         errMessage: "Ok",
         users: plainAdmins
      });
   } catch (error) {
      console.error("Get Admins Error:", error);
      return res.status(500).json({
         errCode: -1,
         errMessage: "Lỗi từ server",
         users: []
      });
   }
};
let handleDeleteUser = async (req, res) => {
   const userId = req.query.id;

   if (!userId) {
      return res.status(400).json({
         errCode: 1,
         errMessage: "Missing user ID"
      });
   }

   try {
      const message = await adminService.deleteUser(userId);
      return res.status(200).json(message);
   } catch (error) {
      console.error("Delete User Error:", error);
      return res.status(500).json({
         errCode: -1,
         errMessage: "Error from server"
      });
   }
};
let handleEditUser = async (req, res) => {
   const data = req.body;

   if (!data || !data.id) {
      return res.status(400).json({
         errCode: 1,
         errMessage: 'Missing user ID'
      });
   }

   if (![1, 2].includes(parseInt(data.roleId))) {
      return res.status(400).json({
         errCode: 2,
         errMessage: 'Invalid roleId. Only 1 (admin) or 2 (user) allowed.'
      });
   }

   try {
      const message = await adminService.updateUserData(data);
      return res.status(200).json(message);
   } catch (error) {
      console.error("Edit User Error:", error);
      return res.status(500).json({
         errCode: -1,
         errMessage: "Server error while updating user"
      });
   }
};
export default {
   handleCreateUserForAdmin: handleCreateUserForAdmin,
   handleCreateAdminForAdmin: handleCreateAdminForAdmin,
   handleGetAllUsers: handleGetAllUsers,
   handleEditUser: handleEditUser,
   handleDeleteUser: handleDeleteUser,
   handleGetAllAdmins: handleGetAllAdmins
};
