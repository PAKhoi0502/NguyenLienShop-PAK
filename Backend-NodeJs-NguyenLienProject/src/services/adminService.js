import db from "../models/index";
import validator from "validator";
import bcrypt from "bcryptjs";
import { checkPhoneNumberExists } from "../utils/validators.js";

let hashUserPassword = async (password) => {
   try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      return hashed;
   } catch (e) {
      throw e;
   }
};

// Admin Service
let getAllAdmins = (userId) => {
   return new Promise(async (resolve, reject) => {
      try {
         let admins = '';
         if (userId === 'ALL') {
            admins = await db.User.findAll({
               where: { roleId: 1 }, // chỉ Admin
               attributes: { exclude: ['password'] },
               include: [{ model: db.Role, attributes: ['name'] }]
            });
         } else if (userId) {
            admins = await db.User.findOne({
               where: { id: userId, roleId: 1 },
               attributes: { exclude: ['password'] }
            });
         }
         resolve(admins);
      } catch (e) {
         reject(e);
      }
   });
};
let createAdminForAdmin = (data) => {
   return new Promise(async (resolve, reject) => {
      try {
         // Gán roleId = 1 (Admin)
         data.roleId = 1;

         // Kiểm tra vai trò hợp lệ
         const validRole = await db.Role.findOne({ where: { id: 1 } });
         if (!validRole) {
            return resolve({ errCode: 5, errMessage: 'Invalid roleId' });
         }

         if (!data.phoneNumber || !data.password) {
            return resolve({ errCode: 6, errMessage: 'Phone number and password are required' });
         }

         // Kiểm tra số điện thoại đã tồn tại
         const errors = [];
         if (await checkPhoneNumberExists(data.phoneNumber)) {
            errors.push("Số điện thoại đã tồn tại!");
         }

         if (errors.length > 0) {
            return resolve({
               errCode: 1,
               errMessage: errors.join(", "),
            });
         }

         let hashPassword = await hashUserPassword(data.password);

         // Tạo admin mới
         await db.User.create({
            phoneNumber: data.phoneNumber,
            password: hashPassword,
            userName: data.userName || null,
            fullName: data.fullName || null,
            gender: data.gender || null,
            birthday: data.birthday || null,
            roleId: 1, // Admin
            slug: data.slug || null
         });

         resolve({
            errCode: 0,
            message: 'Tạo tài khoản admin thành công!'
         });
      } catch (error) {
         reject(error);
      }
   });
};
let updateAdmin = (data) => {
   return new Promise(async (resolve, reject) => {
      try {
         if (!data.id) {
            return resolve({
               errCode: 1,
               errMessage: 'Missing admin ID'
            });
         }

         const user = await db.User.findOne({
            where: { id: data.id },
            raw: false
         });

         if (!user) {
            return resolve({
               errCode: 3,
               errMessage: 'Admin not found'
            });
         }

         if (data.hasOwnProperty('userName')) {
            const trimmed = data.userName?.trim();
            user.userName = trimmed === '' ? null : trimmed;
         }

         if (data.hasOwnProperty('fullName')) {
            const trimmed = data.fullName?.trim();
            user.fullName = trimmed === '' ? null : trimmed;
         }

         if (data.hasOwnProperty('birthday')) {
            user.birthday = data.birthday || null;
         }

         if (data.hasOwnProperty('gender')) {
            user.gender = ['M', 'F', 'O'].includes(data.gender) ? data.gender : null;
         }

         if (data.hasOwnProperty('roleId')) {
            const role = await db.Role.findByPk(data.roleId);
            if (!role) {
               return resolve({
                  errCode: 4,
                  errMessage: 'Invalid roleId'
               });
            }
            user.roleId = data.roleId;
         }

         await user.save();

         return resolve({
            errCode: 0,
            errMessage: 'Update admin successfully'
         });

      } catch (error) {
         console.error("Update Admin Error:", error.message || error);
         return reject({
            errCode: -1,
            errMessage: 'Server error while updating admin'
         });
      }
   });
};


// User Service
let getAllUsers = (userId) => {
   return new Promise(async (resolve, reject) => {
      try {
         let users = '';
         if (userId === 'ALL') {
            users = await db.User.findAll({
               where: { roleId: 2 }, // lọc chỉ User
               attributes: { exclude: ['password'] },
               include: [{ model: db.Role, attributes: ['name'] }]
            });
         } else if (userId) {
            users = await db.User.findOne({
               where: { id: userId, roleId: 2 },
               attributes: { exclude: ['password'] }
            });
         }
         resolve(users);
      } catch (e) {
         reject(e);
      }
   });
};
let deleteUser = (userId) => {
   return new Promise(async (resolve) => {
      try {
         const user = await db.User.findOne({ where: { id: userId } });

         if (!user) {
            return resolve({
               errCode: 2,
               errMessage: `Người dùng không tồn tại`
            });
         }

         await user.destroy();

         return resolve({
            errCode: 0,
            errMessage: `Đã xóa người dùng "${user.phoneNumber || 'ID: ' + user.id}" thành công`,
            deletedUserId: user.id
         });
      } catch (error) {
         console.error("Delete User Error:", error);
         return resolve({
            errCode: -1,
            errMessage: "Đã xảy ra lỗi trong quá trình xóa người dùng"
         });
      }
   });
};

let updateUser = (data) => {
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

         if (data.hasOwnProperty('userName')) {
            const trimmed = data.userName?.trim();
            user.userName = trimmed === '' ? null : trimmed;
         }

         if (data.hasOwnProperty('fullName')) {
            const trimmed = data.fullName?.trim();
            user.fullName = trimmed === '' ? null : trimmed;
         }

         if (data.hasOwnProperty('birthday')) {
            user.birthday = data.birthday || null;
         }

         if (data.hasOwnProperty('gender')) {
            user.gender = ['M', 'F', 'O'].includes(data.gender) ? data.gender : null;
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
let createUserForAdmin = (data) => {
   return new Promise(async (resolve, reject) => {
      try {
         // Kiểm tra vai trò hợp lệ
         const validRole = await db.Role.findOne({ where: { id: parseInt(data.roleId) } });
         if (!validRole) {
            return resolve({ errCode: 5, errMessage: 'Invalid roleId' });
         }

         if (!data.phoneNumber || !data.password) {
            return resolve({ errCode: 6, errMessage: 'Phone number and password are required' });
         }

         // Kiểm tra số điện thoại đã tồn tại
         const errors = [];
         if (await checkPhoneNumberExists(data.phoneNumber)) {
            errors.push("Số điện thoại đã tồn tại!");
         }

         if (errors.length > 0) {
            return resolve({
               errCode: 1,
               errMessage: errors.join(", "),
            });
         }

         let hashPassword = await hashUserPassword(data.password);

         // Tạo người dùng mới
         await db.User.create({
            phoneNumber: data.phoneNumber,
            password: hashPassword,
            userName: data.userName || null,  // Biệt danh
            fullName: data.fullName || null,  // Họ tên đầy đủ
            gender: data.gender || null,
            birthday: data.birthday || null,
            roleId: parseInt(data.roleId) || 2,
            slug: data.slug || null
         });

         resolve({
            errCode: 0,
            message: 'Tạo tài khoản thành công!'
         });
      } catch (error) {
         reject(error);
      }
   });
};

export default {
   getAllUsers,
   deleteUser,
   updateUser,
   createUserForAdmin,
   createAdminForAdmin,
   getAllAdmins,
   updateAdmin
};
