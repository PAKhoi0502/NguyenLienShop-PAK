import bcrypt from 'bcrypt';
import db from '../models/index';
import { where } from 'sequelize';

const salt = bcrypt.genSaltSync(10);

let getAllUser = async () => {
   try {
      let users = await db.User.findAll({
         attributes: { exclude: ['password'] },
         include: [
            {
               model: db.Role,
               attributes: ['name']
            }
         ],
         raw: true,
         nest: true
      });
      return users;
   } catch (error) {
      throw error;
   }
};

let createNewUser = async (data) => {
   try {
      data.userName = data.userName?.trim();
      data.email = data.email?.trim();
      data.phoneNumber = data.phoneNumber?.trim();
      data.fullName = data.fullName?.trim();

      if (!data.password || !data.roleId || (!data.email && !data.phoneNumber)) {
         return {
            errCode: 1,
            errMessage: 'Missing required fields'
         };
      }

      if (data.userName) {
         const loginExists = await db.User.findOne({ where: { userName: data.userName } });
         if (loginExists) return { errCode: 2, errMessage: 'Username already exists' };
      }

      if (data.phoneNumber) {
         const phoneExists = await db.User.findOne({ where: { phoneNumber: data.phoneNumber } });
         if (phoneExists) return { errCode: 3, errMessage: 'Phone number already exists' };
      }

      if (data.email) {
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(data.email)) {
            return { errCode: 6, errMessage: 'Invalid email format' };
         }

         const emailExists = await db.User.findOne({ where: { email: data.email } });
         if (emailExists) return { errCode: 4, errMessage: 'Email already exists' };
      }

      const hashedPassword = await bcrypt.hash(data.password, salt);

      await db.User.create({
         ...(data.userName && { userName: data.userName }),
         password: hashedPassword,
         email: data.email || null,
         phoneNumber: data.phoneNumber || null,
         fullName: data.fullName || null,
         gender: data.gender || null,
         roleId: parseInt(data.roleId),
      });

      return { errCode: 0, errMessage: 'Create new user succeed' };
   } catch (error) {
      throw error;
   }
};

let getUserInfoById = async (userId) => {
   return new Promise(async (resolve, reject) => {
      try {
         let user = await db.User.findOne({
            where: { id: userId },
            raw: true
         })
         if (user) {
            resolve(user)
         } else {
            resolve({});
         }
      } catch (error) {
         reject(error);
      }
   })

}

let updateUserData = async (data) => {
   try {
      if (!data.id) return { errCode: 1, errMessage: 'Missing user ID' };

      const user = await db.User.findOne({ where: { id: data.id } });
      if (!user) return { errCode: 2, errMessage: 'User not found' };

      // Email
      if (data.email !== undefined) {
         const emailValue = data.email.trim();
         if (emailValue === "") {
            user.email = null;
         } else if (emailValue !== user.email) {
            const emailExists = await db.User.findOne({
               where: {
                  email: emailValue,
                  id: { [db.Sequelize.Op.ne]: data.id }
               }
            });
            if (emailExists) return { errCode: 3, errMessage: 'Email already in use' };
            user.email = emailValue;
         }
      }

      // Phone number
      if (data.phoneNumber !== undefined) {
         const phoneValue = data.phoneNumber.trim();
         if (phoneValue === "") {
            user.phoneNumber = null;
         } else {
            const phonePattern = /^0\d{9}$/;
            if (!phonePattern.test(phoneValue)) {
               return { errCode: 5, errMessage: 'Invalid phone number. Must be 10 digits and start with 0.' };
            }
            user.phoneNumber = phoneValue;
         }
      }

      // Full name
      user.fullName = data.fullName?.trim() || null;

      // Gender (cẩn thận vì 0 là falsy)
      if (data.gender !== undefined) {
         user.gender = data.gender;
      }

      // Role ID (nếu không muốn cho update, có thể bỏ)
      if (data.roleId !== undefined) {
         user.roleId = data.roleId;
      }

      await user.save();
      return { errCode: 0, errMessage: 'Update successful' };
   } catch (error) {
      throw error;
   }
};

let deleteUserById = async (userId) => {
   try {
      const user = await db.User.findOne({ where: { id: userId } });
      if (!user) return { errCode: 1, errMessage: 'User not found' };

      await user.destroy();
      return { errCode: 0, errMessage: 'User deleted successfully' };
   } catch (error) {
      throw error;
   }
};

module.exports = {
   getAllUser: getAllUser,
   createNewUser: createNewUser,
   getUserInfoById: getUserInfoById,
   updateUserData: updateUserData,
   deleteUserById: deleteUserById,
};