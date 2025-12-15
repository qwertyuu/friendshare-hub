import { Router } from 'express';
import { generalRequestsController } from '../controllers/generalRequests.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = Router();

// Auth required for all routes
router.use(auth);

// List all general requests (community view)
router.get('/', generalRequestsController.listAll);

// List my general requests
router.get('/mine', generalRequestsController.listMine);

// Create general request
router.post('/', generalRequestsController.create);

// Update general request
router.patch('/:id', generalRequestsController.update);

// Mark as fulfilled
router.patch('/:id/fulfill', generalRequestsController.fulfill);

// Cancel general request
router.patch('/:id/cancel', generalRequestsController.cancel);

// Delete general request
router.delete('/:id', generalRequestsController.delete);

// Respond to general request with an item
router.post('/:id/responses', generalRequestsController.respondWithItem);

// Delete a response
router.delete('/responses/:responseId', generalRequestsController.deleteResponse);

export default router;
