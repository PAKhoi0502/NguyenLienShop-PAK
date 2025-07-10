import express from 'express';
import authController from '../controllers/authController.js';
import userController from '../controllers/userController.js';
import adminController from '../controllers/adminController.js';
import { verifyToken, isRole } from '../middlewares/authMiddleware.js';
import validateBodyFields from '../middlewares/validateBodyFields.js';

const router = express.Router();

//public APIs
router.post(
   '/login',
   validateBodyFields(['identifier', 'password']),
   authController.handleLogin
);
router.post('/register', authController.handleRegister);

// // Admin APIs
// router.get('/admin/users-manager/:id', verifyToken, isRole(1), adminController.handleGetAllUsers);
// router.put('/admin/user/:id', verifyToken, isRole(1), adminController.handleEditUser);
// router.delete('/admin/user/:id', verifyToken, isRole(1), adminController.handleDeleteUser);

// // User APIs
// router
//    .route('/profile/me')
//    .get(verifyToken, isRole(2), userController.handleGetUserProfile)
//    .put(verifyToken, isRole(2), userController.handleEditUserProfile);

// router.patch('/user/me/address', verifyToken, isRole(2), userController.updateAddress);
// router.patch('/user/me/email', verifyToken, isRole(2), userController.updateEmail);
// router.patch('/user/me/phone', verifyToken, isRole(2), userController.updatePhoneNumber);
// router.patch('/user/me/password', verifyToken, isRole(2), userController.changePassword);

export default router;
