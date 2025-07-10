import db from "../models/index"
import validator from "validator";
// User Manager

let getAllUsers = (userId) => {
   return new Promise(async (resolve, reject) => {
      try {
         let users = '';
         if (userId === 'ALL') {
            users = await db.User.findAll({
               attributes: { exclude: ['password'] },
               include: [{ model: db.Role, attributes: ['name'] }]
            })

         }
         if (userId && userId !== 'ALL') {
            users = await db.User.findOne({
               where: { id: userId },
               attributes: {
                  exclude: ['password'] // remove password
               }
            })
         }
         resolve(users)
      } catch (e) {
         reject(e);
      }
   })
}

let deleteUser = (userId) => {
   return new Promise(async (resolve, reject) => {
      try {
         let user = await db.User.findOne({
            where: { id: userId }
         });
         if (!user) {
            return resolve({
               errCode: 2,
               errMessage: `The user isn't exist`
            });
         }
         await user.destroy();
         resolve({
            errCode: 0,
            errMessage: `The user is deleted`
         });
      } catch (error) {
         reject({
            errCode: -1,
            errMessage: "An error occurred while deleting the user"
         });
      }
   });
}

const updateUserData = (data) => {
   return new Promise(async (resolve, reject) => {
      try {
         if (!data.id) {
            return resolve({
               errCode: 1,
               errMessage: 'Missing user ID'
            });
         }

         const user = await db.User.findOne({
            where: { id: data.id },
            raw: false
         });

         if (!user) {
            return resolve({
               errCode: 3,
               errMessage: 'User not found'
            });
         }

         // Kiểm tra email
         if (data.email && data.email !== user.email) {
            if (!validator.isEmail(data.email)) {
               return resolve({
                  errCode: 5,
                  errMessage: 'Invalid email format'
               });
            }

            const emailExists = await db.User.findOne({
               where: {
                  email: data.email,
                  id: { [db.Sequelize.Op.ne]: data.id }
               }
            });

            if (emailExists) {
               return resolve({
                  errCode: 4,
                  errMessage: 'Email already in use by another user'
               });
            }

            user.email = data.email;
         }

         // Các trường tùy chọn
         user.firstName = data.firstName?.trim() || null;
         user.lastName = data.lastName?.trim() || null;
         user.address = data.address?.trim() || null;
         user.phoneNumber = data.phoneNumber?.trim() || null;

         if (['M', 'F', 'O'].includes(data.gender)) {
            user.gender = data.gender;
         } else {
            user.gender = null;
         }

         // Vai trò người dùng (chỉ admin nên được cập nhật)
         if (data.roleId && typeof data.roleId === "number") {
            user.roleId = data.roleId;
         }

         await user.save();

         return resolve({
            errCode: 0,
            errMessage: 'Update user successfully'
         });

      } catch (error) {
         console.error("Update User Error:", error.message || error);
         return reject({
            errCode: -1,
            errMessage: 'Server error while updating user'
         });
      }
   });
};

export default {
   getAllUsers,
   deleteUser,
   updateUserData,
};
