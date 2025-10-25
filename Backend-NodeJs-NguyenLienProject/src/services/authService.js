import { resolveInclude } from "ejs";
import db from "../models/index"
import bcrypt from 'bcryptjs';
import { where } from "sequelize";
import { checkPhoneNumberExists, checkUserNameExists, generateUniqueUsername, validateVietnamesePhoneNumber } from "../utils/validators";
import { Op } from 'sequelize';
import validator from 'validator';
const { generateAccessToken } = require('../utils/tokenUtils');

let loginUser = async (identifier, password) => {
   try {

      const user = await db.User.findOne({
         where: { phoneNumber: identifier },
         attributes: ['id', 'userName', 'email', 'phoneNumber', 'fullName', 'gender', 'birthday', 'roleId', 'password', 'avatar', 'createdAt', 'updatedAt'],
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

         // Validate phone number format
         if (!validateVietnamesePhoneNumber(data.phoneNumber)) {
            return resolve({ errCode: 7, errMessage: 'Invalid Vietnamese phone number format' });
         }

         if (!data.roleId || isNaN(parseInt(data.roleId))) {
            return resolve({ errCode: 5, errMessage: 'Invalid or missing roleId' });
         }

         const errors = [];
         if (!data.phoneVerified && await checkPhoneNumberExists(data.phoneNumber)) {
            errors.push("Số điện thoại đã tồn tại!");
         }

         if (errors.length > 0) {
            return resolve({
               errCode: 1,
               errMessage: errors.join(", "),
            });
         }

         let hashPassword = await hashUserPassword(data.password);

         // Generate random username for all users
         const userName = await generateUniqueUsername();

         // Tạo người dùng mới
         await db.User.create({
            phoneNumber: data.phoneNumber,
            password: hashPassword,
            userName: userName, // Auto-generated random username
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
         attributes: ['id', 'password', 'roleId', 'userName', 'email', 'phoneNumber', 'fullName', 'gender', 'birthday', 'avatar', 'createdAt', 'updatedAt'],
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

// 🔄 FORGOT PASSWORD SERVICES

let requestPasswordReset = async (phoneNumber, ipAddress, userAgent) => {
   try {
      // Check if phone number exists
      const user = await db.User.findOne({
         where: { phoneNumber },
         attributes: ['id', 'phoneNumber', 'userName']
      });

      if (!user) {
         return {
            errCode: 1,
            errMessage: "Số điện thoại không tồn tại trong hệ thống!"
         };
      }

      // Check if there are too many recent reset requests (rate limiting)
      const recentTokens = await db.PasswordResetToken.findAll({
         where: {
            phoneNumber,
            createdAt: {
               [Op.gte]: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
            }
         }
      });

      if (recentTokens.length >= 3) {
         return {
            errCode: 2,
            errMessage: "Bạn đã yêu cầu quá nhiều lần. Vui lòng đợi 15 phút trước khi thử lại."
         };
      }

      // Invalidate all previous unused OTP tokens for this phone number
      await db.PasswordResetToken.update(
         {
            isUsed: true
         },
         {
            where: {
               phoneNumber,
               isUsed: false,
               expiresAt: { [Op.gt]: new Date() } // Only invalidate non-expired tokens
            }
         }
      );

      console.log(`🔐 Invalidated previous OTP tokens for ${phoneNumber}`);

      // Generate secure reset token
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Create password reset token record
      const passwordResetToken = await db.PasswordResetToken.create({
         userId: user.id,
         phoneNumber,
         resetToken,
         otpCode,
         expiresAt,
         ipAddress,
         userAgent
      });

      // Send OTP via SMS (using backend SMS service)
      const smsService = await import('./smsService.js');
      const smsResult = await smsService.default.sendOTP(phoneNumber);

      if (!smsResult.success) {
         // If SMS fails, delete the token
         await passwordResetToken.destroy();
         return {
            errCode: 3,
            errMessage: "Không thể gửi OTP. Vui lòng thử lại sau."
         };
      }

      // Update the token with the actual OTP sent
      if (smsResult.otpCode) {
         passwordResetToken.otpCode = smsResult.otpCode;
         await passwordResetToken.save();
      }

      console.log(`🔄 Password reset requested for ${phoneNumber}, OTP: ${passwordResetToken.otpCode}`);

      return {
         errCode: 0,
         message: "Mã OTP đã được gửi đến số điện thoại của bạn. Vui lòng kiểm tra và nhập mã để tiếp tục.",
         resetToken, // Return for frontend to use in next step
         expiresIn: 15 // minutes
      };

   } catch (error) {
      console.error('RequestPasswordReset service error:', error);
      return { errCode: -1, errMessage: "Lỗi server khi yêu cầu đặt lại mật khẩu!" };
   }
};

let verifyResetOTP = async (phoneNumber, otpCode) => {
   try {
      // Find the most recent valid reset token for this phone number
      const resetToken = await db.PasswordResetToken.findOne({
         where: {
            phoneNumber,
            isUsed: false,
            expiresAt: {
               [Op.gt]: new Date()
            }
         },
         order: [['createdAt', 'DESC']],
         include: [{
            model: db.User,
            as: 'user',
            attributes: ['id', 'phoneNumber']
         }]
      });

      if (!resetToken) {
         return {
            errCode: 1,
            errMessage: "Không tìm thấy yêu cầu đặt lại mật khẩu hoặc đã hết hạn. Vui lòng thử lại."
         };
      }

      // Check if exceeded max attempts
      if (resetToken.attempts >= resetToken.maxAttempts) {
         await resetToken.destroy();
         return {
            errCode: 2,
            errMessage: "Đã vượt quá số lần nhập sai. Vui lòng yêu cầu mã OTP mới."
         };
      }

      // Increment attempt counter
      await resetToken.incrementAttempts();

      // Verify OTP
      if (!resetToken.verifyOTP(otpCode)) {
         const remainingAttempts = resetToken.getRemainingAttempts();
         if (remainingAttempts <= 0) {
            await resetToken.destroy();
            return {
               errCode: 3,
               errMessage: "Mã OTP không đúng và đã hết số lần thử. Vui lòng yêu cầu mã mới.",
               attemptsRemaining: 0
            };
         }

         return {
            errCode: 4,
            errMessage: `Mã OTP không đúng. Còn ${remainingAttempts} lần thử.`,
            attemptsRemaining: remainingAttempts
         };
      }

      console.log(`✅ OTP verified successfully for ${phoneNumber}`);

      return {
         errCode: 0,
         message: "Xác thực OTP thành công! Bạn có thể đặt mật khẩu mới.",
         resetToken: resetToken.resetToken, // Return the reset token for password change
         userId: resetToken.user.id
      };

   } catch (error) {
      console.error('VerifyResetOTP service error:', error);
      return { errCode: -1, errMessage: "Lỗi server khi xác thực OTP!" };
   }
};

let resetPassword = async (resetToken, newPassword) => {
   try {
      // Validate new password
      if (!newPassword || newPassword.length < 6) {
         return {
            errCode: 1,
            errMessage: "Mật khẩu mới phải có ít nhất 6 ký tự."
         };
      }

      // Find and validate reset token
      const passwordResetToken = await db.PasswordResetToken.findValidToken(resetToken);

      if (!passwordResetToken) {
         return {
            errCode: 2,
            errMessage: "Token không hợp lệ hoặc đã hết hạn."
         };
      }

      // Hash new password
      const newHashedPassword = await hashUserPassword(newPassword);

      // Update user password
      await db.User.update(
         { password: newHashedPassword },
         { where: { id: passwordResetToken.userId } }
      );

      // Mark token as used
      await passwordResetToken.markAsUsed();

      // Invalidate all refresh tokens for this user (force re-login)
      await db.RefreshToken.update(
         { isActive: false },
         { where: { userId: passwordResetToken.userId } }
      );

      console.log(`🔐 Password reset successfully for user ${passwordResetToken.userId}`);

      return {
         errCode: 0,
         message: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại."
      };

   } catch (error) {
      console.error('ResetPassword service error:', error);
      return { errCode: -1, errMessage: "Lỗi server khi đặt lại mật khẩu!" };
   }
};

// 🗑️ Clear OTP data for phone number (for when user goes back to step 1)
let clearOTPForPhone = async (phoneNumber) => {
   try {
      console.log('🗑️ Clearing OTP for phone:', phoneNumber);

      // Delete OTP record from database
      const deletedCount = await db.PasswordResetToken.destroy({
         where: { phoneNumber: phoneNumber }
      });

      console.log(`🗑️ Deleted ${deletedCount} OTP records for phone: ${phoneNumber}`);

      return {
         errCode: 0,
         errMessage: 'OTP đã được xóa thành công!'
      };

   } catch (error) {
      console.error('ClearOTPForPhone service error:', error);
      return {
         errCode: -1,
         errMessage: 'Lỗi server khi xóa OTP!'
      };
   }
};

// 🔄 CHANGE PASSWORD SERVICES (for authenticated users)

let requestChangePassword = async (userId, currentPassword, ipAddress, userAgent) => {
   try {
      // 1. Verify user exists and get their data (including phoneNumber)
      const user = await db.User.findOne({
         where: { id: userId },
         attributes: ['id', 'phoneNumber', 'password', 'userName']
      });

      if (!user) {
         return {
            errCode: 1,
            errMessage: "Người dùng không tồn tại!"
         };
      }

      // 2. Verify current password
      const match = bcrypt.compareSync(currentPassword, user.password);
      if (!match) {
         return {
            errCode: 2,
            errMessage: "Mật khẩu hiện tại không chính xác!"
         };
      }

      // 3. Get phoneNumber from database (not from parameter)
      const phoneNumber = user.phoneNumber;

      if (!phoneNumber) {
         return {
            errCode: 3,
            errMessage: "Tài khoản chưa có số điện thoại!"
         };
      }

      // 4. Rate limiting - check recent requests
      const recentTokens = await db.PasswordResetToken.findAll({
         where: {
            phoneNumber,
            createdAt: {
               [Op.gte]: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes
            }
         }
      });

      if (recentTokens.length >= 3) {
         return {
            errCode: 4,
            errMessage: "Bạn đã yêu cầu quá nhiều lần. Vui lòng đợi 15 phút."
         };
      }

      // 5. Invalidate all previous unused OTP tokens for this phone number
      await db.PasswordResetToken.update(
         {
            isUsed: true
         },
         {
            where: {
               phoneNumber,
               isUsed: false,
               expiresAt: { [Op.gt]: new Date() } // Only invalidate non-expired tokens
            }
         }
      );

      console.log(`🔄 Invalidated previous OTP tokens for ${phoneNumber}`);

      // 6. Generate reset token and OTP
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // 7. Create password reset token
      const passwordResetToken = await db.PasswordResetToken.create({
         userId: user.id,
         phoneNumber,
         resetToken,
         otpCode,
         expiresAt,
         ipAddress,
         userAgent
      });

      // 8. Send OTP via SMS
      const smsService = await import('./smsService.js');
      const smsResult = await smsService.default.sendOTP(phoneNumber);

      if (!smsResult.success) {
         await passwordResetToken.destroy();
         return {
            errCode: 5,
            errMessage: "Không thể gửi OTP. Vui lòng thử lại."
         };
      }

      // 9. Update token with actual OTP sent
      if (smsResult.otpCode) {
         passwordResetToken.otpCode = smsResult.otpCode;
         await passwordResetToken.save();
      }

      console.log(`🔄 Change password OTP sent to ${phoneNumber}, OTP: ${passwordResetToken.otpCode}`);

      return {
         errCode: 0,
         message: "Mã OTP đã được gửi đến số điện thoại của bạn.",
         resetToken,
         expiresIn: 15
      };

   } catch (error) {
      console.error('RequestChangePassword service error:', error);
      return { errCode: -1, errMessage: "Lỗi server!" };
   }
};

// 🔐 Change password with verified OTP
let changePassword = async (resetToken, newPassword) => {
   try {
      // Validate new password
      if (!newPassword || newPassword.length < 6) {
         return {
            errCode: 1,
            errMessage: "Mật khẩu mới phải có ít nhất 6 ký tự."
         };
      }

      // Find and validate reset token
      const passwordResetToken = await db.PasswordResetToken.findValidToken(resetToken);

      if (!passwordResetToken) {
         return {
            errCode: 2,
            errMessage: "Token không hợp lệ hoặc đã hết hạn."
         };
      }

      // Get current password to prevent using same password
      const user = await db.User.findOne({
         where: { id: passwordResetToken.userId },
         attributes: ['id', 'password']
      });

      // 🔒 Security: Check if new password is same as old password
      const isSamePassword = bcrypt.compareSync(newPassword, user.password);
      if (isSamePassword) {
         return {
            errCode: 3,
            errMessage: "Mật khẩu mới không được trùng với mật khẩu cũ!"
         };
      }

      // Hash new password
      const newHashedPassword = await hashUserPassword(newPassword);

      // Update user password
      await db.User.update(
         { password: newHashedPassword },
         { where: { id: passwordResetToken.userId } }
      );

      // Mark token as used
      await passwordResetToken.markAsUsed();

      // 🔒 Security: Invalidate all refresh tokens (force re-login on all devices)
      await db.RefreshToken.update(
         { isActive: false },
         { where: { userId: passwordResetToken.userId } }
      );

      console.log(`🔐 Password changed successfully for user ${passwordResetToken.userId}`);

      return {
         errCode: 0,
         message: "Thay đổi mật khẩu thành công! Vui lòng đăng nhập lại."
      };

   } catch (error) {
      console.error('ChangePassword service error:', error);
      return { errCode: -1, errMessage: "Lỗi server!" };
   }
};

// 📧 UPDATE EMAIL SERVICES (NEW FLOW - for authenticated users)
// Flow: Email input → OTP to email → Verify OTP → Update

let sendEmailOTP = async (userId, newEmail, ipAddress, userAgent) => {
   try {
      // 1. Validate email format
      if (!newEmail || !validator.isEmail(newEmail)) {
         return {
            errCode: 1,
            errMessage: "Email không hợp lệ."
         };
      }

      // 2. Verify user exists
      const user = await db.User.findOne({
         where: { id: userId },
         attributes: ['id', 'email', 'userName', 'phoneNumber']
      });

      if (!user) {
         return {
            errCode: 2,
            errMessage: "Người dùng không tồn tại!"
         };
      }

      // 3. Check if email already exists (for another user)
      const emailExists = await db.User.findOne({
         where: {
            email: newEmail,
            id: { [Op.ne]: userId }
         }
      });

      if (emailExists) {
         return {
            errCode: 3,
            errMessage: "Email này đã được sử dụng bởi tài khoản khác!"
         };
      }

      // 4. Rate limiting (use email as identifier)
      const recentTokens = await db.PasswordResetToken.findAll({
         where: {
            userId,
            createdAt: {
               [Op.gte]: new Date(Date.now() - 15 * 60 * 1000)
            }
         }
      });

      if (recentTokens.length >= 3) {
         return {
            errCode: 4,
            errMessage: "Bạn đã yêu cầu quá nhiều lần. Vui lòng đợi 15 phút."
         };
      }

      // 5. Invalidate all previous unused OTP tokens for this user
      await db.PasswordResetToken.update(
         {
            isUsed: true
         },
         {
            where: {
               userId,
               isUsed: false,
               expiresAt: { [Op.gt]: new Date() }
            }
         }
      );

      console.log(`📧 Invalidated previous OTP tokens for user ${userId}`);

      // 6. Generate token and OTP
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // 7. Create password reset token (store target email in phoneNumber field temporarily)
      const passwordResetToken = await db.PasswordResetToken.create({
         userId: user.id,
         phoneNumber: newEmail, // Store target email here
         resetToken,
         otpCode,
         expiresAt,
         ipAddress,
         userAgent
      });

      // 8. Send OTP via Email (mocked for now, log to console)
      // TODO: Implement real email service later
      console.log(`📧 ========================================`);
      console.log(`📧 UPDATE EMAIL OTP`);
      console.log(`📧 To: ${newEmail}`);
      console.log(`📧 OTP Code: ${otpCode}`);
      console.log(`📧 Expires in: 15 minutes`);
      console.log(`📧 ========================================`);

      return {
         errCode: 0,
         message: "Mã OTP đã được gửi đến email của bạn.",
         resetToken,
         expiresIn: 15,
         hasEmail: !!user.email,
         currentEmail: user.email,
         targetEmail: newEmail // Return target email for UI display
      };

   } catch (error) {
      console.error('SendEmailOTP service error:', error);
      return { errCode: -1, errMessage: "Lỗi server!" };
   }
};

// 📧 Verify email OTP and update email
let verifyEmailOTPAndUpdate = async (resetToken, otpCode) => {
   try {
      // 1. Find reset token
      const passwordResetToken = await db.PasswordResetToken.findOne({
         where: {
            resetToken,
            isUsed: false,
            expiresAt: { [Op.gt]: new Date() }
         }
      });

      if (!passwordResetToken) {
         return {
            errCode: 1,
            errMessage: "Token không hợp lệ hoặc đã hết hạn."
         };
      }

      // 2. Check attempts
      if (passwordResetToken.attempts >= 3) {
         return {
            errCode: 2,
            errMessage: "Bạn đã nhập sai OTP quá nhiều lần. Vui lòng thử lại."
         };
      }

      // 3. Verify OTP
      if (passwordResetToken.otpCode !== otpCode) {
         // Increment attempts
         await passwordResetToken.update({
            attempts: passwordResetToken.attempts + 1
         });

         const remainingAttempts = 3 - (passwordResetToken.attempts + 1);
         return {
            errCode: 3,
            errMessage: `Mã OTP không đúng. Còn ${remainingAttempts} lần thử.`,
            attemptsRemaining: remainingAttempts
         };
      }

      // 4. OTP correct - Get target email from phoneNumber field
      const newEmail = passwordResetToken.phoneNumber; // We stored email here

      // 5. Validate email format
      if (!newEmail || !validator.isEmail(newEmail)) {
         return {
            errCode: 4,
            errMessage: "Email không hợp lệ."
         };
      }

      // 6. Check if email already exists (for another user)
      const emailExists = await db.User.findOne({
         where: {
            email: newEmail,
            id: { [Op.ne]: passwordResetToken.userId }
         }
      });

      if (emailExists) {
         return {
            errCode: 5,
            errMessage: "Email này đã được sử dụng bởi tài khoản khác!"
         };
      }

      // 7. Update user email
      await db.User.update(
         { email: newEmail },
         { where: { id: passwordResetToken.userId } }
      );

      // 8. Mark token as used
      await passwordResetToken.markAsUsed();

      console.log(`📧 Email updated successfully for user ${passwordResetToken.userId} to ${newEmail}`);

      return {
         errCode: 0,
         message: "Cập nhật email thành công!"
      };

   } catch (error) {
      console.error('VerifyEmailOTPAndUpdate service error:', error);
      return { errCode: -1, errMessage: "Lỗi server!" };
   }
};

export default {
   loginUser,
   registerUser,
   verifyUserPassword,
   requestPasswordReset,
   verifyResetOTP,
   resetPassword,
   clearOTPForPhone,
   requestChangePassword,
   changePassword,
   sendEmailOTP,
   verifyEmailOTPAndUpdate
}