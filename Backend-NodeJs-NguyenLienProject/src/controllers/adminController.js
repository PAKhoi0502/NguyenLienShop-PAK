import adminService from "../services/adminService.js";
import dotenv from 'dotenv';
dotenv.config();

// ==================== USER MANAGER ====================

// Get All Users or Single User
let handleGetAllUsers = async (req, res) => {
   const id = req.params.id;

   if (!id) {
      return res.status(400).json({
         errCode: 1,
         errMessage: "Missing required parameter",
         users: []
      });
   }

   try {
      const users = await adminService.getAllUsers(id);
      return res.status(200).json({
         errCode: 0,
         errMessage: "Ok",
         users
      });
   } catch (error) {
      console.error("Get Users Error:", error);
      return res.status(500).json({
         errCode: -1,
         errMessage: "Error from server"
      });
   }
};

// Delete User
let handleDeleteUser = async (req, res) => {
   const userId = req.params.id;

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

// Edit User
let handleEditUser = async (req, res) => {
   const data = req.body;

   if (!data || !data.id) {
      return res.status(400).json({
         errCode: 1,
         errMessage: 'Missing user ID'
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

// ==================== EXPORT ====================
export default {
   handleGetAllUsers,
   handleEditUser,
   handleDeleteUser
};
