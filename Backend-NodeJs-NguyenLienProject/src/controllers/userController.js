import userService from "../services/userService";
import dotenv from 'dotenv';
dotenv.config();

let handleGetUserProfile = async (req, res) => {
   try {
      const userId = req.user?.id;

      if (!userId) {
         return res.status(400).json({
            errCode: 1,
            errMessage: 'Missing user ID from token'
         });
      }

      const result = await userService.getUserProfile(userId);
      return res.status(result.errCode === 0 ? 200 : 400).json(result);

   } catch (error) {
      console.error('Get Profile Error:', error);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Internal server error'
      });
   }
};
let handleUpdateUserProfile = async (req, res) => {
   try {
      const userId = req.user?.id;
      const data = req.body;

      if (!userId) {
         return res.status(400).json({
            errCode: 1,
            errMessage: 'Missing user ID from token'
         });
      }

      const result = await userService.updateUserProfile(userId, data);

      return res.status(result.errCode === 0 ? 200 : 400).json(result);
   } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Internal server error'
      });
   }
};

export default {
   handleGetUserProfile: handleGetUserProfile,
   handleUpdateUserProfile: handleUpdateUserProfile
};
