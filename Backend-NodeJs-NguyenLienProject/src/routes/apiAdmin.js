import express from 'express';
import adminController from '../controllers/adminController.js';
import { verifyToken, isRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/user-register', verifyToken, isRole(1), adminController.handleCreateUserForAdmin);
router.post('/admin-register', verifyToken, isRole(1), adminController.handleCreateAdminForAdmin);
router.get('/users-manager', verifyToken, isRole(1), adminController.handleGetAllUsers);
router.get('/admins-manager', verifyToken, isRole(1), adminController.handleGetAllAdmins);
router.delete('/user-delete', verifyToken, isRole(1), adminController.handleDeleteUser);
router.put('/user-edit', verifyToken, isRole(1), adminController.handleEditUser);

export default router;