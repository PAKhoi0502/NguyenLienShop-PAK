import express from 'express';

import apiAdmin from './apiAdmin.js';
import apiAuth from './apiAuth.js';
import apiHomePage from './apiHomePage.js';
import apiUser from './apiUser.js';
import apiPublicHomePage from './apiPublicHomePage.js';

const router = express.Router();

router.use('/admin', apiAdmin);
router.use('/auth', apiAuth);
router.use('/admin', apiHomePage);

router.use('/user', apiUser);

router.use('/public', apiPublicHomePage);

export default router;