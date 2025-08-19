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

export default router;
