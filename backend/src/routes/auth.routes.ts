import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', auth, authController.me);

export default router;
