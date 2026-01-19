import { Router } from 'express';
import { itemsController } from '../controllers/items.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import imagesRouter from './images.routes.js';

const router = Router();

// Auth required for all routes
router.use(auth);

// Items CRUD
router.get('/', itemsController.list);
router.get('/:id', itemsController.getById);
router.post('/', itemsController.create);
router.patch('/:id', itemsController.update);
router.put('/:id/status', itemsController.updateStatus);
router.delete('/:id', itemsController.delete);

// Images nested routes
router.use('/:itemId/images', imagesRouter);

export default router;
