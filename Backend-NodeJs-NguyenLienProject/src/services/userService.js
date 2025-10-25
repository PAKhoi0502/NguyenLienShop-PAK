import db from '../models/index.js';
import { formatDateString } from '../utils/validators.js';

let getUserProfile = async (userId) => {
   try {
      const user = await db.User.findOne({
         where: { id: userId },
         attributes: { exclude: ['password'] },
         include: [{ model: db.Role, attributes: ['name'] }]
      });

      if (!user) {
         return {
            errCode: 2,
            errMessage: 'User not found'
         };
      }

      return {
         errCode: 0,
         message: 'OK',
         user
      };
   } catch (error) {
      console.error('getUserProfile error:', error);
      return {
         errCode: -1,
         errMessage: 'Server error while retrieving user profile'
      };
   }
};
let updateUserProfile = async (userId, data) => {
   try {
      const user = await db.User.findOne({
         where: { id: userId },
         raw: false
      });

      if (!user) {
         return {
            errCode: 2,
            errMessage: 'User not found'
         };
      }

      // Cập nhật thông tin
      user.userName = data.userName?.trim() || user.userName;
      user.fullName = data.fullName?.trim() || user.fullName;

      // Cập nhật avatar
      if (data.avatar) {
         user.avatar = data.avatar;
      }

      if (['M', 'F', 'O'].includes(data.gender)) {
         user.gender = data.gender;
      }
      if (data.birthday) {
         user.birthday = data.birthday;
      }
      if (data.birthday) {
         const formattedBirthday = formatDateString(data.birthday);
         if (!formattedBirthday) {
            return {
               errCode: 4,
               errMessage: 'Ngày sinh không hợp lệ. Định dạng đúng: dd/mm/yyyy'
            };
         }
         user.birthday = formattedBirthday;
      }

      await user.save();

      return {
         errCode: 0,
         message: 'User profile updated successfully'
      };
   } catch (error) {
      console.error('Update user service error:', error);
      return {
         errCode: -1,
         errMessage: 'Server error during update'
      };
   }
};
export default {
   getUserProfile,
   updateUserProfile
};
