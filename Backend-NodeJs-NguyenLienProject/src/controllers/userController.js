import userService from "../services/userService";
import dotenv from 'dotenv';
dotenv.config();

let handleGetUserProfile = async (req, res) => {
   try {
      const userId = req.user?.id;

      if (!userId) {
         return res.status(401).json({
            errCode: 1,
            message: 'Unauthorized',
         });
      }

      const user = await userService.getUserInfoById(userId);
      if (!user) {
         return res.status(404).json({
            errCode: 2,
            message: 'User not found',
         });
      }

      return res.status(200).json({
         errCode: 0,
         message: 'Success',
         data: user,
      });
   } catch (error) {
      console.error(error);
      return res.status(500).json({
         errCode: -1,
         message: 'Server error',
      });
   }
};

let handleEditUserProfile = async (req, res) => {
};

let updateAddress = async (req, res) => {

};

let updateEmail = async (req, res) => {

};

let updatePhoneNumber = async (req, res) => {

};

let changePassword = async (req, res) => {

};

export default {
   handleGetUserProfile: handleGetUserProfile,
   handleEditUserProfile: handleEditUserProfile,
   updateAddress: updateAddress,
   updateEmail: updateEmail,
   updatePhoneNumber: updatePhoneNumber,
   changePassword: changePassword
};