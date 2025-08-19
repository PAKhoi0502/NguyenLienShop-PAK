import express from 'express';

import authController from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import validateBodyFields from '../middlewares/validateBodyFields.js';

const router = express.Router();

router.post(
   '/login',
   validateBodyFields(['identifier', 'password']),
   authController.handleLogin
);
router.post('/register', authController.handleRegister);

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

export default router;
