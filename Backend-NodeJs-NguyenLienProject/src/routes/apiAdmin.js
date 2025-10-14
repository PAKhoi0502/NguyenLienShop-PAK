import express from 'express';
import adminController from '../controllers/adminController.js';
import authController from '../controllers/authController.js';
import dashboardController from '../controllers/dashboardController.js';
import countController from '../controllers/countController.js';
import announcementController from '../controllers/announcementController.js';
import { verifyToken, isRole } from '../middlewares/authMiddleware.js';
import validateBodyFields from '../middlewares/validateBodyFields.js';

const router = express.Router();

// Dashboard routes
router.get('/dashboard-stats', verifyToken, isRole(1), dashboardController.handleGetDashboardStats);
router.get('/account-stats', verifyToken, isRole(1), dashboardController.handleGetAccountStats);
router.get('/account-count-stats', verifyToken, isRole(1), dashboardController.handleGetAccountCountStats);
router.get('/product-category-stats', verifyToken, isRole(1), dashboardController.handleGetProductCategoryStats);
router.get('/homepage-stats', verifyToken, isRole(1), dashboardController.handleGetHomepageStats);
router.get('/announcement-stats', verifyToken, isRole(1), announcementController.handleGetAnnouncementCount);


// Count routes - Đếm số lượng sản phẩm/danh mục
router.get('/product-count-by-category', verifyToken, isRole(1), countController.handleGetProductCountByCategoryId);
router.get('/product-count-all-categories', verifyToken, isRole(1), countController.handleGetProductCountForAllCategories);
router.get('/category-count-by-product', verifyToken, isRole(1), countController.handleGetCategoryCountByProductId);
router.get('/category-count-all-products', verifyToken, isRole(1), countController.handleGetCategoryCountForAllProducts);

// Admin routes
router.post('/admin-register', verifyToken, isRole(1), adminController.handleCreateAdminForAdmin);
router.get('/admin-management', verifyToken, isRole(1), adminController.handleGetAllAdmins);
router.put('/admin-update', verifyToken, isRole(1), adminController.handleUpdateAdmin);

// User routes
router.post('/user-register', verifyToken, isRole(1), adminController.handleCreateUserForAdmin);
router.get('/user-management', verifyToken, isRole(1), adminController.handleGetAllUsers);
router.delete('/user-delete', verifyToken, isRole(1), adminController.handleDeleteUser);
router.put('/user-update', verifyToken, isRole(1), adminController.handleUpdateUser);

// 🔒 Verify admin password for sensitive operations
router.post('/verify-password', verifyToken, isRole(1), validateBodyFields(['password']), authController.handleVerifyPassword);



export default router;