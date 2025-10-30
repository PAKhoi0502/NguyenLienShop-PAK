import express from 'express';
import publicHomePageController from '../controllers/publicHomePageController.js';
import announcementController from '../controllers/announcementController.js';
import discountCodeController from '../controllers/discountCodeController.js';

const router = express.Router();

// public home page
router.get('/banner', publicHomePageController.handleViewsBanner);

// 📢 Public announcement routes (no authentication required)
router.get('/announcements/active', announcementController.handleGetActiveAnnouncements);

// 🎁 Public vouchers (no authentication required)
router.get('/vouchers', discountCodeController.handleGetPublicVouchers);

export default router;
