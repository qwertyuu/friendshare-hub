import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = Router();

// SSO login endpoints
router.get('/login', authController.login);           // Initiate OIDC flow
router.get('/callback', authController.callback);     // OIDC callback
router.post('/logout', authController.logout);        // Logout
router.get('/me', auth, authController.me);           // Get current user

// Legacy endpoints (deprecated)
router.post('/register', authController.register);    // Returns 410 Gone

export default router;
