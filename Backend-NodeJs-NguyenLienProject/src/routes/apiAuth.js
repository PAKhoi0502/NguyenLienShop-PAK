import express from 'express';

import authController from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import validateBodyFields from '../middlewares/validateBodyFields.js';
import { checkPhoneNumberExists } from '../utils/validators.js';

const router = express.Router();

router.post(
   '/login',
   validateBodyFields(['identifier', 'password']),
   authController.handleLogin
);
router.post('/register', authController.handleRegister);

// Check if phone number exists endpoint
router.post('/check-phone', async (req, res) => {
   try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
         return res.status(400).json({
            errCode: 1,
            errMessage: 'Phone number is required'
         });
      }

      const exists = await checkPhoneNumberExists(phoneNumber);

      return res.status(200).json({
         errCode: 0,
         exists: exists,
         message: exists ? 'Phone number already exists' : 'Phone number is available'
      });

   } catch (error) {
      console.error('Check phone error:', error);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Internal server error'
      });
   }
});

// ✅ Thêm logout route với verifyToken middleware
router.post('/logout', verifyToken, authController.handleLogout);

// 🔧 Add auth check route to verify cookie-based authentication
router.get('/check', verifyToken, authController.handleAuthCheck);

// 🔄 Add refresh token route (no middleware needed - handles its own validation)
router.post('/refresh', authController.handleRefreshToken);

// 📊 Get user's active sessions
router.get('/sessions', verifyToken, authController.handleGetUserSessions);

// 🔐 Logout from all devices  
router.post('/logout-all', verifyToken, authController.handleLogoutAllDevices);

// 🔄 Forgot Password Flow
router.post('/forgot-password', validateBodyFields(['phoneNumber']), authController.handleForgotPassword);
router.post('/verify-reset-otp', validateBodyFields(['phoneNumber', 'otpCode']), authController.handleVerifyResetOTP);
router.post('/reset-password', validateBodyFields(['resetToken', 'newPassword']), authController.handleResetPassword);

export default router;
