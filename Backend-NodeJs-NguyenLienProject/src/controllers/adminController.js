import adminService from "../services/adminService.js";
import dotenv from 'dotenv';
dotenv.config();

// admin controller
let handleCreateAdminForAdmin = async (req, res) => {
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
let handleGetAllAdmins = async (req, res) => {
   try {
      const id = req.query.id;
      if (!id) {
         return res.status(400).json({
            errCode: 1,
            errMessage: "Thiếu tham số id",
            users: []
         });
      }
      const users = await adminService.getAllAdmins(id === 'ALL' ? 'ALL' : id);
      const plainUsers = Array.isArray(users)
         ? users.map(user => user.get({ plain: true }))
         : users ? [users.get({ plain: true })] : [];
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
let handleUpdateAdmin = async (req, res) => {
   const data = req.body;

   if (!data || !data.id) {
      return res.status(400).json({
         errCode: 1,
         errMessage: 'Missing admin ID'
      });
   }

   try {
      const message = await adminService.updateAdmin(data);
      return res.status(200).json(message);
   } catch (error) {
      console.error("Update Admin Error:", error);
      return res.status(500).json({
         errCode: -1,
         errMessage: "Server error while updating admin"
      });
   }
};


//users management
let handleCreateUserForAdmin = async (req, res) => {
   const data = req.body;

   if (!data.phoneNumber || !data.password) {
      return res.status(400).json({
         errCode: 1,
         errMessage: 'Missing required fields: phoneNumber, password'
      });
   }

   try {
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
let handleGetAllUsers = async (req, res) => {
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
      const plainUsers = Array.isArray(users)
         ? users.map(user => user.get({ plain: true }))
         : users ? [users.get({ plain: true })] : [];
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
let handleUpdateUser = async (req, res) => {
   const data = req.body;

   if (!data || !data.id) {
      return res.status(400).json({
         errCode: 1,
         errMessage: 'Missing user ID'
      });
   }

   try {
      const message = await adminService.updateUser(data);
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
   handleUpdateUser: handleUpdateUser,
   handleDeleteUser: handleDeleteUser,
   handleGetAllAdmins: handleGetAllAdmins,
   handleUpdateAdmin: handleUpdateAdmin
};
