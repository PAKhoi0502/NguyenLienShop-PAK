import express from 'express';
import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';
import { verifyToken, isRole } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';
import validateBodyFields from '../middlewares/validateBodyFields.js';

const router = express.Router();

router.get('/profile', verifyToken, userController.handleGetUserProfile);
router.put('/update', verifyToken, upload.single('avatar'), userController.handleUpdateUserProfile);

// 🔐 Change Password (for authenticated users)
router.post('/request-change-password',
    verifyToken,
    validateBodyFields(['currentPassword']),
    authController.handleRequestChangePassword
);

router.post('/verify-change-otp',
    verifyToken,
    validateBodyFields(['phoneNumber', 'otpCode']),
    authController.handleVerifyResetOTP // Reuse existing OTP verification
);

router.post('/change-password',
    verifyToken,
    validateBodyFields(['resetToken', 'newPassword']),
    authController.handleChangePassword
);

// 📧 Update Email (NEW FLOW - for authenticated users)
// Flow: Email input → OTP to email → Verify OTP & Update
router.post('/send-email-otp',
    verifyToken,
    validateBodyFields(['newEmail']),
    authController.handleSendEmailOTP
);

router.post('/verify-email-otp',
    verifyToken,
    validateBodyFields(['resetToken', 'otpCode']),
    authController.handleVerifyEmailOTPAndUpdate
);

export default router;