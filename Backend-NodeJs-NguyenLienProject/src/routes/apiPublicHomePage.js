import express from 'express';
import publicHomePageController from '../controllers/publicHomePageController.js';
import announcementController from '../controllers/announcementController.js';

const router = express.Router();

// public home page
router.get('/banner', publicHomePageController.handleViewsBanner);

// 📢 Public announcement routes (no authentication required)
router.get('/announcements/active', announcementController.handleGetActiveAnnouncements);

export default router;
