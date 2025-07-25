import express from 'express';
import homePageController from '../controllers/homePageController.js';
import { verifyToken, isRole } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Banner
router.get('/banner-management', verifyToken, isRole(1), homePageController.handleGetBanners);

router.post('/banner-create', verifyToken, isRole(1), upload.single('image'), homePageController.handleCreateBanner);

router.put('/banner-update', verifyToken, isRole(1), homePageController.handleUpdateBanner);
router.delete('/banner-delete', verifyToken, isRole(1), homePageController.handleDeleteBanner);
router.get('/banner-active', verifyToken, isRole(1), homePageController.handleGetActiveBanners);

// Categories 
export default router;
