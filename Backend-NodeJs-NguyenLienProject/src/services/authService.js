import { resolveInclude } from "ejs";
import db from "../models/index"
import bcrypt from 'bcryptjs';
import { where } from "sequelize";
import { checkPhoneNumberExists, checkUserNameExists } from "../utils/validators";
import { Op } from 'sequelize';
import validator from 'validator';
const { generateAccessToken } = require('../utils/tokenUtils');

let loginUser = async (identifier, password) => {
   try {

      const user = await db.User.findOne({
         where: { phoneNumber: identifier },
         attributes: ['id', 'userName', 'email', 'phoneNumber', 'roleId', 'password'],
         include: [{ model: db.Role, attributes: ['name'] }]
      });

      if (!user) {
         return { errCode: 1, errMessage: "Sai tài khoản hoặc mật khẩu!" };
      }

      const match = bcrypt.compareSync(password, user.password);
      if (!match) {
         return { errCode: 3, errMessage: "Sai mật khẩu!" };
      }

      // ✅ Sử dụng tokenUtils thay vì tạo token trực tiếp
      const token = generateAccessToken(user);

      const userPlain = user.get({ plain: true });
      delete userPlain.password;
      delete userPlain.Role;

      return {
         errCode: 0,
         errMessage: "OK",
         token,
         user: userPlain
      };

   } catch (err) {
      return { errCode: -1, errMessage: "Internal server error" };
   }
};
let registerUser = (data) => {
   return new Promise(async (resolve, reject) => {
      try {
         const validRole = await db.Role.findOne({ where: { id: parseInt(data.roleId) } });
         if (!validRole) {
            return resolve({ errCode: 5, errMessage: 'Invalid roleId' });
         }

         if (!data.phoneNumber || !data.password) {
            return resolve({ errCode: 6, errMessage: 'Phone number and password are required' });
         }
         if (!data.roleId || isNaN(parseInt(data.roleId))) {
            return resolve({ errCode: 5, errMessage: 'Invalid or missing roleId' });
         }

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
            firstName: data.firstName || null,
            lastName: data.lastName || null,
            address: data.address || null,
            gender: data.gender || null,
            roleId: parseInt(data.roleId) || 2
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
let hashUserPassword = async (password) => {
   try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      return hashed;
   } catch (e) {
      throw e;
   }
};

let verifyUserPassword = async (userId, password) => {
   try {
      // Find user by ID with password
      const user = await db.User.findOne({
         where: { id: userId },
         attributes: ['id', 'password', 'roleId'],
         include: [{ model: db.Role, attributes: ['name'] }]
      });

      if (!user) {
         return { errCode: 1, errMessage: "Người dùng không tồn tại!" };
      }

      // Verify password
      const match = bcrypt.compareSync(password, user.password);
      if (!match) {
         return { errCode: 3, errMessage: "Mật khẩu không chính xác!" };
      }

      return {
         errCode: 0,
         errMessage: "Xác thực mật khẩu thành công!"
      };

   } catch (err) {
      console.error('VerifyUserPassword service error:', err);
      return { errCode: -1, errMessage: "Lỗi server khi xác thực mật khẩu!" };
   }
};

export default {
   loginUser,
   registerUser,
   verifyUserPassword
}