import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { auth, adminOnly } from '../middleware/auth.middleware.js';

const router = Router();

// Auth and admin required for all routes
router.use(auth);
router.use(adminOnly);

// List users
router.get('/users', adminController.listUsers);

// Approve user
router.patch('/users/:id/approve', adminController.approveUser);

// Reject user
router.patch('/users/:id/reject', adminController.rejectUser);

export default router;
