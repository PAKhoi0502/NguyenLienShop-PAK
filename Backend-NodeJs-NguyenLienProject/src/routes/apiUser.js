import express from 'express';
import userController from '../controllers/userController.js';
import { verifyToken, isRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/profile', verifyToken, userController.handleGetUserProfile);
router.put('/update', verifyToken, userController.handleUpdateUserProfile);

export default router;