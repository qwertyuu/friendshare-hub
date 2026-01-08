import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { auth, adminOnly } from '../middleware/auth.middleware.js';

const router = Router();

// Auth and admin required for all routes
router.use(auth);
router.use(adminOnly);

// Get platform statistics
router.get('/statistics', adminController.getStatistics);

// List users
router.get('/users', adminController.listUsers);

// Delete user
router.delete('/users/:id', adminController.deleteUser);

export default router;
