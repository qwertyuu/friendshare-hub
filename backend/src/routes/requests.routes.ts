import { Router } from 'express';
import { requestsController } from '../controllers/requests.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = Router();

// Auth required for all routes
router.use(auth);

// Get my requests
router.get('/', requestsController.listRequests);

// Get demands (requests for my items)
router.get('/demands', requestsController.listDemands);

// Create request
router.post('/', requestsController.create);

// Approve request
router.patch('/:id/approve', requestsController.approve);

// Reject request
router.patch('/:id/reject', requestsController.reject);

// Complete request
router.patch('/:id/complete', requestsController.complete);

// Cancel request
router.patch('/:id/cancel', requestsController.cancel);

export default router;
