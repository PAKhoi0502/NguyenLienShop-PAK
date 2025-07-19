import express from 'express';

import authController from '../controllers/authController.js';

import validateBodyFields from '../middlewares/validateBodyFields.js';

const router = express.Router();

router.post(
   '/login',
   validateBodyFields(['identifier', 'password']),
   authController.handleLogin
);
router.post('/register', authController.handleRegister);

export default router;
