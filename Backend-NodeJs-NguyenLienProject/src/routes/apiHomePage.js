import express from 'express';
import homePageController from '../controllers/homePageController.js';
import { verifyToken, isRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Banner
router.get('/banners', homePageController.handleGetBanners);

router.post('/banners', verifyToken, isRole(1), homePageController.handleCreateBanner);
router.put('/banners/:id', verifyToken, isRole(1), homePageController.handleUpdateBanner);
router.delete('/banners/:id', verifyToken, isRole(1), homePageController.handleDeleteBanner);

// Categories 
export default router;
