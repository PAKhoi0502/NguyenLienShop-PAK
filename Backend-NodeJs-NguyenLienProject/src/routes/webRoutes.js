import express from 'express';
import backendController from '../controllers/backendController.js';

const router = express.Router();

router.get('/', backendController.homePage);
router.get('/user-manager', backendController.userManager);
router.get('/create-new-user', backendController.createNewUser);
router.post('/post-create-new-user', backendController.postCreateNewUser);
router.get('/edit-user', backendController.editUser);
router.post('/update-user', backendController.updateUser);
router.get('/delete-user', backendController.deleteUser);

export default router;
