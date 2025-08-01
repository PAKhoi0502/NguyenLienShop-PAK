import express from 'express';
import publicHomePageController from '../controllers/publicHomePageController.js';
const router = express.Router();

// public home page
router.get('/banner', publicHomePageController.handleViewsBanner);

export default router;
